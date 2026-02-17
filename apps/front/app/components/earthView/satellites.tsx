import React, { useEffect, useState } from 'react';
import type { SatelliteVectorData } from '@/components/earthView/type';
import { getBaseDataFor3DView } from '@/components/earthView/utils/calculateSatellitePos';
import { Satellite } from '@/components/earthView/submodules/satellite';
import type { TleMember } from '@/types/tle';

interface PropsSatellites {
  satelliteMemberList: TleMember[];
  controlsRef: React.RefObject<any>;
}

export function Satellites({ satelliteMemberList, controlsRef }: PropsSatellites): JSX.Element {
  const [satellitesVectorData, setSatellitesVectorData] = useState<(SatelliteVectorData | undefined)[]>([]);

  useEffect(() => {
    const positions: (SatelliteVectorData | undefined)[] = getBaseDataFor3DView(satelliteMemberList);
    setSatellitesVectorData(positions);
  }, [satelliteMemberList]);

  return (
    <>
      {satellitesVectorData.map(satellite => {
        if (!satellite?.position) {
          return null;
        }
        return <Satellite controlsRef={controlsRef} key={satellite.id} satellite={satellite} />;
      })}
    </>
  );
}

export default Satellites;
