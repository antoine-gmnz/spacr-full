export type BodyName = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Earth' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune';

export interface PlanetPosition {
  body: BodyName;
  timestamp: string;
  // Equatorial coordinates
  ra: number; // Right Ascension in degrees
  dec: number; // Declination in degrees
  distanceAu: number; // Distance from Earth in AU
  // Observables
  phase: number; // Illumination phase (0-1)
  magnitude?: number; // Apparent magnitude (not for Sun)
  angularDiameterArcsec: number; // Angular diameter in arcseconds
  elongationDeg: number; // Angle from Sun in degrees
  // 3D position for visualization (heliocentric, in AU)
  x: number;
  y: number;
  z: number;
  // Additional info
  description: string;
  orbitalPeriodDays: number;
}

export interface SpaceExplorerPositionsResponse {
  success: boolean;
  data: {
    date: string;
    positions: PlanetPosition[];
    nextEvent: {
      title: string;
      description: string;
      body: BodyName;
    };
  };
}

// Planet visual data
export const PLANET_COLORS: Record<BodyName, string> = {
  Sun: '#ffaa00',
  Moon: '#dddddd',
  Mercury: '#b3b3b3',
  Venus: '#d9c58b',
  Earth: '#3fa7ff',
  Mars: '#d14b3f',
  Jupiter: '#c89f6c',
  Saturn: '#d3c7a6',
  Uranus: '#7fd1d8',
  Neptune: '#5a79d6',
};

export const PLANET_ICONS: Record<BodyName, string> = {
  Sun: '☀️',
  Moon: '🌙',
  Mercury: '☿️',
  Venus: '♀️',
  Earth: '🌍',
  Mars: '♂️',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '⛢',
  Neptune: '♆',
};

