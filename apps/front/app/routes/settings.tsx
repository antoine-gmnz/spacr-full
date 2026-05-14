import { Outlet, Link, useLocation } from 'react-router';
import { useAuth } from '@/context/authContext';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Profile', href: '/settings/profile' },
  { label: 'Locations', href: '/settings/locations' },
];

export default function SettingsLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <div className="flex gap-6">
        <nav className="w-48 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                'block px-4 py-2 rounded-md text-sm transition-colors',
                location.pathname.startsWith(tab.href)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
