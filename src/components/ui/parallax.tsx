import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  enableOnDesktop?: boolean;
  enableOnMobile?: boolean;
}

const Parallax: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  className = '',
  direction = 'up',
  enableOnDesktop = true,
  enableOnMobile = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Create smooth spring animations
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  
  // Transform scroll progress based on direction and speed
  const getTransformValue = () => {
    const range = window.innerHeight * speed;
    switch (direction) {
      case 'up':
        return useTransform(scrollYProgress, [0, 1], [range, -range]);
      case 'down':
        return useTransform(scrollYProgress, [0, 1], [-range, range]);
      case 'left':
        return useTransform(scrollYProgress, [0, 1], [range, -range]);
      case 'right':
        return useTransform(scrollYProgress, [0, 1], [-range, range]);
      default:
        return useTransform(scrollYProgress, [0, 1], [range, -range]);
    }
  };

  const transform = getTransformValue();
  const smoothTransform = useSpring(transform, springConfig);

  // Media query detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Determine if parallax should be enabled
  const isEnabled = (isMobile && enableOnMobile) || (!isMobile && enableOnDesktop);

  // Reduce motion for accessibility
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  if (!isEnabled || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const motionStyle = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { y: smoothTransform };
      case 'left':
      case 'right':
        return { x: smoothTransform };
      default:
        return { y: smoothTransform };
    }
  };

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={motionStyle()}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
};

// Specialized parallax components for common use cases
export const ParallaxText: React.FC<{
  children: React.ReactNode;
  className?: string;
  speed?: number;
}> = ({ children, className, speed = 0.3 }) => (
  <Parallax 
    speed={speed} 
    className={className}
    enableOnMobile={true}
  >
    {children}
  </Parallax>
);

export const ParallaxImage: React.FC<{
  children: React.ReactNode;
  className?: string;
  speed?: number;
}> = ({ children, className, speed = 0.8 }) => (
  <Parallax 
    speed={speed} 
    className={className}
    enableOnDesktop={true}
    enableOnMobile={false}
  >
    {children}
  </Parallax>
);

// Multi-layer parallax container for complex effects
export const ParallaxLayers: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const layers = React.Children.toArray(children);
  
  return (
    <div className={`relative ${className}`}>
      {layers.map((layer, index) => {
        const speed = (index + 1) * 0.2; // Each layer moves at different speeds
        return (
          <Parallax
            key={index}
            speed={speed}
            className="absolute inset-0"
            style={{ zIndex: layers.length - index }}
          >
            {layer}
          </Parallax>
        );
      })}
    </div>
  );
};

export default Parallax;