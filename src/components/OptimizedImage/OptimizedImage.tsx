import React, { useState } from 'react';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';

interface OptimizedImageProps {
  image: any;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  aspectRatio?: number;
  width?: number;
  height?: number;
  placeholder?: 'blurred' | 'none';
  quality?: number;
  formats?: ('auto' | 'webp' | 'avif' | 'png' | 'jpg')[];
}

/**
 * OptimizedImage component with CLS prevention and performance optimizations
 * Wraps gatsby-plugin-image with additional performance enhancements
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  image,
  alt,
  className = '',
  loading = 'lazy',
  aspectRatio,
  width,
  height,
  placeholder = 'blurred',
  quality = 85,
  formats = ['auto', 'webp', 'avif'],
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Get optimized image data
  const optimizedImage = getImage(image);

  if (!optimizedImage) {
    return (
      <div 
        className={`bg-muted flex items-center justify-center ${className}`}
        style={{
          aspectRatio: aspectRatio ? aspectRatio.toString() : undefined,
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
        }}
        role="img"
        aria-label={alt}
      >
        <span className="text-muted-foreground text-sm">Image not found</span>
      </div>
    );
  }

  // Container styles for CLS prevention
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...(aspectRatio && { aspectRatio: aspectRatio.toString() }),
    ...(width && { width: `${width}px` }),
    ...(height && { height: `${height}px` }),
  };

  // Loading skeleton styles
  const skeletonStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)',
    backgroundSize: '400% 100%',
    animation: 'loading 1.4s ease infinite',
    zIndex: 1,
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease-out',
  };

  return (
    <div 
      className={`prevent-cls ${className}`}
      style={containerStyles}
      data-dynamic="true"
    >
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div style={skeletonStyles} aria-hidden="true" />
      )}

      {/* Error fallback */}
      {hasError && (
        <div 
          className="bg-muted flex items-center justify-center w-full h-full"
          role="img"
          aria-label={alt}
        >
          <span className="text-muted-foreground text-sm">
            Failed to load image
          </span>
        </div>
      )}

      {/* Optimized image */}
      <GatsbyImage
        image={optimizedImage}
        alt={alt}
        loading={loading}
        placeholder={placeholder}
        quality={quality}
        formats={formats}
        style={{
          opacity: hasError ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
        }}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        imgStyle={{
          objectFit: 'cover',
          width: '100%',
          height: '100%',
        }}
      />

      {/* Intersection Observer for lazy loading analytics */}
      {loading === 'lazy' && (
        <div
          ref={(node) => {
            if (node && 'IntersectionObserver' in window) {
              const observer = new IntersectionObserver(
                (entries) => {
                  entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                      // Track lazy loading performance
                      if (window.gtag) {
                        window.gtag('event', 'lazy_image_load', {
                          event_category: 'Performance',
                          custom_parameter_1: alt,
                        });
                      }
                      observer.unobserve(entry.target);
                    }
                  });
                },
                { rootMargin: '50px' }
              );
              observer.observe(node);
              return () => observer.unobserve(node);
            }
          }}
          style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1 }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default OptimizedImage;

// Utility functions for image optimization
export const getOptimalImageSizes = (breakpoints: number[] = [768, 1024, 1366, 1920]) => {
  return breakpoints.map(bp => `(max-width: ${bp}px) ${Math.round(bp * 0.9)}px`).join(', ') + ', 1200px';
};

export const getResponsiveImageData = (
  image: any,
  options: {
    maxWidth?: number;
    quality?: number;
    formats?: string[];
    breakpoints?: number[];
  } = {}
) => {
  const {
    maxWidth = 1200,
    quality = 85,
    formats = ['auto', 'webp', 'avif'],
    breakpoints = [480, 768, 1024, 1200],
  } = options;

  return {
    ...image,
    childImageSharp: {
      ...image?.childImageSharp,
      gatsbyImageData: {
        ...image?.childImageSharp?.gatsbyImageData,
        width: Math.min(image?.childImageSharp?.gatsbyImageData?.width || maxWidth, maxWidth),
        height: Math.round(
          (image?.childImageSharp?.gatsbyImageData?.height || maxWidth) * 
          (maxWidth / (image?.childImageSharp?.gatsbyImageData?.width || maxWidth))
        ),
        quality,
        formats,
        breakpoints,
      },
    },
  };
};