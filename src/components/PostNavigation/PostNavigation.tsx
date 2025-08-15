import React from "react";
import { Link } from "gatsby";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { PostNavigationProps } from "../../models";

function PostNavigation({ 
  previous, 
  next, 
  className 
}: PostNavigationProps): React.ReactElement | null {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav className={cn("grid gap-4 md:grid-cols-2", className)}>
      <div className="flex">
        {previous ? (
          <Link to={previous.slug} className="w-full">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                      Previous Post
                    </div>
                    <div className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
                      {previous.title}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <div></div> // Empty div to maintain grid layout
        )}
      </div>

      <div className="flex">
        {next ? (
          <Link to={next.slug} className="w-full">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0 text-right">
                    <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                      Next Post
                    </div>
                    <div className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
                      {next.title}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <div></div> // Empty div to maintain grid layout
        )}
      </div>
    </nav>
  );
}

export default PostNavigation;