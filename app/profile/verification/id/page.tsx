//app/profile/verification/id/page.tsx
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, RefreshCw } from 'lucide-react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { KYCService } from '@/app/lib/services/kyc';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';

export default function IDVerification() {
  const [idType, setIdType] = useState<'passport' | 'drivers_license'>();
  const [selfieImage, setSelfieImage] = useState<string>();
  const [idImage, setIdImage] = useState<string>();
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const webcamRef = React.useRef<Webcam>(null);

  const handleCapture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setSelfieImage(imageSrc);
      setShowCamera(false);
    }
  }, [webcamRef]);

  const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!idType || !selfieImage || !idImage || !user?.id) return;

    try {
      setLoading(true);
      await KYCService.verifyPhotoID(user.id, {
        idType,
        selfieImage,
        idImage
      });

      toast({
        id: "id-verification-success",
        title: "Verification Submitted",
        description: "Your ID verification is being processed",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        id: "id-verification-failed",
        title: "Verification Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="container max-w-2xl mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">ID Verification</h1>
        <p className="text-gray-600">Upload your ID and take a selfie to verify your identity</p>
      </div>

      <div className="space-y-6">
        <Select onValueChange={(value) => setIdType(value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Select ID Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passport">International Passport</SelectItem>
            <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
          </SelectContent>
        </Select>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold">ID Document</h3>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {idImage ? (
                <div className="relative">
                  <Image
                    src={idImage}
                    alt="ID"
                    className="rounded-lg"
                    width={400}
                    height={300}
                  />
                  <Button
                    onClick={() => setIdImage(undefined)}
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIdUpload}
                  />
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p>Upload ID</p>
                </label>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Selfie</h3>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {selfieImage ? (
                <div className="relative">
                  <Image
                    src={selfieImage}
                    alt="Selfie"
                    className="rounded-lg"
                    width={400}
                    height={300}
                  />
                  <Button
                    onClick={() => setSelfieImage(undefined)}
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowCamera(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Camera className="h-8 w-8 mr-2" />
                  Take Selfie
                </Button>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !idType || !selfieImage || !idImage}
          className="w-full bg-green-600 hover:bg-green-300 text-white hover:text-black"
        >
          {loading ? 'Verifying...' : 'Submit Verification'}
        </Button>
      </div>

      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take a Selfie</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="rounded-lg"
            />
            <Button
              onClick={handleCapture}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-300 text-white hover:text-black"
            >
              Capture
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 