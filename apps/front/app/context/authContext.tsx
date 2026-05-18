import { createContext, useContext, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { HttpError } from '@/lib/http';
import type { UserDto, LoginRequest, RegisterRequest } from '@spacr/shared-types';

interface AuthContextValue {
  user: UserDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    staleTime: Infinity,
    retry: (failureCount, error) => {
      if (error instanceof HttpError && error.status === 401) return false;
      return failureCount < 1;
    },
  });

  const loginMutation = useMutation({
    mutationFn: (d: LoginRequest) => authApi.login(d),
    onSuccess: (res) => {
      queryClient.setQueryData(['auth', 'me'], res);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (d: RegisterRequest) => authApi.register(d),
    onSuccess: (res) => {
      queryClient.setQueryData(['auth', 'me'], res);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const user = data?.user ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login: async (d) => { await loginMutation.mutateAsync(d); },
        register: async (d) => { await registerMutation.mutateAsync(d); },
        logout: async () => { await logoutMutation.mutateAsync(); },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
