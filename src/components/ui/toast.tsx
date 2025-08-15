import React from 'react';
import { Toaster as Sonner, toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
        duration: 4000,
      }}
      {...props}
    />
  );
};

// Enhanced toast functions with animations
const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
  custom: (message: string) => toast(message),
  
  // Specialized actions
  copySuccess: () => toast.success('Copied to clipboard!', {
    duration: 2000,
    icon: '📋',
  }),
  
  linkShared: () => toast.success('Link shared!', {
    duration: 2000,
    icon: '🔗',
  }),
  
  pageLoaded: () => toast.success('Page loaded successfully!', {
    duration: 1500,
    icon: '✅',
  }),
  
  // Loading states
  loading: (message: string) => toast.loading(message),
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => toast.promise(promise, { loading, success, error }),
};

export { Toaster, showToast };