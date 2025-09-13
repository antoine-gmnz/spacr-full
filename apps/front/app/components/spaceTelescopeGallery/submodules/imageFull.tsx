import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import type { SpaceTelescopeImage } from '@/types/jwst';

export function ImageFull({ metadata, title, credits, type }: SpaceTelescopeImage) {
  return (
    <div className="flex w-full">
      <div className="w-8/12">
        <Image src={metadata.imgSrc} alt={title} className="object-contain w-full h-[calc(70vh-5rem)] rounded-xl" />
      </div>
      <div className="w-4/12 pt-6 pl-5 pr-5 flex flex-col justify-between">
        <div className="flex flex-col gap-5">
          <h2 className="font-bold text-2xl font-mono">{title}</h2>
          <p className="text-xs text-foreground">{type === 'HUBBLE' ? 'Hubble Space Telescope' : 'James Webb Space Telescope'}</p>
          <h5 className="text-sm text-foreground">Credits: {credits}</h5>
        </div>
        <div className="w-1/2">
          <Button>Download full version</Button>
        </div>
      </div>
    </div>
  );
}
