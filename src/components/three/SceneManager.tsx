'use client';

import { Suspense, ReactNode, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { QualityTierProvider, useQualityTier } from '@/contexts/QualityTierContext';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Sun } from './Sun';
import { Earth } from './Earth';
import type { EphemerisData } from '@/lib/types';
import { BODY_IDS } from '@/lib/types';

// --- Types ---

interface SceneManagerProps {
  children?: ReactNode;
  ephemerisData?: EphemerisData[];
}

interface SceneContentProps {
  children?: ReactNode;
  ephemerisData?: EphemerisData[];
}

// --- Constants ---

const CAMERA_CONFIG = {
  position: [0, 50, 150] as [number, number, number],
  fov: 45,
  near: 0.1,
  far: 50000,
};

// Default positions (used when ephemeris data not available)
const DEFAULT_EARTH_POSITION: [number, number, number] = [30, 0, 0];

// --- Helper Functions ---

function getBodyPosition(
  ephemerisData: EphemerisData[] | undefined,
  bodyId: string,
  defaultPosition: [number, number, number]
): [number, number, number] {
  if (!ephemerisData || ephemerisData.length === 0) {
    return defaultPosition;
  }

  const body = ephemerisData.find(b => b.bodyId === bodyId);
  if (body) {
    return [body.position.x, body.position.y, body.position.z];
  }

  return defaultPosition;
}

// --- Inner Scene Component (uses quality context) ---

function SceneContent({ children, ephemerisData }: SceneContentProps) {
  const { settings, tier } = useQualityTier();

  // Memoize positions to avoid recalculating on every render
  const earthPosition = useMemo(
    () => getBodyPosition(ephemerisData, BODY_IDS.EARTH, DEFAULT_EARTH_POSITION),
    [ephemerisData]
  );

  const handlePlanetClick = (name: string) => {
    console.log(`[Scene] Planet clicked: ${name}`);
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
    >
      {/* Ambient light for base visibility */}
      <ambientLight intensity={0.1} />

      {/* Stars background */}
      <Stars
        radius={300}
        depth={60}
        count={tier === 'low' ? 2000 : 5000}
        factor={4}
        fade
        speed={0.5}
      />

      {/* Orbit controls for navigation */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={500}
        enablePan
        panSpeed={0.5}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />

      {/* Sun at center */}
      <Sun />

      {/* Earth with ephemeris position */}
      <Earth position={earthPosition} onClick={handlePlanetClick} />

      {/* Additional scene content */}
      {children}
    </Canvas>
  );
}

// --- Main Component ---

export function SceneManager({ children, ephemerisData }: SceneManagerProps) {
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
          <SceneContent ephemerisData={ephemerisData}>{children}</SceneContent>
        </Suspense>
      </div>
    </QualityTierProvider>
  );
}

