/**
 * useWebGLError Hook
 * Detects WebGL support and handles context loss events
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { AppError } from '@/components/ui/ErrorOverlay';

// --- Types ---

interface UseWebGLErrorReturn {
  error: AppError | null;
  isSupported: boolean;
  isContextLost: boolean;
}

// --- WebGL Support Detection (runs once, outside React) ---

function checkWebGLSupport(): { supported: boolean; error: AppError | null } {
  if (typeof window === 'undefined') {
    return { supported: true, error: null }; // SSR - assume supported
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      return {
        supported: false,
        error: {
          type: 'WEBGL_NOT_SUPPORTED',
          message: 'WebGL is not supported in this browser',
          technicalDetails: 'No WebGL context could be created. Please use a modern browser with WebGL support.',
          canRetry: false,
        },
      };
    }

    return { supported: true, error: null };
  } catch (e) {
    return {
      supported: false,
      error: {
        type: 'WEBGL_NOT_SUPPORTED',
        message: 'WebGL is not supported',
        technicalDetails: e instanceof Error ? e.message : 'Unknown error during WebGL detection',
        canRetry: false,
      },
    };
  }
}

// --- Hook ---

export function useWebGLError(): UseWebGLErrorReturn {
  // Check WebGL support on initial render (derived from function, not effect)
  const [webglCheck] = useState(() => checkWebGLSupport());
  const [contextLostError, setContextLostError] = useState<AppError | null>(null);
  const [isContextLost, setIsContextLost] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Listen for WebGL context loss on Three.js canvas
  useEffect(() => {
    if (typeof window === 'undefined' || !webglCheck.supported) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.error('[useWebGLError] WebGL context lost');
      setIsContextLost(true);
      setContextLostError({
        type: 'WEBGL_CONTEXT_LOST',
        message: 'WebGL context was lost',
        technicalDetails: 'The GPU context was lost, possibly due to memory issues or driver problems. Reloading the page should fix this.',
        canRetry: false,
      });
    };

    const handleContextRestored = () => {
      console.log('[useWebGLError] WebGL context restored');
      setIsContextLost(false);
      setContextLostError(null);
    };

    // Find the Three.js canvas
    const findCanvas = () => {
      const canvas = document.querySelector('canvas');
      if (canvas && canvas !== canvasRef.current) {
        canvasRef.current = canvas;
        canvas.addEventListener('webglcontextlost', handleContextLost);
        canvas.addEventListener('webglcontextrestored', handleContextRestored);
      }
    };

    // Initial check and periodic check for canvas
    findCanvas();
    const interval = setInterval(findCanvas, 1000);

    return () => {
      clearInterval(interval);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('webglcontextlost', handleContextLost);
        canvasRef.current.removeEventListener('webglcontextrestored', handleContextRestored);
      }
    };
  }, [webglCheck.supported]);

  // Return WebGL check error or context lost error
  const error = webglCheck.error || contextLostError;

  return {
    error,
    isSupported: webglCheck.supported,
    isContextLost,
  };
}
