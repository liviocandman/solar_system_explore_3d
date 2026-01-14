'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import type { Mesh } from 'three';
import { getDidacticRadius } from '@/lib/scales';

// --- Types ---

interface SunProps {
  radius?: number;
  lightIntensity?: number;
}

// --- Constants ---

const SUN_TEXTURE_PATH = '/textures/sun.webp';
const SUN_BODY_ID = '10';
// Computed didactic radius: (696000 / 1000000) * 50 = 34.8
const DEFAULT_RADIUS = getDidacticRadius(SUN_BODY_ID, 'STAR');
const DEFAULT_LIGHT_INTENSITY = 2;
const ROTATION_SPEED = 0.001;

// --- Component ---

export function Sun({
  radius = DEFAULT_RADIUS,
  lightIntensity = DEFAULT_LIGHT_INTENSITY,
}: SunProps) {
  const meshRef = useRef<Mesh>(null);
  const sunTexture = useTexture(SUN_TEXTURE_PATH);

  // Slow rotation animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += ROTATION_SPEED;
    }
  });

  return (
    <group>
      {/* Sun mesh with emissive glow */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={sunTexture}
          emissive="#ffaa00"
          emissiveIntensity={1.5}
          emissiveMap={sunTexture}
        />
      </mesh>

      {/* Point light for scene illumination */}
      <pointLight
        position={[0, 0, 0]}
        intensity={lightIntensity}
        color="#ffffff"
        distance={0}
        decay={0.5}
      />

      {/* Ambient glow effect (simple halo) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[radius * 1.2, 32, 32]} />
        <meshBasicMaterial
          color="#ffcc66"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
