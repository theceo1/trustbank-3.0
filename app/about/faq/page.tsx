"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is trustBank?",
    answer: "trustBank is your gateway to seamless crypto banking. We're dedicated to providing secure, swift, and transparent financial solutions for the underserved."
  },
  {
    question: "What drives trustBank's mission?",
    answer: "Our mission is to bridge the financial gap, connecting millions worldwide to cutting-edge crypto banking services."
  },
  {
    question: "What are trustBank's core values?",
    answer: (
      <ul className="list-disc list-inside">
        <li>Customer-centricity</li>
        <li>Innovation</li>
        <li>Transparency</li>
        <li>Security</li>
        <li>Inclusivity</li>
      </ul>
    )
  },
  {
    question: "How can I create an account?",
    answer: (
      <>
        You can create an account by visiting our{' '}
        <Link href="/register" className="text-green-600 hover:underline">
          Sign Up
        </Link>{' '}
        page and following the instructions.
      </>
    )
  },
  {
    question: "How do I report suspicious activity?",
    answer: (
      <>
        Contact our dedicated support team via email or visit the{' '}
        <Link href="/about/contact" className="text-green-600 hover:underline">
          contact us
        </Link>{' '}
        page and fill the form.
      </>
    )
  },
  {
    question: "What services do you offer?",
    answer: "We offer cryptocurrency trading, a secure wallet, and a debit card for easy transactions, among other financial services."
  },
  {
    question: "What are your customer support hours?",
    answer: "Our support team is available 24/7."
  },
  {
    question: "What cryptocurrencies do you support?",
    answer: "We support major cryptocurrencies, including Bitcoin, Ethereum, Tether and Litecoin."
  },
  {
    question: "What is cryptocurrency?",
    answer: "Cryptocurrency is a digital or virtual currency that uses cryptography for security. It operates independently of a central bank and can be transferred directly between individuals.",
  },
  {
    question: "How do I start trading on trustBank?",
    answer: "To start trading on trustBank, simply create an account, verify your identity, deposit funds, and you're ready to buy and sell cryptocurrencies.",
  },
  {
    question: "Is trustBank secure?",
    answer: "Yes, trustBank employs state-of-the-art security measures, including encryption and multi-factor authentication, to ensure the safety of your assets and personal information.",
  },
];

export default function FAQPage() {
  return (
    <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ duration: 1.5 }}
        className="text-lg font-bold mb-4 text-green-600 pt-14"
      >
        F.A.Q
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ delay: 0.2, duration: 1.5 }}
        className="text-sm mb-4 text-gray-500"
      >
       <i> Get answers to your questions about trustBank, the innovative cryptocurrency exchange platform empowering the unbanked</i>.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 2, y: 0 }}
        transition={{ delay: 0.4, duration: 1.5 }}
      >
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  );
}
