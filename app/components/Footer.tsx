"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Facebook, 
  Instagram, 
  X, 
  AtSign, 
  MessageCircle,
  Globe,
  BookOpen,
  Wallet,
  BarChart3,
  Calculator,
  Shield,
  HelpCircle,
  Mail,
  FileText,
  GraduationCap,
  Eye,
  Target,
  Newspaper,
  ExternalLink,
  Send,
  DollarSign,
  Repeat,
  Gift,
  Headphones,
  AlertCircle,
  BookMarked,
  Users,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Custom Meta logo component for the latest design
function MetaLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

// Custom Snapchat logo component
function SnapchatLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
    </svg>
  );
}

// Custom TikTok logo component
function TikTokLogo() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

interface LinkItem {
  name: string;
  href: string;
  icon: JSX.Element;
  isNew?: boolean;
}

interface SocialLink {
  name: string;
  href: string;
  icon: JSX.Element;
}

export default function Footer() {
  const quickLinks: LinkItem[] = [
    { name: "Market", href: "/market", icon: <BarChart3 className="w-4 h-4" /> },
    { name: "Trade", href: "/trade", icon: <Globe className="w-4 h-4" /> },
    { name: "Wallet", href: "/profile/wallet", icon: <Wallet className="w-4 h-4" /> },
    { name: "Calculator", href: "/calculator", icon: <Calculator className="w-4 h-4" /> },
    { name: "Instant Swap", href: "/swap", icon: <Repeat className="w-4 h-4" />, isNew: true },
    { name: "Buy Crypto", href: "/buy", icon: <DollarSign className="w-4 h-4" />, isNew: true },
  ];

  const aboutLinks: LinkItem[] = [
    { name: "Vision", href: "/about/vision", icon: <Eye className="w-4 h-4" /> },
    { name: "Mission", href: "/about/mission", icon: <Target className="w-4 h-4" /> },
    { name: "Blog", href: "/about/blog", icon: <Newspaper className="w-4 h-4" /> },
    { name: "Team", href: "/about/team", icon: <Users className="w-4 h-4" /> },
    { name: "Careers", href: "/about/careers", icon: <BookMarked className="w-4 h-4" /> },
  ];

  const supportLinks: LinkItem[] = [
    { name: "FAQ", href: "/about/faq", icon: <HelpCircle className="w-4 h-4" /> },
    { name: "Contact", href: "/about/contact", icon: <Mail className="w-4 h-4" /> },
    { name: "Privacy", href: "/privacy-policy", icon: <Shield className="w-4 h-4" /> },
    { name: "Terms", href: "/terms-of-service", icon: <FileText className="w-4 h-4" /> },
    { name: "Academy", href: "/learn", icon: <GraduationCap className="w-4 h-4" /> },
    { name: "Support 24/7", href: "/support", icon: <Headphones className="w-4 h-4" /> },
    { name: "Status", href: "/status", icon: <AlertCircle className="w-4 h-4" /> },
  ];

  const socialLinks: SocialLink[] = [
    { name: "Meta", href: "https://www.facebook.com/trustbanktech", icon: <MetaLogo /> },
    { name: "Instagram", href: "https://www.instagram.com/trustbanktech", icon: <Instagram className="w-5 h-5" /> },
    { name: "X (Twitter)", href: "https://x.com/trustbanktech", icon: <X className="w-5 h-5" /> },
    { name: "Threads", href: "https://www.threads.net/trustbanktech", icon: <AtSign className="w-5 h-5" /> },
    { name: "Telegram", href: "https://t.me/trustbanktech", icon: <Send className="w-5 h-5" /> },
    { name: "Snapchat", href: "https://www.snapchat.com/add/trustbanktech", icon: <SnapchatLogo /> },
    { name: "TikTok", href: "https://www.tiktok.com/@trustbanktech", icon: <TikTokLogo /> },
  ];

  return (
    <motion.footer 
      className="bg-background relative mt-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50/20 via-background to-background dark:from-green-950/20 dark:via-background dark:to-background pointer-events-none" />

      {/* Newsletter Section */}
      <div className="relative border-b">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold">Stay Updated</h2>
            <p className="text-muted-foreground">
              Get the latest news about cryptocurrency markets and exclusive offers
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Button className="bg-green-600 hover:bg-green-700">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto py-12 px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
          <div>
              <h3 className="font-bold text-2xl mb-2">trustBank</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your trusted partner in <span className="text-green-600 font-medium">Crypto | Simplified</span>. 
                Making cryptocurrency trading accessible, secure, and efficient.
              </p>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button className="bg-green-600 hover:bg-green-700 w-full" asChild>
                <Link href="/auth/signup">
                  Start Trading <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full group" asChild>
                <Link href="/referral">
                  <span className="flex items-center">
                    Refer & Earn
                    <Badge className="ml-2 bg-green-600/10 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                      $50 USDT
                    </Badge>
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="group text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <span className="text-green-600 group-hover:translate-x-1 transition-transform">
                      {link.icon}
                    </span>
                    {link.name}
                    {link.isNew && (
                      <Badge className="ml-2 bg-green-600/10 text-green-600">New</Badge>
                    )}
                </Link>
              </li>
              ))}
            </ul>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">About</h4>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="group text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <span className="text-green-600 group-hover:translate-x-1 transition-transform">
                      {link.icon}
                    </span>
                    {link.name}
                </Link>
              </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="group text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  >
                    <span className="text-green-600 group-hover:translate-x-1 transition-transform">
                      {link.icon}
                    </span>
                    {link.name}
                </Link>
              </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col gap-6">
            {/* Social Links */}
            <div className="flex flex-wrap justify-center gap-6">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-green-600 transition-colors"
                  aria-label={social.name}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social.icon}
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Copyright and Company Info */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} trustBank. All rights reserved.</p>
              
              <div className="flex items-center gap-4">
                <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <Link href="/terms-of-service" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <Link href="/security" className="hover:text-foreground transition-colors">
                  Security
                </Link>
              </div>

              <div>
                Powered by{' '}
                <Link 
                  href="https://www.trustbank.tech" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-500 font-medium"
                >
                  Digital Kloud Transact Limited
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
} 