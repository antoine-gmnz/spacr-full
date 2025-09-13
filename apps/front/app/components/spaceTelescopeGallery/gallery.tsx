import type { JSX } from 'react';
import type { SpaceTelescopeImage } from '@/types/jwst';
import { ImageGallery } from '@/components/spaceTelescopeGallery/submodules/imageGallery';
import type { PaginatedResponse } from '@spacr/shared-types/dto';

interface SpaceTelescopeGalleryProps {
  data: PaginatedResponse<SpaceTelescopeImage>;
}

export function SpaceTelescopeGallery({ data }: SpaceTelescopeGalleryProps): JSX.Element {
  return (
    <div className="grid grid-cols-4 gap-10 mb-10">
      {data.data.map((image: SpaceTelescopeImage) => (
        <ImageGallery key={image.id} image={image} />
      ))}
    </div>
  );
}
