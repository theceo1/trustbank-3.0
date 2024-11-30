"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Shield, Key, Smartphone, Lock, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/ui/back-button";
import { useAuth } from "@/context/AuthContext";

export default function SecurityPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const securitySections = [
    {
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      action: (
        <div className="flex items-center space-x-2">
          <Switch
            checked={is2FAEnabled}
            onCheckedChange={(checked) => {
              setIs2FAEnabled(checked);
              toast({
                id: "2fa-success",
                title: checked ? "2FA Enabled" : "2FA Disabled",
                description: checked 
                  ? "Two-factor authentication has been enabled"
                  : "Two-factor authentication has been disabled",
              });
            }}
          />
          <Label>Enable 2FA</Label>
        </div>
      )
    },
    {
      title: "Password Settings",
      description: "Change your password or set up recovery options",
      icon: <Key className="w-6 h-6 text-green-500" />,
      action: (
        <Button variant="outline" onClick={() => toast({
          id: "password-settings-coming-soon",
          title: "Coming Soon",
          description: "This feature will be available soon!"
        })}>
          Change Password
        </Button>
      )
    },
    {
      title: "Device Management",
      description: "View and manage devices that have access to your account",
      icon: <Smartphone className="w-6 h-6 text-purple-500" />,
      action: (
        <Button variant="outline" onClick={() => toast({
          id: "device-management-coming-soon",
          title: "Coming Soon",
          description: "Device management will be available soon!"
        })}>
          Manage Devices
        </Button>
      )
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen pt-24">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage your account security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {securitySections.map((section, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>{section.action}</CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}