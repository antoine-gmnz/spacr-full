import { Badge } from '@/components/ui/badge';
import { CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Collapsible } from '@radix-ui/react-collapsible';
import { DownloadIcon, ExpandIcon, InfoIcon } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useState, type JSX } from 'react';
import type { SpaceTelescopeImage } from '@/types/jwst';
import { ImageDetails } from '@/components/spaceTelescopeGallery/submodules/imageDetails';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ImageFull } from '@/components/spaceTelescopeGallery/submodules/imageFull';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImageGalleryProps {
  image: SpaceTelescopeImage;
}
export function ImageGallery({ image }: ImageGalleryProps): JSX.Element {
  const { metadata, title, type } = image;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const getScreenSizeUrl = (url: string): string => {
    return url.replace('large', 'screen');
  };

  return (
    <div className="flex w-full h-[400px] relative rounded-xl overflow-hidden">
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen} className="w-100">
        <div className="absolute left-3 top-3 z-20 flex gap-1 flex-row">
          <Badge className="h-5">{type}</Badge>
        </div>
        <div className="h-10 absolute top-3 right-3 z-20 flex gap-1 flex-row">
          <Badge onClick={() => window.open(metadata.imgFullSize, '_blank')?.focus()} className="h-10 w-10 rounded-xl z-20 hover:cursor-pointer">
            <DownloadIcon />
          </Badge>
          <CollapsibleTrigger asChild>
            <Badge className="h-10 w-10 rounded-xl z-20 hover:cursor-pointer">
              <InfoIcon />
            </Badge>
          </CollapsibleTrigger>
          <Dialog>
            <DialogTrigger asChild>
              {/* <Badge onClick={() => window.open(img_src, '_blank')?.focus()} className="h-10 w-10 rounded-xl z-20 hover:cursor-pointer"> */}
              <Badge className="h-10 w-10 rounded-xl z-20 hover:cursor-pointer">
                <ExpandIcon />
              </Badge>
            </DialogTrigger>
            <DialogContent className="w-[calc(70%-2rem)] h-[calc(82%-2rem)]">
              <ImageFull {...image} />
            </DialogContent>
          </Dialog>
        </div>
        <Image src={getScreenSizeUrl(metadata.imgSrc)} alt={title} className="object-cover h-100 w-100" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="absolute bottom-3 left-3 max-w-80">
                <p className="truncate text-ellipsis">{title}</p>
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-80">
              <p className="text-xs">{title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <CollapsibleContent className="absolute w-full h-full z-30 top-0">
          <ImageDetails close={() => setDetailsOpen(false)} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
