"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import supabase from '@/lib/supabase/client';  
import { Modal } from "@/app/components/ui/modal";
import { Mail, Phone, MapPin, MessageSquare, Loader2, Globe, Twitter, Instagram, Facebook } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`https://ipinfo.io?token=${process.env.NEXT_PUBLIC_IPINFO_API_KEY}`);
      const locationData = await response.json();
      const userLocation = `${locationData.city}, ${locationData.region}, ${locationData.country}`;

      const { error: supabaseError } = await supabase
        .from('contact_messages')
        .insert([{ name, email, message, location: userLocation, created_at: new Date().toISOString() }]);

      if (supabaseError) throw supabaseError;

      setIsModalOpen(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error: any) {
      setError('An error occurred while sending your message. Please try again.');
      toast({
        id: 'contact-error',
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-5xl mx-auto pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-green-600 mb-4">Get in Touch</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions about our services? We&apos;re here to help and would love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Find us through any of these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { icon: <Mail className="h-5 w-5" />, text: "support@trustbank.tech" },
                    // { icon: <Phone className="h-5 w-5" />, text: "+234 (800) TRUST-BANK" },
                    { icon: <Globe className="h-5 w-5" />, text: "@trustbanktech" },
                    { icon: <MapPin className="h-5 w-5" />, text: "World Wide Web" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 text-muted-foreground">
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Business Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Monday - Friday: 7:00 AM - 10:00 PM (WAT)<br />
                    Weekend: Available for emergencies
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>Fill out the form below and we&apos;ll get back to you shortly</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="border-muted-foreground/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-muted-foreground/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="How can we help?"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="min-h-[120px] border-muted-foreground/20"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-300 hover:text-black text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <MessageSquare className="h-8 w-8 text-green-600" />
          </motion.div>
          <h2 className="text-lg font-semibold mb-2 text-green-600">Thank You!</h2>
          <p className="text-muted-foreground mb-2">
            We&apos;ve received your message and will get back to you within 24 hours.
          </p>
          <p className="mb-6 bg-gray-300 p-2 rounded-sm text-black"> <span className="font-bold text-green-600">Signed:</span> Tony from trustBank</p>

          <Button 
            onClick={() => setIsModalOpen(false)}
            className="bg-green-600 hover:bg-green-300 hover:text-black text-white mt-2"
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
