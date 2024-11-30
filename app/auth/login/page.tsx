"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, AuthContextType } from '@/context/AuthContext';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, ArrowLeft } from "lucide-react";
import supabase from '@/lib/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth() as AuthContextType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error, user } = await signIn(email, password);
      if (error) throw error;
      if (user) {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogle();
      if (!result) return;
      
      const { data, error } = result;
      if (error) throw error;

      // No need to check for session immediately as OAuth redirects to another page
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Floating Circles */}
        {[...Array(5)].map((_, i) => {
          // Calculate values once during render
          const width = 150 + Math.floor(i * 50);
          const height = 150 + Math.floor(i * 50);
          const left = `${20 + (i * 15)}%`;
          const top = `${10 + (i * 15)}%`;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-green-500/20 backdrop-blur-3xl"
              style={{
                width,
                height,
                left,
                top,
              }}
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          );
        })}

        {/* Gradient Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"
          animate={{
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Moving Grid Pattern */}
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(22, 163, 74, 0.15) 1px, transparent 0)`,
            backgroundSize: '50px 50px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="w-full flex flex-col md:flex-row">
        {/* Welcome Message - Only visible on md and larger screens */}
        <div className="hidden md:flex flex-1 flex-col justify-center px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 max-w-lg"
          >
            <h1 className="text-3xl lg:text-5xl font-bold">
              Hi there 👋
            </h1>
            <div className="space-y-2">
              <p className="text-2xl font-medium text-card-foreground">
                Welcome to <span className="text-green-600">trustBank</span>.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                an ecosystem designed for real impact in emerging markets.
              </p>
              <p className="text-sm font-semibold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                CRYPTO | SIMPLIFIED
              </p>
            </div>
          </motion.div>
        </div>

        {/* Login Form - Keep existing code but update container */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card/50 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-card-foreground">Welcome Back</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Continue your journey with <span className="text-green-600 font-semibold">trustBank</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        required
                        className="pl-10 h-12"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Link 
                        href="/auth/forgot-password" 
                        className="text-sm text-green-600 hover:text-green-500 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        id="password"
                        type="password"
                        required
                        className="pl-10 h-12"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-green-600 hover:bg-green-500 text-white transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full transition-all duration-200 transform hover:scale-[1.02] mt-6 hover:bg-green-300 text-black hover:text-white dark:text-white dark:hover:bg-green-300 dark:hover:text-black"
                disabled={isLoading}
              >
                <FcGoogle className="h-4 w-4 mr-2" />
                Sign in with Google
              </Button>

              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="font-medium text-green-600 hover:text-green-300">
                  Sign up
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
