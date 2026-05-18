import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import { useAuth } from './authContext';
import type { UserLocationDto } from '@spacr/shared-types';

interface PrimaryLocationContextValue {
  primaryLocation: UserLocationDto | null;
  isLoading: boolean;
}

const PrimaryLocationContext = createContext<PrimaryLocationContextValue>({
  primaryLocation: null,
  isLoading: false,
});

export function PrimaryLocationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['user', 'locations'],
    queryFn: () => userApi.listLocations(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const primaryLocation = data?.locations.find((l) => l.isPrimary) ?? null;

  return (
    <PrimaryLocationContext.Provider value={{ primaryLocation, isLoading }}>
      {children}
    </PrimaryLocationContext.Provider>
  );
}

export function usePrimaryLocation() {
  return useContext(PrimaryLocationContext);
}
