import React, { useEffect, useRef, useState } from "react";
import Satellites from "src/components/earthView/satellites";
import { Canvas } from "@react-three/fiber";
import { Earth } from "./earth";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "src/components/ui/skeleton";
import { Credits } from "src/components/earthView/submodules/credits";
import { SatelliteInfo } from "src/components/earthView/submodules/satelliteInfo";
import { OrbitControls } from "@react-three/drei";
import { Member, TleResponse } from "src/shared-types/src/NASA";

export function EarthView(): JSX.Element {
    const [memberData, setMemberData] = useState<Member[]>([]);
    const controlsRef = useRef(null);

    const { error, isLoading, data } = useQuery<TleResponse>({
        queryKey: ["tleData"],
        queryFn: () =>
            fetch("http://localhost:4200/tle/gettledata").then((res) => res.json()),
    });

    useEffect(() => {
        if (data) {
            setMemberData(data.member);
        }
    }, [data]);

    if (isLoading) {
        return <Skeleton className="w-100 h-100 rounded-full" />;
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
                    width: "100%",
                    height: "537px",
                    zIndex: 0,
                }}
            >
                <OrbitControls ref={controlsRef} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                <Earth />
                {memberData.length > 0 && (
                    <Satellites
                        satelliteMemberList={memberData}
                        controlsRef={controlsRef}
                    />
                )}
            </Canvas>
            <SatelliteInfo />
            <Credits />
        </div>
    );
}
