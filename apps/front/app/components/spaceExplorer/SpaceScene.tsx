import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html, Environment } from '@react-three/drei';
import React, { Suspense, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Vector3, type Mesh } from 'three';
import type { PlanetPosition, BodyName } from './types';
import { PLANET_COLORS } from './types';

const AU_TO_UNITS = 10; // 1 AU = 10 scene units for a compact view

// Approximate J2000 orbital elements for planets (for visualization)
// a (AU), e, i (deg), Omega (deg), omega (deg)
const ORBIT_ELEMENTS: Partial<Record<BodyName, { a: number; e: number; i: number; Omega: number; omega: number }>> = {
  Mercury: { a: 0.387098, e: 0.20563, i: 7.00487, Omega: 48.33167, omega: 29.12478 },
  Venus: { a: 0.723332, e: 0.006772, i: 3.39471, Omega: 76.68069, omega: 54.85229 },
  Earth: { a: 1.0, e: 0.01671, i: 0.00005, Omega: 348.73936, omega: 114.20783 },
  Mars: { a: 1.523679, e: 0.0934, i: 1.85061, Omega: 49.57854, omega: 286.4623 },
  Jupiter: { a: 5.2026, e: 0.048498, i: 1.30327, Omega: 100.55615, omega: 273.867 },
  Saturn: { a: 9.55491, e: 0.055508, i: 2.48524, Omega: 113.71504, omega: 339.392 },
  Uranus: { a: 19.2184, e: 0.046381, i: 0.773059, Omega: 74.00595, omega: 96.998857 },
  Neptune: { a: 30.1104, e: 0.008988, i: 1.76917, Omega: 131.784, omega: 273.187 },
};

const DEG2RAD = Math.PI / 180;
const OBLIQUITY = 23.439281 * DEG2RAD;

// Physical equatorial radii (km)
const RADII_KM: Record<BodyName, number> = {
  Sun: 695_700,
  Mercury: 2_439.7,
  Venus: 6_051.8,
  Earth: 6_378.1,
  Moon: 1_737.4,
  Mars: 3_389.5,
  Jupiter: 71_492,
  Saturn: 60_268,
  Uranus: 25_559,
  Neptune: 24_764,
};

// Visual scaling (units per AU) so planets are visible while keeping relative sense
const PLANET_SCALE = 500;
const SUN_SCALE = 60;
const MIN_RADIUS = 0.12;
const MAX_RADIUS = 2.0;

function physicalRadiusUnits(body: BodyName): number {
  const rKm = RADII_KM[body];
  const rAu = rKm / 149_597_870.7;
  const scale = body === 'Sun' ? SUN_SCALE : PLANET_SCALE;
  const units = rAu * AU_TO_UNITS * scale;
  return Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, units));
}

function Rx(a: number) {
  const c = Math.cos(a), s = Math.sin(a);
  return [[1, 0, 0], [0, c, -s], [0, s, c]] as const;
}

function Rz(a: number) {
  const c = Math.cos(a), s = Math.sin(a);
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]] as const;
}

function mulMatVec(M: readonly (readonly number[])[], v: [number, number, number]): [number, number, number] {
  return [
    M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
    M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
    M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]
  ];
}

function mulMat(A: readonly (readonly number[])[], B: readonly (readonly number[])[]) {
  const out: number[][] = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      out[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j];
  return out as readonly (readonly number[])[];
}

interface EllipticalOrbitProps {
  body: BodyName;
  elements: { a: number; e: number; i: number; Omega: number; omega: number };
  segments?: number;
  color?: string;
  visible?: boolean;
}

