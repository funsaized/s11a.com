import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
  cascade?: boolean;
  cascadeDelay?: number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 50,
  className = '',
  threshold = 0.1,
  once = true,
  cascade = false,
  cascadeDelay = 0.1,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once,
    amount: threshold,
    margin: '-50px 0px',
  });
  const controls = useAnimation();
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animation variants based on direction
  const variants = {
    up: {
      hidden: { opacity: 0, y: distance },
      visible: { opacity: 1, y: 0 },
    },
    down: {
      hidden: { opacity: 0, y: -distance },
      visible: { opacity: 1, y: 0 },
    },
    left: {
      hidden: { opacity: 0, x: distance },
      visible: { opacity: 1, x: 0 },
    },
    right: {
      hidden: { opacity: 0, x: -distance },
      visible: { opacity: 1, x: 0 },
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    rotate: {
      hidden: { opacity: 0, rotate: -15, scale: 0.9 },
      visible: { opacity: 1, rotate: 0, scale: 1 },
    },
  };

  const transition = {
    type: 'spring',
    duration: duration,
    bounce: 0.3,
    delay: delay,
  };

  useEffect(() => {
    if (isInView && (!once || !hasAnimated)) {
      controls.start('visible');
      setHasAnimated(true);
    } else if (!isInView && !once) {
      controls.start('hidden');
    }
  }, [isInView, controls, once, hasAnimated]);

  // Handle cascade animation for children
  if (cascade && React.Children.count(children) > 1) {
    return (
      <div ref={ref} className={className}>
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            initial="hidden"
            animate={controls}
            variants={variants[direction]}
            transition={{
              ...transition,
              delay: delay + (index * cascadeDelay),
            }}
            style={{ display: 'contents' }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={variants[direction]}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

// Higher-order component for easy scroll reveal wrapping
export const withScrollReveal = <P extends object>(
  Component: React.ComponentType<P>,
  options: Partial<ScrollRevealProps> = {}
) => {
  return React.forwardRef<any, P>((props, ref) => (
    <ScrollReveal {...options}>
      <Component {...props} ref={ref} />
    </ScrollReveal>
  ));
};

export default ScrollReveal;