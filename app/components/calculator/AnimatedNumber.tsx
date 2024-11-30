"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  precision?: number;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedNumber({ 
  value, 
  precision = 2, 
  prefix = "", 
  suffix = "" 
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  
  const springConfig = {
    damping: 15,
    stiffness: 100,
    mass: 0.5
  };

  const spring = useSpring(displayValue, springConfig);
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const display = useTransform(spring, (latest) => 
    `${prefix}${latest.toFixed(precision)}${suffix}`
  );

  return (
    <motion.span className="tabular-nums">
      {display}
    </motion.span>
  );
}