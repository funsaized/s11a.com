import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

interface CardProps extends React.ComponentProps<"div"> {
  variant?: 'default' | 'hover-lift' | 'hover-glow' | 'tilt' | 'scale';
  animation?: 'none' | 'fade-in' | 'slide-up' | 'scale-in';
}

function Card({ className, variant = 'default', animation = 'none', ...props }: CardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const getCardVariants = () => {
    const baseVariants = {
      initial: { opacity: 1, scale: 1, y: 0, rotateX: 0, rotateY: 0 },
      animate: { opacity: 1, scale: 1, y: 0, rotateX: 0, rotateY: 0 },
    };

    switch (animation) {
      case 'fade-in':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
        };
      case 'slide-up':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
        };
      case 'scale-in':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
        };
      default:
        return baseVariants;
    }
  };

  const getHoverVariants = () => {
    switch (variant) {
      case 'hover-lift':
        return {
          whileHover: { y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
          transition: { type: 'spring', stiffness: 300, damping: 30 },
        };
      case 'hover-glow':
        return {
          whileHover: { 
            boxShadow: '0 0 30px rgba(var(--primary-rgb), 0.3)',
            borderColor: 'hsl(var(--primary))',
          },
          transition: { duration: 0.3 },
        };
      case 'tilt':
        return {
          whileHover: { rotateX: 5, rotateY: 5, scale: 1.02 },
          transition: { type: 'spring', stiffness: 300, damping: 30 },
        };
      case 'scale':
        return {
          whileHover: { scale: 1.03 },
          whileTap: { scale: 0.98 },
          transition: { type: 'spring', stiffness: 300, damping: 30 },
        };
      default:
        return {};
    }
  };

  const cardVariants = getCardVariants();
  const hoverVariants = getHoverVariants();

  return (
    <motion.div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        "transition-all duration-300 ease-in-out cursor-pointer",
        {
          'transform-gpu': variant === 'tilt',
          'hover:border-primary/20': variant === 'hover-glow',
        },
        className
      )}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
      initial="initial"
      animate="animate"
      variants={cardVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...hoverVariants}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

// Specialized Card Components

// Magnetic Card with mouse follow effect
const MagneticCard = React.forwardRef<HTMLDivElement, CardProps & {
  magneticStrength?: number;
}>(({ className, magneticStrength = 0.3, ...props }, ref) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * magneticStrength;
    const y = (e.clientY - rect.top - rect.height / 2) * magneticStrength;
    
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        "cursor-pointer transform-gpu",
        className
      )}
      animate={{
        x: mousePosition.x,
        y: mousePosition.y,
        rotateX: -mousePosition.y * 0.1,
        rotateY: mousePosition.x * 0.1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      }}
      {...props}
    />
  );
});
MagneticCard.displayName = "MagneticCard";

// Glassmorphism Card
const GlassCard: React.FC<CardProps & {
  blur?: number;
  opacity?: number;
}> = ({ className, blur = 10, opacity = 0.1, ...props }) => {
  return (
    <Card
      className={cn(
        "backdrop-blur-sm bg-background/10 border-white/20",
        "shadow-xl shadow-black/5",
        className
      )}
      style={{
        backdropFilter: `blur(${blur}px)`,
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      }}
      variant="hover-glow"
      {...props}
    />
  );
};

// Gradient Border Card
const GradientCard: React.FC<CardProps & {
  gradientFrom?: string;
  gradientTo?: string;
}> = ({ 
  className, 
  gradientFrom = "from-primary", 
  gradientTo = "to-secondary",
  children,
  ...props 
}) => {
  return (
    <div className={cn("p-0.5 rounded-xl bg-gradient-to-r", gradientFrom, gradientTo)}>
      <Card
        className={cn("bg-background border-0", className)}
        variant="scale"
        {...props}
      >
        {children}
      </Card>
    </div>
  );
};

// Interactive Card with reveal animation
const RevealCard: React.FC<CardProps & {
  revealDirection?: 'top' | 'bottom' | 'left' | 'right';
}> = ({ className, revealDirection = 'bottom', children, ...props }) => {
  const [isRevealed, setIsRevealed] = React.useState(false);

  const revealVariants = {
    hidden: {
      opacity: 0,
      clipPath: {
        top: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
        bottom: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
        left: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
        right: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
      }[revealDirection],
    },
    visible: {
      opacity: 1,
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={revealVariants}
      onAnimationComplete={() => setIsRevealed(true)}
    >
      <Card
        className={cn("overflow-hidden", className)}
        variant="hover-lift"
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
};

// Stacked Cards with depth effect
const StackedCard: React.FC<CardProps & {
  stackCount?: number;
  stackOffset?: number;
}> = ({ 
  className, 
  stackCount = 3, 
  stackOffset = 4,
  children,
  ...props 
}) => {
  return (
    <div className="relative">
      {/* Stack background cards */}
      {Array.from({ length: stackCount - 1 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 bg-card border rounded-xl",
            "opacity-40 -z-10"
          )}
          style={{
            transform: `translate(${(index + 1) * stackOffset}px, ${(index + 1) * stackOffset}px)`,
            zIndex: -(index + 1),
          }}
        />
      ))}
      
      {/* Main card */}
      <Card
        className={cn("relative z-10", className)}
        variant="hover-lift"
        {...props}
      >
        {children}
      </Card>
    </div>
  );
};

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  MagneticCard,
  GlassCard,
  GradientCard,
  RevealCard,
  StackedCard,
}