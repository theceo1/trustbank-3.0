import { Suspense } from 'react';
import TransactionStatusView from '@/app/transaction/[id]/TransactionStatusView';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';
import { NextPage } from 'next';

interface TransactionPageProps {
  params: Promise<{
    id: string;
  }>;
}

const TransactionPage: NextPage<TransactionPageProps> = async ({ params }) => {
  const { id } = await params;

  // Fetch transaction details based on the id
  const transaction = await fetchTransactionDetails(id);

  if (!transaction) {
    notFound(); // This will return a 404 page if the transaction is not found
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <TransactionStatusView transactionId={id} />
      </Suspense>
    </div>
  );
};

// Function to fetch transaction details
async function fetchTransactionDetails(id: string) {
  const response = await fetch(`https://trustbank.tech/transactions/${id}`); // Replace with your actual API endpoint
  if (!response.ok) {
    return null; // Handle error appropriately
  }
  return response.json();
}

export default TransactionPage;