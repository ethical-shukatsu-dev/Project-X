import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CompanyCard from './CompanyCard';
import { Company } from '@/lib/supabase/client';
import { ThumbsDown, PartyPopper } from 'lucide-react';
import { LOCALSTORAGE_KEYS } from "@/lib/constants/localStorage";

interface CompanyCardStackProps {
  companies: {
    id: string;
    company: Company;
    matchingPoints: string[];
    feedback?: "interested" | "not_interested";
  }[];
  onFeedback: (companyId: string, feedback: "interested" | "not_interested") => void;
  lng: string;
}

const cardVariants = {
  current: {
    scale: 1,
    y: 0,
    opacity: 1,
    zIndex: 5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  upcoming: {
    scale: 0.95,
    y: 40,
    opacity: 0.5,
    zIndex: 4,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  exit: (direction: "left" | "right") => ({
    x: direction === "left" ? -300 : 300,
    opacity: 0,
    scale: 0.5,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  })
};

export default function CompanyCardStack({ companies, onFeedback, lng }: CompanyCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Check if we're in anonymous mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(LOCALSTORAGE_KEYS.ANONYMOUS_COMPANIES);
      setIsAnonymous(storedValue === "true");
    }
  }, []);

  const handleFeedback = (feedback: "interested" | "not_interested") => {
    if (currentIndex >= companies.length) return;
    
    const direction = feedback === "interested" ? "right" : "left";
    setExitDirection(direction);
    
    onFeedback(companies[currentIndex].id, feedback);
    setCurrentIndex(prev => prev + 1);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } }
  ) => {
    const threshold = window.innerWidth * 0.3;
    if (Math.abs(info.offset.x) > threshold) {
      handleFeedback(info.offset.x > 0 ? "interested" : "not_interested");
    }
    setSwipeProgress(0);
    setIsDragging(false);
  };

  const updateSwipeProgress = (x: number) => {
    const progress = x / (window.innerWidth * 0.3);
    setSwipeProgress(progress);
    setIsDragging(true);
  };

  // If in anonymous mode, render all cards in a list
  if (isAnonymous) {
    return (
      <div className="space-y-6">
        {companies.map((item) => (
          <CompanyCard
            key={item.company.id}
            company={item.company}
            matchingPoints={item.matchingPoints}
            onFeedback={(feedback) => onFeedback(item.id, feedback)}
            feedback={item.feedback}
            lng={lng}
            disableBuiltInSwipe={false}
          />
        ))}
      </div>
    );
  }

  // Non-anonymous mode: render card stack with swiper
  return (
    <div className={`relative w-full max-w-md mx-auto h-[600px] ${isDragging ? 'cursor-grabbing' : ''}`}>
      {/* Global swipe indicators */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-red-500/20 backdrop-blur-sm"
          style={{
            opacity: swipeProgress < 0 ? Math.abs(swipeProgress) * 0.5 : 0
          }}
        />
        <motion.div
          className="absolute inset-0 bg-green-500/20 backdrop-blur-sm"
          style={{
            opacity: swipeProgress > 0 ? Math.abs(swipeProgress) * 0.5 : 0
          }}
        />
        
        {/* Center indicators */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="absolute flex items-center justify-center text-red-500"
            style={{
              opacity: swipeProgress < 0 ? Math.abs(swipeProgress) : 0,
              scale: swipeProgress < 0 ? Math.abs(swipeProgress) * 1.5 + 1 : 1
            }}
          >
            <ThumbsDown className="w-24 h-24" />
          </motion.div>
          <motion.div
            className="absolute flex items-center justify-center text-green-500"
            style={{
              opacity: swipeProgress > 0 ? Math.abs(swipeProgress) : 0,
              scale: swipeProgress > 0 ? Math.abs(swipeProgress) * 1.5 + 1 : 1
            }}
          >
            <PartyPopper className="w-24 h-24" />
          </motion.div>
        </div>
      </div>

      {/* Card stack */}
      <div className="relative w-full h-full">
        <AnimatePresence initial={false} custom={exitDirection}>
          {companies.slice(currentIndex, currentIndex + 2).map((item, index) => {
            const isLast = index === 0;
            const hasFeedback = Boolean(item.feedback);
            
            return (
              <motion.div
                key={item.company.id}
                className="absolute w-full"
                custom={exitDirection}
                variants={cardVariants}
                initial={isLast ? "current" : "upcoming"}
                animate={isLast ? "current" : "upcoming"}
                exit="exit"
                drag={isLast && !hasFeedback ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.9}
                onDragEnd={isLast && !hasFeedback ? handleDragEnd : undefined}
                onDrag={(_, info) => {
                  if (isLast && !hasFeedback) {
                    updateSwipeProgress(info.offset.x);
                  }
                }}
              >
                <CompanyCard
                  company={item.company}
                  matchingPoints={item.matchingPoints}
                  onFeedback={handleFeedback}
                  feedback={item.feedback}
                  lng={lng}
                  disableBuiltInSwipe={true}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
} 