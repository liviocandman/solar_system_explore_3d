'use client';

import { CelestialBody } from './CelestialBody';

// --- Types ---

interface EarthProps {
  position?: [number, number, number];
  onClick?: (name: string) => void;
}

// --- Constants ---

const EARTH_TEXTURE_PATH = '/textures/earth.webp';
const EARTH_RADIUS = 1;
const EARTH_ROTATION_SPEED = 0.003;
const DEFAULT_POSITION: [number, number, number] = [30, 0, 0];

// --- Component ---

export function Earth({
  position = DEFAULT_POSITION,
  onClick,
}: EarthProps) {
  return (
    <CelestialBody
      name="Earth"
      position={position}
      radius={EARTH_RADIUS}
      textureUrl={EARTH_TEXTURE_PATH}
      rotationSpeed={EARTH_ROTATION_SPEED}
      onClick={onClick}
    />
  );
}
