import React, { useState, useEffect } from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TableOfContentsProps, TableOfContentsHeading } from "../../models";

function TableOfContents({
  headings,
  className,
}: TableOfContentsProps): React.ReactElement | null {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -80px 0px",
        threshold: 0.1,
      },
    );

    // Observe all headings
    const headingElements = headings.flatMap((heading) => {
      const elements = [document.getElementById(heading.id)];
      if (heading.children) {
        elements.push(
          ...heading.children.map((child) => document.getElementById(child.id)),
        );
      }
      return elements.filter(Boolean);
    });

    headingElements.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => {
      headingElements.forEach((element) => {
        if (element) observer.unobserve(element);
      });
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  const renderHeading = (heading: TableOfContentsHeading) => (
    <li key={heading.id}>
      <button
        onClick={() => scrollToHeading(heading.id)}
        className={cn(
          "block w-full text-left py-1 px-2 rounded text-sm transition-colors hover:bg-muted",
          heading.level === 2 && "font-medium",
          heading.level === 3 && "ml-3 text-muted-foreground",
          heading.level === 4 && "ml-6 text-muted-foreground text-xs",
          activeId === heading.id && "text-primary bg-primary/10 font-medium",
        )}
      >
        {heading.title}
      </button>
      {heading.children && heading.children.length > 0 && (
        <ul className="space-y-1 mt-1">
          {heading.children.map(renderHeading)}
        </ul>
      )}
    </li>
  );

  return (
    <Card
      className={cn(
        "sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto",
        className,
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Table of Contents
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <nav>
          <ul className="space-y-1">{headings.map(renderHeading)}</ul>
        </nav>
      </CardContent>
    </Card>
  );
}

export default TableOfContents;
