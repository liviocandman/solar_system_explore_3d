'use client';

import { CSSProperties } from 'react';
import { PLANET_CONFIG } from '@/lib/textureConfig';

// --- Types ---

interface PlanetData {
  bodyId: string;
  englishName: string;
  position: { x: number; y: number; z: number };
  distanceFromSun: number; // million km
}

interface PlanetInfoProps {
  planet: PlanetData | null;
  earthPosition?: { x: number; y: number; z: number };
}

// --- Helper Functions ---

/**
 * Calculates distance between two points
 * Since 1 unit = 1M km, the magnitude of the diff vector is millions of km
 */
function calculateMillionKmDistance(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function formatNumber(num: number, decimals = 1): string {
  if (num >= 1000) {
    return num.toLocaleString('en-US', { maximumFractionDigits: decimals });
  }
  return num.toFixed(decimals);
}

// --- Styles ---

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '8px',
};

const planetIconStyle: CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
};

const planetNameStyle: CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 600,
  color: '#fff',
  margin: 0,
};

const planetTypeStyle: CSSProperties = {
  fontSize: '0.875rem',
  color: 'rgba(255, 255, 255, 0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const statsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
};

const statCardStyle: CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '8px',
  padding: '12px',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const statLabelStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'rgba(255, 255, 255, 0.5)',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const statValueStyle: CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#fff',
};

const statUnitStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'rgba(255, 255, 255, 0.5)',
  marginLeft: '4px',
};

const emptyStateStyle: CSSProperties = {
  textAlign: 'center',
  padding: '32px 16px',
  color: 'rgba(255, 255, 255, 0.5)',
};

const emptyIconStyle: CSSProperties = {
  fontSize: '48px',
  marginBottom: '16px',
  opacity: 0.5,
};

// --- Planet Type Icons ---

const PLANET_ICONS: Record<string, string> = {
  STAR: '☀️',
  PLANET: '🪐',
  DWARF_PLANET: '🌑',
};

// --- Component ---

export function PlanetInfo({ planet, earthPosition }: PlanetInfoProps) {
  if (!planet) {
    return (
      <div style={emptyStateStyle}>
        <div style={emptyIconStyle}>🌍</div>
        <p>Select a planet to view details</p>
      </div>
    );
  }

  const config = PLANET_CONFIG[planet.bodyId];
  const planetType = config?.type || 'PLANET';
  const orbitalPeriod = config?.orbitalPeriod || 0;

  // Calculate orbital velocity (km/s) using v = 2πr/T
  // r in km, T in seconds
  const orbitalRadius = planet.distanceFromSun * 1e6; // Convert million km to km
  const orbitalPeriodSeconds = orbitalPeriod * 24 * 60 * 60; // Days to seconds
  const orbitalVelocity = orbitalPeriodSeconds > 0
    ? (2 * Math.PI * orbitalRadius) / orbitalPeriodSeconds
    : 0;

  // Calculate distance from Earth in million km
  const distanceFromEarth = earthPosition
    ? calculateMillionKmDistance(planet.position, earthPosition)
    : null;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div
          style={{
            ...planetIconStyle,
            background: config?.fallbackColor || '#666',
            boxShadow: `0 0 20px ${config?.fallbackColor || '#666'}40`,
          }}
        >
          {PLANET_ICONS[planetType] || '🪐'}
        </div>
        <div>
          <h2 style={planetNameStyle}>{planet.englishName}</h2>
          <span style={planetTypeStyle}>{planetType.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={statsGridStyle}>
        {/* Distance from Sun */}
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Distance from Sun</div>
          <div style={statValueStyle}>
            {formatNumber(planet.distanceFromSun)}
            <span style={statUnitStyle}>M km</span>
          </div>
        </div>

        {/* Distance from Earth */}
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Distance from Earth</div>
          <div style={statValueStyle}>
            {distanceFromEarth !== null ? formatNumber(distanceFromEarth) : '—'}
            <span style={statUnitStyle}>M km</span>
          </div>
        </div>

        {/* Orbital Velocity */}
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Orbital Velocity</div>
          <div style={statValueStyle}>
            {orbitalVelocity > 0 ? formatNumber(orbitalVelocity) : '—'}
            <span style={statUnitStyle}>km/s</span>
          </div>
        </div>

        {/* Orbital Period */}
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Orbital Period</div>
          <div style={statValueStyle}>
            {orbitalPeriod > 0 ? formatNumber(orbitalPeriod, 0) : '—'}
            <span style={statUnitStyle}>days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
