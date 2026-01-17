'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import type { Mesh } from 'three';
import { getDidacticRadius } from '@/lib/scales';
import { getTexturePath, TextureTier } from '@/lib/textureConfig';
import { useQualityTier } from '@/contexts/QualityTierContext';

// --- Types ---

interface SunProps {
  radius?: number;
  lightIntensity?: number;
}

// --- Constants ---

const SUN_BODY_ID = '10';
// Computed didactic radius: (696000 / 1000000) * 50 = 34.8
const DEFAULT_RADIUS = getDidacticRadius(SUN_BODY_ID, 'STAR');
const DEFAULT_LIGHT_INTENSITY = 3.5; // Intense point light for dramatic scene
const ROTATION_SPEED = 0.001;

// --- Component ---

export function Sun({
  radius = DEFAULT_RADIUS,
  lightIntensity = DEFAULT_LIGHT_INTENSITY,
}: SunProps) {
  const meshRef = useRef<Mesh>(null);
  const { tier } = useQualityTier();
  const texturePath = getTexturePath(SUN_BODY_ID, tier as TextureTier);
  const sunTexture = useTexture(texturePath);

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
          emissiveIntensity={3}
          emissiveMap={sunTexture}
        />
      </mesh>

      {/* Point light for scene illumination */}
      <pointLight
        position={[0, 0, 0]}
        intensity={lightIntensity}
        color="#ffffff"
        distance={20000}
        decay={0}
        castShadow
      />

      {/* Ambient glow effect (simple halo) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[radius * 1.2, 64, 64]} />
        <meshBasicMaterial
          color="#ffcc66"
          transparent
          opacity={0.001}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
