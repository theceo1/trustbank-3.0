"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import BackButton from '@/components/ui/back-button';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Settings, Lock, Bell, Shield, Smartphone, Mail, Key, UserCog, Globe, Wallet } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";

interface AccountSettings {
  two_factor_enabled: boolean;
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    trades: boolean;
    marketing: boolean;
  };
  privacy: {
    profile_visible: boolean;
    show_balance: boolean;
    activity_status: boolean;
  };
}

export default function AccountSettingsPage() {
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState<AccountSettings>({
    two_factor_enabled: false,
    language: 'en',
    currency: 'NGN',
    notifications: {
      email: true,
      push: true,
      trades: true,
      marketing: false,
    },
    privacy: {
      profile_visible: true,
      show_balance: false,
      activity_status: true,
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('account_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (!data) {
          const defaultSettings = {
            user_id: user.id,
            two_factor_enabled: false,
            language: 'en',
            currency: 'NGN',
            notifications: {
              email: true,
              push: true,
              trades: true,
              marketing: false,
            },
            privacy: {
              profile_visible: true,
              show_balance: false,
              activity_status: true,
            }
          };

          const { error: insertError } = await supabase
            .from('account_settings')
            .insert(defaultSettings);

          if (insertError) throw insertError;
          
          setSettings(defaultSettings);
        } else {
          setSettings(data);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          id: "settings-error",
          title: "Error",
          description: "Failed to load account settings",
          variant: "destructive",
        });
      }
    };

    loadSettings();
  }, [supabase, toast]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        id: "password-error",
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast({
        id: "password-success",
        title: "Success",
        description: "Your password has been updated successfully.",
      });
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        id: "password-error",
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    }
  };

  const updateSettings = async (newSettings: Partial<AccountSettings>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const updatedSettings = {
        ...settings,
        ...newSettings,
      };

      const { error } = await supabase
        .from('account_settings')
        .update(updatedSettings)
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings(updatedSettings);
      
      toast({
        id: "settings-success",
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        id: "settings-error",
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
    toast({
      id: "settings-success",
      title: "Settings updated",
      description: "Your notification settings have been updated.",
    });
  };

  return (
    <motion.div
      className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <BackButton />
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-green-600" />
            <CardTitle className="text-2xl font-bold text-green-600">Account Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="security">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Security Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <motion.div variants={itemVariants} className="space-y-4 p-4">
                  <div className="space-y-4">
                    {isChangingPassword ? (
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <Input type="password" placeholder="Current Password" />
                        <Input type="password" placeholder="New Password" />
                        <Input type="password" placeholder="Confirm New Password" />
                        <div className="flex space-x-2">
                          <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Update Password
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsChangingPassword(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <Button
                        onClick={() => setIsChangingPassword(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Change Password
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="wallet">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5" />
                  <span>Wallet Settings</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <motion.div variants={itemVariants} className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <Label htmlFor="show-balance">Show Wallet Balance</Label>
                    </div>
                    <Switch
                      id="show-balance"
                      checked={settings.privacy.show_balance}
                      onCheckedChange={(checked) => {
                        const newPrivacySettings = {
                          ...settings.privacy,
                          show_balance: checked
                        };
                        updateSettings({
                          privacy: newPrivacySettings
                        });
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <Label htmlFor="currency">Default Currency</Label>
                    </div>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => {
                        updateSettings({
                          currency: value
                        });
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="notifications">
              <AccordionTrigger className="text-lg font-semibold">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <motion.div variants={itemVariants} className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.notifications.email}
                      onCheckedChange={() => handleNotificationChange('email')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4" />
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.notifications.push}
                      onCheckedChange={() => handleNotificationChange('push')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <Label htmlFor="trade-notifications">Trade Alerts</Label>
                    </div>
                    <Switch
                      id="trade-notifications"
                      checked={settings.notifications.trades}
                      onCheckedChange={() => handleNotificationChange('trades')}
                    />
                  </div>
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
}