function EllipticalOrbit({ body, elements, segments = 512, color = '#2a2f45', visible = true }: EllipticalOrbitProps) {
  const points = useMemo(() => {
    const a = elements.a;
    const e = elements.e;
    const b = a * Math.sqrt(1 - e * e);
    const i = elements.i * DEG2RAD;
    const Omega = elements.Omega * DEG2RAD;
    const omega = elements.omega * DEG2RAD;

    // equatorial = Rx(+ε) * Rz(Ω) * Rx(i) * Rz(ω) * perifocal
    const R = mulMat(Rx(OBLIQUITY), mulMat(Rz(Omega), mulMat(Rx(i), Rz(omega))));

    const pts: [number, number, number][] = [];
    for (let k = 0; k <= segments; k++) {
      const t = (k / segments) * Math.PI * 2;
      const x_plane = a * Math.cos(t) - a * e;
      const y_plane = b * Math.sin(t);
      const z_plane = 0;
      const vEq = mulMatVec(R, [x_plane, y_plane, z_plane]);
      pts.push([vEq[0] * AU_TO_UNITS, vEq[1] * AU_TO_UNITS, vEq[2] * AU_TO_UNITS]);
    }
    return pts;
  }, [elements, segments]);

  if (!visible) return null;
  return <Line points={points} color={color} lineWidth={1} opacity={0.4} transparent />;
}

// Saturn's rings component
function SaturnRings({ position, radius }: { position: [number, number, number]; radius: number }) {
  return (
    <group position={position} rotation={[Math.PI / 6, 0, 0]}>
      <mesh>
        <ringGeometry args={[radius * 1.4, radius * 2.2, 64]} />
        <meshStandardMaterial 
          color="#c9b896" 
          transparent 
          opacity={0.6} 
          side={2}
        />
      </mesh>
    </group>
  );
}

interface PlanetProps {
  planet: PlanetPosition;
  selected: boolean;
  visible: boolean;
  onSelect: (planet: PlanetPosition, position: [number, number, number]) => void;
  showLabels?: boolean;
}

