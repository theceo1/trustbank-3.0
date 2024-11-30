"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Scale, Shield, UserCheck, FileText, Settings, Phone, AlertCircle, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from 'next/link';

export default function TermsOfServicePage() {
  const sections = [
    { id: "company", icon: Building2, title: "Company Information" },
    { id: "terms", icon: Scale, title: "Terms & Conditions" },
    { id: "privacy", icon: Shield, title: "Privacy & Security" },
    { id: "account", icon: UserCheck, title: "Account & Usage" },
    { id: "legal", icon: FileText, title: "Legal" },
    { id: "contact", icon: Phone, title: "Contact" },
  ];

  return (
    <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-4 lg:px-8 pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-green-600 mb-2">Terms of Service</h1>
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
                <Building2 className="h-5 w-5 text-green-600" />
                <CardTitle className="text-xl">Digital Kloud Transact Limited</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                A licensed financial service company powering trustBank
              </p>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="company" className="w-full">
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
                  {/* Company Information */}
                  <TabsContent value="company" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">About Us</h3>
                        <p className="text-sm">
                          trustBank is a product of Digital Kloud Transact Limited, a licensed financial service company. Our platform at{' '}
                          <Link 
                            href="https://www.trustbank.tech" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            www.trustbank.tech
                          </Link>{' '}
                          provides innovative cryptocurrency trading services while maintaining strict compliance with financial regulations.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Licensing & Regulation</h3>
                        <p className="text-sm">
                          Digital Kloud Transact Limited is a registered financial services provider, operating under the regulatory framework of relevant financial authorities. We maintain all necessary licenses and permissions to provide cryptocurrency trading services.
                        </p>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Our Mission</h3>
                        <p className="text-sm">
                          To provide secure, transparent, and accessible cryptocurrency trading services while maintaining the highest standards of regulatory compliance and customer protection.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Terms & Conditions */}
                  <TabsContent value="terms" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">1. Acceptance of Terms</h3>
                        <p className="text-sm">
                          By accessing or using trustBank&apos;s services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.
                        </p>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">2. Eligibility</h3>
                        <p className="text-sm">
                          To use our services, you must be:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>At least 18 years old</li>
                          <li>Legally capable of forming a binding contract</li>
                          <li>Not prohibited from using our services by applicable law</li>
                          <li>A resident of a jurisdiction where our services are available</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">3. Account Registration</h3>
                        <p className="text-sm">
                          To use certain features of our services, you may be required to register for an account. You agree to:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>Provide accurate and complete registration information</li>
                          <li>Maintain and update your information</li>
                          <li>Keep your account credentials secure</li>
                          <li>Notify us immediately of any unauthorized access</li>
                          <li>Accept responsibility for all activities under your account</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">4. Service Modifications</h3>
                        <p className="text-sm">
                          trustBank reserves the right to:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>Modify or discontinue services temporarily or permanently</li>
                          <li>Change fees or charges for our services</li>
                          <li>Implement new features or requirements</li>
                          <li>Update security protocols and requirements</li>
                        </ul>
                      </div>

                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Cryptocurrency trading involves significant risks. Please trade responsibly and within your means.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>

                  {/* Privacy & Security */}
                  <TabsContent value="privacy" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Data Protection</h3>
                        <p className="text-sm">
                          We implement robust security measures to protect your personal and financial information. Our security protocols include:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>End-to-end encryption</li>
                          <li>Two-factor authentication</li>
                          <li>Regular security audits</li>
                          <li>Compliance with international data protection standards</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Information Usage</h3>
                        <p className="text-sm">
                          We collect and use your information in accordance with our{' '}
                          <Link href="/privacy-policy" className="text-green-600 hover:text-green-700">
                            Privacy Policy
                          </Link>
                          . Your data is never sold to third parties.
                        </p>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Security Measures</h3>
                        <p className="text-sm">
                          We employ industry-standard security protocols:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>SSL/TLS encryption for all data transmission</li>
                          <li>Multi-factor authentication options</li>
                          <li>Regular security audits and penetration testing</li>
                          <li>Cold storage for digital assets</li>
                          <li>24/7 security monitoring</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Account & Usage */}
                  <TabsContent value="account" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Account Management</h3>
                        <p className="text-sm">
                          Users are responsible for:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>Maintaining account security</li>
                          <li>Keeping personal information up to date</li>
                          <li>Reporting any unauthorized access</li>
                          <li>Complying with KYC/AML requirements</li>
                        </ul>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Trading Rules</h3>
                        <p className="text-sm">
                          All trading activities must comply with our platform rules and applicable regulations. We reserve the right to suspend accounts that violate these terms.
                        </p>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Trading Guidelines</h3>
                        <p className="text-sm">
                          When using our trading platform:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>Verify all transaction details before confirming</li>
                          <li>Maintain sufficient funds for trades</li>
                          <li>Be aware of market volatility risks</li>
                          <li>Follow our anti-money laundering policies</li>
                          <li>Report suspicious activities</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Legal */}
                  <TabsContent value="legal" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Jurisdiction</h3>
                        <p className="text-sm">
                          These terms are governed by law. Any disputes shall be resolved in the courts of [Jurisdiction].
                        </p>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Liability</h3>
                        <p className="text-sm">
                          Digital Kloud Transact Limited&apos;s liability is limited to the extent permitted by applicable law. We are not liable for:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>Market volatility and trading losses</li>
                          <li>Technical issues beyond our control</li>
                          <li>Third-party services</li>
                          <li>Force majeure events</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Contact */}
                  <TabsContent value="contact" className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Customer Support</h3>
                        <p className="text-sm">
                          Our support team is available 24/7. Contact us through:
                        </p>
                        <ul className="list-none text-sm mt-2 space-y-2">
                          <li className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-green-600" />
                            <span>support@trustbank.tech</span>
                          </li>
                          {/* <li className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-green-600" />
                            <span>+1 (555) 123-4567</span>
                          </li> */}
                        </ul>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2 text-green-600">Office Location</h3>
                        <p className="text-sm">
                          Digital Kloud Transact Limited<br />
                          World Wide Web . tech<br />
                          
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
    </div>
  );
}
