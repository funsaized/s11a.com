import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl",
        magnetic:
          "bg-primary text-primary-foreground shadow-lg hover:shadow-xl transform-gpu",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
      animation: {
        none: "",
        subtle: "",
        bounce: "",
        magnetic: "",
        ripple: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "subtle",
    },
  },
);

// Animation configurations
const animationConfigs = {
  subtle: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  bounce: {
    whileHover: { scale: 1.05, y: -2 },
    whileTap: { scale: 0.95, y: 0 },
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
  magnetic: {
    whileHover: { scale: 1.03, rotateX: 5, rotateY: 5 },
    whileTap: { scale: 0.97, rotateX: 0, rotateY: 0 },
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  ripple: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
  none: {},
};

// Ripple effect component
const RippleEffect: React.FC<{ onClick?: (e: React.MouseEvent) => void }> = ({
  onClick,
}) => {
  const [ripples, setRipples] = React.useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  return (
    <>
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 4,
            height: 4,
            backgroundColor: "currentColor",
            borderRadius: "50%",
            opacity: 0.3,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 20, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </>
  );
};

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    animation?: "none" | "subtle" | "bounce" | "magnetic" | "ripple";
  } & HTMLMotionProps<"button">;

function Button({
  className,
  variant,
  size,
  animation = "subtle",
  asChild = false,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const [isPressed, setIsPressed] = React.useState(false);

  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size, animation, className }))}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  const animationProps = animationConfigs[animation];

  return (
    <motion.button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, animation, className }))}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      {animation === "ripple" && <RippleEffect onClick={onClick} />}

      {/* Gradient background for special variants */}
      {variant === "gradient" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0"
          animate={{
            opacity: isPressed ? 1 : 0,
            x: isPressed ? 0 : -100,
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

export { Button, buttonVariants };
