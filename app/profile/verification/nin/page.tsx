"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, Camera, Upload } from "lucide-react";
import BackButton from "@/components/ui/back-button";
import { KYCService } from "@/app/lib/services/kyc";
import { useAuth } from "@/context/AuthContext";
import Webcam from "react-webcam";
import Image from "next/image";

export default function NINVerificationPage() {
  const [nin, setNin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const handleCaptureSelfie = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setSelfieImage(imageSrc);
      setShowCamera(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfieImage) {
      toast({
        id: "nin-selfie-error",
        title: "Error",
        description: "Please take a selfie to complete verification",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await KYCService.verifyNIN(user?.id as string, nin, selfieImage);
      toast({
        id: "nin-success",
        title: "Success",
        description: "NIN verification submitted successfully. Please wait for verification.",
      });
      router.push("/profile");
    } catch (error) {
      toast({
        id: "nin-error",
        title: "Error",
        description: "Failed to verify NIN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>NIN Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="Enter your 11-digit NIN"
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                  pattern="^[0-9]{11}$"
                  required
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Please enter your 11-digit National Identity Number
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Selfie Verification</h4>
                {showCamera ? (
                  <div className="space-y-2">
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full rounded-lg"
                    />
                    <Button 
                      type="button"
                      onClick={handleCaptureSelfie}
                      className="w-full"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Capture Selfie
                    </Button>
                  </div>
                ) : selfieImage ? (
                  <div className="relative w-full h-48">
                    <Image 
                      src={selfieImage} 
                      alt="Selfie" 
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Selfie
                  </Button>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !selfieImage}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Submit Verification"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}