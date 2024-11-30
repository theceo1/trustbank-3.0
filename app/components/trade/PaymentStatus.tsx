import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PaymentStatus() {
  const { id } = useParams();
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const checkStatus = async () => {
      const response = await fetch(`/api/trades/${id}/status`);
      const data = await response.json();
      setStatus(data.status);

      if (!['completed', 'failed'].includes(data.status)) {
        setTimeout(checkStatus, 5000);
      }
    };

    checkStatus();
  }, [id]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Payment Status: {status}</h2>
      {/* Status-specific UI */}
    </div>
  );
} 