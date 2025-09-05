import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { Separator } from '@/components/ui/separator';
import type { JSX } from 'react';
export interface MarsRoverPhotoDto {
  id: number;
  imgHash: string;
  sol: number;
  roverId: number;
  cameraCode: string;
  metadata: {
    title: string;
    credits: string;
    originalUrl: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Props {
  images: MarsRoverPhotoDto[];
}

export function ImageGallery({ images }: Props): JSX.Element {
  return (
    <div className="my-10">
      <Separator />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
        {images?.map(image => (
          <div className="rounded-xl relative" key={image.id}>
            <div className="absolute flex flex-row w-full top-2 left-2 gap-2">
              <Badge className="font-mono">Sol : {image.sol}</Badge>
              <Badge className="font-mono">{image.cameraCode}</Badge>
            </div>
            <div className="h-[250px]">
              <Image alt={image.metadata.title} objectFit="cover" className="w-full rounded-xl" src={image.metadata.originalUrl} />
            </div>
            <div>
              <Badge className="absolute bottom-2 right-2 font-mono">Credits: {image.metadata.credits}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
