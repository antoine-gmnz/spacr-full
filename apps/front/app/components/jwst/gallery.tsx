import { type PaginatedResponse } from '@/types/pagination';
import type { JSX } from 'react';
import type { JWSTImage } from '@/types/jwst';
import { ImageGallery } from '@/components/jwst/submodules/imageGallery';

interface JWSTGalleryProps {
  data: PaginatedResponse<JWSTImage[]>;
}

export function JWSTGallery({ data }: JWSTGalleryProps): JSX.Element {
  return (
    <div className="grid grid-cols-4 gap-10 mb-10">
      {data?.data.map((image: JWSTImage) => (
        <ImageGallery key={image.id} {...image} />
      ))}
    </div>
  );
}
