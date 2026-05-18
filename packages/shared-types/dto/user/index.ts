export interface UserLocationDto {
  id: string
  userId: string
  name: string
  lat: number
  lng: number
  isPrimary: boolean
  createdAt: string
}

export interface CreateUserLocationRequest {
  name: string
  lat: number
  lng: number
}

export interface UpdateUserLocationRequest {
  name?: string
  lat?: number
  lng?: number
  isPrimary?: boolean
}
