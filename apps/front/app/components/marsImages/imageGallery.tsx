import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/ui/image';
import { Separator } from '@/components/ui/separator';
import type { GetRoverImagesResponseDTO } from '@spacr/shared-types/dto';
import type { JSX } from 'react';
import TextType from '@/components/ui/TextType/textType';

interface Props {
  response: GetRoverImagesResponseDTO;
}

export function ImageGallery({ response }: Props): JSX.Element {
  return (
    <div className="my-10">
      <Separator />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
        {response.data?.map(image => (
          <div className="rounded-sm relative" key={image.id}>
            <div className="absolute z-10 flex flex-row w-full top-2 left-2 gap-2">
              <Badge className="font-mono bg-card dark:text-white text-black">
                <TextType text={`Sol: ${image.sol}`} as="span" typingSpeed={150} showCursor={false} />
              </Badge>
              <Badge className="font-mono bg-card dark:text-white text-black">
                <TextType text={`Camera: ${image.camera.code}`} as="span" typingSpeed={150} showCursor={false} />
              </Badge>
            </div>
            <div className="h-[250px] relative overflow-hidden">
              <OptimizedImage fill onImageError={() => {}} lazy={false} alt={image.title} objectFit="cover" className="w-full h-full rounded-sm" src={image.imgSrc} />
            </div>
            <div>
              <Badge className="absolute bottom-2 right-2 font-mono dark:text-white text-black bg-card">Credits: {image.credits}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
