import { Badge } from '@/components/ui/badge';
import { CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Collapsible } from '@radix-ui/react-collapsible';
import { DownloadIcon, ExpandIcon, InfoIcon } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useState, type JSX } from 'react';
import type { JWSTImage } from '@/types/jwst';
import { ImageDetails } from '@/components/jwst/submodules/imageDetails';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export function ImageGallery({ img_src, img_full_size, title }: JWSTImage): JSX.Element {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const getScreenSizeUrl = (url: string): string => {
    return url.replace('large', 'screen');
  };

  return (
    <div className="flex w-full h-[400px] relative rounded-xl overflow-hidden">
      <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
        <div className="h-10 w-auto absolute top-3 right-3 z-20 flex gap-1">
          <Badge onClick={() => window.open(img_full_size, '_blank')?.focus()} className="h-10 w-10 rounded-xl z-20 hover:cursor-pointer">
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
            <DialogContent className="w-[calc(100%-2rem)] h-[calc(100%-2rem)]">
              <div className="flex">
                <div className="w-9/12">
                  <Image src={img_src} alt={title} className="object-none w-full h-[calc(100vh-5rem)] rounded-xl" />
                </div>
                <div className="w-3/12 px-10 py-5">
                  <h2 className="font-bold text-2xl">{title}</h2>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Image src={getScreenSizeUrl(img_src)} alt={title} className="object-cover h-100" />
        <Badge className="absolute bottom-3 left-3 max-w-80">{title}</Badge>
        <CollapsibleContent className="absolute w-full h-full z-30 top-0">
          <ImageDetails close={() => setDetailsOpen(false)} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
