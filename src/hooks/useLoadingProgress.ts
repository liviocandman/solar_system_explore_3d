/**
 * useLoadingProgress Hook
 * Tracks loading progress across API and texture loading stages
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { LoadingStage, LoadingProgress } from '@/components/ui/LoadingScreen';

// --- Constants ---

const TOTAL_TEXTURES = 9; // Sun + 8 planets

// --- Hook ---

interface UseLoadingProgressOptions {
  isApiLoading: boolean;
  hasApiData: boolean;
}

export function useLoadingProgress({
  isApiLoading,
  hasApiData
}: UseLoadingProgressOptions): LoadingProgress {
  const [texturesLoaded, setTexturesLoaded] = useState(0);
  const [textureLoadingComplete, setTextureLoadingComplete] = useState(false);
  const textureSimulationStartedRef = useRef(false);

  // Derive stage from props (no setState in effect needed)
  const stage: LoadingStage = (() => {
    if (textureLoadingComplete) return 'ready';
    if (hasApiData && !isApiLoading) return 'loading_textures';
    if (isApiLoading) return 'fetching_data';
    return 'initializing';
  })();

  // Simulate texture loading progress (only start once when entering texture loading stage)
  useEffect(() => {
    if (stage !== 'loading_textures') return;
    if (textureSimulationStartedRef.current) return;

    textureSimulationStartedRef.current = true;

    // Simulate progressive texture loading
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setTexturesLoaded(count);

      if (count >= TOTAL_TEXTURES) {
        clearInterval(interval);
        setTextureLoadingComplete(true);
      }
    }, 150); // Fast for demo purposes

    return () => clearInterval(interval);
  }, [stage]);

  // Calculate progress percentage
  const calculateProgress = (): number => {
    switch (stage) {
      case 'initializing':
        return 5;
      case 'fetching_data':
        return 20;
      case 'loading_textures':
        // 20-95% range for texture loading
        return 20 + (texturesLoaded / TOTAL_TEXTURES) * 75;
      case 'ready':
        return 100;
      default:
        return 0;
    }
  };

  return {
    stage,
    progress: Math.round(calculateProgress()),
    texturesLoaded,
    texturesTotal: TOTAL_TEXTURES,
  };
}
