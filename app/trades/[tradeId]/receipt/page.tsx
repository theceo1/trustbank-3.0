import { Metadata } from "next";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound } from "next/navigation";
import { TradeReceipt } from "@/app/components/trade/TradeReceipt";

export const metadata: Metadata = {
  title: "Trade Receipt",
  description: "View and print your trade receipt",
};

interface TradeReceiptPageProps {
  params: {
    tradeId: string;
  };
}

export default async function TradeReceiptPage({ params }: TradeReceiptPageProps) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    notFound();
  }

  const { data: trade, error } = await supabase
    .from("trades")
    .select("*")
    .eq("id", params.tradeId)
    .eq("user_id", session.user.id)
    .single();

  if (error || !trade) {
    notFound();
  }

  return (
    <div className="container max-w-2xl py-8 space-y-8">
      <TradeReceipt trade={trade} />
    </div>
  );
} 