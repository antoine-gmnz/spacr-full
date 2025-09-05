import type { JSX } from 'react';
import type { SpaceTelescopeImage } from '@/types/jwst';
import { ImageGallery } from '@/components/spaceTelescopeGallery/submodules/imageGallery';

interface SpaceTelescopeGalleryProps {
  data: SpaceTelescopeImage[];
}

export function SpaceTelescopeGallery({ data }: SpaceTelescopeGalleryProps): JSX.Element {
  return (
    <div className="grid grid-cols-4 gap-10 mb-10">
      {data?.map((image: SpaceTelescopeImage) => (
        <ImageGallery key={image.id} image={image} />
      ))}
    </div>
  );
}
