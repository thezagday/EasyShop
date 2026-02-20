import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Route3D({ points }) {
    const tubeRef = useRef();
    const glowRef = useRef();

    const curve = useMemo(() => {
        if (!points || points.length < 2) return null;
        const vectors = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
        return new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.3);
    }, [points]);

    // Animate dash offset
    useFrame((_, delta) => {
        if (tubeRef.current && tubeRef.current.material) {
            tubeRef.current.material.dashOffset -= delta * 0.5;
        }
    });

    if (!curve) return null;

    return (
        <group>
            {/* Main route tube */}
            <mesh ref={tubeRef}>
                <tubeGeometry args={[curve, 128, 0.03, 8, false]} />
                <meshStandardMaterial
                    color="#22c55e"
                    emissive="#22c55e"
                    emissiveIntensity={0.6}
                    roughness={0.3}
                    metalness={0.4}
                />
            </mesh>

            {/* Glow tube (slightly larger, transparent) */}
            <mesh ref={glowRef}>
                <tubeGeometry args={[curve, 128, 0.06, 8, false]} />
                <meshStandardMaterial
                    color="#22c55e"
                    emissive="#22c55e"
                    emissiveIntensity={0.3}
                    transparent
                    opacity={0.15}
                    roughness={1}
                    metalness={0}
                />
            </mesh>

            {/* Direction dots along the path */}
            <RouteDirectionDots curve={curve} />
        </group>
    );
}

function RouteDirectionDots({ curve }) {
    const dotsRef = useRef();
    const dotCount = 30;

    const positions = useMemo(() => {
        const pts = [];
        for (let i = 0; i < dotCount; i++) {
            const t = i / dotCount;
            const p = curve.getPointAt(t);
            pts.push(p);
        }
        return pts;
    }, [curve, dotCount]);

    // Animate dots (pulsing along the path)
    useFrame(({ clock }) => {
        if (!dotsRef.current) return;
        const time = clock.getElapsedTime();
        dotsRef.current.children.forEach((dot, idx) => {
            const phase = (time * 2 + idx * 0.3) % (dotCount * 0.3);
            const brightness = Math.max(0.2, Math.sin(phase) * 0.8 + 0.2);
            dot.scale.setScalar(brightness * 0.8 + 0.3);
        });
    });

    return (
        <group ref={dotsRef}>
            {positions.map((pos, idx) => (
                <mesh key={idx} position={[pos.x, pos.y + 0.01, pos.z]}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshStandardMaterial
                        color="#86efac"
                        emissive="#22c55e"
                        emissiveIntensity={0.8}
                    />
                </mesh>
            ))}
        </group>
    );
}
