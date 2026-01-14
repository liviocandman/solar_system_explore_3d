/**
 * Texture Configuration
 * Maps bodyId to texture paths, visual properties, and orbital data
 */
import { BodyClass } from './scales';

// --- Types ---

export interface PlanetConfig {
  bodyId: string;
  name: string;
  englishName: string;
  type: 'STAR' | 'PLANET' | 'DWARF_PLANET';
  bodyClass: BodyClass;
  texturePath: string;
  fallbackColor: string;
  radius: number; // Scene units (will be computed dynamically if needed)
  rotationSpeed: number; // Radians per frame
  orbitalPeriod: number; // Earth days
  meanDistanceAU: number; // Astronomical Units from Sun
}

// --- Texture Map ---
// Initial radius values are placeholders, they should be derived from src/lib/scales.ts in the components

export const PLANET_CONFIG: Record<string, PlanetConfig> = {
  '10': {
    bodyId: '10',
    name: 'Sol',
    englishName: 'Sun',
    type: 'STAR',
    bodyClass: 'STAR',
    texturePath: '/textures/sun.webp',
    fallbackColor: '#FDB813',
    radius: 34.8, // Didactic radius
    rotationSpeed: 0.001,
    orbitalPeriod: 0,
    meanDistanceAU: 0,
  },
  '199': {
    bodyId: '199',
    name: 'Mercúrio',
    englishName: 'Mercury',
    type: 'PLANET',
    bodyClass: 'ROCKY_PLANET',
    texturePath: '/textures/mercury.webp',
    fallbackColor: '#8C7853',
    radius: 4.8,
    rotationSpeed: 0.001,
    orbitalPeriod: 88,
    meanDistanceAU: 0.387,
  },
  '299': {
    bodyId: '299',
    name: 'Vênus',
    englishName: 'Venus',
    type: 'PLANET',
    bodyClass: 'ROCKY_PLANET',
    texturePath: '/textures/venus.webp',
    fallbackColor: '#FFC649',
    radius: 12.1,
    rotationSpeed: 0.0005,
    orbitalPeriod: 225,
    meanDistanceAU: 0.723,
  },
  '399': {
    bodyId: '399',
    name: 'Terra',
    englishName: 'Earth',
    type: 'PLANET',
    bodyClass: 'ROCKY_PLANET',
    texturePath: '/textures/earth.webp',
    fallbackColor: '#6B93D6',
    radius: 12.7,
    rotationSpeed: 0.002,
    orbitalPeriod: 365,
    meanDistanceAU: 1.0,
  },
  '499': {
    bodyId: '499',
    name: 'Marte',
    englishName: 'Mars',
    type: 'PLANET',
    bodyClass: 'ROCKY_PLANET',
    texturePath: '/textures/mars.webp',
    fallbackColor: '#C1440E',
    radius: 6.7,
    rotationSpeed: 0.0019,
    orbitalPeriod: 687,
    meanDistanceAU: 1.524,
  },
  '599': {
    bodyId: '599',
    name: 'Júpiter',
    englishName: 'Jupiter',
    type: 'PLANET',
    bodyClass: 'GAS_GIANT',
    texturePath: '/textures/jupiter.webp',
    fallbackColor: '#D8CA9D',
    radius: 71.4,
    rotationSpeed: 0.004,
    orbitalPeriod: 4333,
    meanDistanceAU: 5.203,
  },
  '699': {
    bodyId: '699',
    name: 'Saturno',
    englishName: 'Saturn',
    type: 'PLANET',
    bodyClass: 'GAS_GIANT',
    texturePath: '/textures/saturn.webp',
    fallbackColor: '#EAD6B8',
    radius: 60.2,
    rotationSpeed: 0.0038,
    orbitalPeriod: 10759,
    meanDistanceAU: 9.537,
  },
  '799': {
    bodyId: '799',
    name: 'Urano',
    englishName: 'Uranus',
    type: 'PLANET',
    bodyClass: 'GAS_GIANT',
    texturePath: '/textures/uranus.webp',
    fallbackColor: '#D1E7E7',
    radius: 25.5,
    rotationSpeed: 0.003,
    orbitalPeriod: 30687,
    meanDistanceAU: 19.191,
  },
  '899': {
    bodyId: '899',
    name: 'Netuno',
    englishName: 'Neptune',
    type: 'PLANET',
    bodyClass: 'GAS_GIANT',
    texturePath: '/textures/neptune.webp',
    fallbackColor: '#5B5DDF',
    radius: 24.7,
    rotationSpeed: 0.0032,
    orbitalPeriod: 60190,
    meanDistanceAU: 30.069,
  },
};

// --- Helper Functions ---

/**
 * Get texture path for a body
 */
export function getTexturePath(bodyId: string): string {
  const config = PLANET_CONFIG[bodyId];
  if (!config) {
    console.warn(`[textureConfig] No config found for bodyId: ${bodyId}`);
    return '';
  }
  return config.texturePath;
}

/**
 * Get planet configuration by bodyId
 */
export function getPlanetConfig(bodyId: string): PlanetConfig | undefined {
  return PLANET_CONFIG[bodyId];
}

/**
 * Get all planet bodyIds (excluding Sun)
 */
export function getPlanetBodyIds(): string[] {
  return Object.keys(PLANET_CONFIG).filter(id => PLANET_CONFIG[id].type === 'PLANET');
}

/**
 * Get all body IDs including Sun
 */
export function getAllBodyIds(): string[] {
  return Object.keys(PLANET_CONFIG);
}

/**
 * Calculate distance between two bodies in millions of km
 */
export function calculateDistance(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;

  // Real distances in KM are handled directly now since we work with million km units
  const sceneDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return sceneDistance; // In million km
}
