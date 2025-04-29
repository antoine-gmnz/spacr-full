import SelectWrapper from "@/components/selectWrapper";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { JSX } from "react";

/**
 * Select :
 * Roscosmos
 * NASA
 * ESA
 * China
 * SpaceX
 */

/**
 * Uncrewed
 * Crewed
 */

/**
 * Select:
 * mission status
 */

/**
 * Select
 * rocket__configuration__name
 */

/**
 * Ordering
 * last_updated, name, net
 */

export default function Filters(): JSX.Element {
  return (
    <div>
      <SelectWrapper
        name="space-agency"
        label="Select a space agency"
        placeholder={"Ex: NASA"}
        selectGroupLabel={"Select one"}
        keyValueList={[
          { key: "NASA", value: "nasa" },
          { key: "ESA", value: "esa" },
        ]}
      />
      <Separator className="w-full my-10" />
    </div>
  );
}
