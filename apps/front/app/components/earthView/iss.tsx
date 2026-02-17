import { useFrame } from '@react-three/fiber';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Vector3 } from 'three';
import { Line } from '@react-three/drei';
import type { ISSPosition } from '@/types/iss';

interface ISSProps {
  position: ISSPosition | null;
  showOrbitTrail?: boolean;
  controlsRef?: React.RefObject<any>;
}

/**
 * Convert lat/lng/altitude to 3D coordinates for Earth visualization
 */
function latLngAltToVector3(lat: number, lng: number, alt: number): Vector3 {
  // Earth radius in km
  const EARTH_RADIUS_KM = 6371;
  const radius = 1 + alt / EARTH_RADIUS_KM; // Normalize to Earth radius = 1

  // Convert to radians
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;

  // Convert to 3D coordinates (matching existing satellite coordinate system)
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new Vector3(x, y, z);
}

export function ISS({ position, showOrbitTrail = false, controlsRef }: ISSProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const previousPositionRef = useRef<Vector3 | null>(null);
  const [trailPoints, setTrailPoints] = useState<Vector3[]>([]);

  // Calculate 3D position from lat/lng/altitude
  const currentPosition = useMemo(() => {
    if (!position) return null;
    return latLngAltToVector3(position.latitude, position.longitude, position.altitude);
  }, [position]);

  // Update mesh position smoothly
  useFrame(() => {
    if (meshRef.current && currentPosition) {
      // Smooth interpolation for visual appeal
      meshRef.current.position.lerp(currentPosition, 0.1);
    }

    // Update orbit trail
    if (showOrbitTrail && currentPosition) {
      if (previousPositionRef.current) {
        const distance = currentPosition.distanceTo(previousPositionRef.current);
        // Only add point if moved significantly (avoid too many points)
        if (distance > 0.01) {
          setTrailPoints(prev => {
            const updated = [...prev, currentPosition.clone()];
            // Limit trail to last 100 points
            return updated.length > 100 ? updated.slice(-100) : updated;
          });
        }
      }
      previousPositionRef.current = currentPosition.clone();
    } else if (currentPosition) {
      previousPositionRef.current = currentPosition.clone();
    }
  });

  // Reset trail when toggled off
  useEffect(() => {
    if (!showOrbitTrail) {
      setTrailPoints([]);
    }
  }, [showOrbitTrail]);

  if (!currentPosition) {
    return null;
  }

  // Convert trail points to array format for Line component
  const trailPointsArray = useMemo(() => {
    return trailPoints.map(p => [p.x, p.y, p.z] as [number, number, number]);
  }, [trailPoints]);

  return (
    <>
      {/* ISS Mesh */}
      <mesh ref={meshRef} position={currentPosition}>
        {/* ISS represented as a box (can be replaced with a model later) */}
        <boxGeometry args={[0.08, 0.08, 0.15]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#4a9eff"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Orbit Trail */}
      {showOrbitTrail && trailPointsArray.length > 1 && (
        <Line points={trailPointsArray} color="#4a9eff" lineWidth={1} opacity={0.6} transparent />
      )}
    </>
  );
}

