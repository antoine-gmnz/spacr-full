import { Separator } from "@/components/ui/separator";
import type { JSX } from "react";

export function Footer(): JSX.Element {
  return (
    <footer className="p-5">
      <Separator className="w-100 my-10" />
      <div className="flex justify-between items-center mb-10">
        <p>© {new Date().getFullYear()} - All rights reserved</p>
        <p className="text-gray-500 text-sm">Created by Antoine Gimenez</p>
      </div>
    </footer>
  );
}
