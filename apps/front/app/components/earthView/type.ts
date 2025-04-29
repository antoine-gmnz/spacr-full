import type { Vector3 } from "three";
import type * as satelliteJs from "satellite.js";

export interface SatelliteVectorData {
  position: Vector3 | undefined;
  name: string;
  date: string;
  id: string;
  satrec: satelliteJs.SatRec;
}
