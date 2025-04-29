import { Vector3 } from "three";
import * as satelliteJs from "satellite.js";
import type { SatelliteVectorData } from "src/components/earthView/type";
import { Member } from "src/shared-types/src/NASA";

export const getSatRecFromMember = (
  line1: string,
  line2: string
): satelliteJs.SatRec => {
  const tle = [line1, line2];
  
  return satelliteJs.twoline2satrec(tle[0] as string, tle[1] as string);
};

export const getPositionECI = (
  satrec: satelliteJs.SatRec
): boolean | satelliteJs.EciVec3<number> => {
  const positionAndVelocity = satelliteJs.propagate(satrec, new Date());
  return positionAndVelocity.position;
};

export const calculateCartesianCoords = (
  positionEci: satelliteJs.EciVec3<number>
): { x: number; y: number; z: number } => {
  const gmst = satelliteJs.gstime(new Date());
  const positionGd = satelliteJs.eciToGeodetic(positionEci, gmst);
  const longitude = satelliteJs.degreesLong(positionGd.longitude);
  const latitude = satelliteJs.degreesLat(positionGd.latitude);
  const height = positionGd.height * 1000;

  // Convert latitude, longitude, and height to 3D coordinates
  const radius = 1 + height / 6371000; // Earth radius in meters
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return { x, y, z };
};

export const getVectorFromPositionECI = (
  positionEci: satelliteJs.EciVec3<number>
): Vector3 => {
  const { x, y, z } = calculateCartesianCoords(positionEci);
  return new Vector3(x, y, z);
};

export const checkPositionECI = (
  positionEci: satelliteJs.EciVec3<number> | boolean
): boolean => {
  if (
    positionEci &&
    typeof positionEci !== "boolean" &&
    Object.values(positionEci).length > 0
  )
    return true;
  return false;
};

export const getBaseDataFor3DView = (
  satelliteData: Member[]
): (SatelliteVectorData | undefined)[] => {
  return satelliteData
    .map((satellite) => {
      const satrec = getSatRecFromMember(satellite.line1, satellite.line2);
      const positionEci = getPositionECI(satrec);

      if (checkPositionECI(positionEci)) {
        const { x, y, z } = calculateCartesianCoords(
          positionEci as satelliteJs.EciVec3<number>
        );

        return {
          position: new Vector3(x, y, z),
          name: satellite.name,
          date: satellite.date,
          id: satellite.satelliteId,
          satrec: satrec,
        } as unknown as SatelliteVectorData;
      }
      return undefined;
    })
    .filter(Boolean);
};
