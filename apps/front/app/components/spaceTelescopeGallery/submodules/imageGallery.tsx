import { Badge } from '@/components/ui/badge';
import { CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Collapsible } from '@radix-ui/react-collapsible';
import { DownloadIcon, ExpandIcon, InfoIcon } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/image';
import { useState, type JSX } from 'react';
import type { SpaceTelescopeImageModel } from '@spacr/shared-types';
import { ImageDetails } from '@/components/spaceTelescopeGallery/submodules/imageDetails';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ImageFull } from '@/components/spaceTelescopeGallery/submodules/imageFull';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImageGalleryProps {
  image: SpaceTelescopeImageModel;
}
interface ImageGalleryWithDimensionsProps extends ImageGalleryProps {
  dimensions?: { width: number; height: number };
}

export function ImageGallery({ image }: ImageGalleryWithDimensionsProps): JSX.Element {
  const { imgSrc, imgFullSize, title, type } = image;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const getScreenSizeUrl = (url: string): string => {
    return url.replace('large', 'screen');
  };

  return (
    <div className="w-full h-full">
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="w-full h-full">
        <div className="relative w-full h-full rounded-sm overflow-hidden">
          <div className="absolute left-3 top-3 z-20 flex gap-1 flex-row">
            <Badge className="font-mono bg-card dark:text-white text-black">{type}</Badge>
          </div>
          <div className="h-10 absolute top-3 right-3 z-20 flex gap-1 flex-row">
            <Badge onClick={() => window.open(imgFullSize, '_blank')?.focus()} className="font-mono bg-card dark:text-white text-black cursor-pointer">
              <DownloadIcon />
            </Badge>
            <CollapsibleTrigger asChild>
              <Badge className="font-mono bg-card dark:text-white text-black cursor-pointer">
                <InfoIcon />
              </Badge>
            </CollapsibleTrigger>
            <Dialog>
              <DialogTrigger asChild>
                <Badge className="font-mono bg-card dark:text-white text-black cursor-pointer">
                  <ExpandIcon />
                </Badge>
              </DialogTrigger>
              <DialogContent className="w-[calc(70%-2rem)] h-[calc(82%-2rem)]">
                <ImageFull {...image} />
              </DialogContent>
            </Dialog>
          </div>
          <div className="w-full h-full relative">
            <OptimizedImage src={getScreenSizeUrl(imgSrc)} alt={title} objectFit="contain" className="w-full h-full" lazy={false} />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild className="bg-card">
                <Badge className="absolute bottom-3 left-3 max-w-80 font-mono bg-card dark:text-white text-black">
                  <p className="truncate text-ellipsis">{title}</p>
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-80 bg-card">
                <p className="text-xs">{title}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <CollapsibleContent className="absolute inset-0 z-30">
            <ImageDetails close={() => setDetailsOpen(false)} />
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
