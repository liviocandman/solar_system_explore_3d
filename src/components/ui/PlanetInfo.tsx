'use client';

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
      <div className="text-center py-8 px-4 text-white/50 animate-in fade-in duration-700">{/* emptyStateStyle */}
        <div className="text-5xl mb-4 opacity-50">🌍</div>{/* emptyIconStyle */}
        <p>Select a planet to view details</p>
      </div>
    );
  }

  const config = PLANET_CONFIG[planet.bodyId];
  const planetType = config?.type || 'PLANET';
  const orbitalPeriod = config?.orbitalPeriod || 0;

  // Calculate orbital velocity (km/s) using v = 2πr/T
  const orbitalRadius = planet.distanceFromSun * 1e6;
  const orbitalPeriodSeconds = orbitalPeriod * 24 * 60 * 60;
  const orbitalVelocity = orbitalPeriodSeconds > 0
    ? (2 * Math.PI * orbitalRadius) / orbitalPeriodSeconds
    : 0;

  // Calculate distance from Earth in million km
  const distanceFromEarth = earthPosition
    ? calculateMillionKmDistance(planet.position, earthPosition)
    : null;

  const planetIcon = PLANET_ICONS[planetType] || '🪐';
  const fallbackColor = config?.fallbackColor || '#666';

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">{/* containerStyle */}
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">{/* headerStyle */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          /* planetIconStyle */
          style={{
            background: `radial-gradient(circle at 30% 30%, ${fallbackColor}aa, ${fallbackColor})`,
            boxShadow: `0 0 20px ${fallbackColor}40`,
          }}
        >
          {planetIcon}
        </div>
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold text-white m-0">{/* planetNameStyle */}
            {planet.englishName}
          </h2>
          <span className="text-sm text-white/50 uppercase tracking-widest">{/* planetTypeStyle */}
            {planetType.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">{/* statsGridStyle */}
        {/* Distance from Sun */}
        <StatCard
          label="Distance from Sun"
          value={formatNumber(planet.distanceFromSun)}
          unit="M km"
        />

        {/* Distance from Earth */}
        <StatCard
          label="Distance from Earth"
          value={distanceFromEarth !== null ? formatNumber(distanceFromEarth) : '—'}
          unit="M km"
        />

        {/* Orbital Velocity */}
        <StatCard
          label="Orbital Velocity"
          value={orbitalVelocity > 0 ? formatNumber(orbitalVelocity) : '—'}
          unit="km/s"
        />

        {/* Orbital Period */}
        <StatCard
          label="Orbital Period"
          value={orbitalPeriod > 0 ? formatNumber(orbitalPeriod, 0) : '—'}
          unit="days"
        />
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
        <p className="text-[10px] text-white/40 italic">
          High-precision ephemeris data provided by NASA JPL Horizons.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10 group transition-colors hover:bg-white/10 flex flex-col justify-between min-w-0">{/* statCardStyle */}
      <div className="text-[10px] text-white/50 mb-1.5 uppercase tracking-wider group-hover:text-white/70 transition-colors leading-tight">{/* statLabelStyle */}
        {label}
      </div>
      <div className="flex items-baseline gap-1 flex-wrap min-w-0">
        <span className="text-base font-semibold text-white truncate">{/* statValueStyle */}
          {value}
        </span>
        <span className="text-[10px] text-white/50 uppercase tracking-tighter shrink-0">{/* statUnitStyle */}
          {unit}
        </span>
      </div>
    </div>
  );
}
