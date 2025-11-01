import { OptimizedImage, type OptimizedImageProps } from './optimized-image';

/**
 * Image component - Backward compatible wrapper around OptimizedImage
 *
 * This component maintains the same API as the previous Image component
 * but uses the new OptimizedImage under the hood for better performance.
 *
 * @deprecated Consider using OptimizedImage directly for more features
 */
export const Image = ({ src, alt, objectFit = 'cover', ...props }: OptimizedImageProps) => {
  return <OptimizedImage src={src} alt={alt} objectFit={objectFit} lazy={false} {...props} />;
};

// Re-export OptimizedImage for direct use
export { OptimizedImage } from './optimized-image';
export type { OptimizedImageProps } from './optimized-image';
