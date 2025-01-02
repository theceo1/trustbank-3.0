import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Key, Smartphone, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

interface SecuritySettingsProps {
  twoFactorEnabled: boolean;
  className?: string;
}

export function SecuritySettings({ twoFactorEnabled: initialTwoFactorEnabled, className = '' }: SecuritySettingsProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactorEnabled);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [showConfirmDisable, setShowConfirmDisable] = useState(false);

  useEffect(() => {
    if (showQRCode) {
      fetchQRCodeData();
    }
  }, [showQRCode]);

  const fetchQRCodeData = async () => {
    try {
      const response = await fetch('/api/user/2fa/setup');
      if (!response.ok) {
        throw new Error('Failed to fetch 2FA setup data');
      }
      const data = await response.json();
      setQrCodeData(data.otpauth_url);
    } catch (error) {
      console.error('Error fetching 2FA setup data:', error);
      toast.error('Failed to setup two-factor authentication');
      setShowQRCode(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!twoFactorEnabled) {
      setShowQRCode(true);
    } else {
      setShowConfirmDisable(true);
    }
  };

  const handleDisable2FA = async () => {
    try {
      const response = await fetch('/api/user/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disable 2FA');
      }

      setTwoFactorEnabled(false);
      setShowConfirmDisable(false);
      toast.success('Two-factor authentication disabled');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Failed to disable two-factor authentication');
    }
  };

  const handleVerify2FA = async () => {
    try {
      const response = await fetch('/api/user/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      setTwoFactorEnabled(true);
      setShowQRCode(false);
      setVerificationCode('');
      toast.success('Two-factor authentication enabled');
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error('Failed to enable two-factor authentication');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Security Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-blue-500" />
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={handleToggle2FA}
          />
        </div>

        <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <div className="flex justify-center">
                {qrCodeData ? (
                  <div className="p-4 bg-white rounded-lg">
                    <QRCodeSVG value={qrCodeData} size={192} />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-sm text-center text-gray-500">
                Scan this QR code with your authenticator app
              </p>
              <Input
                type="text"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="text-center"
              />
              <Button
                className="w-full"
                onClick={handleVerify2FA}
                disabled={!verificationCode}
              >
                Verify and Enable
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showConfirmDisable} onOpenChange={setShowConfirmDisable}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to disable two-factor authentication? This will make your account less secure.
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowConfirmDisable(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDisable2FA}
                >
                  Disable 2FA
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Key className="h-6 w-6 text-blue-500" />
            <div>
              <h3 className="font-medium">API Keys</h3>
              <p className="text-sm text-gray-500">
                Manage your API keys for automated trading
              </p>
            </div>
          </div>
          <Button variant="outline">Manage Keys</Button>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-medium">Account Activity</h3>
              <p className="text-sm text-gray-500">
                View login history and active sessions
              </p>
            </div>
          </div>
          <Button variant="outline">View Activity</Button>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">
            Danger Zone
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            These actions are irreversible. Please proceed with caution.
          </p>
          <div className="space-y-2">
            <Button variant="destructive" className="w-full">
              Reset Security Settings
            </Button>
            <Button variant="destructive" className="w-full">
              Deactivate Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 