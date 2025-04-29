import type { SatelliteVectorData } from "src/components/earthView/type";
import { useSelectedSatellite } from "src/context/satelliteContext";
import { useThree } from "@react-three/fiber";
import React, { useState } from "react";
import gsap from "gsap";

interface SatelliteProps {
    satellite: SatelliteVectorData;
    controlsRef: React.RefObject<any>;
}

export function Satellite({
    satellite,
    controlsRef,
}: SatelliteProps): JSX.Element {
    const { setSelectedSatellite } = useSelectedSatellite();
    const { camera } = useThree();
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const handleClick = (): void => {
        setSelectedSatellite(satellite);
        if (controlsRef.current && satellite.position) {
            const { x, y, z } = satellite.position;

            const timeline = gsap.timeline();

            timeline.to(camera.position, {
                x: x + 2,
                y: y + 2,
                z: z + 2,
                duration: 2,
                onUpdate: () => {
                    controlsRef.current.update();
                },
            });

            timeline.to(controlsRef.current.target, {
                x,
                y,
                z,
                duration: 2,
                onUpdate: () => {
                    controlsRef.current.update();
                },
            });

            timeline.eventCallback("onComplete", () => {
                camera.lookAt(x, y, z);
                controlsRef.current.update();
            });
        }
    };

    return (
        <>
            {satellite.position ? (
                <mesh
                    key={`${satellite.position.x}-${satellite.position.y}`}
                    onClick={handleClick}
                    onPointerEnter={() => {
                        setIsHovered(true);
                    }}
                    onPointerOut={() => {
                        setIsHovered(false);
                    }}
                    position={satellite.position}
                >
                    <sphereGeometry args={isHovered ? [0.05, 16, 16] : [0.03, 16, 16]} />
                    <meshStandardMaterial color="red" />
                </mesh>
            ) : null}
        </>
    );
}
