import type { LaunchImage, LaunchServiceProvider, Mission, Pad } from '@spacr/shared-types';
import { Separator } from '@/components/ui/separator';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';

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
  return (
    <td colSpan={5}>
      <div className="p-3 w-full flex gap-5">
        <div className="relative h-36 w-36 rounded-xl">
          <Image objectFit="contain" src={mission.agencies[0]?.image_url ? mission.agencies[0]?.image_url : mission.agencies[0]?.logo_url} alt={''} />
        </div>
        <div className="flex flex-col gap-0 w-2/3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex items-center justify-center">{mission.agencies[0] && <img src={mission.agencies[0]?.logo_url} alt="" />}</div>
            <p className="font-bold">
              {mission.agencies[0]?.name} - {mission.agencies[0]?.launchers ? mission.agencies[0].launchers : launchServiceProvider.name}
            </p>
          </div>
          <p className="text-xs text-slate-400 max-w-100 line-clamp-3 mt-2">{mission.description}</p>
          <div className="w-1/3 mt-5">
            <Button variant="default">Learn more</Button>
          </div>
        </div>
      </div>
      <Separator className="w-full my-5" />
    </td>
  );
}
