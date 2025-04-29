import React, { useRef } from "react";
import { TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";

export function Earth(): JSX.Element {
    const earthRef = useRef<any>();
    const texture = useLoader(TextureLoader, "./earth-texture-map.jpg");

    return (
        <>
            <mesh ref={earthRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial map={texture} />
            </mesh>
            <OrbitControls />
            <Stars />
        </>
    );
}

export default Earth;