import { Badge } from "@/components/ui/badge";
import { type PaginatedResponse } from "@/types/pagination";
import { ExpandIcon } from "lucide-react";
import type { JSX } from "react";
import type { JWSTImage } from "@/types/jwst";
import { Image } from "@/components/ui/image";

interface JWSTGalleryProps {
  data: PaginatedResponse<JWSTImage[]>;
}

export function JWSTGallery({ data }: JWSTGalleryProps): JSX.Element {
  const getScreenSizeUrl = (url: string): string => {
    return url.replace("large", "screen");
  };

  const getFullSizeUrl = (imageUrl: string) => {
    const imageNameSplit = imageUrl.split("/");
    const imageNameS = imageNameSplit[imageNameSplit.length - 1];
    const baseUrl = "https://esawebb.org/media/archives/images/original/";
    return baseUrl + imageNameS;
  };

  return (
    <div className="grid grid-cols-4 gap-10 mb-10">
      {data?.data.map((image: JWSTImage) => {
        return (
          <div
            key={image.id}
            className="flex w-full h-[400px] relative rounded-xl overflow-hidden"
          >
            <Badge
              onClick={() =>
                window.open(getFullSizeUrl(image.img_src), "_blank")?.focus()
              }
              className="h-10 w-10 rounded-xl absolute top-3 right-3 z-20 hover:cursor-pointer"
            >
              <ExpandIcon />
            </Badge>
            <Image
              src={getScreenSizeUrl(image.img_src)}
              alt={image.title}
              className="object-cover"
            />
            <Badge className="absolute bottom-3 left-3 max-w-80">
              {image.title}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}
