import React, { useState, useEffect, useCallback } from "react";
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Mail,
  MessageCircle,
  Heart,
  ThumbsUp,
  Smile,
  Zap,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  title: string;
  url?: string;
  description?: string;
  author?: string;
  className?: string;
}

interface ReactionProps {
  postId: string;
  initialCounts?: Record<string, number>;
  className?: string;
}

const reactions = [
  { name: "like", icon: ThumbsUp, label: "Like", color: "text-blue-500" },
  { name: "love", icon: Heart, label: "Love", color: "text-red-500" },
  { name: "happy", icon: Smile, label: "Happy", color: "text-yellow-500" },
  { name: "wow", icon: Zap, label: "Wow", color: "text-purple-500" },
];

export function SocialShare({
  title,
  url,
  description = "",
  author = "",
  className,
}: SocialShareProps): React.ReactElement {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(url || "");
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, [url]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Failed to share:", error);
        }
      }
    } else {
      setIsShareOpen(true);
    }
  }, [title, description, shareUrl]);

  const shareLinks = [
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}${author ? `&via=${encodeURIComponent(author)}` : ""}`,
      color: "hover:text-blue-400",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "hover:text-blue-600",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "hover:text-blue-700",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${shareUrl}`)}`,
      color: "hover:text-green-600",
    },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Native Share or Custom Share */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNativeShare}
            className="h-8 px-3"
            aria-label="Share article"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share this article</TooltipContent>
      </Tooltip>

      {/* Quick Copy Link */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 w-8 p-0"
            aria-label="Copy link"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy link"}</TooltipContent>
      </Tooltip>

      {/* Custom Share Sheet */}
      <Sheet open={isShareOpen} onOpenChange={setIsShareOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Article
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <h3 className="font-medium text-sm mb-1">{title}</h3>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Share on social media</h4>
              {shareLinks.map((platform) => (
                <Button
                  key={platform.name}
                  variant="outline"
                  className={cn("w-full justify-start", platform.color)}
                  onClick={() =>
                    window.open(platform.url, "_blank", "noopener,noreferrer")
                  }
                >
                  <platform.icon className="h-4 w-4 mr-3" />
                  Share on {platform.name}
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
              ))}
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm mb-3">Copy link</h4>
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-muted rounded text-sm font-mono truncate">
                  {shareUrl}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function ReactionSystem({
  postId,
  initialCounts = {},
  className,
}: ReactionProps): React.ReactElement {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Load user reactions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`reactions-${postId}`);
      if (saved) {
        setUserReactions(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.warn("Failed to load reactions:", error);
    }
  }, [postId]);

  // Save user reactions to localStorage
  const saveUserReactions = useCallback(
    (reactions: Set<string>) => {
      try {
        localStorage.setItem(
          `reactions-${postId}`,
          JSON.stringify([...reactions]),
        );
      } catch (error) {
        console.warn("Failed to save reactions:", error);
      }
    },
    [postId],
  );

  const handleReaction = useCallback(
    async (reactionName: string) => {
      if (isLoading) return;

      setIsLoading(true);
      const hasReacted = userReactions.has(reactionName);
      const newReactions = new Set(userReactions);
      const newCounts = { ...counts };

      if (hasReacted) {
        // Remove reaction
        newReactions.delete(reactionName);
        newCounts[reactionName] = Math.max(
          0,
          (newCounts[reactionName] || 0) - 1,
        );
      } else {
        // Add reaction
        newReactions.add(reactionName);
        newCounts[reactionName] = (newCounts[reactionName] || 0) + 1;
      }

      // Update state optimistically
      setUserReactions(newReactions);
      setCounts(newCounts);
      saveUserReactions(newReactions);

      // Here you could make an API call to persist to a backend
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      setIsLoading(false);

      // Show feedback
      const reaction = reactions.find((r) => r.name === reactionName);
      if (reaction) {
        toast.success(
          hasReacted ? `Removed ${reaction.label}` : `Added ${reaction.label}!`,
        );
      }
    },
    [isLoading, userReactions, counts, saveUserReactions],
  );

  const totalReactions = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1">
        {reactions.map((reaction) => {
          const count = counts[reaction.name] || 0;
          const hasReacted = userReactions.has(reaction.name);
          const Icon = reaction.icon;

          return (
            <Tooltip key={reaction.name}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(reaction.name)}
                  disabled={isLoading}
                  className={cn(
                    "h-8 px-2 transition-all duration-200",
                    hasReacted && [
                      "bg-background shadow-sm scale-105",
                      reaction.color,
                    ],
                  )}
                  aria-label={`${reaction.label} (${count})`}
                >
                  <Icon className="h-4 w-4" />
                  {count > 0 && (
                    <span className="ml-1 text-xs font-medium">{count}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {reaction.label} {count > 0 && `(${count})`}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {totalReactions > 0 && (
        <span className="text-xs text-muted-foreground ml-2">
          {totalReactions} reaction{totalReactions !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

// Newsletter signup component
interface NewsletterSignupProps {
  className?: string;
  compact?: boolean;
}

export function NewsletterSignup({
  className,
  compact = false,
}: NewsletterSignupProps): React.ReactElement {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || isSubmitting) return;

      setIsSubmitting(true);

      // Simulate API call - replace with your newsletter service
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsSubmitted(true);
        setEmail("");
        toast.success("Thanks for subscribing!");

        // Reset after 3 seconds
        setTimeout(() => setIsSubmitted(false), 3000);
      } catch (error) {
        toast.error("Failed to subscribe. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isSubmitting],
  );

  if (isSubmitted) {
    return (
      <div
        className={cn(
          "flex items-center justify-center p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/30 rounded-lg text-green-700 dark:text-green-300",
          className,
        )}
      >
        <Check className="h-5 w-5 mr-2" />
        <span className="font-medium">Successfully subscribed!</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        compact
          ? "flex gap-2 items-center"
          : "space-y-4 p-6 bg-muted/30 rounded-lg border",
        className,
      )}
    >
      {!compact && (
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-2">Stay Updated</h3>
          <p className="text-muted-foreground text-sm">
            Get the latest posts and updates delivered to your inbox.
          </p>
        </div>
      )}

      <div className={compact ? "flex-1" : ""}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className={cn(
            "w-full px-3 py-2 bg-background border border-border rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "placeholder:text-muted-foreground",
          )}
        />
      </div>

      <Button
        type="submit"
        disabled={!email || isSubmitting}
        className={compact ? "shrink-0" : "w-full"}
      >
        {isSubmitting ? (
          <>
            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Subscribing...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Subscribe
          </>
        )}
      </Button>
    </form>
  );
}

export default { SocialShare, ReactionSystem, NewsletterSignup };
