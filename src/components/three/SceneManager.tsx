'use client';

import { Suspense, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { QualityTierProvider, useQualityTier } from '@/contexts/QualityTierContext';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Sun } from './Sun';
import { CelestialBody } from './CelestialBody';
import type { EphemerisData } from '@/lib/types';
import { getPlanetConfig } from '@/lib/textureConfig';
import { getDidacticRadius, scalePositionFromKm } from '@/lib/scales';
import { CameraController } from '@/hooks/useCameraAnimation';

// --- Types ---

export interface SelectedPlanet {
  bodyId: string;
  name: string;
  englishName: string;
  position: { x: number; y: number; z: number };
  distanceFromSun: number;
}

interface SceneManagerProps {
  children?: ReactNode;
  ephemerisData?: EphemerisData[];
  onPlanetClick?: (planet: SelectedPlanet | null) => void;
  selectedPlanetId?: string | null;
  selectedPlanetPosition?: { x: number; y: number; z: number } | null;
}

interface SceneContentProps {
  children?: ReactNode;
  ephemerisData?: EphemerisData[];
  onPlanetClick?: (planet: SelectedPlanet | null) => void;
  selectedPlanetId?: string | null;
  selectedPlanetPosition?: { x: number; y: number; z: number } | null;
}

// --- Constants ---

const CAMERA_CONFIG = {
  position: [0, 200, 500] as [number, number, number], // Scaled initial position
  fov: 45,
  near: 0.1,
  far: 20000, // Optimized for 1 unit = 1M km
};

// Sun body ID (excluded from planet rendering)
const SUN_BODY_ID = '10';

/**
 * Calculates real distance from Sun in million km
 * Since 1 unit = 1M km, this is just the magnitude of the position vector
 */
function calculateMillionKmFromSun(position: [number, number, number]): number {
  const [x, y, z] = position;
  return Math.sqrt(x * x + y * y + z * z);
}

// --- Inner Scene Component (uses quality context) ---

function SceneContent({
  children,
  ephemerisData,
  onPlanetClick,
  selectedPlanetId,
  selectedPlanetPosition
}: SceneContentProps) {
  const { settings, tier } = useQualityTier();

  // React 19 compiler auto-memoizes - plain computation
  const planetsToRender = (() => {
    if (!ephemerisData || ephemerisData.length === 0) {
      return [];
    }

    return ephemerisData
      .filter(body => body.bodyId !== SUN_BODY_ID) // Exclude Sun (rendered separately)
      .map(body => {
        const config = getPlanetConfig(body.bodyId);
        if (!config) {
          console.warn(`[SceneContent] No config for bodyId: ${body.bodyId}`);
          return null;
        }

        // Scale real km position to scene units
        const position = scalePositionFromKm(
          body.position.x,
          body.position.y,
          body.position.z
        );

        return {
          bodyId: body.bodyId,
          name: config.name,
          englishName: config.englishName,
          position,
          radius: getDidacticRadius(body.bodyId, config.bodyClass),
          texturePath: config.texturePath,
          rotationSpeed: config.rotationSpeed,
          distanceFromSun: calculateMillionKmFromSun(position),
        };
      })
      .filter(Boolean);
  })();

  // Handle planet click - create SelectedPlanet and call callback
  const handlePlanetClick = (name: string) => {
    if (!onPlanetClick) return;

    // Find the planet by name
    const planet = planetsToRender.find(p => p?.name === name);

    if (planet) {
      const selectedPlanet: SelectedPlanet = {
        bodyId: planet.bodyId,
        name: planet.name,
        englishName: planet.englishName,
        position: {
          x: planet.position[0],
          y: planet.position[1],
          z: planet.position[2],
        },
        distanceFromSun: planet.distanceFromSun,
      };

      console.log(`[Scene] Planet selected: ${planet.englishName}`, selectedPlanet);
      onPlanetClick(selectedPlanet);
    }
  };

  return (
    <Canvas
      camera={CAMERA_CONFIG}
      dpr={settings.devicePixelRatio}
      gl={{
        antialias: settings.antialias,
        powerPreference: tier === 'low' ? 'low-power' : 'high-performance',
      }}
      style={{ width: '100%', height: '100%' }}
      onPointerMissed={() => {
        // Click on empty space = deselect
        if (onPlanetClick) {
          onPlanetClick(null);
        }
      }}
    >
      {/* Ambient light for base visibility */}
      <ambientLight intensity={0.1} />

      {/* Stars background */}
      <Stars
        radius={1000} // Expanded for larger scale
        depth={300}
        count={tier === 'low' ? 2000 : 5000}
        factor={10}
        fade
        speed={0.5}
      />

      {/* Orbit controls for navigation */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={1}
        maxDistance={12000} // Neptune is at ~4500, extra room for viewing
        enablePan
        panSpeed={0.5}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />

      {/* Sun at center */}
      <Sun />

      {/* Dynamically render all planets from ephemeris data */}
      {planetsToRender.map((planet) => {
        if (!planet) return null;

        const isSelected = selectedPlanetId === planet.bodyId;

        return (
          <CelestialBody
            key={planet.bodyId}
            name={planet.name}
            position={planet.position}
            radius={planet.radius * (isSelected ? 1.1 : 1)} // Slight scale on selection
            textureUrl={planet.texturePath}
            rotationSpeed={planet.rotationSpeed}
            onClick={handlePlanetClick}
          />
        );
      })}

      {/* Camera animation controller */}
      <CameraController targetPosition={selectedPlanetPosition} />

      {/* Additional scene content */}
      {children}
    </Canvas>
  );
}

// --- Main Component ---

export function SceneManager({
  children,
  ephemerisData,
  onPlanetClick,
  selectedPlanetId,
  selectedPlanetPosition
}: SceneManagerProps) {
  return (
    <QualityTierProvider>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <SceneContent
            ephemerisData={ephemerisData}
            onPlanetClick={onPlanetClick}
            selectedPlanetId={selectedPlanetId}
            selectedPlanetPosition={selectedPlanetPosition}
          >
            {children}
          </SceneContent>
        </Suspense>
      </div>
    </QualityTierProvider>
  );
}
