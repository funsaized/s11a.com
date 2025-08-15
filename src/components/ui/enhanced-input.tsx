import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'floating' | 'outlined' | 'underlined';
  helperText?: string;
  onValidation?: (isValid: boolean) => void;
}

const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  error,
  success,
  icon,
  variant = 'floating',
  className,
  helperText,
  onValidation,
  required,
  type = 'text',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update hasValue when value changes
  useEffect(() => {
    if (inputRef.current) {
      setHasValue(inputRef.current.value.length > 0);
    }
  }, [props.value]);

  // Validation logic
  useEffect(() => {
    if (inputRef.current && required) {
      const value = inputRef.current.value;
      const valid = value.length > 0;
      setIsValid(valid);
      onValidation?.(valid);
    }
  }, [props.value, required, onValidation]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  // Style variants
  const getInputStyles = () => {
    const baseStyles = cn(
      'w-full transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'text-destructive border-destructive focus:border-destructive': error,
        'text-green-600 border-green-500 focus:border-green-500': success,
        'border-input focus:border-primary': !error && !success,
      }
    );

    switch (variant) {
      case 'floating':
        return cn(
          baseStyles,
          'bg-transparent border-2 rounded-lg px-4 py-3',
          'placeholder-transparent peer',
          icon ? 'pl-12' : ''
        );
      
      case 'outlined':
        return cn(
          baseStyles,
          'bg-background border-2 rounded-lg px-4 py-3',
          icon ? 'pl-12' : ''
        );
      
      case 'underlined':
        return cn(
          baseStyles,
          'bg-transparent border-0 border-b-2 rounded-none px-0 py-3',
          'focus:border-b-primary',
          icon ? 'pl-10' : ''
        );
      
      default:
        return cn(baseStyles, 'bg-background border rounded-md px-3 py-2');
    }
  };

  const getLabelStyles = () => {
    const baseStyles = 'absolute transition-all duration-200 ease-in-out pointer-events-none';
    
    if (variant === 'floating') {
      return cn(
        baseStyles,
        'text-muted-foreground peer-placeholder-shown:text-muted-foreground',
        'peer-placeholder-shown:scale-100 peer-focus:scale-75',
        'peer-focus:text-primary',
        isFocused || hasValue 
          ? 'left-4 top-2 scale-75 text-xs text-primary' 
          : 'left-4 top-1/2 -translate-y-1/2 scale-100',
        icon ? 'peer-placeholder-shown:left-12 peer-focus:left-4' : '',
        error ? 'peer-focus:text-destructive' : '',
        success ? 'peer-focus:text-green-600' : ''
      );
    }
    
    if (variant === 'underlined') {
      return cn(
        baseStyles,
        'left-0 text-muted-foreground',
        isFocused || hasValue 
          ? 'top-0 scale-75 text-xs text-primary' 
          : 'top-1/2 -translate-y-1/2 scale-100',
        icon ? 'peer-placeholder-shown:left-10 peer-focus:left-0' : ''
      );
    }

    return cn(baseStyles, 'left-0 -top-2 text-xs text-primary');
  };

  return (
    <div className={cn('relative', className)}>
      {/* Icon */}
      {icon && (
        <motion.div
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 z-10',
            'text-muted-foreground',
            {
              'text-destructive': error,
              'text-green-600': success,
              'text-primary': isFocused && !error && !success,
            }
          )}
          animate={{
            scale: isFocused ? 1.1 : 1,
            color: isFocused ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
          }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
      )}

      {/* Input field */}
      <motion.input
        ref={inputRef}
        type={type}
        className={getInputStyles()}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder={variant === 'floating' ? ' ' : props.placeholder}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        {...props}
      />

      {/* Floating label */}
      {label && variant !== 'default' && (
        <motion.label
          className={getLabelStyles()}
          initial={false}
          animate={{
            scale: isFocused || hasValue ? 0.75 : 1,
            y: isFocused || hasValue ? (variant === 'underlined' ? -24 : -8) : 0,
            color: error 
              ? 'hsl(var(--destructive))' 
              : success 
                ? 'hsl(var(--success))' 
                : isFocused 
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--muted-foreground))',
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </motion.label>
      )}

      {/* Static label for default variant */}
      {label && variant === 'default' && (
        <label className="block text-sm font-medium mb-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Underline animation for underlined variant */}
      {variant === 'underlined' && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-primary"
          initial={{ width: 0 }}
          animate={{ width: isFocused ? '100%' : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      )}

      {/* Error/Success/Helper text */}
      <AnimatePresence>
        {(error || helperText || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <span>⚠</span> {error}
              </p>
            )}
            {success && !error && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span>✓</span> Success!
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-xs text-muted-foreground">{helperText}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced textarea with similar functionality
export const EnhancedTextarea: React.FC<{
  label?: string;
  error?: string;
  success?: boolean;
  variant?: 'default' | 'floating' | 'outlined';
  helperText?: string;
  rows?: number;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  label,
  error,
  success,
  variant = 'floating',
  className,
  helperText,
  rows = 4,
  required,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    setHasValue(e.target.value.length > 0);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  return (
    <div className={cn('relative', className)}>
      <motion.textarea
        ref={textareaRef}
        rows={rows}
        className={cn(
          'w-full transition-all duration-200 ease-in-out resize-none',
          'focus:outline-none focus:ring-0',
          'bg-transparent border-2 rounded-lg px-4 py-3',
          'placeholder-transparent peer',
          {
            'text-destructive border-destructive focus:border-destructive': error,
            'text-green-600 border-green-500 focus:border-green-500': success,
            'border-input focus:border-primary': !error && !success,
          }
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        placeholder={variant === 'floating' ? ' ' : props.placeholder}
        whileFocus={{ scale: 1.005 }}
        transition={{ duration: 0.2 }}
        {...props}
      />

      {label && (
        <motion.label
          className={cn(
            'absolute left-4 transition-all duration-200 ease-in-out pointer-events-none',
            'text-muted-foreground peer-placeholder-shown:text-muted-foreground',
            'peer-focus:text-primary'
          )}
          initial={false}
          animate={{
            scale: isFocused || hasValue ? 0.75 : 1,
            y: isFocused || hasValue ? -8 : 12,
            color: error 
              ? 'hsl(var(--destructive))' 
              : isFocused 
                ? 'hsl(var(--primary))'
                : 'hsl(var(--muted-foreground))',
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </motion.label>
      )}

      <AnimatePresence>
        {(error || helperText || success) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            {error && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <span>⚠</span> {error}
              </p>
            )}
            {success && !error && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span>✓</span> Success!
              </p>
            )}
            {helperText && !error && !success && (
              <p className="text-xs text-muted-foreground">{helperText}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedInput;