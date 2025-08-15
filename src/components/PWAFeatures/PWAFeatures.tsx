import React, { useState, useEffect, useCallback } from "react";
import { 
  Download,
  Wifi,
  WifiOff,
  Bell,
  BellOff,
  Bookmark,
  BookmarkCheck,
  Smartphone,
  X,
  Reload,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PWAFeaturesProps {
  className?: string;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface OfflinePost {
  slug: string;
  title: string;
  content: string;
  dateAdded: string;
  estimatedReadTime: number;
}

export function PWAInstallPrompt({ 
  className 
}: { 
  className?: string;
}): React.ReactElement | null {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed/running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                             (window.navigator as any).standalone ||
                             document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay if not dismissed recently
      const lastDismissed = localStorage.getItem('pwa-install-dismissed');
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      
      if (!lastDismissed || parseInt(lastDismissed) < oneDayAgo) {
        setTimeout(() => setShowInstallPrompt(true), 5000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      toast.success("App installed successfully!");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      } else {
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or in standalone mode
  if (isInstalled || isStandalone || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Card className={cn("fixed bottom-4 right-4 z-50 max-w-sm shadow-lg", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Install App</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-sm">
          Install this app on your device for a better experience with offline access and notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button onClick={handleInstallClick} className="flex-1" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Install
          </Button>
          <Button onClick={handleDismiss} variant="outline" size="sm">
            Not now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function OfflineIndicator({ 
  className 
}: { 
  className?: string;
}): React.ReactElement {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online && !showOfflineBanner) {
        setShowOfflineBanner(true);
        toast.error("You're offline. Some features may not work properly.");
      } else if (online && showOfflineBanner) {
        setShowOfflineBanner(false);
        toast.success("You're back online!");
      }
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [showOfflineBanner]);

  if (isOnline) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 bg-orange-500 text-white text-sm text-center py-2 z-50",
      className
    )}>
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>You're offline - viewing cached content</span>
      </div>
    </div>
  );
}

export function NotificationManager({ 
  className 
}: { 
  className?: string;
}): React.ReactElement {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Check if already subscribed (simplified - would need service worker integration)
    const savedSubscription = localStorage.getItem('notification-subscribed');
    setSubscribed(savedSubscription === 'true');
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        setSubscribed(true);
        localStorage.setItem('notification-subscribed', 'true');
        toast.success('Notifications enabled! You\'ll be notified of new posts.');
        
        // Show a test notification
        new Notification('Notifications enabled!', {
          body: 'You\'ll now receive notifications about new blog posts.',
          icon: '/favicon.png',
        });
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
    }
  };

  const unsubscribeNotifications = () => {
    setSubscribed(false);
    localStorage.setItem('notification-subscribed', 'false');
    toast.success('Notifications disabled');
  };

  if (!('Notification' in window)) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {permission === 'granted' && subscribed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={unsubscribeNotifications}
              className="h-8 w-8 p-0"
              aria-label="Disable notifications"
            >
              <BellOff className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Disable notifications</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={requestNotificationPermission}
              className="h-8 w-8 p-0"
              aria-label="Enable notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Enable notifications for new posts</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export function OfflineReadingQueue({ 
  className 
}: { 
  className?: string;
}): React.ReactElement {
  const [offlinePosts, setOfflinePosts] = useState<OfflinePost[]>([]);
  const [currentPost, setCurrentPost] = useState<string | null>(null);

  useEffect(() => {
    // Load offline posts from localStorage
    try {
      const saved = localStorage.getItem('offline-reading-queue');
      if (saved) {
        setOfflinePosts(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load offline reading queue:', error);
    }

    // Get current post slug from URL
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      setCurrentPost(path);
    }
  }, []);

  const saveToOffline = useCallback(async (slug: string, title: string) => {
    try {
      // In a real implementation, you would fetch the full content
      // For now, we'll simulate this
      const content = document.querySelector('article')?.innerHTML || '';
      const estimatedReadTime = Math.ceil(content.length / 1000); // Rough estimate
      
      const newPost: OfflinePost = {
        slug,
        title,
        content,
        dateAdded: new Date().toISOString(),
        estimatedReadTime,
      };

      const updated = [...offlinePosts.filter(p => p.slug !== slug), newPost];
      setOfflinePosts(updated);
      
      localStorage.setItem('offline-reading-queue', JSON.stringify(updated));
      toast.success('Post saved for offline reading!');
    } catch (error) {
      console.error('Failed to save post for offline:', error);
      toast.error('Failed to save post for offline reading');
    }
  }, [offlinePosts]);

  const removeFromOffline = useCallback((slug: string) => {
    const updated = offlinePosts.filter(p => p.slug !== slug);
    setOfflinePosts(updated);
    localStorage.setItem('offline-reading-queue', JSON.stringify(updated));
    toast.success('Removed from offline reading queue');
  }, [offlinePosts]);

  const isPostSaved = currentPost ? offlinePosts.some(p => p.slug === currentPost) : false;

  // Get current page title (simplified)
  const currentTitle = typeof document !== 'undefined' ? document.title : '';

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Save/Remove Current Post */}
      {currentPost && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isPostSaved) {
                  removeFromOffline(currentPost);
                } else {
                  saveToOffline(currentPost, currentTitle);
                }
              }}
              className="h-8 w-8 p-0"
              aria-label={isPostSaved ? "Remove from offline queue" : "Save for offline reading"}
            >
              {isPostSaved ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPostSaved ? "Remove from offline queue" : "Save for offline reading"}
          </TooltipContent>
        </Tooltip>
      )}

      {/* Offline Queue Count */}
      {offlinePosts.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => {
                // Navigate to offline reading queue page
                // This would be implemented as a separate page
                toast.info(`${offlinePosts.length} posts saved for offline reading`);
              }}
            >
              <Bookmark className="h-4 w-4 mr-1" />
              {offlinePosts.length}
            </Button>
          </TooltipTrigger>
          <TooltipContent>View offline reading queue</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export function ServiceWorkerUpdater({ 
  className 
}: { 
  className?: string;
}): React.ReactElement | null {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Register service worker update listener
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdatePrompt(true);
      });

      // Check for waiting service worker
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration?.waiting) {
          setShowUpdatePrompt(true);
        }
      });
    }
  }, []);

  const handleUpdate = async () => {
    if (!('serviceWorker' in navigator)) return;

    setIsUpdating(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // Reload page to get updated content
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to update app:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) return null;

  return (
    <Card className={cn("fixed bottom-4 left-4 z-50 max-w-sm shadow-lg", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Reload className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Update Available</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-sm">
          A new version of the app is available with bug fixes and improvements.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button 
            onClick={handleUpdate} 
            className="flex-1" 
            size="sm"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Updating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Update
              </>
            )}
          </Button>
          <Button onClick={handleDismiss} variant="outline" size="sm">
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Combined PWA Features Component
export function PWAFeatures({ className }: PWAFeaturesProps): React.ReactElement {
  return (
    <div className={cn(className)}>
      <PWAInstallPrompt />
      <OfflineIndicator />
      <ServiceWorkerUpdater />
    </div>
  );
}

export default {
  PWAFeatures,
  PWAInstallPrompt,
  OfflineIndicator,
  NotificationManager,
  OfflineReadingQueue,
  ServiceWorkerUpdater,
};