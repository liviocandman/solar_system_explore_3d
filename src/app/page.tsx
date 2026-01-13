'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Toaster, toast } from 'sonner';
import { useEphemeris } from '@/hooks/useEphemeris';
import type { SelectedPlanet } from '@/components/three/SceneManager';

// Dynamically import SceneManager with SSR disabled
// This prevents hydration mismatch errors with Three.js/R3F
const SceneManager = dynamic(
  () => import('@/components/three/SceneManager').then(mod => mod.SceneManager),
  {
    ssr: false,
    loading: () => (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}>
        Loading Solar System...
      </div>
    )
  }
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
    error,
    source,
    isFallback,
    retry,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    refresh // Will be used by HUD DateSelector in Task 5
  } = useEphemeris({ date: currentDate });

  // Selected planet state for HUD
  const [selectedPlanet, setSelectedPlanet] = useState<SelectedPlanet | null>(null);

  // Handle date change with validation (will be used by HUD DateSelector in Task 5)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // Show error toast if there's an error (even with fallback active)
  useEffect(() => {
    if (error && !isLoading) {
      toast.error('Erro ao carregar dados', {
        description: isFallback
          ? 'Usando dados aproximados. Clique para tentar novamente.'
          : error.message,
        action: error.canRetry ? {
          label: 'Tentar novamente',
          onClick: retry,
        } : undefined,
      });
    }
  }, [error, isLoading, isFallback, retry]);

  // Handle planet selection
  const handlePlanetClick = (planet: SelectedPlanet | null) => {
    setSelectedPlanet(planet);

    if (planet) {
      console.log(`[Home] Planet selected: ${planet.englishName}`, planet);
    } else {
      console.log('[Home] Planet deselected');
    }
  };

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

      <SceneManager
        ephemerisData={ephemerisData}
        onPlanetClick={handlePlanetClick}
        selectedPlanetId={selectedPlanet?.bodyId}
        selectedPlanetPosition={selectedPlanet?.position}
      />

      {/* Selected planet info panel (will be replaced by HUD in Task 5) */}
      {selectedPlanet && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            padding: '16px 24px',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            fontFamily: 'system-ui, sans-serif',
            zIndex: 100,
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>
            {selectedPlanet.englishName}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
            Distance from Sun: {selectedPlanet.distanceFromSun.toFixed(1)} million km
          </div>
        </div>
      )}

      {/* Date display (temporary - will be in HUD for Task 5) */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          zIndex: 100,
        }}
      >
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '4px' }}>
          Simulation Date
        </div>
        <div>{currentDate}</div>
      </div>

      {/* Fallback mode indicator */}
      {isFallback && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            padding: '8px 16px',
            background: 'rgba(234, 179, 8, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            color: '#fbbf24',
            fontSize: '0.75rem',
            fontFamily: 'system-ui, sans-serif',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>⚠️</span>
          <span>Modo Offline</span>
        </div>
      )}
    </>
  );
}
