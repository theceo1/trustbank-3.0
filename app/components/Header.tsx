"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Moon, Sun, ChevronDown, Menu, X, LayoutDashboard, LineChart, ArrowLeftRight, Calculator, Newspaper, Target, Eye, MessageSquare, HelpCircle, User as UserIcon, ShieldCheck, Wallet, LogOut } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-xl">
            trustBank
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              <Link href="/market" className="text-sm font-medium transition-colors hover:text-primary">
                Market
              </Link>
              <Link href="/trade" className="text-sm font-medium transition-colors hover:text-primary">
                Trade
              </Link>
              <Link href="/calculator" className="text-sm font-medium transition-colors hover:text-primary">
                Calculator
              </Link>
            </>
          ) : (
            <>
              <Link href="/calculator" className="text-sm font-medium transition-colors hover:text-primary">
                Calculator
              </Link>
              <Link href="/market" className="text-sm font-medium transition-colors hover:text-primary">
                Market
              </Link>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-24">
                About <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/about/blog">Blog</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about/mission">Mission</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about/vision">Vision</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about/contact">Contact Us</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about/faq">FAQ</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Profile</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/verification">KYC Verification</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/wallet">Wallet</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-300">
            <div 
              className="fixed inset-0 bg-black/60 animate-in fade-in duration-200" 
              onClick={() => setIsMenuOpen(false)} 
            />
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-green-600 dark:bg-green-700 shadow-xl animate-in slide-in-from-right duration-300">
              {/* Menu Header */}
              <div className="border-b border-green-500 dark:border-green-600">
                <div className="flex items-center justify-between p-4">
                  <span className="text-lg font-semibold text-white">Menu</span>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                {user && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-green-100">Hi 👋</p>
                    <p className="font-medium text-white">
                      {user.user_metadata?.full_name?.split(' ')[0] || 'User'}
                    </p>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="px-2 py-4 overflow-y-auto bg-white dark:bg-gray-900">
                {user ? (
                  <div className="space-y-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5 mr-3" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/market"
                      className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LineChart className="h-5 w-5 mr-3" />
                      <span>Market</span>
                    </Link>
                    <Link
                      href="/trade"
                      className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ArrowLeftRight className="h-5 w-5 mr-3" />
                      <span>Trade</span>
                    </Link>
                    <Link
                      href="/calculator"
                      className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Calculator className="h-5 w-5 mr-3" />
                      <span>Calculator</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link
                      href="/market"
                      className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LineChart className="h-5 w-5 mr-3" />
                      <span>Market</span>
                    </Link>
                    <Link
                      href="/calculator"
                      className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Calculator className="h-5 w-5 mr-3" />
                      <span>Calculator</span>
                    </Link>
                  </div>
                )}

                <div className="my-4 border-t border-gray-200 dark:border-gray-800" />

                <div className="space-y-1">
                  <Link
                    href="/about/blog"
                    className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Newspaper className="h-5 w-5 mr-3" />
                    <span>Blog</span>
                  </Link>
                  <Link
                    href="/about/mission"
                    className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Target className="h-5 w-5 mr-3" />
                    <span>Mission</span>
                  </Link>
                  <Link
                    href="/about/vision"
                    className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Eye className="h-5 w-5 mr-3" />
                    <span>Vision</span>
                  </Link>
                  <Link
                    href="/about/contact"
                    className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <MessageSquare className="h-5 w-5 mr-3" />
                    <span>Contact</span>
                  </Link>
                </div>

                {user && (
                  <>
                    <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserIcon className="h-5 w-5 mr-3" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/profile/verification"
                        className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <ShieldCheck className="h-5 w-5 mr-3" />
                        <span>KYC Verification</span>
                      </Link>
                      <Link
                        href="/profile/wallet"
                        className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Wallet className="h-5 w-5 mr-3" />
                        <span>Wallet</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full p-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Section */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-green-500 dark:border-green-600 p-4 bg-white dark:bg-gray-900">
                {!user ? (
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
                      <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setTheme(theme === "dark" ? "light" : "dark");
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full p-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                  >
                    <div className="relative w-5 h-5 mr-3">
                      <Sun className="absolute inset-0 rotate-0 scale-100 transition-all duration-200 dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute inset-0 rotate-90 scale-0 transition-all duration-200 dark:rotate-0 dark:scale-100" />
                    </div>
                    <span className="text-gray-900 dark:text-gray-100">Toggle Theme</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 