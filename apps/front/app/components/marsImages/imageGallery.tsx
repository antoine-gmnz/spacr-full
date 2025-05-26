import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import { Separator } from '@/components/ui/separator';
import type { MarsRoverPhoto } from '@/types/rover';
import type { JSX } from 'react';

interface Props {
  images: MarsRoverPhoto[];
}

export function ImageGallery({ images }: Props): JSX.Element {
  return (
    <div className="my-10">
      <Separator />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
        {images?.map(image => (
          <div className="rounded-xl relative" key={image.id}>
            <div className="absolute flex flex-row w-full top-2 left-2 gap-2">
              <Badge className="">Sol : {image.sol}</Badge>
              <Badge className="">{image.camera}</Badge>
            </div>
            <Image alt={image.img_src} objectFit="cover" className="h-[300px] w-full rounded-xl" src={image.img_src} />
            <div>
              <Badge className="absolute bottom-2 right-2">Credits: {image.credits}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
