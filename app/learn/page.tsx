"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, ChartBar, Shield, Users, Lightbulb, Clock, Award, Lock, Rocket } from 'lucide-react';
import Link from 'next/link';

interface CourseModule {
  title: string;
  lessons: string[];
  duration: string;
  certification: boolean;
  progress: number;
}

interface CourseLevel {
  level: string;
  description: string;
  icon: JSX.Element;
  modules: CourseModule[];
}

const courses = [
  {
    level: "Beginner",
    description: "Perfect for those new to cryptocurrency trading",
    icon: <BookOpen className="w-6 h-6" />,
    modules: [
      {
        title: "Crypto Fundamentals",
        lessons: [
          "Understanding Blockchain Technology",
          "Types of Cryptocurrencies",
          "Crypto Wallets & Security",
          "KYC & Regulatory Compliance"
        ],
        duration: "2.5 hours",
        certification: true,
        progress: 0
      },
      {
        title: "Trading Essentials",
        lessons: [
          "Market Structure & Order Books",
          "Spot Trading Basics",
          "Understanding Trading Fees",
          "Basic Technical Analysis"
        ],
        duration: "3 hours",
        certification: true,
        progress: 0
      },
      {
        title: "Risk Management",
        lessons: [
          "Position Sizing",
          "Stop Loss Strategies",
          "Portfolio Diversification",
          "Psychology of Trading"
        ],
        duration: "2 hours",
        certification: true,
        progress: 0
      }
    ]
  },
  {
    level: "Intermediate",
    description: "For traders ready to advance their skills",
    icon: <ChartBar className="w-6 h-6" />,
    modules: [
      {
        title: "Advanced Technical Analysis",
        lessons: [
          "Multiple Timeframe Analysis",
          "Advanced Chart Patterns",
          "Fibonacci Trading",
          "Volume Profile Trading"
        ],
        duration: "4 hours",
        certification: true,
        progress: 0
      },
      {
        title: "Trading Strategies",
        lessons: [
          "Trend Following Strategies",
          "Breakout Trading",
          "Scalping Techniques",
          "Swing Trading Methods"
        ],
        duration: "4 hours",
        certification: true,
        progress: 0
      },
      {
        title: "Margin Trading",
        lessons: [
          "Understanding Leverage",
          "Margin Trading Risks",
          "Funding Rates",
          "Liquidation Prevention"
        ],
        duration: "3 hours",
        certification: true,
        progress: 0
      }
    ]
  },
  {
    level: "Expert",
    description: "Advanced concepts for professional traders",
    icon: <Target className="w-6 h-6" />,
    modules: [
      {
        title: "Algorithmic Trading",
        lessons: [
          "API Integration Basics",
          "Building Trading Bots",
          "Backtesting Strategies",
          "Risk Management Systems"
        ],
        duration: "5 hours",
        certification: true,
        progress: 0
      },
      {
        title: "Advanced Market Analysis",
        lessons: [
          "Order Flow Analysis",
          "Market Microstructure",
          "Institutional Trading",
          "Arbitrage Strategies"
        ],
        duration: "5 hours",
        certification: true,
        progress: 0
      },
      {
        title: "DeFi Trading",
        lessons: [
          "DeFi Protocols Deep Dive",
          "Yield Farming Strategies",
          "Liquidity Provision",
          "Flash Loans & Arbitrage"
        ],
        duration: "4 hours",
        certification: true,
        progress: 0
      }
    ]
  }
];

export default function TradingAcademy() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseModule | null>(null);

  const handleStartCourse = (course: CourseModule) => {
    setSelectedCourse(course);
    setShowDialog(true);
  };

  return (
    <div className="min-h-screen py-24 bg-gradient-to-b from-background to-green-50/20 dark:to-green-950/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4">Trading Academy</h1>
          <div className="text-xl text-muted-foreground">Master cryptocurrency trading with our comprehensive courses</div>
        </motion.div>

        <Tabs defaultValue="beginner" className="space-y-8">
          <TabsList className="flex justify-center">
            {courses.map((course: CourseLevel) => (
              <TabsTrigger key={course.level.toLowerCase()} value={course.level.toLowerCase()}>
                <div className="flex items-center gap-2">
                  {course.icon}
                  {course.level}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {courses.map((level: CourseLevel) => (
            <TabsContent key={level.level.toLowerCase()} value={level.level.toLowerCase()}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {level.modules.map((module: CourseModule, moduleIndex) => (
                  <motion.div
                    key={moduleIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: moduleIndex * 0.2 }}
                  >
                    <Card>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-lg">{module.title}</h3>
                          </div>
                          {module.certification && (
                            <Badge variant="outline" className="bg-green-500/10">
                              Certificate
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2 mb-6">
                          <div className="text-sm text-muted-foreground">
                            Progress: {module.progress}%
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-600 transition-all duration-300" 
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          {module.lessons.map((lesson, i) => (
                            <div key={i} className="flex items-center gap-2 text-muted-foreground">
                              {module.progress === 0 ? (
                                <Lock className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Target className="w-4 h-4 text-green-600" />
                              )}
                              <span>{lesson}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {module.duration}
                          </span>
                          <Button 
                            variant={module.progress === 0 ? "outline" : "default"}
                            onClick={() => handleStartCourse(module)}
                          >
                            {module.progress === 0 ? "Start Course" : "Continue"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-green-600" />
                Coming Soon!
              </DialogTitle>
              <DialogDescription asChild>
                <div className="space-y-4 pt-4">
                  <div className="text-sm text-muted-foreground">
                    We&apos;re currently crafting an exceptional learning experience for {selectedCourse?.title}. Our team of experts is developing comprehensive, easy-to-follow content that will help you master cryptocurrency trading.
                  </div>
                  
                  <div className="bg-green-500/10 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">While you wait:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        Join our trading community
                      </li>
                      <li className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-600" />
                        Practice with our demo account
                      </li>
                      <li className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-green-600" />
                        Browse our knowledge base
                      </li>
                    </ul>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Close
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Create Free Account</Link>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}