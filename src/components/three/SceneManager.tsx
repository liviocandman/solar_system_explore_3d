'use client';

import { Suspense, ReactNode, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { QualityTierProvider, useQualityTier } from '@/contexts/QualityTierContext';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Sun } from './Sun';
import { CelestialBody } from './CelestialBody';
import type { EphemerisData } from '@/lib/types';
import { getPlanetConfig } from '@/lib/textureConfig';
import { getDidacticRadius, scalePositionFromKm, AU_TO_UNIT } from '@/lib/scales';
import { CameraController } from '@/hooks/useCameraAnimation';
import { OrbitLine, getOrbitOpacity } from './OrbitLine';
import * as THREE from 'three';

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

// --- Helper Components ---

function SelectionRing({ position, radius }: { position: [number, number, number]; radius: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smooth rotation
    meshRef.current.rotation.z += 0.01;

    // Subtle pulse
    const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[Math.PI / 2, 0, 0]}>
      {/* Parameters: radius, tube, radialSegments, tubularSegments */}
      <torusGeometry args={[radius * 1.5, 0.05 * (radius / 10), 16, 100]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// --- Constants ---

const CAMERA_CONFIG = {
  position: [0, 200, 500] as [number, number, number], // Scaled initial position
  fov: 45,
  near: 0.1,
  far: 20000,
};

const SUN_BODY_ID = '10';

/**
 * Calculates real distance from Sun in million km
 * Since 1 unit = 1M km, this is just the magnitude of the position vector
 */
function calculateMillionKmFromSun(position: [number, number, number]): number {
  const [x, y, z] = position;
  return Math.sqrt(x * x + y * y + z * z);
}

// --- Inner Scene Component ---

function SceneContent({
  children,
  ephemerisData,
  onPlanetClick,
  selectedPlanetId,
  selectedPlanetPosition
}: SceneContentProps) {
  const { settings, tier } = useQualityTier();

  const planetsToRender = (() => {
    if (!ephemerisData || ephemerisData.length === 0) {
      return [];
    }

    return ephemerisData
      .filter(body => body.bodyId !== SUN_BODY_ID) // Exclude Sun (rendered separately)
      .map(body => {
        const config = getPlanetConfig(body.bodyId);
        if (!config) return null;

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
      const selected: SelectedPlanet = {
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
      onPlanetClick(selected);
    }
  };

  const selectedPlanet = planetsToRender.find(p => p?.bodyId === selectedPlanetId);

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
      <ambientLight intensity={0.15} />

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
        maxDistance={12000}
        enablePan
        panSpeed={0.5}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />

      {/* Sun at center */}
      <Sun />

      {/* Keplerian orbital path lines - ellipses with Sun at focus */}
      {planetsToRender.map((planet) => {
        if (!planet) return null;
        const config = getPlanetConfig(planet.bodyId);
        if (!config) return null;

        // Calculate semi-major axis from meanDistanceAU (1 AU = 149.6 scene units)
        const semiMajorAxis = config.meanDistanceAU * AU_TO_UNIT;

        return (
          <OrbitLine
            key={`orbit-${planet.bodyId}`}
            semiMajorAxis={semiMajorAxis}
            eccentricity={config.eccentricity}
            inclination={config.orbitalInclination}
            longAscNode={config.longAscNode}
            longPerihelion={config.longPerihelion}
            opacity={getOrbitOpacity(planet.distanceFromSun)}
            color="#4a90d9"
          />
        );
      })}

      {/* Dynamically render all planets from ephemeris data */}
      {planetsToRender.map((planet) => {
        if (!planet) return null;
        return (
          <CelestialBody
            key={planet.bodyId}
            name={planet.name}
            position={planet.position}
            radius={planet.radius}
            textureUrl={planet.texturePath}
            rotationSpeed={planet.rotationSpeed}
            onClick={handlePlanetClick}
          />
        );
      })}

      {/* Selection Ring */}
      {selectedPlanet && (
        <SelectionRing
          position={selectedPlanet.position}
          radius={selectedPlanet.radius}
        />
      )}

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
        className="fixed inset-0 overflow-hidden bg-[#000]"
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
