import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Zap, Globe, ChartBar } from 'lucide-react';

const features = [
  {
    icon: <Shield className="w-4 h-4" />,
    title: "Bank-Grade Security",
    description: "Multi-layer security architecture with advanced encryption",
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: "Lightning Fast",
    description: "Execute trades in milliseconds with our optimized engine",
  },
  {
    icon: <Globe className="w-4 h-4" />,
    title: "Global Access",
    description: "Trade from anywhere, anytime with our global infrastructure",
  },
  {
    icon: <ChartBar className="w-4 h-4" />,
    title: "Advanced Analytics",
    description: "Make informed decisions with real-time market insights",
  }
];

export default function FeatureShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <div ref={containerRef} className="relative py-24 bg-gradient-to-b from-transparent to-green-50 dark:to-green-950/20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-bold mb-4">Why Choose trustBank?</h2>
          <p className="text-md text-muted-foreground">Experience the difference with our cutting-edge features</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.5 }}
              className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="mb-2 text-green-600">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}