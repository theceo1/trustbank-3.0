import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Switch } from '@/app/components/ui/switch';
import { Button } from '@/app/components/ui/button';
import { Bell, Mail, Phone, Globe, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationSettings {
  email: {
    marketing: boolean;
    security: boolean;
    trading: boolean;
    news: boolean;
  };
  push: {
    trading: boolean;
    security: boolean;
    price_alerts: boolean;
  };
  sms: {
    security: boolean;
    trading: boolean;
  };
}

interface NotificationSettingsProps {
  settings: NotificationSettings;
  className?: string;
}

export function NotificationSettings({ settings: initialSettings, className = '' }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (category: keyof NotificationSettings, type: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification settings');
      }

      toast.success('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Notification Settings</CardTitle>
        <Button onClick={handleSave} disabled={isSaving}>
          Save Changes
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Email Notifications</h3>
          </div>
          
          <div className="ml-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-gray-500">
                  Get notified about security events
                </p>
              </div>
              <Switch
                checked={settings.email.security}
                onCheckedChange={(checked) => handleToggle('email', 'security', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Trading Updates</p>
                <p className="text-sm text-gray-500">
                  Receive updates about your trades
                </p>
              </div>
              <Switch
                checked={settings.email.trading}
                onCheckedChange={(checked) => handleToggle('email', 'trading', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing</p>
                <p className="text-sm text-gray-500">
                  Receive promotional offers and updates
                </p>
              </div>
              <Switch
                checked={settings.email.marketing}
                onCheckedChange={(checked) => handleToggle('email', 'marketing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">News & Updates</p>
                <p className="text-sm text-gray-500">
                  Stay informed about platform updates
                </p>
              </div>
              <Switch
                checked={settings.email.news}
                onCheckedChange={(checked) => handleToggle('email', 'news', checked)}
              />
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Push Notifications</h3>
          </div>
          
          <div className="ml-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Trading Alerts</p>
                <p className="text-sm text-gray-500">
                  Get notified about order updates
                </p>
              </div>
              <Switch
                checked={settings.push.trading}
                onCheckedChange={(checked) => handleToggle('push', 'trading', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security</p>
                <p className="text-sm text-gray-500">
                  Important security notifications
                </p>
              </div>
              <Switch
                checked={settings.push.security}
                onCheckedChange={(checked) => handleToggle('push', 'security', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Price Alerts</p>
                <p className="text-sm text-gray-500">
                  Notifications for price movements
                </p>
              </div>
              <Switch
                checked={settings.push.price_alerts}
                onCheckedChange={(checked) => handleToggle('push', 'price_alerts', checked)}
              />
            </div>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Phone className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">SMS Notifications</h3>
          </div>
          
          <div className="ml-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-gray-500">
                  Critical security notifications
                </p>
              </div>
              <Switch
                checked={settings.sms.security}
                onCheckedChange={(checked) => handleToggle('sms', 'security', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Trading Updates</p>
                <p className="text-sm text-gray-500">
                  Important trading notifications
                </p>
              </div>
              <Switch
                checked={settings.sms.trading}
                onCheckedChange={(checked) => handleToggle('sms', 'trading', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 