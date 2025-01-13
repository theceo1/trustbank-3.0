import { Metadata } from "next";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound } from "next/navigation";
import { TradeDetails } from "@/app/components/trade/TradeDetails";

export const metadata: Metadata = {
  title: "Trade Details",
  description: "View your trade details and download receipt",
};

interface TradeDetailsPageProps {
  params: {
    tradeId: string;
  };
}

export default async function TradeDetailsPage({ params }: TradeDetailsPageProps) {
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
      <TradeDetails trade={trade} />
    </div>
  );
} 