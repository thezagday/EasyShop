import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Line } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

const CORNER_MAX_RADIUS = 0.12;
const CORNER_RATIO = 0.35;
const CORNER_STEPS = 5;

function dedupeVectors(vectors, minDist = 0.0001) {
    if (!vectors || vectors.length <= 1) return vectors || [];
    const result = [vectors[0]];

    for (let i = 1; i < vectors.length; i++) {
        if (vectors[i].distanceTo(result[result.length - 1]) > minDist) {
            result.push(vectors[i]);
        }
    }

    return result;
}

function buildRoundedVectors(vectors) {
    if (!vectors || vectors.length < 3) return vectors || [];

    const rounded = [vectors[0].clone()];

    for (let i = 1; i < vectors.length - 1; i++) {
        const prev = vectors[i - 1];
        const curr = vectors[i];
        const next = vectors[i + 1];

        const inDir = curr.clone().sub(prev);
        const outDir = next.clone().sub(curr);
        const inLen = inDir.length();
        const outLen = outDir.length();

        if (inLen < 1e-6 || outLen < 1e-6) {
            rounded.push(curr.clone());
            continue;
        }

        inDir.normalize();
        outDir.normalize();

        // Skip almost-straight vertices to avoid unnecessary interpolation.
        const cornerStrength = 1 - Math.abs(inDir.dot(outDir));
        if (cornerStrength < 0.08) {
            rounded.push(curr.clone());
            continue;
        }

        const radius = Math.min(CORNER_MAX_RADIUS, inLen * CORNER_RATIO, outLen * CORNER_RATIO);
        if (radius < 0.004) {
            rounded.push(curr.clone());
            continue;
        }

        const start = curr.clone().addScaledVector(inDir, -radius);
        const end = curr.clone().addScaledVector(outDir, radius);
        rounded.push(start);

        for (let s = 1; s <= CORNER_STEPS; s++) {
            const t = s / (CORNER_STEPS + 1);
            const q1 = start.clone().lerp(curr, t);
            const q2 = curr.clone().lerp(end, t);
            rounded.push(q1.lerp(q2, t));
        }

        rounded.push(end);
    }

    rounded.push(vectors[vectors.length - 1].clone());
    return dedupeVectors(rounded);
}

function splitPolylineByT(vectors, t) {
    if (!vectors || vectors.length < 2) return { passedPoints: [], aheadPoints: vectors || [] };

    const clampedT = Math.max(0, Math.min(1, t));
    const cumulative = [0];

    for (let i = 1; i < vectors.length; i++) {
        cumulative[i] = cumulative[i - 1] + vectors[i].distanceTo(vectors[i - 1]);
    }

    const total = cumulative[cumulative.length - 1];
    if (total <= 0) return { passedPoints: [], aheadPoints: vectors };

    const targetLength = total * clampedT;
    if (targetLength <= 0) return { passedPoints: [], aheadPoints: vectors };
    if (targetLength >= total) return { passedPoints: vectors, aheadPoints: [] };

    let splitIndex = 1;
    while (splitIndex < cumulative.length && cumulative[splitIndex] < targetLength) splitIndex++;

    const prevLen = cumulative[splitIndex - 1];
    const segLen = cumulative[splitIndex] - prevLen;
    const segT = segLen > 0 ? (targetLength - prevLen) / segLen : 0;

    const splitPoint = vectors[splitIndex - 1].clone().lerp(vectors[splitIndex], segT);

    return {
        passedPoints: [...vectors.slice(0, splitIndex), splitPoint],
        aheadPoints: [splitPoint, ...vectors.slice(splitIndex)],
    };
}

function samplePolyline(points, count) {
    if (!points || points.length === 0) return [];
    if (points.length === 1 || count <= 1) return [points[0]];

    const cumulative = [0];
    for (let i = 1; i < points.length; i++) {
        cumulative[i] = cumulative[i - 1] + points[i].distanceTo(points[i - 1]);
    }

    const total = cumulative[cumulative.length - 1];
    if (total <= 1e-6) return [points[0]];

    const sampled = [];
    for (let i = 0; i < count; i++) {
        const target = total * (i / Math.max(1, count - 1));

        let idx = 1;
        while (idx < cumulative.length && cumulative[idx] < target) idx++;
        idx = Math.min(idx, cumulative.length - 1);

        const prevLen = cumulative[idx - 1];
        const segLen = cumulative[idx] - prevLen;
        const segT = segLen > 0 ? (target - prevLen) / segLen : 0;
        sampled.push(points[idx - 1].clone().lerp(points[idx], segT));
    }

    return sampled;
}

export function Route3D({ points, passedT = 0 }) {
    const { controls } = useThree();
    const [isInteracting, setIsInteracting] = useState(false);

    useEffect(() => {
        if (!controls?.addEventListener) return undefined;

        const handleStart = () => setIsInteracting(true);
        const handleEnd = () => setIsInteracting(false);

        controls.addEventListener('start', handleStart);
        controls.addEventListener('end', handleEnd);

        return () => {
            controls.removeEventListener('start', handleStart);
            controls.removeEventListener('end', handleEnd);
        };
    }, [controls]);

    const roundedPoints = useMemo(() => {
        if (!points || points.length < 2) return [];
        const vectors = points.map(p => new THREE.Vector3(p[0], p[1] + 0.01, p[2]));
        return buildRoundedVectors(vectors);
    }, [points]);

    const { passedPoints, aheadPoints } = useMemo(
        () => splitPolylineByT(roundedPoints, passedT),
        [roundedPoints, passedT]
    );

    if (roundedPoints.length < 2) return null;

    return (
        <group>
            {/* Base route underlay */}
            <Line
                points={roundedPoints}
                color="#ffffff"
                lineWidth={8}
                transparent
                opacity={0.22}
                depthWrite={false}
            />

            {/* Passed segment */}
            {passedPoints.length >= 2 && (
                <Line
                    points={passedPoints}
                    color="#8c99ad"
                    lineWidth={5}
                    transparent
                    opacity={0.9}
                    depthWrite={false}
                />
            )}

            {/* Ahead segment */}
            {aheadPoints.length >= 2 && (
                <>
                    <Line
                        points={aheadPoints}
                        color="#2f7df6"
                        lineWidth={5}
                        transparent
                        opacity={0.97}
                        depthWrite={false}
                    />
                    {!isInteracting && (
                        <>
                            <Line
                                points={aheadPoints}
                                color="#9ec5ff"
                                lineWidth={10}
                                transparent
                                opacity={0.26}
                                depthWrite={false}
                            />
                            <RouteDirectionDots points={aheadPoints} />
                        </>
                    )}
                </>
            )}
        </group>
    );
}

function RouteDirectionDots({ points }) {
    const dotsRef = useRef();
    const dotCount = 14;

    const positions = useMemo(() => {
        return samplePolyline(points, dotCount);
    }, [points, dotCount]);

    return (
        <group ref={dotsRef}>
            {positions.map((pos, idx) => (
                <mesh key={idx} position={[pos.x, pos.y + 0.01, pos.z]}>
                    <sphereGeometry args={[0.015, 8, 8]} />
                    <meshStandardMaterial
                        color="#9ec5ff"
                        emissive="#2f7df6"
                        emissiveIntensity={0.8}
                    />
                </mesh>
            ))}
        </group>
    );
}
