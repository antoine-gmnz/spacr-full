import { http } from '@/lib/http';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  UserDto,
} from '@spacr/shared-types';

export const authApi = {
  me: (): Promise<AuthResponse> => http.get<AuthResponse>('/auth/me'),

  register: (data: RegisterRequest): Promise<AuthResponse> =>
    http.post<AuthResponse, RegisterRequest>('/auth/register', data),

  login: (data: LoginRequest): Promise<AuthResponse> =>
    http.post<AuthResponse, LoginRequest>('/auth/login', data),

  logout: (): Promise<void> => http.post<void>('/auth/logout'),

  updateProfile: (data: UpdateProfileRequest): Promise<{ user: UserDto }> =>
    http.patch<{ user: UserDto }, UpdateProfileRequest>('/user/profile', data),

  forgotPassword: (email: string): Promise<void> =>
    http.post<void>('/auth/forgot-password', { email }),

  resetPassword: (data: {
    token: string
    email: string
    password: string
    passwordConfirmation: string
  }): Promise<void> => http.post<void>('/auth/reset-password', data),
};
