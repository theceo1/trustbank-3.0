// app/profile/verification/nin/page.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, Camera, RefreshCw } from "lucide-react";
import BackButton from "@/components/ui/back-button";
import { KYCService } from "@/app/lib/services/kyc";
import { useAuth } from "@/context/AuthContext";
import Webcam from "react-webcam";
import Image from "next/image";
import { NotificationDialog } from "@/app/components/ui/notification-dialog";
// import Footer from "@/components/layout/footer";

export default function NINVerificationPage() {
  const [nin, setNin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    description: string;
    variant: "success" | "error";
  }>({
    show: false,
    title: "",
    description: "",
    variant: "success"
  });
  
  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleCaptureSelfie = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setSelfieImage(imageSrc);
        setShowCamera(false);
        setNotification({
          show: true,
          title: "Selfie Captured",
          description: "Your selfie has been captured successfully",
          variant: "success"
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      setNotification({
        show: true,
        title: "Authentication Error",
        description: "Please login to continue",
        variant: "error"
      });
      return;
    }

    if (!nin.match(/^[0-9]{11}$/)) {
      setNotification({
        show: true,
        title: "Invalid NIN",
        description: "Please enter a valid 11-digit NIN number",
        variant: "error"
      });
      return;
    }

    if (!selfieImage) {
      setNotification({
        show: true,
        title: "Selfie Required",
        description: "Please take a selfie to complete verification",
        variant: "error"
      });
      return;
    }

    setIsLoading(true);

    try {
      await KYCService.verifyNIN(user.id, nin, selfieImage);
      
      setNotification({
        show: true,
        title: "Verification Submitted",
        description: "Your NIN verification has been submitted successfully",
        variant: "success"
      });
      
      // Redirect after dialog is closed
      setTimeout(() => {
        router.push("/profile/verification");
      }, 2000);
      
    } catch (error: any) {
      console.error("NIN verification error:", error);
      setNotification({
        show: true,
        title: "Verification Failed",
        description: error?.message || "Failed to verify NIN. Please try again later.",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NotificationDialog
        open={notification.show}
        onOpenChange={(open) => setNotification(prev => ({ ...prev, show: open }))}
        title={notification.title}
        description={notification.description}
        variant={notification.variant}
      />
      <div className="min-h-screen flex items-center justify-center px-2 sm:px-6 lg:px-2">
        <div className="w-full max-w-md space-y-8">
          <BackButton />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-t-4 border-t-green-600">
              <CardHeader>
                <CardTitle className="text-lg font-bold">NIN Verification</CardTitle>
                <CardDescription>
                  Complete your identity verification with your NIN and a selfie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">National Identity Number</label>
                    <Input
                      type="text"
                      placeholder="Enter your 11-digit NIN"
                      value={nin}
                      onChange={(e) => setNin(e.target.value)}
                      pattern="^[0-9]{11}$"
                      required
                      className="w-full border-2 focus:border-green-600 focus:ring-green-600"
                    />
                    <p className="text-sm text-muted-foreground">
                      Please enter your 11-digit National Identity Number
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Selfie Verification</h4>
                    {showCamera ? (
                      <div className="space-y-2">
                        <div className="relative rounded-lg overflow-hidden">
                          <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            className="w-full rounded-lg"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button"
                            onClick={handleCaptureSelfie}
                            className="flex-1 bg-green-600 hover:bg-green-300 text-white hover:text-black"
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Capture
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCamera(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : selfieImage ? (
                      <div className="space-y-2">
                        <div className="relative w-full h-48 rounded-lg overflow-hidden">
                          <Image 
                            src={selfieImage} 
                            alt="Selfie" 
                            className="w-full h-full object-cover rounded-lg"
                            width={400}
                            height={300}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCamera(true)}
                          className="w-full"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retake Selfie
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        variant="outline"
                        className="w-full border-2 border-dashed"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Take Selfie
                      </Button>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-300 text-white hover:text-black" 
                    disabled={isLoading || !selfieImage}
                  >
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
      </div>
    </>
  );
}