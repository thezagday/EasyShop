import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SCALE, HALF_W, HALF_H } from './constants';

const TYPE_COLORS = {
    shelf: '#b0bece',
    wall: '#3a4a5a',
    counter: '#6890c0',
    checkout: '#5cb87c',
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
                    <meshBasicMaterial
                        color={m.color}
                        transparent
                        opacity={0.58}
                    />
                </mesh>
            ))}
        </group>
    );
}
