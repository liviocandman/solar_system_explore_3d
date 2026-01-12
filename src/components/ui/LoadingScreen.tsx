'use client';

import { CSSProperties } from 'react';

// --- Types ---

interface LoadingScreenProps {
  message?: string;
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
};

const keyframesStyle = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// --- Component ---

export function LoadingScreen({ message = 'Loading Solar System...' }: LoadingScreenProps) {
  return (
    <div style={containerStyle}>
      <style>{keyframesStyle}</style>
      <div style={spinnerContainerStyle}>
        <div style={orbitRingStyle} />
        <div style={innerOrbitStyle} />
        <div style={planetDotStyle} />
      </div>
      <p style={messageStyle}>{message}</p>
    </div>
  );
}