function Planet({ planet, selected, visible, onSelect, showLabels = true }: PlanetProps) {
  const meshRef = useRef<Mesh>(null);
  
  // Map AU to scene units
  const position = useMemo(
    () => [planet.x * AU_TO_UNITS, planet.y * AU_TO_UNITS, planet.z * AU_TO_UNITS] as [number, number, number],
    [planet.x, planet.y, planet.z]
  );

  // Physically-informed radius with clamped visual scaling
  const radius = useMemo(() => physicalRadiusUnits(planet.body), [planet.body]);
  const color = PLANET_COLORS[planet.body];

  // Subtle rotation animation
  useFrame((state) => {
    if (meshRef.current && planet.body !== 'Sun') {
      meshRef.current.rotation.y += 0.002;
    }
  });

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onSelect(planet, position);
    },
    [onSelect, planet, position]
  );

  if (!visible) return null;

  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onClick={handleClick} 
        onPointerOver={() => (document.body.style.cursor = 'pointer')} 
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={planet.body === 'Sun' ? '#ff8800' : 'black'} 
          emissiveIntensity={planet.body === 'Sun' ? 0.8 : 0}
          roughness={planet.body === 'Sun' ? 0.2 : 0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Sun glow */}
      {planet.body === 'Sun' && (
        <mesh>
          <sphereGeometry args={[radius * 1.2, 32, 32]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.15} />
        </mesh>
      )}
      
      {/* Saturn rings */}
      {planet.body === 'Saturn' && <SaturnRings position={[0, 0, 0]} radius={radius} />}
      
      {/* Selection ring */}
      {selected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.5, radius * 1.7, 32]} />
          <meshBasicMaterial color="#3fa7ff" transparent opacity={0.6} side={2} />
        </mesh>
      )}
      
      {/* Label */}
      {showLabels && (
        <Html 
          position={[0, radius * 1.8, 0]} 
          center 
          distanceFactor={8}
          style={{ pointerEvents: 'none' }}
        >
          <div className={`
            px-2 py-1 rounded text-xs font-medium whitespace-nowrap
            ${selected 
              ? 'bg-indigo-600/90 text-white' 
              : 'bg-slate-900/80 text-slate-300'
            }
          `}>
            {planet.body}
          </div>
        </Html>
      )}
      
      {/* Detailed tooltip on selection */}
      {selected && (
        <Html 
          position={[radius * 2.5, 0, 0]} 
          center 
          distanceFactor={6} 
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-slate-900/95 border border-slate-700/50 p-3 rounded-sm min-w-[180px] shadow-xl">
            <div className="font-bold text-white mb-2 flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
              />
              {planet.body}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Distance:</span>
                <span className="text-white">{planet.distanceAu.toFixed(3)} AU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phase:</span>
                <span className="text-white">{(planet.phase * 100).toFixed(0)}%</span>
              </div>
              {planet.magnitude !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Magnitude:</span>
                  <span className="text-white">{planet.magnitude.toFixed(1)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Elongation:</span>
                <span className="text-white">{planet.elongationDeg.toFixed(1)}°</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

interface OrbitControlsWithTargetProps {
  targetPos: [number, number, number] | null;
  autoRotate?: boolean;
}

function OrbitControlsWithTarget({ targetPos, autoRotate = true }: OrbitControlsWithTargetProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  
  useEffect(() => {
    if (!targetPos || !controlsRef.current) return;
    const controls = controlsRef.current;
    const oldTarget = controls.target.clone() as Vector3;
    const newTarget = new Vector3(targetPos[0], targetPos[1], targetPos[2]);
    const delta = new Vector3().subVectors(newTarget, oldTarget);
    controls.target.copy(newTarget);
    camera.position.add(delta);
    controls.update();
  }, [targetPos, camera]);
  
  return (
    <OrbitControls 
      ref={controlsRef} 
      enableDamping 
      dampingFactor={0.1}
      autoRotate={autoRotate}
      autoRotateSpeed={0.2}
      minDistance={5}
      maxDistance={400}
    />
  );
}

export interface SpaceSceneProps {
  positions: PlanetPosition[];
  selectedPlanet: BodyName | null;
  visiblePlanets: Set<BodyName>;
  showOrbits?: boolean;
  showLabels?: boolean;
  autoRotate?: boolean;
  onPlanetSelect: (planet: PlanetPosition) => void;
  onFocusPlanet?: (body: BodyName) => void;
}

export default function SpaceScene({ 
  positions, 
  selectedPlanet,
  visiblePlanets,
  showOrbits = true,
  showLabels = true,
  autoRotate = true,
  onPlanetSelect,
  onFocusPlanet
}: SpaceSceneProps) {
  const [targetPos, setTargetPos] = useState<[number, number, number] | null>(null);
  
  const onSelect = useCallback((planet: PlanetPosition, pos: [number, number, number]) => {
    onPlanetSelect(planet);
    setTargetPos(pos);
  }, [onPlanetSelect]);

  // Find selected planet position for camera target
  useEffect(() => {
    if (selectedPlanet) {
      const planet = positions.find(p => p.body === selectedPlanet);
      if (planet) {
        setTargetPos([planet.x * AU_TO_UNITS, planet.y * AU_TO_UNITS, planet.z * AU_TO_UNITS]);
      }
    }
  }, [selectedPlanet, positions]);

  return (
    <div className="w-full h-full min-h-[500px] bg-[#02030a] rounded-sm overflow-hidden">
      <Canvas
        camera={{ position: [0, 20, 40], fov: 55 }}
        className="w-full h-full"
        onPointerMissed={() => {
          onPlanetSelect(null as any);
          setTargetPos(null);
        }}
      >
        <color attach="background" args={['#02030a']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" />
        <pointLight position={[0, 50, 50]} intensity={0.3} color="#ffffff" />
        
        <Suspense fallback={null}>
          {/* Enhanced starfield */}
          <Stars 
            radius={200} 
            depth={80} 
            count={8000} 
            factor={5} 
            saturation={0.1} 
            fade 
            speed={0.3}
          />
          
          {/* Elliptical orbit guides */}
          {showOrbits && Object.entries(ORBIT_ELEMENTS).map(([body, el]) => (
            <EllipticalOrbit 
              key={`orbit-${body}`} 
              body={body as BodyName} 
              elements={el} 
              color={PLANET_COLORS[body as BodyName]}
              visible={visiblePlanets.has(body as BodyName)}
            />
          ))}
          
          {/* Celestial bodies */}
          {positions.map(planet => (
            <Planet 
              key={planet.body} 
              planet={planet} 
              selected={selectedPlanet === planet.body}
              visible={visiblePlanets.has(planet.body)}
              onSelect={onSelect}
              showLabels={showLabels}
            />
          ))}
        </Suspense>
        
        <OrbitControlsWithTarget targetPos={targetPos} autoRotate={autoRotate && !selectedPlanet} />
      </Canvas>
    </div>
  );
}
