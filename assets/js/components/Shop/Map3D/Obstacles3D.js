import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SCALE, HALF_W, HALF_H } from './constants';

const TYPE_COLORS = {
    shelf: '#a3836a',
    wall: '#b0b8c4',
    counter: '#7c9eb8',
    checkout: '#6dae94',
};

const TYPE_HEIGHTS = {
    shelf: 0.08,
    wall: 0.12,
    counter: 0.06,
    checkout: 0.05,
};

export function Obstacles3D({ obstacles }) {
    const meshes = useMemo(() => {
        if (!obstacles || obstacles.length === 0) return [];

        return obstacles.map((obs, idx) => {
            const w = obs.width * SCALE;
            const d = obs.height * SCALE;
            const h = TYPE_HEIGHTS[obs.type] || 0.08;
            const color = TYPE_COLORS[obs.type] || '#a3836a';

            // Admin coords: (x, y) is top-left, Y-down
            // Three.js: center of box, admin Y maps to +Z
            const cx = obs.x * SCALE + w / 2 - HALF_W;
            const cy = h / 2;
            const cz = obs.y * SCALE + d / 2 - HALF_H;

            return { key: obs.id || idx, w, d, h, cx, cy, cz, color, type: obs.type };
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
                        roughness={0.6}
                        metalness={0.1}
                        transparent
                        opacity={0.45}
                    />
                </mesh>
            ))}
        </group>
    );
}
