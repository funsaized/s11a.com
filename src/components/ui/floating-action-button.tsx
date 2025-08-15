import React, { useRef, useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  magnetic?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'secondary' | 'gradient';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  children,
  onClick,
  position = 'bottom-right',
  magnetic = true,
  className,
  size = 'md',
  variant = 'gradient',
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });

  // Mouse position springs
  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 30 });

  // Transform mouse position to button rotation
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-7.5deg', '7.5deg']);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setBounds({ width: rect.width, height: rect.height });
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!magnetic || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseXPos = (e.clientX - centerX) / rect.width;
    const mouseYPos = (e.clientY - centerY) / rect.height;

    mouseX.set(mouseXPos);
    mouseY.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-12 w-12 text-sm',
    md: 'h-14 w-14 text-base',
    lg: 'h-16 w-16 text-lg',
  };

  return (
    <motion.div
      className={cn(
        'fixed z-50',
        positionClasses[position],
        className
      )}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 0.5,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        ref={ref}
        onClick={onClick}
        variant={variant}
        size="icon"
        className={cn(
          'rounded-full shadow-lg hover:shadow-xl transition-all duration-300',
          'backdrop-blur-sm border border-white/20',
          sizeClasses[size],
          magnetic && 'cursor-pointer'
        )}
        style={{
          rotateX: magnetic ? rotateX : 0,
          rotateY: magnetic ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          initial={{ rotate: 0 }}
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </Button>
    </motion.div>
  );
};

// Expandable FAB with menu options
export const ExpandableFloatingActionButton: React.FC<{
  mainIcon: React.ReactNode;
  actions: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }>;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}> = ({ mainIcon, actions, position = 'bottom-right' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const containerVariants = {
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
    open: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    closed: {
      scale: 0,
      rotate: -90,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    open: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  // Position-based offset calculation
  const getItemPosition = (index: number) => {
    const spacing = 60;
    const angle = position.includes('right') ? -90 : 90; // Fan direction
    const radians = (angle * Math.PI) / 180;
    
    if (position.includes('bottom')) {
      return {
        x: Math.cos(radians + (index * 0.3)) * spacing * (index + 1),
        y: Math.sin(radians + (index * 0.3)) * spacing * (index + 1),
      };
    } else {
      return {
        x: Math.cos(radians - (index * 0.3)) * spacing * (index + 1),
        y: Math.sin(radians - (index * 0.3)) * spacing * (index + 1),
      };
    }
  };

  return (
    <div className={cn('fixed z-50', {
      'bottom-6 right-6': position === 'bottom-right',
      'bottom-6 left-6': position === 'bottom-left',
      'top-6 right-6': position === 'top-right',
      'top-6 left-6': position === 'top-left',
    })}>
      {/* Action items */}
      <motion.div
        variants={containerVariants}
        initial="closed"
        animate={isExpanded ? 'open' : 'closed'}
        className="absolute inset-0"
      >
        {actions.map((action, index) => {
          const itemPosition = getItemPosition(index);
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              style={{
                position: 'absolute',
                bottom: position.includes('bottom') ? 0 : 'auto',
                top: position.includes('top') ? 0 : 'auto',
                right: position.includes('right') ? 0 : 'auto',
                left: position.includes('left') ? 0 : 'auto',
                x: itemPosition.x,
                y: itemPosition.y,
              }}
              className="flex items-center gap-2"
            >
              <Button
                onClick={() => {
                  action.onClick();
                  setIsExpanded(false);
                }}
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full shadow-lg hover:shadow-xl backdrop-blur-sm"
                title={action.label}
              >
                {action.icon}
              </Button>
              
              {/* Label tooltip */}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: isExpanded ? 1 : 0,
                  scale: isExpanded ? 1 : 0.8,
                }}
                transition={{ delay: 0.1 }}
                className="text-xs bg-background/90 backdrop-blur-sm border rounded px-2 py-1 whitespace-nowrap shadow-sm"
              >
                {action.label}
              </motion.span>
            </div>
          );
        })}
      </motion.div>

      {/* Main FAB */}
      <FloatingActionButton
        onClick={() => setIsExpanded(!isExpanded)}
        magnetic={true}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {mainIcon}
        </motion.div>
      </FloatingActionButton>
    </div>
  );
};

export default FloatingActionButton;