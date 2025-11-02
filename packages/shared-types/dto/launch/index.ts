export interface LaunchData {
  id: string;
  url: string;
  name: string;
  response_mode: string;
  slug: string;
  launch_designator: string | null;
  status: Status;
  last_updated: string;
  net: string;
  net_precision: NetPrecision;
  window_end: string;
  window_start: string;
  image: LaunchImage;
  infographic: string | null;
  probability: number;
  weather_concerns: string;
  failreason: string;
  hashtag: string | null;
  launch_service_provider: LaunchServiceProvider;
  rocket: Rocket;
  mission: Mission;
  pad: Pad;
  webcast_live: boolean;
  program: unknown[];
  orbital_launch_attempt_count: number;
  location_launch_attempt_count: number;
  pad_launch_attempt_count: number;
  agency_launch_attempt_count: number;
  orbital_launch_attempt_count_year: number;
  location_launch_attempt_count_year: number;
  pad_launch_attempt_count_year: number;
  agency_launch_attempt_count_year: number;
}

export interface Status {
  id: number;
  name: string;
  abbrev: string;
  description: string;
}

export interface NetPrecision {
  id: number;
  name: string;
  abbrev: string;
  description: string;
}

export interface LaunchImage {
  id: number;
  name: string;
  image_url: string;
  thumbnail_url: string;
  credit: string | null;
  license: License;
  single_use: boolean;
  variants: any[];
}

export interface License {
  id: number;
  name: string;
  priority: number;
  link: string | null;
}

export interface LaunchServiceProvider {
  response_mode: string;
  id: number;
  url: string;
  name: string;
  abbrev: string;
  type: LaunchType;
}

export interface LaunchType {
  id: number;
  name: string;
}

export interface Rocket {
  id: number;
  configuration: RocketConfiguration;
}

export interface RocketConfiguration {
  response_mode: string;
  id: number;
  url: string;
  name: string;
  families: Family[];
  full_name: string;
  variant: string;
}

export interface Family {
  response_mode: string;
  id: number;
  name: string;
}

export interface Mission {
  id: number;
  name: string;
  type: string;
  description: string;
  image: string | null;
  orbit: Orbit;
  agencies: any[];
  info_urls: any[];
  vid_urls: any[];
}

export interface Orbit {
  id: number;
  name: string;
  abbrev: string;
  celestial_body: CelestialBody;
}

export interface CelestialBody {
  response_mode: string;
  id: number;
  name: string;
  type: CelestialBodyType;
  diameter: number;
  mass: number;
  gravity: number;
  length_of_day: string;
  atmosphere: boolean;
  image: LaunchImage;
  description: string;
  wiki_url: string;
  total_attempted_launches: number;
  successful_launches: number;
  failed_launches: number;
  total_attempted_landings: number;
  successful_landings: number;
  failed_landings: number;
}

export interface CelestialBodyType {
  id: number;
  name: string;
}

export interface Pad {
  id: number;
  url: string;
  active: boolean;
  agencies: Agency[];
  name: string;
  image: LaunchImage;
  description: string;
  info_url: string | null;
  wiki_url: string;
  map_url: string;
  latitude: number;
  longitude: number;
  country: Country;
  map_image: string;
  total_launch_count: number;
  orbital_launch_attempt_count: number;
  fastest_turnaround: string;
  location: Location;
}

export interface Agency {
  response_mode: string;
  id: number;
  url: string;
  name: string;
  abbrev: string;
  type: LaunchType;
  featured: boolean;
  country: Country[];
  description: string;
  administrator: string;
  founding_year: number;
  launchers: string;
  spacecraft: string;
  parent: string | null;
  image: LaunchImage;
  logo: LaunchImage;
  social_logo: LaunchImage;
}

export interface Country {
  id: number;
  name: string;
  alpha_2_code: string;
  alpha_3_code: string;
  nationality_name: string;
  nationality_name_composed: string;
}

export interface Location {
  response_mode: string;
  id: number;
  url: string;
  name: string;
  celestial_body: CelestialBody;
  active: boolean;
  country: Country;
  description: string;
  image: LaunchImage;
  map_image: string;
  longitude: number;
  latitude: number;
  timezone_name: string;
  total_launch_count: number;
  total_landing_count: number;
}

export interface LaunchDataResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: LaunchData[];
}
