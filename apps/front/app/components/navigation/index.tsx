import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, Link } from '@radix-ui/react-navigation-menu';
import { HomeIcon, MoonIcon, OrbitIcon, RocketIcon, SatelliteIcon, SunIcon } from 'lucide-react';
// import Image from "next/image";

import LogoH from '@/assets/logo-hor.svg';
import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/themeContext';

export function Navigation(): JSX.Element {
  const { toggleTheme, theme } = useTheme();
  return (
    <NavigationMenu className="flex justify-between">
      <div className="flex items-center">
        <div className="w-[100px] h-16 flex items-center">
          <img alt="Spacr logo" className="w-full" src={LogoH} />
        </div>
        <NavigationMenuList className="flex w-full gap-5 justify-center my-3 ml-10">
          <NavigationMenuItem>
            <Link className={`${navigationMenuTriggerStyle()} [&.active]:font-bold`} href="/">
              <div className="flex flex-row gap-1 items-center justify-center">
                <HomeIcon size={17} />
                <p>Home</p>
              </div>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link className={`${navigationMenuTriggerStyle()} [&.active]:font-bold`} href="/mars-rover">
              <div className="flex flex-row gap-1 items-center justify-center">
                <OrbitIcon size={17} />
                <p>Mars Rover images</p>
              </div>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link className={`${navigationMenuTriggerStyle()} [&.active]:font-bold`} href="/jwst">
              <div className="flex flex-row gap-1 items-center justify-center">
                <SatelliteIcon size={17} />
                <p>JWST Gallery</p>
              </div>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link className={`${navigationMenuTriggerStyle()} [&.active]:font-bold`} href="/launch-schedule">
              <div className="flex flex-row gap-1 items-center justify-center">
                <RocketIcon size={17} />
                <p>Launch schedule</p>
              </div>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </div>
      <div className="flex items-center justify-center h-16">
        <Button onClick={toggleTheme} variant="ghost" className="h-12 w-12 hover:cursor-pointer" asChild>
          {theme === 'light' ? <MoonIcon className="h-10 w-10" /> : <SunIcon className="h-10 w-10" />}
        </Button>
      </div>
    </NavigationMenu>
  );
}
