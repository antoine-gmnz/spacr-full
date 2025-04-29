import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  Link,
} from "@radix-ui/react-navigation-menu";
import { HomeIcon, OrbitIcon, RocketIcon, SatelliteIcon } from "lucide-react";
// import Image from "next/image";

import LogoH from "@/assets/logo-hor.svg";
import type { JSX } from "react";

export function Navigation(): JSX.Element {
  return (
    <NavigationMenu className="flex">
      <div className="w-[100px] h-auto flex items-center">
        <img alt="Spacr logo" className="w-full" src={LogoH} />
      </div>
      <NavigationMenuList className="flex w-full gap-5 justify-center my-3 ml-10">
        <NavigationMenuItem>
          <Link
            className={`${navigationMenuTriggerStyle()} [&.active]:font-bold`}
            href="/"
          >
            <div className="flex flex-row gap-1 items-center justify-center">
              <HomeIcon size={17} />
              <p>Home</p>
            </div>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link
            className={`${navigationMenuTriggerStyle()} [&.active]:font-bold`}
            href="/mars-rover"
          >
            <div className="flex flex-row gap-1 items-center justify-center">
              <OrbitIcon size={17} />
              <p>Mars Rover images</p>
            </div>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link
            className={`${navigationMenuTriggerStyle()} [&.active]:font-bold`}
            href="/jwst"
          >
            <div className="flex flex-row gap-1 items-center justify-center">
              <SatelliteIcon size={17} />
              <p>JWST Gallery</p>
            </div>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link
            className={`${navigationMenuTriggerStyle()} [&.active]:font-bold`}
            href="/launch-schedule"
          >
            <div className="flex flex-row gap-1 items-center justify-center">
              <RocketIcon size={17} />
              <p>Launch schedule</p>
            </div>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
