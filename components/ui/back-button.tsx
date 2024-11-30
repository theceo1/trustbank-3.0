import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function BackButton() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="mb-4 text-gray-600 hover:text-green-600"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </Button>
    </motion.div>
  );
}