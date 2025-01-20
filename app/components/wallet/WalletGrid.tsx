"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import WalletCard from "./WalletCard";

interface WalletData {
  id: string;
  currency: string;
  balance: string;
  locked: string;
  staked: string;
  converted_balance: string;
  reference_currency: string;
  is_crypto: boolean;
}

interface WalletGridProps {
  wallets: WalletData[];
  onToggleFavorite?: (currency: string) => void;
  favoriteWallets?: string[];
}

export default function WalletGrid({ wallets, onToggleFavorite, favoriteWallets = [] }: WalletGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hideSmallBalances, setHideSmallBalances] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Calculate total portfolio value in NGN
  const totalPortfolioValue = useMemo(() => {
    return wallets.reduce((total, wallet) => {
      const balance = parseFloat(wallet.balance) || 0;
      const convertedBalance = parseFloat(wallet.converted_balance) || 0;
      return total + (wallet.currency.toLowerCase() === 'ngn' ? balance : convertedBalance);
    }, 0);
  }, [wallets]);

  // Filter wallets based on search query and toggles
  const filteredWallets = useMemo(() => {
    return wallets.filter(wallet => {
      const matchesSearch = wallet.currency.toLowerCase().includes(searchQuery.toLowerCase());
      const hasBalance = parseFloat(wallet.balance) > 0;
      const isFavorite = favoriteWallets.includes(wallet.currency.toLowerCase());

      if (showOnlyFavorites && !isFavorite) return false;
      if (hideSmallBalances && !hasBalance) return false;
      return matchesSearch;
    });
  }, [wallets, searchQuery, hideSmallBalances, showOnlyFavorites, favoriteWallets]);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card className="bg-green-600/5 border-green-600/20">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Total Portfolio Value</h2>
            <div className="text-3xl font-bold">
              {formatCurrency(totalPortfolioValue, "NGN")}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search wallets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="hide-small-balances"
              checked={hideSmallBalances}
              onCheckedChange={setHideSmallBalances}
            />
            <Label htmlFor="hide-small-balances">Hide small balances</Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={showOnlyFavorites ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100" : ""}
          >
            <Star className={`h-4 w-4 mr-2 ${showOnlyFavorites ? "fill-yellow-500" : ""}`} />
            {showOnlyFavorites ? "All Wallets" : "Favorites"}
          </Button>
        </div>
      </div>

      {/* Wallet Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredWallets.map((wallet) => (
          <WalletCard
            key={wallet.id}
            currency={wallet.currency}
            balance={parseFloat(wallet.balance)}
            locked={parseFloat(wallet.locked)}
            isFavorite={favoriteWallets.includes(wallet.currency.toLowerCase())}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredWallets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery
              ? "No wallets match your search"
              : showOnlyFavorites
              ? "You haven't added any wallets to favorites"
              : hideSmallBalances
              ? "No wallets with balance found"
              : "No wallets found"}
          </p>
        </div>
      )}
    </div>
  );
} 