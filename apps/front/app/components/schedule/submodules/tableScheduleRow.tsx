import type { LaunchData } from "@/types/launch-data";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState, type JSX } from "react";
import { CollapsibleRowContent } from "@/components/schedule/submodules/collapsibleRowContent";

export function TableScheduleRow({
  id,
  rocket,
  net,
  status,
  image,
  mission,
  pad,
  launch_service_provider,
}: LaunchData): JSX.Element {
  const [clicked, setClicked] = useState<boolean>(false);
  return (
    <>
      <Collapsible asChild>
        <>
          <TableRow key={id} className="h-12">
            <TableCell className="w-2/12">
              {rocket.configuration.name}
            </TableCell>
            <TableCell className="w-2/12">
              {new Date(net).toLocaleString()}
            </TableCell>
            <TableCell className="w-2/12">
              <Badge className="text-xs">{status.name}</Badge>
            </TableCell>
            <TableCell className="w-6/12">{status.description}</TableCell>
            <TableCell>
              <CollapsibleTrigger asChild onClick={() => setClicked(!clicked)}>
                <Badge
                  className="h-10 w-10 hover:cursor-pointer"
                  variant="outline"
                >
                  <ArrowDownIcon
                    className={`transition-all ${clicked ? "rotate-180" : ""}`}
                  />
                </Badge>
              </CollapsibleTrigger>
            </TableCell>
          </TableRow>
          <CollapsibleContent className="p-3 w-100 transition-all" asChild>
            <tr>
              <CollapsibleRowContent
                image={image}
                mission={mission}
                pad={pad}
                launchServiceProvider={launch_service_provider}
              />
            </tr>
          </CollapsibleContent>
        </>
      </Collapsible>
    </>
  );
}
