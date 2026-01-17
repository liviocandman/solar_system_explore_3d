'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { useTexture, Text, Billboard } from '@react-three/drei';
import type { Mesh } from 'three';
import * as THREE from 'three';
import '../../app/globals.css';

// --- Types ---

interface CelestialBodyProps {
  name: string;
  englishName: string;
  bodyId: string;
  position: [number, number, number];
  radius: number;
  textureUrl: string;
  rotationSpeed?: number;
  onClick?: (bodyId: string) => void;
}

// --- Constants ---

const DEFAULT_ROTATION_SPEED = 0.002;
const LABEL_COLOR = '#a3cffe';

// Adaptive scaling constants
const BASE_FONT_SIZE = 5; // Base font size in 3D units
const MIN_FONT_SIZE = 2; // Smaller when close
const MAX_FONT_SIZE = 100; // Much larger when zoomed out far
const SCALE_BASE_DISTANCE = 100; // Lower base for faster growth
const THROTTLE_FRAMES = 10; // Check every 10 frames

// --- Component ---

export function CelestialBody({
  name,
  englishName,
  bodyId,
  position,
  radius,
  textureUrl,
  rotationSpeed = DEFAULT_ROTATION_SPEED,
  onClick,
}: CelestialBodyProps) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture(textureUrl);
  const [fontSize, setFontSize] = useState(BASE_FONT_SIZE);
  const { camera } = useThree();

  // Reuse Vector3 to avoid GC pressure
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const frameCountRef = useRef(0);

  // Self-rotation animation + throttled font size calculation
  useFrame(() => {
    // Planet rotation (every frame)
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }

    // Throttled font size check
    frameCountRef.current++;
    if (frameCountRef.current % THROTTLE_FRAMES !== 0) return;

    // Calculate distance from camera to planet
    tempVec.set(position[0], position[1], position[2]);
    const distance = camera.position.distanceTo(tempVec);

    // Linear scaling based on distance
    // Close (distance < 100): very small labels to avoid overlap
    // Medium (100-800): small to medium labels
    // Far (800+): large labels for visibility at max zoom
    let newFontSize: number;

    if (distance < 100) {
      // Close up: tiny labels to avoid overlap
      newFontSize = 0.5 + (distance / 100) * 1; // 0.5 to 1.5
    } else if (distance < 6000) {
      // Medium range: gradual growth
      newFontSize = 1.5 + ((distance - 100) / 700) * 6.5; // 1.5 to 8
    } else {
      // Far away: aggressive growth for visibility
      newFontSize = 8 + Math.min(192, ((distance - 6000) / 4200) * 192); // 8 to 200
    }

    newFontSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newFontSize));

    // Only update if changed significantly
    if (Math.abs(newFontSize - fontSize) > 0.5) {
      setFontSize(newFontSize);
    }
  });

  // Click handler - emits bodyId for reliable lookup
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (onClick) {
      onClick(bodyId);
    }
  };

  return (
    <group position={position}>
      {/* Planet mesh */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          emissive={0x333333}
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* 3D Text Label
          - Naturally occluded by GPU depth buffer
          - Billboard keeps text always facing the camera
          - fontSize scales with camera distance (larger when zoomed out)
      */}
      <Billboard
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <Text
          position={[0, -radius * 1.2, 0]}
          fontSize={fontSize}
          color={LABEL_COLOR}
          anchorX="center"
          anchorY="top"
          outlineWidth={fontSize * 0.04}
          outlineColor="#000000"
        >
          {englishName.toUpperCase()}
        </Text>
      </Billboard>
    </group>
  );
}
