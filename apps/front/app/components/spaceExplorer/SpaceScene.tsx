import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Html } from '@react-three/drei';
import React, { Suspense, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Vector3 } from 'three';

export type BodyName = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Earth' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune';

export interface ObjectPositionDTO {
  body: BodyName;
  timestamp: string;
  equatorial: {
    raDeg: number;
    decDeg: number;
    distanceAu: number;
  };
  observables: {
    phase: number;
    magnitude?: number;
    angularDiameterArcsec: number;
    elongationDeg: number;
  };
  vectorAu: {
    x: number;
    y: number;
    z: number;
  };
}

export interface SpaceSceneProps {
  objects: ObjectPositionDTO[];
}

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
  const c = Math.cos(a),
    s = Math.sin(a);
  return [
    [1, 0, 0],
    [0, c, -s],
    [0, s, c],
  ] as const;
}
function Rz(a: number) {
  const c = Math.cos(a),
    s = Math.sin(a);
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ] as const;
}
function mulMatVec(M: readonly (readonly number[])[], v: [number, number, number]): [number, number, number] {
  return [M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2], M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2], M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]];
}
function mulMat(A: readonly (readonly number[])[], B: readonly (readonly number[])[]) {
  const out: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) out[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j];
  return out as readonly (readonly number[])[];
}

function EllipticalOrbit({
  body,
  elements,
  segments = 512,
  color = '#2a2f45',
}: {
  body: BodyName;
  elements: { a: number; e: number; i: number; Omega: number; omega: number };
  segments?: number;
  color?: string;
}) {
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
      // Ellipse in orbital plane centered at focus (Sun at origin): shift -a*e along +x
      const x_plane = a * Math.cos(t) - a * e;
      const y_plane = b * Math.sin(t);
      const z_plane = 0;
      const vEq = mulMatVec(R, [x_plane, y_plane, z_plane]);
      pts.push([vEq[0] * AU_TO_UNITS, vEq[1] * AU_TO_UNITS, vEq[2] * AU_TO_UNITS]);
    }
    return pts;
  }, [elements, segments]);
  return <Line points={points} color={color} lineWidth={1} opacity={0.6} transparent />;
}

function bodyColor(body: BodyName): string {
  switch (body) {
    case 'Sun':
      return '#ffaa00';
    case 'Mercury':
      return '#b3b3b3';
    case 'Venus':
      return '#d9c58b';
    case 'Earth':
      return '#3fa7ff';
    case 'Moon':
      return '#dddddd';
    case 'Mars':
      return '#d14b3f';
    case 'Jupiter':
      return '#c89f6c';
    case 'Saturn':
      return '#d3c7a6';
    case 'Uranus':
      return '#7fd1d8';
    case 'Neptune':
      return '#5a79d6';
    default:
      return '#ffffff';
  }
}

function Planet({ obj, selected, onSelect }: { obj: ObjectPositionDTO; selected: boolean; onSelect: (o: ObjectPositionDTO, position: [number, number, number]) => void }) {
  // Map AU to scene units
  const position = useMemo(() => [obj.vectorAu.x * AU_TO_UNITS, obj.vectorAu.y * AU_TO_UNITS, obj.vectorAu.z * AU_TO_UNITS] as [number, number, number], [obj.vectorAu]);

  // Physically-informed radius with clamped visual scaling
  const radius = useMemo(() => physicalRadiusUnits(obj.body), [obj.body]);

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      onSelect(obj, position);
    },
    [onSelect, obj, position]
  );

  return (
    <group position={position}>
      <mesh onClick={handleClick} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'default')}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial color={bodyColor(obj.body)} emissive={obj.body === 'Sun' ? '#ff8800' : 'black'} emissiveIntensity={obj.body === 'Sun' ? 0.6 : 0} />
      </mesh>
      {selected && (
        <Html position={[0, radius * 1.6, 0]} center distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              background: 'rgba(10,12,20,0.9)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '8px 10px',
              borderRadius: 8,
              color: '#e6e6e6',
              minWidth: 160,
              boxShadow: '0 6px 16px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{obj.body}</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Distance: {obj.equatorial.distanceAu.toFixed(3)} AU</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Phase: {(obj.observables.phase * 100).toFixed(0)}%</div>
            {typeof obj.observables.magnitude === 'number' && <div style={{ fontSize: 12, opacity: 0.9 }}>Mag: {obj.observables.magnitude.toFixed(1)}</div>}
            <div style={{ fontSize: 12, opacity: 0.9 }}>Elongation: {obj.observables.elongationDeg.toFixed(1)}°</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function OrbitControlsWithTarget({ targetPos }: { targetPos: [number, number, number] | null }) {
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
  return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.1} />;
}

export default function SpaceScene({ objects }: SpaceSceneProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [targetPos, setTargetPos] = useState<[number, number, number] | null>(null);
  const onSelect = useCallback((o: ObjectPositionDTO, pos: [number, number, number]) => {
    setSelected(o.body);
    setTargetPos(pos);
  }, []);
  const isSelected = useCallback((o: ObjectPositionDTO) => selected === o.body, [selected]);

  return (
    <div className="w-full h-[70vh] bg-[#02030a] rounded">
      <Canvas
        camera={{ position: [0, 15, 30], fov: 60 }}
        className="w-full bg-[#02030a] rounded"
        onPointerMissed={() => {
          setSelected(null);
          setTargetPos(null);
        }}
      >
        <color attach="background" args={['#02030a']} />
        <ambientLight intensity={1} />
        {/* Light at the Sun's recentered origin */}
        <pointLight position={[0, 0, 0]} intensity={1.8} color="#ffffff" />
        <Suspense fallback={null}>
          <Stars radius={120} depth={50} count={7000} factor={4} saturation={0} fade />
          {/* Elliptical, inclined orbit guides (J2000 approx) */}
          {Object.entries(ORBIT_ELEMENTS).map(([body, el]) => (
            <EllipticalOrbit key={`orbit-${body}`} body={body as BodyName} elements={el} color={bodyColor(body as BodyName)} />
          ))}
          {/* Bodies */}
          {objects.map(o => (
            <Planet key={`${o.body}-${o.timestamp}`} obj={o} selected={isSelected(o)} onSelect={onSelect} />
          ))}
        </Suspense>
        <OrbitControlsWithTarget targetPos={targetPos} />
      </Canvas>
    </div>
  );
}
