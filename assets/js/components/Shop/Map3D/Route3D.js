import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Route3D({ points, passedT = 0 }) {
    const curve = useMemo(() => {
        if (!points || points.length < 2) return null;
        const vectors = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
        const path = new THREE.CurvePath();
        for (let i = 0; i < vectors.length - 1; i++) {
            path.add(new THREE.LineCurve3(vectors[i], vectors[i + 1]));
        }
        return path;
    }, [points]);

    const { passedCurve, aheadCurve } = useMemo(() => {
        if (!curve) return { passedCurve: null, aheadCurve: null };
        const t = Math.max(0, Math.min(1, passedT));
        if (t <= 0) return { passedCurve: null, aheadCurve: curve };
        if (t >= 1) return { passedCurve: curve, aheadCurve: null };

        const splitPoint = curve.getPointAt(t);
        const STEPS = 200;

        const passedVecs = [];
        for (let i = 0; i <= STEPS * t; i++) {
            passedVecs.push(curve.getPointAt(i / STEPS));
        }
        passedVecs.push(splitPoint);

        const aheadVecs = [splitPoint];
        for (let i = Math.ceil(STEPS * t); i <= STEPS; i++) {
            aheadVecs.push(curve.getPointAt(i / STEPS));
        }

        const buildPath = (vecs) => {
            const p = new THREE.CurvePath();
            for (let i = 0; i < vecs.length - 1; i++) {
                p.add(new THREE.LineCurve3(vecs[i], vecs[i + 1]));
            }
            return p;
        };

        return {
            passedCurve: passedVecs.length >= 2 ? buildPath(passedVecs) : null,
            aheadCurve: aheadVecs.length >= 2 ? buildPath(aheadVecs) : null,
        };
    }, [curve, passedT]);

    if (!curve) return null;

    return (
        <group>
            {/* Passed segment – gray */}
            {passedCurve && (
                <mesh>
                    <tubeGeometry args={[passedCurve, 128, 0.03, 8, false]} />
                    <meshStandardMaterial color="#9ca3af" roughness={0.8} metalness={0} />
                </mesh>
            )}

            {/* Ahead segment – green */}
            {aheadCurve && (
                <>
                    <mesh>
                        <tubeGeometry args={[aheadCurve, 128, 0.03, 8, false]} />
                        <meshStandardMaterial
                            color="#22c55e"
                            emissive="#22c55e"
                            emissiveIntensity={0.6}
                            roughness={0.3}
                            metalness={0.4}
                        />
                    </mesh>
                    <mesh>
                        <tubeGeometry args={[aheadCurve, 128, 0.06, 8, false]} />
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
                    <RouteDirectionDots curve={aheadCurve} />
                </>
            )}
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
