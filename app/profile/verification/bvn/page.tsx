"use client";

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, ArrowLeft, Shield, RefreshCw, Check, X, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import Image from 'next/image';

const WEBCAM_CONFIG = {
  width: 720,
  height: 720,
  facingMode: "user"
};

export default function BVNVerificationPage() {
  const webcamRef = useRef<Webcam>(null);
  const [bvn, setBvn] = useState('');
  const [dob, setDob] = useState('');
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

  const retake = () => {
    setSelfieImage(null);
    setShowCamera(true);
  };

  const handleSubmit = async () => {
    if (!bvn || !dob || !selfieImage) {
      toast({
        title: "Missing Information",
        description: "Please provide your BVN, date of birth, and take a selfie",
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
        description: "Your BVN verification is being processed",
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
                  <CardTitle>BVN Verification</CardTitle>
                  <CardDescription>Link your Bank Verification Number for increased limits</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  Please ensure your BVN details match your bank records exactly.
                </AlertDescription>
              </Alert>

              {/* BVN Input Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Verification Number (BVN)</label>
                <Input
                  type="text"
                  placeholder="Enter your 11-digit BVN"
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="font-mono"
                />
              </div>

              {/* Date of Birth Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full"
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
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
                          className="bg-green-600 hover:bg-green-300 text-white hover:text-black"
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
                        className="w-full rounded-lg"
                        width={200}
                        height={200}
                      />
                      <div className="absolute bottom-4 right-4">
                        <Button
                          variant="outline"
                          onClick={retake}
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
                disabled={loading || !bvn || !dob || !selfieImage}
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