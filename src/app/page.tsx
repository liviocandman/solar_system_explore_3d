'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Toaster, toast } from 'sonner';
import { useEphemeris } from '@/hooks/useEphemeris';
import { useLoadingProgress } from '@/hooks/useLoadingProgress';
import { useWebGLError } from '@/hooks/useWebGLError';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ErrorOverlay } from '@/components/ui/ErrorOverlay';
import { HUD } from '@/components/ui/HUD';
import { BODY_IDS } from '@/lib/types';
import type { AppError } from '@/components/ui/ErrorOverlay';
import type { SelectedPlanet } from '@/components/three/SceneManager';
import type { ViewMode } from '@/lib/scales';

// Dynamically import SceneManager with SSR disabled
// This prevents hydration mismatch errors with Three.js/R3F
const SceneManager = dynamic(
  () => import('@/components/three/SceneManager').then(mod => mod.SceneManager),
  { ssr: false }
);

// --- Date Utilities ---

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;

  // JPL Horizons limits: 1600-01-01 to 2500-01-01
  const minDate = new Date('1600-01-01');
  const maxDate = new Date('2500-01-01');

  return date >= minDate && date <= maxDate;
}

// --- Component ---

export default function Home() {
  // Current simulation date state
  const [currentDate, setCurrentDate] = useState<string>(getTodayString());

  // Use the useEphemeris hook for data fetching with error handling
  const {
    data: ephemerisData,
    isLoading,
    error: ephemerisError,
    source,
    isFallback,
    retry,
    retryCount,
    refresh
  } = useEphemeris({ date: currentDate });

  // WebGL error detection
  const { error: webglError, isSupported: isWebGLSupported } = useWebGLError();

  // Track loading progress
  const loadingProgress = useLoadingProgress({
    isApiLoading: isLoading,
    hasApiData: ephemerisData.length > 0,
  });

  // Selected planet state for HUD
  const [selectedPlanet, setSelectedPlanet] = useState<SelectedPlanet | null>(null);

  // View mode state: 'didactic' (inflated) or 'realistic' (true scale)
  const [viewMode, setViewMode] = useState<ViewMode>('didactic');

  // Travel target state - separate from selection (only set on double-click)
  const [travelTarget, setTravelTarget] = useState<{ x: number; y: number; z: number } | null>(null);
  const [travelTargetRadius, setTravelTargetRadius] = useState<number | undefined>(undefined);

  // Get Earth position for distance calculations
  const earthPosition = useMemo(() => {
    const earth = ephemerisData.find(body => body.bodyId === BODY_IDS.EARTH);
    if (earth) {
      return {
        x: earth.position.x,
        y: earth.position.y,
        z: earth.position.z,
      };
    }
    return undefined;
  }, [ephemerisData]);

  // Combine errors - WebGL errors take priority
  const activeError: AppError | null = webglError ?? (ephemerisError ? {
    type: ephemerisError.type,
    message: ephemerisError.message,
    technicalDetails: ephemerisError.technicalDetails,
    canRetry: ephemerisError.canRetry,
  } : null);

  // Only show error overlay for critical errors (not when fallback is working)
  const showErrorOverlay = activeError && (!isFallback || !isWebGLSupported);

  // Handle date change with validation
  const handleDateChange = (newDate: string) => {
    if (!isValidDate(newDate)) {
      toast.error('Data inválida', {
        description: 'A data deve estar entre 1600 e 2500.',
      });
      return;
    }

    setCurrentDate(newDate);
    // Clear selection when date changes
    setSelectedPlanet(null);

    console.log(`[Home] Date changed to: ${newDate}`);
  };

  // Show toast notifications based on data source
  useEffect(() => {
    if (isLoading || !source) return;

    if (source === 'FALLBACK_DATASET') {
      toast.warning('Modo Offline: Posições aproximadas', {
        description: 'Usando dados de fallback. API NASA indisponível.',
        duration: 5000,
      });
    } else if (source === 'CACHE_HIT') {
      toast.success('Dados carregados do cache', {
        duration: 2000,
      });
    } else if (source === 'NASA_LIVE') {
      toast.success('Dados ao vivo da NASA', {
        duration: 2000,
      });
    }

    console.log(`[Home] Ephemeris loaded - Source: ${source}, Bodies: ${ephemerisData.length}, Date: ${currentDate}`);
  }, [source, isLoading, ephemerisData.length, currentDate]);

  // Handle planet selection (single click) - show info only, no travel
  const handlePlanetClick = (planet: SelectedPlanet | null) => {
    setSelectedPlanet(planet);

    if (planet) {
      console.log(`[Home] Planet selected: ${planet.englishName}`);
    } else {
      console.log('[Home] Planet deselected');
    }
  };

  // Handle planet double-click - switch to realistic + travel
  const handlePlanetDoubleClick = (planet: SelectedPlanet) => {
    setSelectedPlanet(planet);
    setViewMode('realistic'); // Always switch to realistic on double-click
    setTravelTarget(planet.position); // This triggers camera travel
    setTravelTargetRadius(planet.radius); // For adaptive zoom distance
    console.log(`[Home] Traveling to: ${planet.englishName}, radius: ${planet.radius}`);
  };

  // Show loading screen while loading
  const showLoadingScreen = loadingProgress.stage !== 'ready' && !showErrorOverlay;

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />

      {/* Error overlay for critical errors */}
      {showErrorOverlay && activeError && (
        <ErrorOverlay
          error={activeError}
          onRetry={retry}
          retryCount={retryCount}
          maxRetries={3}
          isFallbackActive={isFallback}
        />
      )}

      {/* Loading screen with progress */}
      {showLoadingScreen && (
        <LoadingScreen progress={loadingProgress} />
      )}

      {/* Scene (renders behind loading screen during load) */}
      {isWebGLSupported && (
        <SceneManager
          ephemerisData={ephemerisData}
          onPlanetClick={handlePlanetClick}
          onPlanetDoubleClick={handlePlanetDoubleClick}
          selectedPlanetId={selectedPlanet?.bodyId}
          travelTarget={travelTarget}
          travelTargetRadius={travelTargetRadius}
          viewMode={viewMode}
        />
      )}

      {/* HUD - Responsive sidebar (desktop) / bottom sheet (mobile) */}
      {!showLoadingScreen && !showErrorOverlay && (
        <HUD
          selectedPlanet={selectedPlanet}
          earthPosition={earthPosition}
          currentDate={currentDate}
          onDateChange={handleDateChange}
          onRefresh={refresh}
          isFallback={isFallback}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(m => m === 'didactic' ? 'realistic' : 'didactic')}
        />
      )}
    </>
  );
}
