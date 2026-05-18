export interface UserDto {
  id: string
  email: string
  displayName: string | null
  createdAt: string
}

export interface RegisterRequest {
  email: string
  password: string
  passwordConfirmation: string
  displayName?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: UserDto
}

export interface UpdateProfileRequest {
  displayName: string
}
