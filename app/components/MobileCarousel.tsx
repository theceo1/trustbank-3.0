import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
  title: string;
  content: string;
}

interface MobileCarouselProps {
  items: CarouselItem[];
  className?: string;
  autoScroll?: boolean;
  interval?: number;
  isVisionBoard?: boolean;
}

const MobileCarousel: React.FC<MobileCarouselProps> = ({ items, className, autoScroll = true, interval = 5000, isVisionBoard = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (autoScroll && !isHovered) {
      const timer = setInterval(nextSlide, interval);
      return () => clearInterval(timer);
    }
  }, [autoScroll, interval, isHovered, nextSlide]);

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={currentIndex}>
        <motion.div
          key={currentIndex}
          custom={currentIndex}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={`p-6 rounded-lg shadow-md text-center ${isVisionBoard ? 'bg-green-600' : 'bg-gray-100'}`}
        >
          <h3 className={`text-sm font-semibold mb-4 ${isVisionBoard ? 'text-white' : 'text-black'}`}>{items[currentIndex].title}</h3>
          <p className={`text-sm ${isVisionBoard ? 'text-gray-200' : 'text-gray-700'}`}>{items[currentIndex].content}</p>
        </motion.div>
      </AnimatePresence>
      {isHovered && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md opacity-50 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md opacity-50 hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </div>
  );
}

export default MobileCarousel;
