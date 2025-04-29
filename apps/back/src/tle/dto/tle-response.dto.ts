export class TleMemberDto {
  name: string;
  satelliteId: string;
  line1: string;
  line2: string;
}

export class TleResponseDto {
  member: TleMemberDto[];
}