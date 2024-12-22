// app/profile/verification/nin/page.tsx
"use client";

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, ArrowLeft, Shield, RefreshCw, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WEBCAM_CONFIG = {
  width: 720,
  height: 720,
  facingMode: "user"
};

export default function NINVerificationPage() {
  const webcamRef = useRef<Webcam>(null);
  const [nin, setNin] = useState('');
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
    if (!nin || !selfieImage) {
      toast({
        title: "Missing Information",
        description: "Please provide your NIN and take a selfie",
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
        description: "Your NIN verification is being processed",
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
    <div className="min-h-screen flex flex-col pt-16">
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
                  <CardTitle>NIN Verification</CardTitle>
                  <CardDescription>Verify your identity with NIN and a selfie</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  Please ensure your NIN details are accurate and your face is clearly visible in the selfie.
                </AlertDescription>
              </Alert>

              {/* NIN Input Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium">National Identity Number (NIN)</label>
                <Input
                  type="text"
                  placeholder="Enter your 11-digit NIN"
                  value={nin}
                  onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="font-mono"
                />
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
                      <img 
                        src={selfieImage} 
                        alt="Selfie" 
                        className="w-full rounded-lg"
                      />
                      <div className="absolute bottom-4 right-4">
                        <Button
                          variant="outline"
                          onClick={retake}
                          // className="bg-white"
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
                disabled={loading || !nin || !selfieImage}
                className="w-full bg-green-600 hover:bg-green-300 text-white hover:text-black"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Submit for Verification
                    <ArrowLeft className="h-4 w-4" />
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