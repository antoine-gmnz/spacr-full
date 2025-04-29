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
import type { JSX } from "react";

interface SelectWrapperProps {
  name: string;
  label: string;
  placeholder: string;
  selectGroupLabel: string | undefined;
  keyValueList: Array<{ key: string; value: string }>;
}

export default function SelectWrapper({
  name,
  label,
  placeholder,
  selectGroupLabel,
  keyValueList,
}: SelectWrapperProps): JSX.Element {
  return (
    <>
      <Label htmlFor={name}>{label}</Label>
      <Select name={name}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {selectGroupLabel && (
            <SelectGroup>
              <SelectLabel>{selectGroupLabel}</SelectLabel>
            </SelectGroup>
          )}
          {keyValueList.map((keyValuePair) => (
            <SelectItem
              className="hover:cursor-pointer"
              key={keyValuePair.key}
              value={keyValuePair.value}
            >
              {keyValuePair.key}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
