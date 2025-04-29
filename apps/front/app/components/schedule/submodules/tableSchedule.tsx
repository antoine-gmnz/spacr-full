import { TableScheduleRow } from "@/components/schedule/submodules/tableScheduleRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LaunchData } from "@/types/launch-data";
import type { JSX } from "react";

interface TableScheduleProps {
  data: LaunchData[];
}

export function TableSchedule({ data }: TableScheduleProps): JSX.Element {
  return (
    <Table className="mt-5">
      <TableHeader>
        <TableRow>
          <TableHead>Rocket name</TableHead>
          <TableHead>Launch date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-6/12">Description</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data &&
          data.map((launchData) => (
            <TableScheduleRow key={launchData.id} {...launchData} />
          ))}
      </TableBody>
    </Table>
  );
}
