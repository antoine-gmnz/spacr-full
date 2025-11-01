import { useState, useEffect } from 'react';

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * Hook to get image dimensions from a URL
 * @param src - The image URL
 * @returns Object with width, height, aspectRatio, loading state, and error
 */
export function useImageDimensions(src: string | null | undefined): {
  dimensions: ImageDimensions | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setDimensions(null);

    const img = new Image();

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      setDimensions({
        width,
        height,
        aspectRatio: width / height,
      });
      setIsLoading(false);
    };

    img.onerror = err => {
      setError(new Error(String(`${err.toString()}`)));
      setIsLoading(false);
    };

    img.src = src;

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { dimensions, isLoading, error };
}

/**
 * Utility function to get image dimensions from a URL (Promise-based)
 * @param url - The image URL
 * @returns Promise that resolves to image dimensions
 */
export function getImageDimensions(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
