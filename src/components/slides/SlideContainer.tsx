"use client";

import { useState, useCallback, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideContainerProps {
  children: ReactNode[];
  onComplete?: () => void;
}

export default function SlideContainer({ children, onComplete }: SlideContainerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const totalSlides = children.length;

  const goNext = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    } else {
      onComplete?.();
    }
  }, [currentSlide, totalSlides, onComplete]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  // Click/tap to advance
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't advance if clicking a button or interactive element
      if (target.closest("button") || target.closest("a") || target.closest("input")) {
        return;
      }
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width * 0.3) {
        goPrev();
      } else {
        goNext();
      }
    },
    [goNext, goPrev]
  );

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden" onClick={handleClick}>
      {/* Background grain */}
      <div className="fixed inset-0 grain-texture z-0" />

      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full z-50 px-4 pt-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-label text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface/40">
            CC Rewind
          </span>
          <span className="font-label text-[10px] text-on-surface/20">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <div
              key={i}
              className="h-[2px] flex-1 rounded-full overflow-hidden bg-on-surface/10"
            >
              <motion.div
                className="h-full bg-primary"
                initial={false}
                animate={{
                  width: i < currentSlide ? "100%" : i === currentSlide ? "100%" : "0%",
                }}
                transition={{
                  duration: i === currentSlide ? 0.6 : 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Slide content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {children[currentSlide]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation hint */}
      <div className="fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-6 pb-8 pt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          disabled={currentSlide === 0}
          className={`
            border rounded-full px-6 py-2.5 flex items-center gap-2
            font-label text-xs font-bold uppercase tracking-widest
            transition-all duration-150 active:scale-95
            ${
              currentSlide === 0
                ? "border-on-surface/5 text-on-surface/20 cursor-not-allowed"
                : "border-on-surface/10 text-on-surface hover:bg-on-surface/5"
            }
          `}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="bg-primary text-white rounded-full px-6 py-2.5 flex items-center gap-2 font-label text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-300 active:scale-95 shadow-lg shadow-primary/20"
        >
          {currentSlide === totalSlides - 1 ? "Finish" : "Next"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
