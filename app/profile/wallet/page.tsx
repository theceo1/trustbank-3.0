// app/profile/wallet/page.tsx
import { Metadata } from "next";
import { WalletOverview } from "@/app/components/dashboard/WalletOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Wallet2, History, ArrowDown, ArrowUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Wallet | trustBank",
  description: "Manage your crypto wallet",
};

export default function WalletPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 mt-16">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Wallet</h2>
          <p className="text-muted-foreground">Manage your crypto assets</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <ArrowDown className="mr-2 h-4 w-4" />
            Deposit
          </Button>
          <Button variant="outline">
            <ArrowUp className="mr-2 h-4 w-4" />
            Withdraw
          </Button>
          <Button>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Trade
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Balance
                </CardTitle>
                <Wallet2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦0.00</div>
                <p className="text-xs text-muted-foreground">
                  +0.00% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <WalletOverview />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                View your recent transactions across all currencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Transaction history will be populated here */}
                <div className="flex items-center">
                  <History className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">No transactions yet</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Limits</CardTitle>
              <CardDescription>
                Your current transaction limits and verification level
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Transaction limits will be populated here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
