import type { JSX } from 'react';
import { ImageGallery } from '@/components/spaceTelescopeGallery/submodules/imageGallery';
import { MasonryGallery } from '@/components/spaceTelescopeGallery/masonry';
import type { SpaceTelescopeImageModel } from '@spacr/shared-types';

interface SpaceTelescopeGalleryProps {
  images: SpaceTelescopeImageModel[];
}

export function SpaceTelescopeGallery({ images }: SpaceTelescopeGalleryProps): JSX.Element {
  const getImageUrl = (image: SpaceTelescopeImageModel): string => {
    return image.imgSrc.replace('large', 'screen');
  };

  return (
    <MasonryGallery
      images={images}
      columns={4}
      gap={8}
      getImageUrl={getImageUrl}
      renderItem={(image, dimensions) => <ImageGallery key={image.id} image={image} dimensions={dimensions} />}
    />
  );
}
