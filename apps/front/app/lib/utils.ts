import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MS_IN_A_SOL = 88775244; // 24 hours, 39 minutes, and 35.244 seconds in milliseconds

export function convertEarthDateToMarsSol(rover: string, earthDate: Date): number {
  const roverLandingDates: Record<string, Date> = {
    Perseverance: new Date('2021-02-18T20:00:00Z'),
    Curiosity: new Date('2012-08-06T05:17:57Z'),
    Opportunity: new Date('2004-01-25T05:05:00Z'),
    Spirit: new Date('2004-01-04T04:35:00Z'),
  };

  const landingDate = roverLandingDates[rover];
  if (!landingDate) {
    throw new Error(`Landing date for rover ${rover} not found`);
  }

  const msSinceLanding = earthDate.getTime() - landingDate.getTime();
  const solsSinceLanding = msSinceLanding / MS_IN_A_SOL;

  return Math.floor(solsSinceLanding);
}
