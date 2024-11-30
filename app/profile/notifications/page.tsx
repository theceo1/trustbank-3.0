"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Bell, Mail, Smartphone, DollarSign, Megaphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/ui/back-button";

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    transactions: true,
    security: true,
    marketing: false,
  });

  const previousSettings = useRef(notifications);

  const handleToggle = useCallback((key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  useEffect(() => {
    // Find which setting changed
    const changedKey = Object.keys(notifications).find(
      key => notifications[key as keyof typeof notifications] !== previousSettings.current[key as keyof typeof notifications]
    ) as keyof typeof notifications;

    if (changedKey) {
      const isEnabled = notifications[changedKey];
      toast({
        id: "notifications-success",
        title: `${changedKey.charAt(0).toUpperCase() + changedKey.slice(1)} notifications ${isEnabled ? 'enabled' : 'disabled'}`,
        description: `You will ${isEnabled ? 'now' : 'no longer'} receive ${changedKey} notifications`,
      });
    }

    previousSettings.current = notifications;
  }, [notifications, toast]);

  const notificationSettings = [
    {
      key: 'email',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: <Mail className="h-5 w-5 text-blue-500" />,
    },
    {
      key: 'push',
      title: 'Push Notifications',
      description: 'Receive push notifications on your devices',
      icon: <Smartphone className="h-5 w-5 text-green-500" />,
    },
    {
      key: 'transactions',
      title: 'Transaction Alerts',
      description: 'Get notified about your transactions',
      icon: <DollarSign className="h-5 w-5 text-purple-500" />,
    },
    {
      key: 'security',
      title: 'Security Alerts',
      description: 'Important security-related notifications',
      icon: <Bell className="h-5 w-5 text-red-500" />,
    },
    {
      key: 'marketing',
      title: 'Marketing Updates',
      description: 'Receive news about products and features',
      icon: <Megaphone className="h-5 w-5 text-yellow-500" />,
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen pt-24">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {notificationSettings.map((setting) => (
              <Card key={setting.key}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-4">
                    {setting.icon}
                    <div>
                      <h4 className="font-medium">{setting.title}</h4>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications[setting.key as keyof typeof notifications]}
                    onCheckedChange={() => handleToggle(setting.key as keyof typeof notifications)}
                  />
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}