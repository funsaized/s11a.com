import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '@gatsbyjs/reach-router';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Animation variants for different page types
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
  },
};

const pageTransition = {
  type: 'tween',
  ease: [0.25, 0.46, 0.45, 0.94], // Custom easing curve
  duration: 0.4,
};

// Specialized transitions for different page types
const transitionVariants = {
  default: pageVariants,
  
  blog: {
    initial: { opacity: 0, x: -30, rotateX: -15 },
    in: { opacity: 1, x: 0, rotateX: 0 },
    out: { opacity: 0, x: 30, rotateX: 15 },
  },
  
  post: {
    initial: { opacity: 0, y: 40, filter: 'blur(10px)' },
    in: { opacity: 1, y: 0, filter: 'blur(0px)' },
    out: { opacity: 0, y: -20, filter: 'blur(5px)' },
  },
  
  home: {
    initial: { opacity: 0, scale: 1.1, filter: 'brightness(0.8)' },
    in: { opacity: 1, scale: 1, filter: 'brightness(1)' },
    out: { opacity: 0, scale: 0.9, filter: 'brightness(1.2)' },
  },
};

const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => {
  const location = useLocation();
  
  // Determine transition type based on pathname
  const getTransitionType = (pathname: string) => {
    if (pathname.startsWith('/blog/') && pathname !== '/blog') return 'post';
    if (pathname === '/blog') return 'blog';
    if (pathname === '/') return 'home';
    return 'default';
  };
  
  const transitionType = getTransitionType(location.pathname);
  const variants = transitionVariants[transitionType];
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className={className}
        initial="initial"
        animate="in"
        exit="out"
        variants={variants}
        transition={pageTransition}
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;