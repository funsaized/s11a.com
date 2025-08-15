import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { Progress } from "../ui/progress";
import { ReadingProgressProps } from "../../models";

function ReadingProgress({ 
  target = ".prose", 
  className 
}: ReadingProgressProps): React.ReactElement {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const targetElement = document.querySelector(target);
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const documentHeight = rect.height;
      const scrollTop = window.scrollY - (targetElement as HTMLElement).offsetTop;

      if (scrollTop <= 0) {
        setProgress(0);
        return;
      }

      if (scrollTop >= documentHeight - windowHeight) {
        setProgress(100);
        return;
      }

      const progressPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
      setProgress(Math.max(0, Math.min(100, progressPercent)));
    };

    // Initial calculation
    updateProgress();

    // Add scroll listener
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [target]);

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50", className)}>
      <Progress 
        value={progress} 
        className="h-1 rounded-none bg-transparent"
      />
    </div>
  );
}

export default ReadingProgress;