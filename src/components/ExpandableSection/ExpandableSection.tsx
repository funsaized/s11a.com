import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  icon?: React.ReactNode;
  variant?: "default" | "bordered" | "minimal";
  size?: "sm" | "md" | "lg";
  animationDuration?: number;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  onToggle?: (expanded: boolean) => void;
}

export function ExpandableSection({
  title,
  children,
  defaultExpanded = false,
  icon,
  variant = "default",
  size = "md",
  animationDuration = 200,
  className,
  headerClassName,
  contentClassName,
  onToggle,
}: ExpandableSectionProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [height, setHeight] = useState<number | undefined>(
    defaultExpanded ? undefined : 0,
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  // Measure content height when expanded state changes
  useEffect(() => {
    if (!contentRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (measureRef.current && isExpanded) {
        setHeight(measureRef.current.scrollHeight);
      }
    });

    if (measureRef.current) {
      resizeObserver.observe(measureRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [isExpanded]);

  const handleToggle = () => {
    const newExpanded = !isExpanded;

    if (newExpanded && measureRef.current) {
      setHeight(measureRef.current.scrollHeight);
    } else {
      setHeight(0);
    }

    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  const variantStyles = {
    default: "bg-card border border-border rounded-lg shadow-sm",
    bordered: "border-2 border-border rounded-md",
    minimal: "border-b border-border/50",
  };

  const sizeStyles = {
    sm: {
      padding: "p-3",
      titleSize: "text-sm font-medium",
      iconSize: "h-4 w-4",
      spacing: "space-y-2",
    },
    md: {
      padding: "p-4",
      titleSize: "text-base font-semibold",
      iconSize: "h-5 w-5",
      spacing: "space-y-3",
    },
    lg: {
      padding: "p-6",
      titleSize: "text-lg font-bold",
      iconSize: "h-6 w-6",
      spacing: "space-y-4",
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        variantStyles[variant],
        className,
      )}
    >
      {/* Header */}
      <Button
        variant="ghost"
        onClick={handleToggle}
        className={cn(
          "w-full justify-between h-auto hover:bg-transparent focus:bg-transparent",
          styles.padding,
          "p-0 font-normal text-left",
          headerClassName,
        )}
        aria-expanded={isExpanded}
        aria-controls={`expandable-content-${title.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn("flex-shrink-0", styles.iconSize)}>{icon}</div>
          )}
          <span className={cn(styles.titleSize, "truncate")}>{title}</span>
        </div>

        <div className="flex-shrink-0 ml-3">
          {isExpanded ? (
            <ChevronDown
              className={cn(
                styles.iconSize,
                "transition-transform duration-200 text-muted-foreground",
              )}
            />
          ) : (
            <ChevronRight
              className={cn(
                styles.iconSize,
                "transition-transform duration-200 text-muted-foreground",
              )}
            />
          )}
        </div>
      </Button>

      {/* Content */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all ease-in-out"
        style={{
          height,
          transitionDuration: `${animationDuration}ms`,
        }}
        id={`expandable-content-${title.replace(/\s+/g, "-").toLowerCase()}`}
        aria-hidden={!isExpanded}
      >
        <div
          ref={measureRef}
          className={cn(
            styles.padding,
            "pt-0",
            styles.spacing,
            contentClassName,
          )}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Convenience components for different variants
export function BorderedExpandableSection(props: Omit<ExpandableSectionProps, "variant">) {
  return <ExpandableSection {...props} variant="bordered" />
}

export function MinimalExpandableSection(props: Omit<ExpandableSectionProps, "variant">) {
  return <ExpandableSection {...props} variant="minimal" />
}

// FAQ-specific expandable section with enhanced styling
export function FAQSection({
  question,
  answer,
  defaultExpanded = false,
  className,
}: {
  question: string;
  answer: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}) {
  return (
    <ExpandableSection
      title={question}
      defaultExpanded={defaultExpanded}
      variant="bordered"
      className={cn("hover:border-primary/50 transition-colors", className)}
      headerClassName="hover:text-primary"
    >
      {answer}
    </ExpandableSection>
  );
}

// Accordion group for multiple expandable sections
interface AccordionProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({
  children,
  allowMultiple = false,
  className,
}: AccordionProps): React.ReactElement {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const handleToggle = (index: number, expanded: boolean) => {
    if (allowMultiple) {
      const newSet = new Set(expandedItems);
      if (expanded) {
        newSet.add(index);
      } else {
        newSet.delete(index);
      }
      setExpandedItems(newSet);
    } else {
      setExpandedItems(expanded ? new Set([index]) : new Set());
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === ExpandableSection) {
          return React.cloneElement(child, {
            key: index,
            defaultExpanded: expandedItems.has(index),
            onToggle: (expanded: boolean) => {
              handleToggle(index, expanded);
              child.props.onToggle?.(expanded);
            },
          });
        }
        return child;
      })}
    </div>
  );
}

export default ExpandableSection;
