export class LaunchDataDto {
  id: string;
  name: string;
  status: {
    id: number;
    name: string;
    abbrev: string;
    description: string;
  };
  last_updated: string;
  net: string;
  window_end: string;
  window_start: string;
  probability: number;
  holdreason: string;
  failreason: string;
  hashtag: string;
  rocket?: {
    id: number;
    configuration: {
      id: number;
      url: string;
      name: string;
      family: string;
      full_name: string;
      variant: string;
    };
  };
  mission?: {
    id: number;
    name: string;
    description: string;
    launch_designator: string;
    type: string;
    orbit: {
      id: number;
      name: string;
      abbrev: string;
    };
  };
  pad: {
    id: number;
    url: string;
    agency_id: number;
    name: string;
    info_url: string;
    wiki_url: string;
    map_url: string;
    latitude: string;
    longitude: string;
    location: {
      id: number;
      url: string;
      name: string;
      country_code: string;
      map_image: string;
      total_launch_count: number;
      total_landing_count: number;
    };
    map_image: string;
    total_launch_count: number;
  };
  webcast_live: boolean;
  image: string;
  infographic: string;
  program: any[];
  orbital_launch_attempt_count: number;
  location_launch_attempt_count: number;
  pad_launch_attempt_count: number;
  agency_launch_attempt_count: number;
  orbital_launch_attempt_count_year: number;
  location_launch_attempt_count_year: number;
  pad_launch_attempt_count_year: number;
  agency_launch_attempt_count_year: number;
}

export class LaunchDataResponseDto {
  count: number;
  next: string;
  previous: string;
  results: LaunchDataDto[];
}
