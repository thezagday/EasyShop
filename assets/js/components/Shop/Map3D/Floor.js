import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { SCALE, MAP_WIDTH, MAP_HEIGHT } from './constants';

const FLOOR_W = MAP_WIDTH * SCALE;
const FLOOR_H = MAP_HEIGHT * SCALE;

export function Floor({ mapImageUrl }) {
    const texture = useMemo(() => {
        if (!mapImageUrl) return null;
        const loader = new THREE.TextureLoader();
        const tex = loader.load(mapImageUrl);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }, [mapImageUrl]);

    return (
        <group>
            {/* Main floor plane */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.01, 0]}
                receiveShadow
            >
                <planeGeometry args={[FLOOR_W, FLOOR_H]} />
                <meshStandardMaterial
                    color={texture ? '#ffffff' : '#e8ecf1'}
                    map={texture}
                    roughness={0.8}
                    metalness={0.0}
                />
            </mesh>

            {/* Subtle ground plane beneath (shadow catcher) */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.02, 0]}
                receiveShadow
            >
                <planeGeometry args={[FLOOR_W + 4, FLOOR_H + 4]} />
                <meshStandardMaterial color="#f0f0f0" roughness={1} />
            </mesh>
        </group>
    );
}
