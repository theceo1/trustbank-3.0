"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Modal from '@/components/ui/modal';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from "framer-motion";
import supabase from "@/lib/supabase/client";

interface BalanceData {
  balance: number;
  total_deposits: number;
  total_withdrawals: number;
  total: number;
  available: number;
  pending: number;
  currency: string;
}

export default function AccountBalance() {
  const [balance, setBalance] = useState<BalanceData>({
    balance: 0,
    total_deposits: 0,
    total_withdrawals: 0,
    total: 0,
    available: 0,
    pending: 0,
    currency: '₦'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const formatAmount = (amount: number | undefined | null): string => {
    return amount ? amount.toFixed(2) : '0.00';
  };

  const getCurrency = (): string => {
    return balance?.currency || '₦';
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Create new wallet if none exists
            const { data: newWallet, error: createError } = await supabase
              .from('wallets')
              .insert([
                {
                  user_id: user.id,
                  balance: 0,
                  total_deposits: 0,
                  total_withdrawals: 0,
                  pending_balance: 0,
                  currency: '₦',
                  last_transaction_at: new Date().toISOString()
                }
              ])
              .select()
              .single();

            if (createError) throw createError;
            
            if (newWallet) {
              setBalance({
                ...newWallet,
                total: newWallet.balance,
                available: newWallet.balance - (newWallet.pending_balance || 0),
                pending: newWallet.pending_balance || 0,
                currency: '₦'
              });
            }
          } else {
            throw error;
          }
        } else if (data) {
          setBalance({
            ...data,
            total: data.balance,
            available: data.balance - (data.pending_balance || 0),
            pending: data.pending_balance || 0,
            currency: '₦'
          });
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('wallets')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${user?.id}` },
        (payload: any) => {
          if (payload.new) {
            setBalance({
              ...payload.new,
              total: payload.new.balance,
              available: payload.new.balance - (payload.new.pending_balance || 0),
              pending: payload.new.pending_balance || 0,
              currency: '₦'
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {showBalance ? (
                    `${getCurrency()} ${formatAmount(balance?.available)}`
                  ) : (
                    '****'
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <div>
                  Total: {getCurrency()} {formatAmount(balance?.total)}
                </div>
              </div>
              <Button 
                onClick={() => setIsModalOpen(true)} 
                className="mt-4 w-full bg-black text-gray-100 hover:bg-gray-800"
              >
                Deposit
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Deposit Funds">
        <p className="text-green-600">Deposit feature coming soon.</p>
      </Modal>
    </motion.div>
  );
}
