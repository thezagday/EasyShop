import React, { Suspense, useEffect, useMemo } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SCALE, MAP_WIDTH, MAP_HEIGHT } from './constants';

const FLOOR_W = MAP_WIDTH * SCALE;
const FLOOR_H = MAP_HEIGHT * SCALE;

function FloorWithTexture({ mapImageUrl }) {
    const { gl } = useThree();
    const texture = useLoader(THREE.TextureLoader, mapImageUrl);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());

    const processedTexture = useMemo(() => {
        const image = texture?.image;
        if (!image || !image.width || !image.height) {
            return texture;
        }

        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return texture;
        }

        ctx.drawImage(image, 0, 0);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = img.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luma = (r + g + b) / 3;

            // Keep a white-friendly base while preserving map details.
            const gain = 1.06;
            const baseLift = 7;
            const darkBoost = luma < 70 ? 8 : 0;

            let nr = Math.min(255, r * gain + baseLift + darkBoost);
            let ng = Math.min(255, g * gain + baseLift + darkBoost);
            let nb = Math.min(255, b * gain + baseLift + darkBoost);

            const boostedLuma = (nr + ng + nb) / 3;
            if (boostedLuma > 244) {
                nr = 255;
                ng = 255;
                nb = 255;
            }

            data[i] = nr;
            data[i + 1] = ng;
            data[i + 2] = nb;
        }

        ctx.putImageData(img, 0, 0);

        const nextTexture = new THREE.CanvasTexture(canvas);
        nextTexture.minFilter = THREE.LinearFilter;
        nextTexture.magFilter = THREE.LinearFilter;
        nextTexture.colorSpace = THREE.SRGBColorSpace;
        nextTexture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
        nextTexture.needsUpdate = true;
        return nextTexture;
    }, [gl, texture]);

    useEffect(() => {
        return () => {
            if (processedTexture !== texture) {
                processedTexture.dispose();
            }
        };
    }, [processedTexture, texture]);

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            receiveShadow
        >
            <planeGeometry args={[FLOOR_W, FLOOR_H]} />
            <meshBasicMaterial map={processedTexture} />
        </mesh>
    );
}

function FloorFallback() {
    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            receiveShadow
        >
            <planeGeometry args={[FLOOR_W, FLOOR_H]} />
            <meshBasicMaterial color="#ffffff" />
        </mesh>
    );
}

export function Floor({ mapImageUrl }) {
    return (
        <group>
            {/* Main floor plane with map texture */}
            {mapImageUrl ? (
                <Suspense fallback={<FloorFallback />}>
                    <FloorWithTexture mapImageUrl={mapImageUrl} />
                </Suspense>
            ) : (
                <FloorFallback />
            )}

            {/* Ground plane beneath (shadow catcher + border) */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.02, 0]}
                receiveShadow
            >
                <planeGeometry args={[FLOOR_W + 4, FLOOR_H + 4]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
        </group>
    );
}
