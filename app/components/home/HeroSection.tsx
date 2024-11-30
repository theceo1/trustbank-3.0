"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BackgroundElement {
  width: number;
  height: number;
  left: string;
  top: string;
  duration: number;
}

export default function HeroSection() {
  const [backgroundElements, setBackgroundElements] = useState<BackgroundElement[]>([]);

  useEffect(() => {
    const elements: BackgroundElement[] = Array.from({ length: 20 }, () => ({
      width: Math.random() * 300 + 50,
      height: Math.random() * 300 + 50,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 5 + 5,
    }));
    setBackgroundElements(elements);
  }, []);

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background to-green-50/20 dark:to-green-950/20">
      <div className="absolute inset-0 overflow-hidden" style={{ position: 'absolute' }}>
        {backgroundElements.map((element, i) => (
          <motion.div
            key={i}
            className="absolute bg-green-500/20 rounded-full backdrop-blur-2xl"
            style={{
              width: element.width,
              height: element.height,
              left: element.left,
              top: element.top,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="space-y-8"
        >
          <motion.h1 
            className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-green-400"
            animate={{ 
              backgroundPosition: ['0%', '100%'],
              opacity: [0.5, 1]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            trustBank
          </motion.h1>
          
          <motion.p 
            className="text-lg tracking-wide mt-2 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            CRYPTO | SIMPLIFIED
          </motion.p>
          
          <motion.p 
            className="text-md max-w-2xl mx-auto text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            ❝Empowering You with Trusted Access to Crypto and Web3 Solutions.❞
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-300 text-white hover:text-black mt-16">
              <Link href="/auth/signup" className="flex items-center gap-2">
                Start Your Journey <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-16 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [10, 14, 10] }}
        transition={{ 
          delay: 0.5,
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={scrollToNextSection}
          className="rounded-full p-2 hover:bg-green-100 dark:hover:bg-green-900/20"
        >
          <ChevronDown className="h-6 w-6 text-green-600" />
        </Button>
      </motion.div>
    </div>
  );
}