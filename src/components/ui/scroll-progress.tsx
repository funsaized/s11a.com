import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

interface ScrollProgressProps {
  className?: string;
  height?: number;
  color?: string;
  position?: "top" | "bottom";
  showPercentage?: boolean;
  smoothAnimation?: boolean;
}

const ScrollProgress: React.FC<ScrollProgressProps> = ({
  className = "",
  height = 4,
  color = "hsl(var(--primary))",
  position = "top",
  showPercentage = false,
  smoothAnimation = true,
}) => {
  const { scrollYProgress } = useScroll();
  const [percentage, setPercentage] = useState(0);

  // Create smooth spring animation
  const scaleX = smoothAnimation
    ? useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
      })
    : scrollYProgress;

  useEffect(() => {
    if (showPercentage) {
      const unsubscribe = scrollYProgress.on("change", (latest) => {
        setPercentage(Math.round(latest * 100));
      });
      return () => unsubscribe();
    }
  }, [scrollYProgress, showPercentage]);

  const positionClasses = position === "top" ? "top-0" : "bottom-0";

  return (
    <>
      <motion.div
        className={`fixed left-0 right-0 z-50 bg-primary/20 ${positionClasses} ${className}`}
        style={{ height: `${height}px` }}
      >
        <motion.div
          className="h-full origin-left"
          style={{
            scaleX,
            backgroundColor: color,
          }}
        />
      </motion.div>

      {showPercentage && (
        <motion.div
          className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border border-border rounded-full px-3 py-1 text-sm font-medium"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {percentage}%
        </motion.div>
      )}
    </>
  );
};

// Circular scroll progress indicator
export const CircularScrollProgress: React.FC<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}> = ({ size = 60, strokeWidth = 4, className = "" }) => {
  const { scrollYProgress } = useScroll();
  const [percentage, setPercentage] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setPercentage(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <motion.div
      className={`fixed bottom-8 right-8 z-50 ${className}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.1 }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.3}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: useSpring(scrollYProgress.get() * circumference, {
              stiffness: 100,
              damping: 30,
            }),
          }}
        />
      </svg>

      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
        {percentage}%
      </div>
    </motion.div>
  );
};

// Reading time progress for blog posts
export const ReadingProgress: React.FC<{
  target?: React.RefObject<HTMLElement>;
  className?: string;
}> = ({ target, className }) => {
  const { scrollYProgress } = useScroll({
    target: target || undefined,
    offset: ["start end", "end start"],
  });

  return (
    <motion.div
      className={`h-1 bg-primary origin-left ${className}`}
      style={{ scaleX: scrollYProgress }}
    />
  );
};

export default ScrollProgress;
