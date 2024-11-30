"use client";

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/app/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Shield, Rocket, Mail, ArrowRight } from "lucide-react";
import Image from 'next/image';
import supabase from '@/lib/supabase/client';
import { Check } from 'lucide-react';

export default function MissionPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    controls.start(i => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2 }
    }));
  }, [controls]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .upsert({ 
          email,
          source: 'mission_page',
          preferences: { interests: ['company_updates', 'mission'] },
          metadata: { subscribed_from: 'mission' }
        }, 
        { onConflict: 'email' });

      if (error) throw error;

      setIsModalOpen(true);
      setEmail('');
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const missionPoints = [
    {
      icon: <Target className="h-6 w-6 text-green-600" />,
      title: "Our Core Mission",
      description: "Making financial services accessible, secure, and effortless for everyone, everywhere."
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      title: "Community First",
      description: "Building a global community of financially empowered individuals."
    },
    {
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: "Security & Trust",
      description: "Ensuring the highest standards of security and transparency in all operations."
    },
    {
      icon: <Rocket className="h-6 w-6 text-green-600" />,
      title: "Innovation",
      description: "Continuously evolving our technology to meet tomorrow's financial needs."
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">Our Mission</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Empowering Global Finance
          </h1>
          <p className="text-muted-foreground">
            Building the future of finance, one transaction at a time
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {missionPoints.map((point, index) => (
            <motion.div
              key={point.title}
              custom={index}
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {point.icon}
                    <CardTitle className="text-lg">{point.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{point.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative"
        >
          <Card className="overflow-hidden border-2 border-green-600/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Join Our Mission</CardTitle>
              <CardDescription>
                Be part of the financial revolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full bg-green-600 hover:bg-green-300 hover:text-black transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Subscribing...'
                  ) : (
                    <span className="flex items-center gap-2">
                      Join the Waitlist <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
              </form>
            </CardContent>
          </Card>
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
          <h2 className="text-2xl font-bold mb-4">Welcome Aboard! 🚀</h2>
          <p className="text-muted-foreground mb-6">
            You&apos;re now part of the <span className="text-green-600 font-bold">TRUSTED</span> community.
            Get ready for an exciting journey ahead!
          </p>
          <Button 
            onClick={() => setIsModalOpen(false)}
            className="bg-green-600 hover:bg-green-700"
          >
            Got it, thanks!
          </Button>
        </div>
      </Modal>
    </div>
  );
}
