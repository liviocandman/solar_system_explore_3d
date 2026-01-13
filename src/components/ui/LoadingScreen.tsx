'use client';

import { CSSProperties } from 'react';

// --- Types ---

export type LoadingStage = 'initializing' | 'fetching_data' | 'loading_textures' | 'ready';

export interface LoadingProgress {
  stage: LoadingStage;
  progress: number; // 0-100
  texturesLoaded?: number;
  texturesTotal?: number;
}

interface LoadingScreenProps {
  message?: string;
  progress?: LoadingProgress;
}

// --- Stage Messages ---

function getStageMessage(progress?: LoadingProgress): string {
  if (!progress) return 'Initializing...';

  switch (progress.stage) {
    case 'initializing':
      return 'Initializing Solar System...';
    case 'fetching_data':
      return 'Fetching orbital data from NASA...';
    case 'loading_textures':
      if (progress.texturesLoaded !== undefined && progress.texturesTotal !== undefined) {
        return `Loading textures (${progress.texturesLoaded}/${progress.texturesTotal})`;
      }
      return 'Loading planet textures...';
    case 'ready':
      return 'Ready!';
    default:
      return 'Loading...';
  }
}

// --- Styles ---

const containerStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
  color: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  zIndex: 9999,
};

const spinnerContainerStyle: CSSProperties = {
  position: 'relative',
  width: '80px',
  height: '80px',
  marginBottom: '24px',
};

const orbitRingStyle: CSSProperties = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  border: '2px solid rgba(100, 150, 255, 0.2)',
  borderTopColor: '#6496ff',
  borderRadius: '50%',
  animation: 'spin 1.2s linear infinite',
};

const innerOrbitStyle: CSSProperties = {
  position: 'absolute',
  top: '15px',
  left: '15px',
  width: '50px',
  height: '50px',
  border: '2px solid rgba(255, 180, 100, 0.2)',
  borderTopColor: '#ffb464',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite reverse',
};

const planetDotStyle: CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '12px',
  height: '12px',
  backgroundColor: '#ffd700',
  borderRadius: '50%',
  boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
};

const messageStyle: CSSProperties = {
  fontSize: '1rem',
  fontWeight: 500,
  letterSpacing: '0.05em',
  opacity: 0.9,
  marginBottom: '16px',
};

const progressContainerStyle: CSSProperties = {
  width: '200px',
  height: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '2px',
  overflow: 'hidden',
  marginBottom: '8px',
};

const progressBarBaseStyle: CSSProperties = {
  height: '100%',
  borderRadius: '2px',
  transition: 'width 0.3s ease-out',
};

const progressTextStyle: CSSProperties = {
  fontSize: '0.75rem',
  opacity: 0.6,
  fontFamily: 'monospace',
};

const keyframesStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// --- Component ---

export function LoadingScreen({ message, progress }: LoadingScreenProps) {
  const displayMessage = message || getStageMessage(progress);
  const progressPercent = progress?.progress ?? 0;

  // Gradient color based on progress
  const progressBarStyle: CSSProperties = {
    ...progressBarBaseStyle,
    width: `${progressPercent}%`,
    background: progressPercent < 50
      ? 'linear-gradient(90deg, #6496ff, #8b5cf6)'
      : progressPercent < 100
        ? 'linear-gradient(90deg, #8b5cf6, #22c55e)'
        : '#22c55e',
  };

  return (
    <div style={containerStyle}>
      <style>{keyframesStyle}</style>
      <div style={spinnerContainerStyle}>
        <div style={orbitRingStyle} />
        <div style={innerOrbitStyle} />
        <div style={planetDotStyle} />
      </div>
      <p style={messageStyle}>{displayMessage}</p>

      {/* Progress bar */}
      <div style={progressContainerStyle}>
        <div style={progressBarStyle} />
      </div>

      {/* Progress percentage */}
      <span style={progressTextStyle}>
        {progressPercent}%
      </span>
    </div>
  );
}
