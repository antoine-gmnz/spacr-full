import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRoverImageContext } from "@/context/roverImageContext";
import type { JSX } from "react";

export function ImageGallery(): JSX.Element {
  const { images } = useRoverImageContext();
  return (
    <div className="my-10">
      <Separator />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-10">
        {images?.map((image) => (
          <div
            className="rounded-xl -z-10 overflow-hidden relative"
            key={image.id}
          >
            <div className="absolute flex flex-row w-full top-5 left-5 gap-2">
              <Badge className="">Sol : {image.sol}</Badge>
              <Badge className="">{image.camera.full_name}</Badge>
            </div>
            <img
              alt={image.img_src}
              className="h-[300px] w-full rounded-xl"
              src={image.img_src}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
