import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JSX } from "react";

interface ResultsPerPageProps {
  items: KeyValuePair[];
  label: string;
  placeholder?: string;
  handleChange: (e: string) => void;
}

interface KeyValuePair {
  key: string;
  value: string;
}

export function ResultsPerPage({
  items,
  label,
  placeholder,
  handleChange,
}: ResultsPerPageProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="sol-to">{label}</Label>
      <Select
        onValueChange={(e) => {
          handleChange(e);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem
                key={item.key}
                value={item.value}
                className="hover:cursor-pointer"
              >
                {item.value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
