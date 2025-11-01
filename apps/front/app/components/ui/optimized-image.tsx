import { useEffect, useRef, useState, forwardRef, useCallback, type ImgHTMLAttributes, type CSSProperties } from 'react';
import { Loader } from '@/components/ui/loader';
import { cn } from '@/lib/utils';

export interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'loading'> {
  /**
   * The source URL of the image
   */
  src: string;

  /**
   * Alternative text for the image
   */
  alt: string;

  /**
   * Optional placeholder image URL (blur/placeholder)
   */
  placeholder?: string | 'blur';

  /**
   * Blur data URL for placeholder effect
   */
  blurDataURL?: string;

  /**
   * Width of the image (for aspect ratio calculation)
   */
  width?: number;

  /**
   * Height of the image (for aspect ratio calculation)
   */
  height?: number;

  /**
   * Object fit behavior
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

  /**
   * Object position
   */
  objectPosition?: string;

  /**
   * Whether this image should be loaded with priority (no lazy loading)
   */
  priority?: boolean;

  /**
   * Sizes attribute for responsive images
   */
  sizes?: string;

  /**
   * Custom fallback image URL when the main image fails to load
   */
  fallback?: string;

  /**
   * Callback when image fails to load
   */
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;

  /**
   * Callback when image fails to load (custom error handler)
   */
  onImageError?: (error: Error) => void;

  /**
   * Callback when image loads successfully
   */
  onLoad?: () => void;

  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;

  /**
   * Custom error component
   */
  errorComponent?: React.ReactNode;

  /**
   * Enable intersection observer for lazy loading
   */
  lazy?: boolean;

  /**
   * Root margin for intersection observer
   */
  rootMargin?: string;

  /**
   * Fill mode - makes the image fill its container (ignores aspect ratio)
   * Useful for galleries with fixed container sizes
   */
  fill?: boolean;
}

/**
 * OptimizedImage - A robust image component inspired by Next.js Image
 *
 * Features:
 * - Lazy loading with Intersection Observer
 * - Error handling with fallback images
 * - Loading states with customizable components
 * - Placeholder/blur support
 * - Responsive image support
 * - Aspect ratio preservation
 * - Priority loading option
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   width={800}
 *   height={600}
 *   objectFit="cover"
 *   placeholder="blur"
 *   blurDataURL="data:image/jpeg;base64,..."
 * />
 * ```
 */
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      placeholder,
      blurDataURL,
      width,
      height,
      objectFit = 'cover',
      objectPosition = 'center',
      priority = false,
      sizes,
      fallback,
      onError,
      onImageError,
      onLoad,
      loadingComponent,
      errorComponent,
      lazy = true,
      rootMargin = '50px',
      fill = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [currentSrc, setCurrentSrc] = useState<string>(src);
    const [isInView, setIsInView] = useState(priority || !lazy);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Calculate aspect ratio - only if fill is false and width/height are provided
    const aspectRatioStyle: CSSProperties = fill || !width || !height ? {} : { aspectRatio: `${width}/${height}` };

    // Intersection Observer for lazy loading
    useEffect(() => {
      if (priority || !lazy || isInView) {
        // If already in view or priority, ensure isInView is true
        if (!isInView && (priority || !lazy)) {
          setIsInView(true);
        }
        return;
      }

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        {
          rootMargin,
          threshold: 0.01,
        }
      );

      // Observe the container div - use a small delay to ensure it's mounted
      const timeoutId = setTimeout(() => {
        if (containerRef.current) {
          observer.observe(containerRef.current);
          observerRef.current = observer;
        }
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, [priority, lazy, isInView, rootMargin]);

    // Handle image load
    const handleLoad = useCallback(() => {
      setImageState('loaded');
      onLoad?.();
    }, [onLoad]);

    // Handle image error
    const handleError = useCallback(
      (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (fallback && currentSrc !== fallback) {
          // Try fallback image
          setCurrentSrc(fallback);
          setImageState('loading');
        } else {
          // No fallback or fallback also failed
          setImageState('error');
          const error = new Error(`Failed to load image: ${currentSrc}`);
          onImageError?.(error);
        }
        onError?.(event);
      },
      [fallback, currentSrc, onError, onImageError]
    );

    // Reset state when src changes
    useEffect(() => {
      setCurrentSrc(src);
      setImageState('loading');
      setIsInView(priority || !lazy);
    }, [src, priority, lazy]);

    // Combine refs
    const combinedRef = useCallback(
      (node: HTMLImageElement | null) => {
        imgRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Show placeholder while loading
    const showPlaceholder = imageState === 'loading' && (placeholder === 'blur' || placeholder);

    // Build image styles
    const imageStyles: CSSProperties = {
      objectFit,
      objectPosition,
      ...style,
    };

    // Show loading state
    if (imageState === 'loading' && !showPlaceholder && !isInView) {
      return (
        <div className={cn('relative bg-muted animate-pulse', className)} style={{ ...aspectRatioStyle, ...style }} {...props}>
          {loadingComponent || (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader />
            </div>
          )}
        </div>
      );
    }

    // Show error state
    if (imageState === 'error') {
      return (
        <div className={cn('relative bg-muted flex items-center justify-center', className)} style={{ ...aspectRatioStyle, ...style }} {...props}>
          {errorComponent || (
            <div className="text-muted-foreground text-sm p-4 text-center">
              <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-N6 6h12M6 18h12"
                />
              </svg>
              <p>Failed to load image</p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div ref={containerRef} className={cn('relative overflow-hidden', fill && 'w-full h-full', className)} style={aspectRatioStyle}>
        {/* Blur placeholder */}
        {showPlaceholder && blurDataURL && (
          <div
            className="absolute inset-0 blur-xl scale-110"
            style={{
              backgroundImage: `url(${blurDataURL})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px)',
              transform: 'scale(1.1)',
            }}
            aria-hidden="true"
          />
        )}

        {/* Regular placeholder */}
        {showPlaceholder && placeholder !== 'blur' && placeholder && (
          <img src={placeholder} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" aria-hidden="true" />
        )}

        {/* Loading indicator */}
        {imageState === 'loading' && isInView && <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">{loadingComponent || <Loader />}</div>}

        {/* Main image */}
        {isInView && (
          <img
            ref={combinedRef}
            src={currentSrc}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              fill ? 'absolute inset-0 w-full h-full' : 'w-full h-full',
              imageState === 'loaded' ? 'opacity-100' : 'opacity-0',
              `object-${objectFit}`
            )}
            style={imageStyles}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            sizes={sizes}
            {...props}
          />
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

/**
 * Utility function to generate a blur data URL
 * This can be used to create a base64-encoded placeholder
 */
export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Create a simple gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#e5e7eb');
    gradient.addColorStop(1, '#d1d5db');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL();
}

/**
 * Utility function to get responsive image sizes
 */
export function getResponsiveSizes(breakpoints: { sm?: string; md?: string; lg?: string; xl?: string; '2xl'?: string }): string {
  const sizes: string[] = [];

  if (breakpoints['2xl']) sizes.push(`(min-width: 1536px) ${breakpoints['2xl']}`);
  if (breakpoints.xl) sizes.push(`(min-width: 1280px) ${breakpoints.xl}`);
  if (breakpoints.lg) sizes.push(`(min-width: 1024px) ${breakpoints.lg}`);
  if (breakpoints.md) sizes.push(`(min-width: 768px) ${breakpoints.md}`);
  if (breakpoints.sm) sizes.push(`(min-width: 640px) ${breakpoints.sm}`);

  sizes.push('100vw'); // Default

  return sizes.join(', ');
}
