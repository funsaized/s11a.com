import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FLIPProps {
  children: React.ReactNode;
  flipKey: string | number;
  className?: string;
  duration?: number;
  easing?: string;
}

// FLIP (First, Last, Invert, Play) animation component
const FLIPAnimation: React.FC<FLIPProps> = ({
  children,
  flipKey,
  className,
  duration = 0.3,
  easing = "easeInOut",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [prevRect, setPrevRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const currentRect = ref.current.getBoundingClientRect();

    if (prevRect) {
      const deltaX = prevRect.left - currentRect.left;
      const deltaY = prevRect.top - currentRect.top;
      const deltaW = prevRect.width / currentRect.width;
      const deltaH = prevRect.height / currentRect.height;

      if (deltaX !== 0 || deltaY !== 0 || deltaW !== 1 || deltaH !== 1) {
        setIsAnimating(true);

        // Apply inverse transformation immediately
        ref.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
        ref.current.style.transformOrigin = "top left";

        // Play the animation
        const animation = ref.current.animate(
          [
            {
              transform: `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`,
            },
            { transform: "translate(0px, 0px) scale(1, 1)" },
          ],
          {
            duration: duration * 1000,
            easing,
            fill: "both",
          },
        );

        animation.addEventListener("finish", () => {
          setIsAnimating(false);
          if (ref.current) {
            ref.current.style.transform = "";
            ref.current.style.transformOrigin = "";
          }
        });
      }
    }

    setPrevRect(currentRect);
  }, [flipKey, duration, easing, prevRect]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        willChange: isAnimating ? "transform" : "auto",
      }}
    >
      {children}
    </div>
  );
};

// Shared element transition component
export const SharedElement: React.FC<{
  children: React.ReactNode;
  id: string;
  className?: string;
}> = ({ children, id, className }) => {
  return (
    <motion.div
      layoutId={id}
      className={className}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      {children}
    </motion.div>
  );
};

// Layout animation wrapper for automatic FLIP animations
export const LayoutAnimator: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <motion.div
      layout
      className={className}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
    >
      {children}
    </motion.div>
  );
};

// Grid item animator for masonry-like layouts
export const GridItemAnimator: React.FC<{
  children: React.ReactNode;
  className?: string;
  index: number;
}> = ({ children, className, index }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
        delay: index * 0.05, // Stagger animation
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// List reorder animation component
export const ReorderableList: React.FC<{
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
}> = ({ items, renderItem, className, itemClassName }) => {
  return (
    <div className={className}>
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={item.id || index}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{
              layout: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              y: { duration: 0.2 },
              x: { duration: 0.2 },
            }}
            className={itemClassName}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Morphing container for content transitions
export const MorphingContainer: React.FC<{
  children: React.ReactNode;
  morphKey: string | number;
  className?: string;
}> = ({ children, morphKey, className }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={morphKey}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{
          layout: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 },
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default FLIPAnimation;
