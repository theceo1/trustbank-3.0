import { Shield, Bell, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

interface AnnouncementProps {
  isVerified: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export default function Announcements({ isVerified }: AnnouncementProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
    >
      {!isVerified && (
        <motion.div variants={item}>
          <Card className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Verify Your Account</h3>
            </div>
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
              Complete KYC verification to enable withdrawals and higher limits.
            </p>
            <Link 
              href="/profile/verification"
              className="mt-2 inline-block text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
            >
              Verify Now →
            </Link>
          </Card>
        </motion.div>
      )}
      
      <motion.div variants={item}>
        <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 text-sm">New Features</h3>
          </div>
          <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
            Check out our new crypto trading features and improved security measures.
          </p>
          <Link 
            href="/features"
            className="mt-2 inline-block text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            Learn More →
          </Link>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm">Market Update</h3>
          </div>
          <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
            Bitcoin hits new high! Check our latest market analysis.
          </p>
          <Link 
            href="/market"
            className="mt-2 inline-block text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            View Analysis →
          </Link>
        </Card>
      </motion.div>
    </motion.div>
  );
}