"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InstantSwapModal } from "@/components/modals/InstantSwapModal";
import { BuyCryptoModal } from "@/components/modals/BuyCryptoModal";
import {
  BarChart3,
  Globe,
  Wallet,
  Calculator,
  Repeat,
  DollarSign,
  Eye,
  Target,
  Newspaper,
  Users,
  BookMarked,
  HelpCircle,
  Mail,
  Shield,
  FileText,
  GraduationCap,
  Headphones,
  AlertCircle,
  ChevronRight,
  Facebook,
  Instagram,
  X,
  AtSign,
  MessageCircle,
  Send
} from "lucide-react";

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
  icon: React.ReactNode;
  isNew?: boolean;
}

interface SocialLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export default function Footer() {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const quickLinks: LinkItem[] = [
    { name: "Market", href: "/market", icon: <BarChart3 className="w-4 h-4" /> },
    { name: "Trade", href: "/trade", icon: <Globe className="w-4 h-4" /> },
    { name: "Wallet", href: "/profile/wallet", icon: <Wallet className="w-4 h-4" /> },
    { name: "Calculator", href: "/calculator", icon: <Calculator className="w-4 h-4" /> },
    { name: "Instant Swap", href: "#", icon: <Repeat className="w-4 h-4" />, isNew: true },
    { name: "Buy Crypto", href: "#", icon: <DollarSign className="w-4 h-4" />, isNew: true },
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
    <footer className="border-t bg-background">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-2xl mb-2">trustBank</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We are <span className="text-green-600 font-medium">Crypto | Simplified</span>. 
                Making cryptocurrency trading accessible, secure, and efficient by simplifying crypto adoption in emerging markets.
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
          <div>
            <h3 className="font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {link.name === "Instant Swap" ? (
                    <button
                      onClick={() => setIsSwapModalOpen(true)}
                      className="flex items-center text-sm hover:text-green-600 text-muted-foreground transition-colors"
                    >
                      {link.icon}
                      <span className="ml-2">{link.name}</span>
                      {link.isNew && (
                        <Badge className="ml-2 bg-green-600/10 text-green-600">New</Badge>
                      )}
                    </button>
                  ) : link.name === "Buy Crypto" ? (
                    <button
                      onClick={() => setIsBuyModalOpen(true)}
                      className="flex items-center text-sm hover:text-green-600 text-muted-foreground transition-colors"
                    >
                      {link.icon}
                      <span className="ml-2">{link.name}</span>
                      {link.isNew && (
                        <Badge className="ml-2 bg-green-600/10 text-green-600">New</Badge>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className="flex items-center text-sm hover:text-green-600 text-muted-foreground transition-colors"
                    >
                      {link.icon}
                      <span className="ml-2">{link.name}</span>
                      {link.isNew && (
                        <Badge className="ml-2 bg-green-600/10 text-green-600">New</Badge>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h3 className="font-semibold mb-6">About</h3>
            <ul className="space-y-4">
              {aboutLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="flex items-center text-sm hover:text-green-600 text-muted-foreground transition-colors"
                  >
                    {link.icon}
                    <span className="ml-2">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="font-semibold mb-6">Support</h3>
            <ul className="space-y-4">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="flex items-center text-sm hover:text-green-600 text-muted-foreground transition-colors"
                  >
                    {link.icon}
                    <span className="ml-2">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links and Copyright */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col gap-6">
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
                  {social.icon}
                </Link>
              ))}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} trustBank. All rights reserved.</p>
              
              <div className="flex items-center gap-4">
                <Link href="/privacy-policy" className="hover:text-green-600 transition-colors">
                  Privacy Policy
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <Link href="/terms-of-service" className="hover:text-green-600 transition-colors">
                  Terms of Service
                </Link>
                <Separator orientation="vertical" className="h-4" />
                <Link href="/security" className="hover:text-green-600 transition-colors">
                  Security
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InstantSwapModal 
        isOpen={isSwapModalOpen} 
        onClose={() => setIsSwapModalOpen(false)} 
      />
      <BuyCryptoModal 
        isOpen={isBuyModalOpen} 
        onClose={() => setIsBuyModalOpen(false)} 
      />
    </footer>
  );
} 