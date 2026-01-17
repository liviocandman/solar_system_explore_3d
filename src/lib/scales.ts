/**
 * Scale System Utilities
 * Core Principle: 1 Three.js Unit = 1,000,000 km (1 Million km)
 */

// Conversion factor: km to Three.js units
export const KM_TO_UNIT = 1 / 1_000_000;

// Conversion factor: AU to Three.js units (1 AU = 149.6 million km)
export const AU_TO_UNIT = 149.59787;


// Didactic visual multipliers
// These inflate objects so they are visible while maintaining relative position accuracy
export const DIDACTIC_SCALE = {
  SUN: 50,
  GAS_GIANT: 400,
  ROCKY_PLANET: 2000,
  MOON: 3000,
};

// Planet type classification
export type BodyClass = 'STAR' | 'GAS_GIANT' | 'ROCKY_PLANET' | 'DWARF_PLANET' | 'MOON';

// Real radii in km (source: NASA)
export const REAL_RADII_KM: Record<string, number> = {
  '10': 696000,    // Sun
  '199': 2440,     // Mercury
  '299': 6052,     // Venus
  '399': 6371,     // Earth
  '499': 3390,     // Mars
  '599': 71492,    // Jupiter (equatorial)
  '699': 60268,    // Saturn (equatorial)
  '799': 25559,    // Uranus (equatorial)
  '899': 24764,    // Neptune (equatorial)
};

/**
 * Converts real radius in km to didactic rendering units
 */
export function getDidacticRadius(bodyId: string, bodyClass: BodyClass): number {
  const realRadiusKm = REAL_RADII_KM[bodyId] || 1000;
  const baseRadius = realRadiusKm * KM_TO_UNIT;

  switch (bodyClass) {
    case 'STAR':
      return baseRadius * DIDACTIC_SCALE.SUN;
    case 'GAS_GIANT':
      return baseRadius * DIDACTIC_SCALE.GAS_GIANT;
    case 'ROCKY_PLANET':
    case 'DWARF_PLANET':
      return baseRadius * DIDACTIC_SCALE.ROCKY_PLANET;
    case 'MOON':
      return baseRadius * DIDACTIC_SCALE.MOON;
    default:
      return baseRadius * DIDACTIC_SCALE.ROCKY_PLANET;
  }
}

/**
 * Converts position from real km to scene units
 */
export function scalePositionFromKm(x: number, y: number, z: number): [number, number, number] {
  return [
    x * KM_TO_UNIT,
    y * KM_TO_UNIT,
    z * KM_TO_UNIT
  ];
}

/**
 * Converts scene units back to million km for display
 */
export function unitToMillionKm(units: number): number {
  return units; // Since 1 unit = 1 million km
}
