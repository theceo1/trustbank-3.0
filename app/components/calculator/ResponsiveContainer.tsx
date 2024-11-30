"use client";

import { motion } from "framer-motion";
import { useMediaQuery } from "@/app/hooks/use-media-query";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function ResponsiveContainer({ children, className = "" }: ResponsiveContainerProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <motion.div
      className={`container mx-auto px-4 ${
        isMobile ? "py-4" : "py-12"
      } ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}