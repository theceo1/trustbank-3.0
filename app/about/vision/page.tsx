"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/app/components/ui/modal";
import { Eye, Target, Lightbulb, Globe, ChartLine, Shield, Mail, Check } from "lucide-react";
import Image from 'next/image';
import supabase from '@/lib/supabase/client';

const visionPoints = [
  {
    icon: <Eye className="h-6 w-6 text-green-600" />,
    title: "Future Vision",
    description: "Transforming the financial landscape through innovation and accessibility.",
    details: [
      "Digital-first banking solutions",
      "Seamless cross-border transactions",
      "Inclusive financial services"
    ]
  },
  {
    icon: <Globe className="h-6 w-6 text-green-600" />,
    title: "Global Impact",
    description: "Creating a borderless financial ecosystem that serves everyone.",
    details: [
      "Worldwide accessibility",
      "Multi-currency support",
      "24/7 global operations"
    ]
  },
  {
    icon: <ChartLine className="h-6 w-6 text-green-600" />,
    title: "Sustainable Growth",
    description: "Building a resilient platform for long-term success.",
    details: [
      "Scalable infrastructure",
      "Environmental consciousness",
      "Continuous innovation"
    ]
  }
];

export default function VisionPage() {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    controls.start(i => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2 }
    }));
  }, [controls]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Simple insert without upsert
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email,
            source: 'vision_page',
            preferences: { interests: ['company_vision', 'updates'] },
            metadata: { subscribed_from: 'vision' }
          }
        ]);

      if (error) throw error;

      setIsModalOpen(true);
      setEmail('');
    } catch (error: any) {
      console.error('Subscription error:', error);
      if (error.code === '23505') { // Unique violation error code
        setError('This email is already subscribed to our newsletter.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">Our Vision</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Shaping Tomorrow&apos;s Finance
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We envision a world where financial services are seamlessly integrated, universally accessible, and inherently secure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {visionPoints.map((point, index) => (
            <motion.div
              key={point.title}
              custom={index}
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-600/5 rounded-full -mr-10 -mt-10" />
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {point.icon}
                    <CardTitle className="text-lg">{point.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{point.description}</p>
                  <ul className="space-y-2">
                    {point.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="my-16"
        >
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6 p-6">
              <div className="space-y-4 flex flex-col justify-center">
                <Badge variant="outline" className="w-fit text-xs bg-green-600/10 text-gray-500">Coming Soon</Badge>
                <CardTitle className="text-lg">trustCard</CardTitle>
                <CardDescription className="text-sm">
                  The future of crypto spending. trustCard seamlessly bridges the gap between your crypto assets and everyday transactions.
                </CardDescription>
                <ul className="space-y-2 text-sm">
                  {[
                    "Instant crypto-to-fiat conversion",
                    "Zero foreign transaction fees",
                    "Enhanced security features",
                    "Worldwide acceptance",
                    "Real-time transaction tracking"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground italic">
                    earn while you spend
                </p>
              </div>
              <div className="relative h-[300px] md:h-auto">
                <Image
                  src="/images/debit-card2.svg"
                  alt="TrustCard - Crypto Debit Card"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative mt-16"
        >
          <Card className="border-2 border-green-600/20">
            <CardHeader className="text-center">
              <CardTitle>Join Us in Shaping the Future</CardTitle>
              <CardDescription>
                Subscribe to stay updated on our journey and be part of the revolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-300 text-white hover:text-black transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Target className="h-6 w-6" />
                      </motion.div>
                      Subscribing...
                    </span>
                  ) : (
                    'Join the Vision'
                  )}
                </Button>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-muted-foreground"
        >
          <p className="text-sm">
            Join over 3,000+ visionaries who have already subscribed to our journey
          </p>
        </motion.div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-lg font-bold mb-2 text-center text-green-600">Welcome to the Future! 🚀</h2>
          <p className="text-muted-foreground mb-4 text-center">
            You&apos;re now part of the exclusive community shaping the future of finance.
          </p>
          <Button 
            onClick={() => setIsModalOpen(false)}
            className="bg-green-600 hover:bg-green-300 text-white hover:text-black transition-colors"
          >
            Continue Exploring
          </Button>
        </div>
      </Modal>
    </div>
  );
}
