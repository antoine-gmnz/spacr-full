import { TableScheduleRow } from '@/components/schedule/submodules/tableScheduleRow';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { LaunchData } from '@spacr/shared-types';
import type { JSX } from 'react';
import { Image } from '@/components/ui/image';

interface TableScheduleProps {
  data: LaunchData[];
}

export function TableSchedule({ data }: TableScheduleProps): JSX.Element {
  console.log(data);
  return (
    <div>
      {data.map(launchData => (
        <div key={launchData.id} className="border-b border-gray-200 py-4 flex flex-row gap-5 items-center">
          <div className="h-14 w-14">
            <Image objectFit="contain" src={launchData.mission.agencies[0]?.logo_url} />
          </div>
          <div className="h-14 w-14">
            <Image objectFit="contain" src={launchData.mission.agencies[0]?.image_url} />
          </div>
          <div className="h-14 w-14">
            <Image objectFit="contain" src={launchData.program[0]?.image_url} />
          </div>
          {launchData.name}
        </div>
      ))}
    </div>
  );
}

// return (
//   <Table className="mt-5">
//     <TableHeader>
//       <TableRow>
//         <TableHead>Rocket name</TableHead>
//         <TableHead>Launch date</TableHead>
//         <TableHead>Status</TableHead>
//         <TableHead className="w-6/12">Description</TableHead>
//         <TableHead></TableHead>
//       </TableRow>
//     </TableHeader>
//     <TableBody>{data && data.map(launchData => <TableScheduleRow key={launchData.id} {...launchData} />)}</TableBody>
//   </Table>
// );
