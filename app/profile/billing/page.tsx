"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import BackButton from '@/components/ui/back-button';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Plus, Trash2, CheckCircle, AlertCircle, Receipt, Calendar, DollarSign } from 'lucide-react';
import supabase from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'card' | 'bank';
  last4: string;
  expiryDate?: string;
  isDefault: boolean;
  created_at: string;
}

interface BillingHistory {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'successful' | 'pending' | 'failed';
  description: string;
  payment_method: string;
  created_at: string;
}

export default function BillingPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Animation variants from your existing code
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

  const loadPaymentMethods = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        id: "payment-methods-error",
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadBillingHistory = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBillingHistory(data || []);
    } catch (error) {
      console.error('Error loading billing history:', error);
      toast({
        id: "billing-history-error",
        title: "Error",
        description: "Failed to load billing history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPaymentMethods();
    loadBillingHistory();
  }, [loadPaymentMethods, loadBillingHistory]);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    toast({
      id: "payment-methods-success",
      title: "Default payment method updated",
      description: "Your default payment method has been updated successfully.",
    });
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
    toast({
      id: "payment-methods-success",
      title: "Payment method removed",
      description: "The payment method has been removed successfully.",
    });
  };

  return (
    <Tabs defaultValue="payment-methods" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        <TabsTrigger value="billing-history">Billing History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="payment-methods">
        <motion.div
          className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <BackButton />
          
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  <CardTitle className="text-2xl font-bold text-green-600">Billing & Payments</CardTitle>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Input placeholder="Card Number" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="MM/YY" />
                        <Input placeholder="CVC" />
                      </div>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          toast({
                            id: "payment-methods-success",
                            title: "Payment method added",
                            description: "Your new payment method has been added successfully.",
                          });
                        }}
                      >
                        Add Payment Method
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <motion.div variants={itemVariants} className="space-y-4">
                {paymentMethods.map((method) => (
                  <motion.div
                    key={method.id}
                    variants={itemVariants}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <CreditCard className="w-6 h-6 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {method.type === 'card' ? 'Card' : 'Bank Account'} ending in {method.last4}
                        </p>
                        {method.expiryDate && (
                          <p className="text-sm text-gray-500">Expires {method.expiryDate}</p>
                        )}
                        {method.isDefault && (
                          <Badge variant="secondary" className="mt-1">Default</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(method.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>
      
      <TabsContent value="billing-history">
        {/* New billing history content */}
      </TabsContent>
    </Tabs>
  );
}
