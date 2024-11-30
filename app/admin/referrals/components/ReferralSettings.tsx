"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit2, Save, Trash2 } from "lucide-react";
import supabase from "@/lib/supabase/client";

interface ReferralTier {
  tier_name: string;
  min_referrals: number;
  commission_rate: number;
  benefits: string[];
}

export default function ReferralSettings() {
  const [tiers, setTiers] = useState<ReferralTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<ReferralTier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchTiers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('referral_tiers')
        .select('*')
        .order('min_referrals', { ascending: true });

      if (error) throw error;
      setTiers(data || []);
    } catch (error) {
      toast({
        id: 'fetch-error',
        title: "Error",
        description: "Failed to fetch referral tiers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const handleSaveTier = async (tier: ReferralTier) => {
    try {
      const { error } = await supabase
        .from('referral_tiers')
        .upsert({
          tier_name: tier.tier_name,
          min_referrals: tier.min_referrals,
          commission_rate: tier.commission_rate,
          benefits: tier.benefits
        });

      if (error) throw error;

      toast({
        id: 'save-success',
        title: "Success",
        description: "Referral tier saved successfully",
      });

      fetchTiers();
      setIsDialogOpen(false);
      setEditingTier(null);
    } catch (error) {
      console.error('Error saving tier:', error);
      toast({
        id: 'save-error',
        title: "Error",
        description: "Failed to save referral tier",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTier = async (tierName: string) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;

    try {
      const { error } = await supabase
        .from('referral_tiers')
        .delete()
        .eq('tier_name', tierName);

      if (error) throw error;

      toast({
        id: 'delete-success',
        title: "Success",
        description: "Referral tier deleted successfully",
      });

      fetchTiers();
    } catch (error) {
      console.error('Error deleting tier:', error);
      toast({
        id: 'delete-error',
        title: "Error",
        description: "Failed to delete referral tier",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Referral Tiers</CardTitle>
              <CardDescription>
                Manage referral tiers and commission rates
              </CardDescription>
            </div>
            <Button onClick={() => {
              setEditingTier({
                tier_name: '',
                min_referrals: 0,
                commission_rate: 0,
                benefits: []
              });
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier Name</TableHead>
                <TableHead>Min. Referrals</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Benefits</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier) => (
                <TableRow key={tier.tier_name}>
                  <TableCell className="font-medium">{tier.tier_name}</TableCell>
                  <TableCell>{tier.min_referrals}</TableCell>
                  <TableCell>{tier.commission_rate}%</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {tier.benefits.map((benefit, index) => (
                        <Badge key={index} variant="secondary">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingTier(tier);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTier(tier.tier_name)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
          <CardDescription>
            Configure global referral program settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Minimum Payout Amount</label>
                <Input type="number" placeholder="Enter amount" />
              </div>
              <div>
                <label className="text-sm font-medium">Payout Frequency</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTier?.tier_name ? 'Edit Tier' : 'Add New Tier'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tier Name</label>
              <Input
                value={editingTier?.tier_name || ''}
                onChange={(e) => setEditingTier(prev => ({
                  ...prev!,
                  tier_name: e.target.value
                }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Minimum Referrals</label>
              <Input
                type="number"
                value={editingTier?.min_referrals || 0}
                onChange={(e) => setEditingTier(prev => ({
                  ...prev!,
                  min_referrals: parseInt(e.target.value)
                }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Commission Rate (%)</label>
              <Input
                type="number"
                value={editingTier?.commission_rate || 0}
                onChange={(e) => setEditingTier(prev => ({
                  ...prev!,
                  commission_rate: parseFloat(e.target.value)
                }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Benefits (comma-separated)</label>
              <Input
                value={editingTier?.benefits.join(', ') || ''}
                onChange={(e) => setEditingTier(prev => ({
                  ...prev!,
                  benefits: e.target.value.split(',').map(b => b.trim())
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => editingTier && handleSaveTier(editingTier)}>
              <Save className="h-4 w-4 mr-2" />
              Save Tier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}