import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';

export function CallToAction() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/20 dark:to-background" />
      
      <div className="container mx-auto px-4">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-2">Ready to Join Our Growing Community?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Be part of a thriving ecosystem where traders help traders. From beginners to experts, everyone contributes to our success story.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                <span>Lightning Fast Trades</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <span>Beginner & Expert Friendly</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-300 text-white hoveer:text-black">
                <Link href="/auth/signup" className="flex items-center gap-2">
                  Join Community <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/learn">Trading Academy</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}