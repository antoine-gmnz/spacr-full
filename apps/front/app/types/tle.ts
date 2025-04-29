export interface TleMember {
  name: string;
  satelliteId: string;
  line1: string;
  line2: string;
}

export interface TleResponse {
  member: TleMember[];
}