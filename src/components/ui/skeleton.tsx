import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.ComponentProps<"div"> {
  variant?: "default" | "wave" | "shimmer" | "glow";
  speed?: "slow" | "normal" | "fast";
}

// Animation variants for different skeleton types
const skeletonVariants = {
  wave: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity,
    },
  },
  shimmer: {
    x: ["-100%", "100%"],
    transition: {
      duration: 1.5,
      ease: "linear",
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  },
  glow: {
    opacity: [0.6, 1, 0.6],
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

const speedConfig = {
  slow: { duration: 3 },
  normal: { duration: 2 },
  fast: { duration: 1 },
};

function Skeleton({
  className,
  variant = "default",
  speed = "normal",
  ...props
}: SkeletonProps) {
  const baseClasses = "bg-accent rounded-md relative overflow-hidden";

  if (variant === "default") {
    return (
      <div
        data-slot="skeleton"
        className={cn(baseClasses, "animate-pulse", className)}
        {...props}
      />
    );
  }

  if (variant === "wave") {
    return (
      <motion.div
        data-slot="skeleton"
        className={cn(
          baseClasses,
          "bg-gradient-to-r from-accent via-accent/50 to-accent bg-[length:200%_100%]",
          className,
        )}
        animate={skeletonVariants.wave}
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
        }}
        transition={{
          ...skeletonVariants.wave.transition,
          ...speedConfig[speed],
        }}
        {...props}
      />
    );
  }

  if (variant === "shimmer") {
    return (
      <div
        data-slot="skeleton"
        className={cn(baseClasses, className)}
        {...props}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={skeletonVariants.shimmer}
          transition={{
            ...skeletonVariants.shimmer.transition,
            ...speedConfig[speed],
          }}
        />
      </div>
    );
  }

  if (variant === "glow") {
    return (
      <motion.div
        data-slot="skeleton"
        className={cn(baseClasses, className)}
        animate={skeletonVariants.glow}
        transition={{
          ...skeletonVariants.glow.transition,
          ...speedConfig[speed],
        }}
        {...props}
      />
    );
  }

  return (
    <div
      data-slot="skeleton"
      className={cn(baseClasses, "animate-pulse", className)}
      {...props}
    />
  );
}

// Preset skeleton components for common use cases
const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="shimmer"
        className={cn(
          "h-4",
          i === lines - 1 ? "w-3/4" : "w-full", // Last line is shorter
        )}
      />
    ))}
  </div>
);

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-4 p-4", className)}>
    <Skeleton variant="wave" className="h-48 w-full" />
    <div className="space-y-2">
      <Skeleton variant="shimmer" className="h-6 w-full" />
      <Skeleton variant="shimmer" className="h-4 w-3/4" />
      <Skeleton variant="shimmer" className="h-4 w-1/2" />
    </div>
  </div>
);

const SkeletonAvatar: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ size = "md", className }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <Skeleton
      variant="glow"
      className={cn("rounded-full", sizeClasses[size], className)}
    />
  );
};

const SkeletonButton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton variant="wave" className={cn("h-9 w-24 rounded-md", className)} />
);

// Animated skeleton group that reveals in sequence
const SkeletonGroup: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.1, className }) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * staggerDelay,
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonGroup,
};
