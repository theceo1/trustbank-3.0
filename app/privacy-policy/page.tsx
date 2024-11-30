"use client";

import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, UserCheck, Bell, FileText, Mail, Target, Check } from "lucide-react";
import Link from 'next/link';
import supabase from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/app/components/ui/modal";

export default function PrivacyPolicyPage() {
  const sections = [
    { id: "overview", icon: Shield, title: "Overview" },
    { id: "collection", icon: FileText, title: "Data Collection" },
    { id: "security", icon: Lock, title: "Security" },
    { id: "rights", icon: UserCheck, title: "Your Rights" },
    { id: "updates", icon: Bell, title: "Updates" },
    { id: "contact", icon: Mail, title: "Contact" },
  ];

  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email,
            source: 'privacy_policy',
            preferences: { interests: ['privacy_updates', 'policy_changes'] },
            metadata: { subscribed_from: 'privacy_policy' }
          }
        ]);

      if (error) throw error;

      setIsModalOpen(true);
      setEmail('');
    } catch (error: any) {
      console.error('Subscription error:', error);
      if (error.code === '23505') {
        setError('This email is already subscribed to our newsletter.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-4 lg:px-8 pt-24 lg:pt-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-green-600 mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="border-t-4 border-t-green-600 p-2 sm:p-4">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-green-600" />
                <CardTitle className="text-xl">Our Commitment to Your Privacy</CardTitle>
              </div>
              <CardDescription>
                A Digital Kloud Transact Limited Service
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 h-auto gap-1 sm:gap-2">
                  {sections.map((section) => (
                    <TabsTrigger 
                      key={section.id} 
                      value={section.id}
                      className="flex flex-col gap-1 py-2 h-auto"
                    >
                      <section.icon className="h-4 w-4" />
                      <span className="text-xs">{section.title}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <ScrollArea className="h-[50vh] sm:h-[60vh] mt-4 sm:mt-6 pr-2 sm:pr-4">
                  {/* Overview Section */}
                  <TabsContent value="overview" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Introduction</h3>
                        <p className="text-sm">
                          At trustBank, we prioritize the protection of your privacy and personal information. This comprehensive privacy policy outlines our practices for data collection, usage, and protection.
                        </p>
                      </div>
                      
                      {/* Add more content sections following the same pattern */}
                    </div>
                  </TabsContent>

                  {/* Data Collection Section */}
                  <TabsContent value="collection" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Information We Collect</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Personal Information</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              <li>Full name and contact details</li>
                              <li>Date of birth and nationality</li>
                              <li>Government-issued identification</li>
                              <li>Residential address</li>
                              <li>Email address and phone number</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Financial Information</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              <li>Bank account details</li>
                              <li>Transaction history</li>
                              <li>Cryptocurrency wallet addresses</li>
                              <li>Trading preferences and history</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-1">Technical Data</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              <li>IP address and device information</li>
                              <li>Browser type and version</li>
                              <li>Operating system details</li>
                              <li>Login timestamps and activity logs</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">How We Use Your Data</h3>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Account creation and maintenance</li>
                          <li>Processing transactions and trades</li>
                          <li>Identity verification and KYC compliance</li>
                          <li>Fraud prevention and security monitoring</li>
                          <li>Service improvements and personalization</li>
                          <li>Communication about platform updates</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Security Section */}
                  <TabsContent value="security" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Security Measures</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Technical Security</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              <li>256-bit SSL/TLS encryption</li>
                              <li>Two-factor authentication (2FA)</li>
                              <li>Regular security audits and penetration testing</li>
                              <li>Advanced firewall protection</li>
                              <li>Real-time threat monitoring</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-1">Asset Security</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              <li>Cold storage for digital assets</li>
                              <li>Multi-signature wallet technology</li>
                              <li>Insurance coverage for stored assets</li>
                              <li>Regular backup procedures</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Your Rights Section */}
                  <TabsContent value="rights" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Your Data Rights</h3>
                        <p className="text-sm mb-2">
                          Under applicable data protection laws, you have the following rights:
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Right to access your personal data</li>
                          <li>Right to rectify inaccurate information</li>
                          <li>Right to request data deletion</li>
                          <li>Right to restrict processing</li>
                          <li>Right to data portability</li>
                          <li>Right to object to processing</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Exercising Your Rights</h3>
                        <p className="text-sm mb-2">
                          To exercise any of these rights, please contact our Data Protection Officer at{' '}
                          <Link href="mailto:privacy@trustbank.tech" className="text-green-600 hover:text-green-700">
                            privacy@trustbank.tech
                          </Link>
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Updates Section */}
                  <TabsContent value="updates" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Policy Updates</h3>
                        <p className="text-sm mb-2">
                          We regularly review and update our privacy policy to ensure it remains current with:
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Changes in our services and operations</li>
                          <li>Updates to legal and regulatory requirements</li>
                          <li>Improvements in security practices</li>
                          <li>Enhanced data protection measures</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Notification of Changes</h3>
                        <p className="text-sm">
                          We will notify you of any material changes to this policy through:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>Email notifications</li>
                          <li>Platform announcements</li>
                          <li>Website updates</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Stay Updated</h3>
                        <p className="text-sm mb-4 italic text-center text-gray-500">
                          Subscribe to receive notifications about privacy policy updates and security enhancements.
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-4">
                          <div className="relative hover:bg-white transition-colors duration-300 rounded-lg p-1">
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
                            className="w-full bg-green-600 hover:bg-green-300 transition-colors text-white font-semibold hover:text-black"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <span className="flex items-center">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <Target className="h-5 w-5" />
                                </motion.div>
                                Subscribing...
                              </span>
                            ) : (
                              'Subscribe to Updates'
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
                          <p className="text-xs text-muted-foreground text-center">
                            By subscribing, you agree to receive privacy policy updates and related communications.
                          </p>
                        </form>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Contact Section */}
                  <TabsContent value="contact" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Contact Information</h3>
                        <p className="text-sm mb-4">
                          For any privacy-related inquiries or concerns, please reach out to us:
                        </p>
                        <ul className="list-none text-sm space-y-3">
                          <li className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-green-600" />
                            <span>privacy@trustbank.tech</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span>Data Protection Officer</span>
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Response Time</h3>
                        <p className="text-sm">
                          We aim to respond to all privacy-related requests within 48 hours. For urgent matters, please indicate this in your communication.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
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
          <h2 className="text-lg font-bold mb-4 text-green-600">Successfully Subscribed!</h2>
          <p className="text-muted-foreground mb-6">
            You&apos;ll now receive updates about our privacy policy changes.
          </p>
          <Button 
            onClick={() => setIsModalOpen(false)}
            className="bg-green-600 hover:bg-green-700"
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}

