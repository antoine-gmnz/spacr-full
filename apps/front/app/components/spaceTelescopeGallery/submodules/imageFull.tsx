import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/image';
import type { SpaceTelescopeImageModel } from '@spacr/shared-types';
import { DownloadIcon } from 'lucide-react';

export function ImageFull({ imgSrc, title, credits, type }: SpaceTelescopeImageModel) {
  return (
    <div className="flex w-full h-100">
      <div className="w-8/12 h-100 bg-gray-300 dark:bg-gray-700 relative rounded-sm">
        <OptimizedImage src={imgSrc.replace('large', 'screen')} alt={title} objectFit="contain" className="w-full h-full" lazy={false} />
      </div>
      <div className="w-4/12 pt-6 pl-5 pr-5 flex flex-col justify-between">
        <div className="flex flex-col gap-5">
          <h2 className="font-bold text-2xl font-mono">{title}</h2>
          <p className="text-xs text-foreground">{type === 'HUBBLE' ? 'Hubble Space Telescope' : 'James Webb Space Telescope'}</p>
          <h5 className="text-sm text-foreground">Credits: {credits}</h5>
        </div>
        <div className="w-1/2">
          <Button variant="outline" className="hover:cursor-pointer" onClick={() => window.open(imgSrc, '_blank')?.focus()}>
            <DownloadIcon />
            Download full version
          </Button>
        </div>
      </div>
    </div>
  );
}
