"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock } from "lucide-react";
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect');
  const { signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { error: signInError } = await signIn(email, password);

      if (signInError) {
        throw signInError;
      }

      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
        variant: "default"
      });
      
      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Floating Circles */}
        {[...Array(3)].map((_, i) => {
          const width = 300 + (i * 100);
          const height = 300 + (i * 100);
          const left = `${60 + (i * 10)}%`;
          const top = `${70 + (i * 5)}%`;
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/5 dark:bg-primary/10 backdrop-blur-3xl"
              style={{
                width,
                height,
                left,
                top,
                transform: 'translate(-50%, -50%)'
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                opacity: [0.1, 0.05, 0.1]
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          );
        })}
      </div>

      {/* Left Side - Welcome Message */}
      <div className="flex-1 flex flex-col justify-center px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl font-bold text-foreground mb-2">
            Hi there{' '}
            <motion.span
              animate={{ rotate: [0, 20, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="inline-block"
            >
              👋
            </motion.span>
          </h1>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Welcome to{' '}
            <span className="text-green-500 dark:text-green-400">trustBank</span>.
          </h2>
          <p className="text-gray-400 text-lg mb-6 max-w-md">
            an ecosystem designed for real impact in emerging markets.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm font-medium text-green-500"
          >
            CRYPTO | SIMPLIFIED
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 rounded-xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-400">
              Continue your journey with trustBank
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-gray-300">Email address</Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-gray-900/50 border-gray-800 text-white"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-green-500 hover:text-green-400 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12 bg-gray-900/50 border-gray-800 text-white"
                    placeholder="••••••••"
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-black text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full h-12 border-gray-800 hover:bg-gray-900 text-white transition-all duration-200"
              disabled={isLoading}
            >
              <FcGoogle className="h-4 w-4 mr-2" />
              Sign in with Google
            </Button>

            <p className="mt-4 text-center text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-green-500 hover:text-green-400">
                Sign up
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
