import { useEffect, useRef, useState, type JSX } from 'react';
import Satellites from '@/components/earthView/satellites';
import { Canvas } from '@react-three/fiber';
import { Earth } from './earth';

import { Credits } from '@/components/earthView/submodules/credits';
import { SatelliteInfo } from '@/components/earthView/submodules/satelliteInfo';
import { OrbitControls } from '@react-three/drei';
import { useTleData } from '@/hooks/use-tle';
import type { TleMember } from '@/types/tle';

export function EarthView(): JSX.Element {
  const [memberData, setMemberData] = useState<TleMember[]>([]);
  const controlsRef = useRef(null);

  const { error, isLoading, data } = useTleData();

  useEffect(() => {
    if (data) {
      setMemberData(data.member);
    }
  }, [data]);

  if (isLoading) {
    return <div className="w-100 h-100 rounded-full" />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="relative w-100 h-100">
      <Canvas
        style={{
          top: 0,
          left: 0,
          width: '100%',
          height: '537px',
          zIndex: 0,
        }}
      >
        <OrbitControls ref={controlsRef} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />
        <Earth />
        {memberData.length > 0 && <Satellites satelliteMemberList={memberData} controlsRef={controlsRef} />}
      </Canvas>
      <SatelliteInfo />
      <Credits />
    </div>
  );
}
