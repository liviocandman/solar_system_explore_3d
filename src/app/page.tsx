'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Toaster, toast } from 'sonner';
import type { EphemerisData, EphemerisResponse } from '@/lib/types';

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



async function fetchEphemerisData(): Promise<EphemerisResponse> {
  const response = await fetch('/api/ephemeris');

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// --- Component ---

export default function Home() {
  const [ephemerisData, setEphemerisData] = useState<EphemerisData[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadEphemeris() {
      try {
        const response = await fetchEphemerisData();

        if (!mounted) return;

        setEphemerisData(response.data);

        // Show toast notification based on data source
        if (response.meta.source === 'FALLBACK_DATASET') {
          toast.warning('Modo Offline: Posições aproximadas', {
            description: 'Usando dados de fallback. API NASA indisponível.',
            duration: 5000,
          });
        } else if (response.meta.source === 'CACHE_HIT') {
          toast.success('Dados carregados do cache', {
            duration: 2000,
          });
        } else if (response.meta.source === 'NASA_LIVE') {
          toast.success('Dados ao vivo da NASA', {
            duration: 2000,
          });
        }

        console.log(`[Home] Ephemeris loaded - Source: ${response.meta.source}, Bodies: ${response.data.length}`);

      } catch (error) {
        console.error('[Home] Failed to load ephemeris:', error);

        if (!mounted) return;

        toast.error('Erro ao carregar dados', {
          description: 'Não foi possível carregar posições dos planetas.',
        });
      }
    }

    loadEphemeris();

    return () => {
      mounted = false;
    };
  }, []);

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
      <SceneManager ephemerisData={ephemerisData} />
    </>
  );
}
