'use client';

import * as THREE from 'three';

// --- Types ---

interface PlanetMarkerProps {
  color?: string;
  opacity?: number;
  size?: number;
}

// --- Component ---

/**
 * PlanetMarker - A simple glowing sphere that marks planet positions
 * Used in realistic mode to keep tiny planets visible at distance
 * 
 * Features:
 * - No texture dependency (pure geometry + material)
 * - Emissive glow effect
 * - Always visible (no depth write)
 */
export function PlanetMarker({
  color = '#ffffff',
  opacity = 0.8,
  size = 0.1,
}: PlanetMarkerProps) {
  return (
    <mesh>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
