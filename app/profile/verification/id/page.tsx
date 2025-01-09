//app/profile/verification/id/page.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, ArrowLeft, Shield, RefreshCw, Upload, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';

const WEBCAM_CONFIG = {
  width: 720,
  height: 720,
  facingMode: "user"
};

const ID_TYPES = [
  { value: 'passport', label: 'International Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'national_id', label: 'National ID Card' },
];

export default function PhotoIDVerificationPage() {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [idType, setIdType] = useState<string>('');
  const [idImage, setIdImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setSelfieImage(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload an image less than 5MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setIdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!idType || !idImage || !selfieImage) {
      toast({
        title: "Missing Information",
        description: "Please provide all required information",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // API call implementation here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated API call
      toast({
        title: "Verification Initiated",
        description: "Your ID verification is being processed",
      });
      router.push('/profile/verification');
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="container max-w-2xl mx-auto px-4 py-8 flex-grow">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle>Photo ID Verification</CardTitle>
                  <CardDescription>Upload a government-issued photo ID for full verification</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  Please ensure your ID is valid and clearly visible. Supported formats: JPG, PNG (max 15MB)
                </AlertDescription>
              </Alert>

              {/* ID Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Type</label>
                <Select value={idType} onValueChange={setIdType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ID_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ID Upload Section */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Upload ID Document</label>
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  {idImage ? (
                    <div className="relative">
                      <Image
                        src={idImage}
                        alt="ID Document"
                        width={300}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                      <div className="absolute bottom-4 right-4">
                        <Button
                          variant="outline"
                          onClick={() => setIdImage(null)}
                          className="bg-white"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Upload New
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-12 border-2 border-dashed rounded-lg">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="h-6 w-6 mr-2" />
                        Upload ID Document
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Selfie Section */}
              <div className="space-y-4">
                <label className="text-sm font-medium">Selfie Verification</label>
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  {showCamera ? (
                    <div className="relative">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={WEBCAM_CONFIG}
                        className="w-full rounded-lg"
                      />
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                        <Button
                          onClick={capture}
                          className="bg-green-600 hover:bg-green-300 text-white dark:text-black"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Capture
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowCamera(false)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : selfieImage ? (
                    <div className="relative">
                      <Image
                        src={selfieImage}
                        alt="Selfie"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                      <div className="absolute bottom-4 right-4">
                        <Button
                          variant="outline"
                          onClick={() => setSelfieImage(null)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2 text-black dark:text-white" />
                          Retake
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setShowCamera(true)}
                      variant="outline"
                      className="w-full py-12"
                    >
                      <Camera className="h-6 w-6 mr-2" />
                      Take Selfie
                    </Button>
                  )}
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={loading || !idType || !idImage || !selfieImage}
                className="w-full bg-green-600 hover:bg-green-300 text-white dark:text-black"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Submit for Verification
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 