import { useEffect, useRef, useState, type JSX, Suspense } from 'react';
import Satellites from '@/components/earthView/satellites';
import { Canvas } from '@react-three/fiber';
import { Earth } from './earth';
import { Aurora } from './aurora';
import { ISS } from './iss';

import { Credits } from '@/components/earthView/submodules/credits';
import { SatelliteInfo } from '@/components/earthView/submodules/satelliteInfo';
import { OrbitControls } from '@react-three/drei';
import { useTleData } from '@/hooks/use-tle';
import { useAuroraData } from '@/hooks/use-aurora';
import type { TleMember } from '@/types/tle';
import type { ISSPosition } from '@/types/iss';

interface EarthViewProps {
  showAurora?: boolean;
  showSatellites?: boolean;
  showISS?: boolean;
  issPosition?: ISSPosition | null;
  showISSTrail?: boolean;
}

export function EarthView({ showAurora = true, showSatellites = true, showISS = false, issPosition = null, showISSTrail = false }: EarthViewProps): JSX.Element {
  const [memberData, setMemberData] = useState<TleMember[]>([]);
  const controlsRef = useRef(null);

  const { error: tleError, isLoading: tleLoading, data: tleData } = useTleData();
  const { data: auroraData, isLoading: auroraLoading } = useAuroraData();

  useEffect(() => {
    if (tleData) {
      setMemberData(tleData.member);
    }
  }, [tleData]);

  const isLoading = tleLoading || (showAurora && auroraLoading);

  if (isLoading) {
    return (
      <div className="w-100 h-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (tleError) {
    return <div>Error: {tleError.message}</div>;
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
        {showAurora && auroraData?.coordinates && (
          <Aurora auroraData={auroraData.coordinates} visible={true} />
        )}
        {showSatellites && memberData.length > 0 && (
          <Satellites satelliteMemberList={memberData} controlsRef={controlsRef} />
        )}
        {showISS && (
          <Suspense fallback={null}>
            <ISS position={issPosition} showOrbitTrail={showISSTrail} />
          </Suspense>
        )}
      </Canvas>
      {showAurora && auroraData && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
          <div className="text-sm font-semibold text-green-400">Aurora Activity</div>
          <div className="text-xs opacity-80">Kp Index: {auroraData.kpIndex}</div>
          <div className="text-xs opacity-60">Updated: {new Date(auroraData.forecastTime).toLocaleTimeString()}</div>
        </div>
      )}
      <SatelliteInfo />
      <Credits />
    </div>
  );
}
