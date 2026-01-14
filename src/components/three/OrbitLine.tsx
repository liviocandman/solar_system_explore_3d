'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

// --- Types ---

interface OrbitLineProps {
  /** Semi-major axis (a) in scene units (1u = 1M km) */
  semiMajorAxis: number;
  /** Orbital eccentricity (e) - 0=circle, closer to 1=more elliptical */
  eccentricity: number;
  /** Orbital inclination in degrees (i) */
  inclination: number;
  /** Longitude of ascending node in degrees (Ω) */
  longAscNode: number;
  /** Longitude of perihelion in degrees (ϖ) */
  longPerihelion: number;
  /** Hex color for the orbit line */
  color?: string;
  /** Opacity value (0-1) */
  opacity?: number;
  /** Number of segments to approximate the ellipse */
  segments?: number;
}

// --- Constants ---

const DEFAULT_COLOR = '#4a90d9';
const DEFAULT_OPACITY = 0.1;
const DEFAULT_SEGMENTS = 128;

// --- Helper: Convert degrees to radians ---
function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// --- Component ---

/**
 * Renders a Keplerian elliptical orbit with the Sun at one FOCUS.
 * 
 * Key transformations applied:
 * 1. Ellipse shape from semi-major (a) and semi-minor (b) axes
 * 2. Focal shift: translates geometry so (0,0,0) is at Sun's focus, not center
 * 3. Rotation hierarchy: Ω (ascending node) → i (inclination) → ω (periapsis)
 */
export function OrbitLine({
  semiMajorAxis,
  eccentricity,
  inclination,
  longAscNode,
  longPerihelion,
  color = DEFAULT_COLOR,
  opacity = DEFAULT_OPACITY,
  segments = DEFAULT_SEGMENTS,
}: OrbitLineProps) {
  // Generate ellipse points with focal shift
  const points = useMemo(() => {
    // 1. Calculate Semi-minor axis (b = a × √(1 - e²))
    const semiMinor = semiMajorAxis * Math.sqrt(1 - eccentricity * eccentricity);

    // 2. Calculate Focal Shift (c = a × e)
    // This is the distance from geometric center to focus (where Sun sits)
    const focusOffset = semiMajorAxis * eccentricity;

    // 3. Generate base ellipse curve
    const curve = new THREE.EllipseCurve(
      0, 0,                     // Center (temporarily at origin)
      semiMajorAxis, semiMinor, // xRadius (a), yRadius (b)
      0, 2 * Math.PI,           // Full loop
      false,                    // Clockwise
      0                         // No rotation (handled by groups)
    );

    const curvePoints = curve.getPoints(segments);

    // 4. Convert to 3D and APPLY FOCAL SHIFT
    // Subtract focusOffset from X so (0,0,0) becomes the Focus (Sun)
    return curvePoints.map(p => new THREE.Vector3(
      p.x - focusOffset, // Shift X so origin is at focus
      0,                 // Y=0 (orbit plane)
      p.y                // Map curve's Y to scene's Z
    ));
  }, [semiMajorAxis, eccentricity, segments]);

  // 5. Calculate rotation angles
  const Omega = degToRad(longAscNode);                    // Longitude of Ascending Node (Ω)
  const i = degToRad(inclination);                        // Inclination (i)
  const omega = degToRad(longPerihelion - longAscNode);   // Argument of Periapsis (ω = ϖ - Ω)

  return (
    // After Y↔Z swap in nasaClient.ts:
    // - Three.js Y = NASA Z (ecliptic north)
    // - Three.js Z = NASA Y
    // So for orbital elements:
    // - Ω: rotate around Three.js Y (ecliptic north) ✓
    // - i: tilt around X-axis (line of nodes after Ω rotation)
    // - ω: rotate around Y again (within tilted plane)
    <group rotation={[0, Omega, 0]}>{/* 1. Rotate to Ascending Node (Y-axis) */}
      <group rotation={[i, 0, 0]}>{/* 2. Tilt the Orbital Plane (X-axis) */}
        <group rotation={[0, omega, 0]}>{/* 3. Rotate Ellipse within Plane (Y-axis) */}
          <Line
            points={points}
            color={color}
            lineWidth={1} // Constant pixel width regardless of zoom
            transparent
            opacity={opacity}
          />
        </group>
      </group>
    </group>
  );
}


// --- Helper: Calculate opacity based on distance ---

/**
 * Returns an opacity value that decreases with distance.
 * Closer planets get higher opacity, distant planets are fainter.
 * @param distanceFromSun Distance in million km
 */
export function getOrbitOpacity(distanceFromSun: number): number {
  const minOpacity = 0.1;
  const maxOpacity = 0.5;

  // Logarithmic interpolation for smooth falloff
  const logMin = Math.log(50);   // ~Mercury
  const logMax = Math.log(5000); // ~Beyond Neptune
  const logDist = Math.log(Math.max(distanceFromSun, 50));

  // Inverse lerp: closer = higher opacity
  const t = (logDist - logMin) / (logMax - logMin);
  const clampedT = Math.max(0, Math.min(1, t));

  return maxOpacity - clampedT * (maxOpacity - minOpacity);
}
