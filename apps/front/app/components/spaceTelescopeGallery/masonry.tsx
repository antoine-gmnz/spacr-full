import { useEffect, useRef, useState, useMemo, type JSX } from 'react';
import type { SpaceTelescopeImageModel } from '@spacr/shared-types';
import { getImageDimensions } from '@/hooks/use-image-dimensions';

interface MasonryItem {
  image: SpaceTelescopeImageModel;
  width: number;
  height: number;
  top: number;
  left: number;
}

interface MasonryGalleryProps {
  images: SpaceTelescopeImageModel[];
  columns?: number;
  gap?: number;
  columnWidth?: number;
  getImageUrl: (image: SpaceTelescopeImageModel) => string;
  renderItem: (image: SpaceTelescopeImageModel, dimensions: { width: number; height: number }) => JSX.Element;
}

/**
 * Masonry Gallery Component
 * Creates a masonry layout by calculating positions based on image dimensions
 */
export function MasonryGallery({ images, columns = 4, gap = 8, columnWidth, getImageUrl, renderItem }: MasonryGalleryProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [itemPositions, setItemPositions] = useState<MasonryItem[]>([]);
  const [imageDimensionsMap, setImageDimensionsMap] = useState<Map<number, { width: number; height: number }>>(new Map());

  // Calculate column width based on container width
  const calculatedColumnWidth = useMemo(() => {
    if (columnWidth) return columnWidth;
    if (containerWidth === 0) return 0;
    return (containerWidth - gap * (columns - 1)) / columns;
  }, [containerWidth, columns, gap, columnWidth]);

  // Load image dimensions for new images only (incremental loading)
  useEffect(() => {
    const loadDimensions = async () => {
      const dimensionsMap = new Map(imageDimensionsMap); // Start with existing dimensions

      // Only load dimensions for images we don't have yet
      const imagesToLoad = images.filter(image => !dimensionsMap.has(image.id));

      if (imagesToLoad.length === 0) return;

      await Promise.all(
        imagesToLoad.map(async image => {
          try {
            const url = getImageUrl(image);
            const dimensions = await getImageDimensions(url);
            dimensionsMap.set(image.id, dimensions);
          } catch (error) {
            console.error(`Failed to load dimensions for image ${image.id}:`, error);
          }
        })
      );

      setImageDimensionsMap(dimensionsMap);
    };

    void loadDimensions();
  }, [images, getImageUrl]);

  // Calculate positions when dimensions are available
  useEffect(() => {
    if (calculatedColumnWidth === 0 || imageDimensionsMap.size === 0) return;

    const loadedDimensions = images
      .map(image => {
        const dimensions = imageDimensionsMap.get(image.id);
        if (!dimensions) return null;
        return { image, ...dimensions };
      })
      .filter((item): item is { image: SpaceTelescopeImageModel; width: number; height: number } => item !== null);

    if (loadedDimensions.length === 0) return;

    // Calculate column heights
    const columnHeights = new Array(columns).fill(0);
    const positions: MasonryItem[] = [];

    loadedDimensions.forEach(({ image, width, height }) => {
      // Find the shortest column
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));

      // Calculate scaled height based on column width
      const aspectRatio = height / width;
      const scaledHeight = calculatedColumnWidth * aspectRatio;

      // Calculate position
      const left = shortestColumnIndex * (calculatedColumnWidth + gap);
      const top = columnHeights[shortestColumnIndex];

      positions.push({
        image,
        width: calculatedColumnWidth,
        height: scaledHeight,
        top,
        left,
      });

      // Update column height
      columnHeights[shortestColumnIndex] += scaledHeight + gap;
    });

    setItemPositions(positions);
  }, [images, imageDimensionsMap, calculatedColumnWidth, columns, gap]);

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (itemPositions.length === 0) return 0;
    return Math.max(...itemPositions.map(item => item.top + item.height));
  }, [itemPositions]);

  return (
    <div
      ref={containerRef}
      className="relative w-full mb-10"
      style={{
        height: totalHeight > 0 ? `${totalHeight}px` : 'auto',
      }}
    >
      {itemPositions.map(item => (
        <div
          key={item.image.id}
          className="absolute"
          style={{
            width: `${item.width}px`,
            height: `${item.height}px`,
            top: `${item.top}px`,
            left: `${item.left}px`,
          }}
        >
          {renderItem(item.image, { width: item.width, height: item.height })}
        </div>
      ))}
    </div>
  );
}
