export interface ISSPosition {
  latitude: number
  longitude: number
  altitude: number // km
  velocity: number // km/s
  timestamp: string
}

export interface ISSCrewMember {
  name: string
  craft: string
}

export interface ISSPass {
  riseTime: string
  setTime: string
  maxElevation: number // degrees
  duration: number // minutes
  riseAzimuth: number // degrees
  setAzimuth: number // degrees
}

export interface ISSCrewResponse {
  crew: ISSCrewMember[]
}

export interface ISSPassesResponse {
  passes: ISSPass[]
}

