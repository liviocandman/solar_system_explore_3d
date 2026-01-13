/**
 * Texture Configuration
 * Maps bodyId to texture paths, visual properties, and orbital data
 */


// --- Types ---

export interface PlanetConfig {
  bodyId: string;
  name: string;
  englishName: string;
  type: 'STAR' | 'PLANET' | 'DWARF_PLANET';
  texturePath: string;
  fallbackColor: string;
  radius: number; // Scene units
  rotationSpeed: number; // Radians per frame
  orbitalPeriod: number; // Earth days
  meanDistanceAU: number; // Astronomical Units from Sun
}

// --- Texture Map ---

export const PLANET_CONFIG: Record<string, PlanetConfig> = {
  '10': {
    bodyId: '10',
    name: 'Sol',
    englishName: 'Sun',
    type: 'STAR',
    texturePath: '/textures/sun.webp',
    fallbackColor: '#FDB813',
    radius: 10,
    rotationSpeed: 0.001,
    orbitalPeriod: 0,
    meanDistanceAU: 0,
  },
  '199': {
    bodyId: '199',
    name: 'Mercúrio',
    englishName: 'Mercury',
    type: 'PLANET',
    texturePath: '/textures/mercury.webp',
    fallbackColor: '#8C7853',
    radius: 0.8,
    rotationSpeed: 0.001,
    orbitalPeriod: 88,
    meanDistanceAU: 0.387,
  },
  '299': {
    bodyId: '299',
    name: 'Vênus',
    englishName: 'Venus',
    type: 'PLANET',
    texturePath: '/textures/venus.webp',
    fallbackColor: '#FFC649',
    radius: 1.2,
    rotationSpeed: 0.0005,
    orbitalPeriod: 225,
    meanDistanceAU: 0.723,
  },
  '399': {
    bodyId: '399',
    name: 'Terra',
    englishName: 'Earth',
    type: 'PLANET',
    texturePath: '/textures/earth.webp',
    fallbackColor: '#6B93D6',
    radius: 1.3,
    rotationSpeed: 0.002,
    orbitalPeriod: 365,
    meanDistanceAU: 1.0,
  },
  '499': {
    bodyId: '499',
    name: 'Marte',
    englishName: 'Mars',
    type: 'PLANET',
    texturePath: '/textures/mars.webp',
    fallbackColor: '#C1440E',
    radius: 1.0,
    rotationSpeed: 0.0019,
    orbitalPeriod: 687,
    meanDistanceAU: 1.524,
  },
  '599': {
    bodyId: '599',
    name: 'Júpiter',
    englishName: 'Jupiter',
    type: 'PLANET',
    texturePath: '/textures/jupiter.webp',
    fallbackColor: '#D8CA9D',
    radius: 4.0,
    rotationSpeed: 0.004,
    orbitalPeriod: 4333,
    meanDistanceAU: 5.203,
  },
  '699': {
    bodyId: '699',
    name: 'Saturno',
    englishName: 'Saturn',
    type: 'PLANET',
    texturePath: '/textures/saturn.webp',
    fallbackColor: '#EAD6B8',
    radius: 3.5,
    rotationSpeed: 0.0038,
    orbitalPeriod: 10759,
    meanDistanceAU: 9.537,
  },
  '799': {
    bodyId: '799',
    name: 'Urano',
    englishName: 'Uranus',
    type: 'PLANET',
    texturePath: '/textures/uranus.webp',
    fallbackColor: '#D1E7E7',
    radius: 2.0,
    rotationSpeed: 0.003,
    orbitalPeriod: 30687,
    meanDistanceAU: 19.191,
  },
  '899': {
    bodyId: '899',
    name: 'Netuno',
    englishName: 'Neptune',
    type: 'PLANET',
    texturePath: '/textures/neptune.webp',
    fallbackColor: '#5B5DDF',
    radius: 1.9,
    rotationSpeed: 0.0032,
    orbitalPeriod: 60190,
    meanDistanceAU: 30.069,
  },
};

// --- Helper Functions ---

/**
 * Get texture path for a body
 * TODO: Add LOD support based on quality tier when multiple texture resolutions are available
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
  // Scene units to AU: 30 units = 1 AU
  // AU to million km: 1 AU = 149.6 million km
  const sceneDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const auDistance = sceneDistance / 30;
  return auDistance * 149.6;
}
