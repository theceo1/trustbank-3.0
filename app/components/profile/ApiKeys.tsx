import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Key, Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  secret?: string;
  created_at: string;
  last_used?: string;
  permissions: {
    read: boolean;
    trade: boolean;
    withdraw: boolean;
  };
}

interface ApiKeysProps {
  apiKeys: ApiKey[];
  className?: string;
}

export function ApiKeys({ apiKeys: initialApiKeys = [], className = '' }: ApiKeysProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: {
      read: true,
      trade: false,
      withdraw: false
    }
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const handleCreateKey = async () => {
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newKeyData),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const newKey = await response.json();
      setApiKeys([...apiKeys, newKey]);
      setShowCreateDialog(false);
      setNewKeyData({
        name: '',
        permissions: {
          read: true,
          trade: false,
          withdraw: false
        }
      });
      toast.success('API key created successfully');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      toast.success('API key deleted successfully');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const handleCopyKey = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const toggleShowSecret = (keyId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">API Keys</CardTitle>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Key
        </Button>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Used</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">{key.name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                      {showSecrets[key.id] ? key.key : '••••••••••••••••'}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShowSecret(key.id)}
                    >
                      {showSecrets[key.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyKey(key.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-x-2">
                    {key.permissions.read && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Read
                      </span>
                    )}
                    {key.permissions.trade && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Trade
                      </span>
                    )}
                    {key.permissions.withdraw && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Withdraw
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{new Date(key.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {key.last_used
                    ? new Date(key.last_used).toLocaleDateString()
                    : 'Never'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteKey(key.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <div>
                <label className="text-sm font-medium">Key Name</label>
                <Input
                  value={newKeyData.name}
                  onChange={(e) =>
                    setNewKeyData({ ...newKeyData, name: e.target.value })
                  }
                  placeholder="Enter a name for your API key"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Permissions</label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Read</p>
                      <p className="text-sm text-gray-500">
                        View account information and transactions
                      </p>
                    </div>
                    <Switch
                      checked={newKeyData.permissions.read}
                      onCheckedChange={(checked) =>
                        setNewKeyData({
                          ...newKeyData,
                          permissions: { ...newKeyData.permissions, read: checked }
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Trade</p>
                      <p className="text-sm text-gray-500">
                        Create and manage orders
                      </p>
                    </div>
                    <Switch
                      checked={newKeyData.permissions.trade}
                      onCheckedChange={(checked) =>
                        setNewKeyData({
                          ...newKeyData,
                          permissions: { ...newKeyData.permissions, trade: checked }
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Withdraw</p>
                      <p className="text-sm text-gray-500">
                        Withdraw funds from your account
                      </p>
                    </div>
                    <Switch
                      checked={newKeyData.permissions.withdraw}
                      onCheckedChange={(checked) =>
                        setNewKeyData({
                          ...newKeyData,
                          permissions: { ...newKeyData.permissions, withdraw: checked }
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleCreateKey}
                disabled={!newKeyData.name}
              >
                Create API Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 