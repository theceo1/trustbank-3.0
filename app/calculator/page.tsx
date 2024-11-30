"use client";

import Calculator from "@/app/components/calculator/Calculator";
import { motion } from "framer-motion";

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-12 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
              Crypto Calculator
            </h1>
            <p className="text-muted-foreground mt-2">
              Get real-time conversion rates for cryptocurrencies
            </p>
          </div>

          <div className="text-left mb-6 flex items-center gap-2">
            <h2 className="text-md font-semibold">trust<span className="text-green-600">Rate™</span></h2>
            <span className="px-2.5 py-0.5 text-[7px] font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full uppercase tracking-wider">
              Beta
            </span>
          </div>
          
          <Calculator />

          <div className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-4">
            <p className="font-medium">Note:</p>
            <p>The conversion results shown are estimates. Actual rates may vary slightly at the time of transaction due to market volatility and network conditions.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
