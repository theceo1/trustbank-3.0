import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { CreditCard, Coins, BarChart2, Terminal } from 'lucide-react';

const visionItems = [
  {
    icon: <CreditCard className="w-12 h-12" />,
    title: "trustCard",
    content: "Borderless Payments, Real-Time transactions at terminal, and cashback rewards when you transact with trustCard.",
    color: "from-green-400 to-emerald-600",
    comingSoon: "Q2 2024"
  },
  {
    icon: <Coins className="w-12 h-12" />,
    title: "trustCoin",
    content: "Experience stability with trustCoin, our most stable ETF. Safe for investment and a reliable store of value.",
    color: "from-emerald-400 to-green-600",
    comingSoon: "Q3 2024"
  },
  {
    icon: <BarChart2 className="w-12 h-12" />,
    title: "trustExchange",
    content: "Experience user-friendly yet professional trading of ETFs and other digital assets on a trusted platform, TTX.",
    color: "from-green-500 to-emerald-700",
    comingSoon: "Q4 2024"
  },
  {
    icon: <Terminal className="w-12 h-12" />,
    title: "trustTerminal",
    content: "Point Of Service terminal for merchants who accept crypto payments. Save on transaction time, cost, profit, and EARN on every transaction.",
    color: "from-emerald-500 to-green-700",
    comingSoon: "Q1 2025"
  }
];

export function VisionBoard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-white dark:from-green-950/20 dark:to-background" />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl font-bold mb-2">Our Vision</h2>
          <p className="text-md text-muted-foreground">Building the future of finance, one feature at a time</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visionItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="p-8">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-green-600 transition-transform duration-300 group-hover:scale-110">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {item.comingSoon}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-green-600 transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {item.content}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}