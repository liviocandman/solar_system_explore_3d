'use client';

import { useRef } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import type { Mesh } from 'three';

// --- Types ---

interface CelestialBodyProps {
  name: string;
  position: [number, number, number];
  radius: number;
  textureUrl: string;
  rotationSpeed?: number;
  onClick?: (name: string) => void;
}

// --- Constants ---

const DEFAULT_ROTATION_SPEED = 0.002;

// --- Component ---

export function CelestialBody({
  name,
  position,
  radius,
  textureUrl,
  rotationSpeed = DEFAULT_ROTATION_SPEED,
  onClick,
}: CelestialBodyProps) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(textureUrl);

  // Self-rotation animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  // Click handler
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (onClick) {
      onClick(name);
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={handleClick}
    >
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
