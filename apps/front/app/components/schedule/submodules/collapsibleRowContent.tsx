import type {
  LaunchImage,
  LaunchServiceProvider,
  Mission,
  Pad,
} from "@/types/launch-data";
import { Separator } from "@/components/ui/separator";
import { Image } from "@/components/ui/image";

export function CollapsibleRowContent({
  image,
  mission,
  pad,
  launchServiceProvider,
}: {
  image: LaunchImage;
  mission: Mission;
  pad: Pad;
  launchServiceProvider: LaunchServiceProvider;
}) {
  console.log(pad);
  return (
    <td colSpan={5}>
      <div className="p-3 w-full flex gap-3">
        <div className="relative h-24 w-24 rounded-xl overflow-hidden">
          <Image src={image.image_url} alt={""} />
        </div>
        <div className="flex flex-col gap-0 w-2/3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10">
              {pad.agencies[0] && (
                <img src={pad.agencies[0]?.social_logo.image_url} alt="" />
              )}
            </div>
            <p className="font-bold">
              {pad.agencies[0]?.name} -{" "}
              {pad.agencies[0]?.launchers
                ? pad.agencies[0].launchers
                : launchServiceProvider.name}
            </p>
          </div>
          <p className="text-xs text-slate-400 max-w-100 line-clamp-3 mt-2">
            {mission.description}
          </p>
        </div>
      </div>
      <Separator className="w-full my-5" />
    </td>
  );
}
