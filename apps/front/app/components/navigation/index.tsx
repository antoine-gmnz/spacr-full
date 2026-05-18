import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, Link } from '@radix-ui/react-navigation-menu';
import {
  EarthIcon,
  Globe,
  HomeIcon,
  MoonIcon,
  OrbitIcon,
  RocketIcon,
  SatelliteIcon,
  Sparkles,
  SunIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  LogInIcon,
} from 'lucide-react';

import LogoH from '@/assets/logo-hor.svg';
import LogoW from '@/assets/logo-white.svg';
import { type JSX } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/themeContext';
import { useAuth } from '@/context/authContext';
import { useNavigate } from 'react-router';

const items = [
  { label: 'Home', href: '/', icon: <HomeIcon size={17} /> },
  { label: 'Mars Rover', href: '/mars-rover', icon: <EarthIcon size={17} /> },
  { label: 'Space Telescope Gallery', href: '/space-telescope-gallery', icon: <SatelliteIcon size={17} /> },
  { label: 'Launch Schedule', href: '/launch-schedule', icon: <RocketIcon size={17} /> },
  { label: 'Space Explorer', href: '/space-explorer', icon: <OrbitIcon size={17} /> },
  { label: 'Aurora Map', href: '/aurora-map', icon: <Sparkles size={17} /> },
  { label: 'Earth View', href: '/earth-view', icon: <Globe size={17} /> },
];

export function Navigation(): JSX.Element {
  const { toggleTheme, theme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <NavigationMenu className="flex justify-between">
      <div className="flex items-center">
        <div className="w-[100px] h-16 flex items-center">
          <img alt="Spacr logo" className="w-full" src={theme === 'light' ? LogoH : LogoW} />
        </div>
        <NavigationMenuList className="flex w-full gap-5 justify-center my-3 ml-10">
          {items.map((item, index) => (
            <NavigationMenuItem key={index}>
              <Link className={`${navigationMenuTriggerStyle()} [&.active]:font-bold`} href={item.href}>
                <div className="flex flex-row gap-1 items-center justify-center">
                  {item.icon}
                  <p>{item.label}</p>
                </div>
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </div>
      <div className="flex items-center justify-center h-16 gap-1">
        <Button onClick={toggleTheme} variant="ghost" className="h-12 w-12 hover:cursor-pointer" asChild>
          {theme === 'light' ? <MoonIcon className="h-10 w-10" /> : <SunIcon className="h-10 w-10" />}
        </Button>
        {isAuthenticated ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings/profile')}
              className="gap-1 text-sm"
              title={user?.displayName ?? user?.email}
            >
              <UserIcon size={16} />
              <span className="max-w-[120px] truncate">{user?.displayName ?? user?.email}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings/locations')}
              title="Settings"
            >
              <SettingsIcon size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} title="Sign out">
              <LogOutIcon size={16} />
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="gap-1">
              <LogInIcon size={16} />
              Sign in
            </Button>
            <Button size="sm" onClick={() => navigate('/register')}>
              Register
            </Button>
          </>
        )}
      </div>
    </NavigationMenu>
  );
}
