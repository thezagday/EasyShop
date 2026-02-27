import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SCALE, HALF_W, HALF_H } from './constants';

const TYPE_COLORS = {
    shelf: '#d9dfc9',
    wall: '#a8b7c8',
    counter: '#b8d7ef',
    checkout: '#98d6ad',
};

const TYPE_OPACITY = {
    shelf: 0.74,
    wall: 0.82,
    counter: 0.72,
    checkout: 0.78,
};

const TYPE_HEIGHTS = {
    shelf: 0.20,
    wall: 0.28,
    counter: 0.16,
    checkout: 0.14,
};

export function Obstacles3D({ obstacles }) {
    const meshes = useMemo(() => {
        if (!obstacles || obstacles.length === 0) return [];

        return obstacles.map((obs, idx) => {
            const w = obs.width * SCALE;
            const d = obs.height * SCALE;
            const h = TYPE_HEIGHTS[obs.type] || 0.10;
            const color = TYPE_COLORS[obs.type] || '#d6d6d6';
            const opacity = TYPE_OPACITY[obs.type] ?? 0.72;

            // Admin coords: (x, y) is top-left, Y-down
            // Three.js: center of box, admin Y maps to +Z
            const cx = obs.x * SCALE + w / 2 - HALF_W;
            const cy = h / 2;
            const cz = obs.y * SCALE + d / 2 - HALF_H;

            return { key: obs.id || idx, w, d, h, cx, cy, cz, color, opacity, type: obs.type };
        });
    }, [obstacles]);

    return (
        <group>
            {meshes.map(m => (
                <mesh
                    key={m.key}
                    position={[m.cx, m.cy, m.cz]}
                    castShadow
                    receiveShadow
                >
                    <boxGeometry args={[m.w, m.h, m.d]} />
                    <meshStandardMaterial
                        color={m.color}
                        roughness={0.85}
                        metalness={0.02}
                        emissive={new THREE.Color(m.color)}
                        emissiveIntensity={0.07}
                        transparent
                        opacity={m.opacity}
                    />
                </mesh>
            ))}
        </group>
    );
}
