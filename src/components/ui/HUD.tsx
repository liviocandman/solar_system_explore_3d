'use client';

import { useState, useEffect, CSSProperties } from 'react';
import { PlanetInfo } from './PlanetInfo';
import { DateSelector } from './DateSelector';

// --- Types ---

interface SelectedPlanet {
  bodyId: string;
  englishName: string;
  position: { x: number; y: number; z: number };
  distanceFromSun: number;
}

interface HUDProps {
  selectedPlanet: SelectedPlanet | null;
  earthPosition?: { x: number; y: number; z: number };
  currentDate: string;
  onDateChange: (date: string) => void;
  onRefresh?: () => void;
  isFallback?: boolean;
}

// --- Hook for responsive detection ---

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// --- Styles ---

// Desktop sidebar styles
const sidebarStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  width: '320px',
  height: '100vh',
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(20px)',
  borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#fff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  zIndex: 100,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

// Mobile bottom sheet styles
const bottomSheetBaseStyle: CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(0, 0, 0, 0.85)',
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px 16px 0 0',
  color: '#fff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  zIndex: 100,
  transition: 'height 0.3s ease-out',
  overflow: 'hidden',
};

const headerStyle: CSSProperties = {
  padding: '16px 20px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const titleStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.8)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  margin: 0,
};

const contentStyle: CSSProperties = {
  flex: 1,
  padding: '20px',
  overflowY: 'auto',
};

const sectionStyle: CSSProperties = {
  marginBottom: '24px',
};

const dividerStyle: CSSProperties = {
  height: '1px',
  background: 'rgba(255, 255, 255, 0.08)',
  margin: '16px 0',
};

// Mobile drag handle
const dragHandleStyle: CSSProperties = {
  width: '40px',
  height: '4px',
  background: 'rgba(255, 255, 255, 0.3)',
  borderRadius: '2px',
  margin: '8px auto',
  cursor: 'grab',
};

// Fallback badge
const fallbackBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  background: 'rgba(234, 179, 8, 0.2)',
  border: '1px solid rgba(234, 179, 8, 0.3)',
  borderRadius: '4px',
  color: '#fbbf24',
  fontSize: '0.625rem',
  fontWeight: 500,
};

// --- Component ---

export function HUD({
  selectedPlanet,
  earthPosition,
  currentDate,
  onDateChange,
  onRefresh,
  isFallback = false,
}: HUDProps) {
  const isMobile = useIsMobile();
  // Start expanded if planet is already selected, otherwise collapsed
  const [isExpanded, setIsExpanded] = useState(() => !!selectedPlanet);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Collapsed height: 60px, Expanded: 50vh
  const mobileHeight = isExpanded ? '50vh' : '60px';

  if (isMobile) {
    return (
      <div style={{ ...bottomSheetBaseStyle, height: mobileHeight }}>
        {/* Drag handle */}
        <div style={dragHandleStyle} onClick={toggleExpand} />

        {/* Collapsed preview */}
        {!isExpanded && (
          <div
            style={{
              padding: '0 20px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
            onClick={toggleExpand}
          >
            <span style={{ fontWeight: 500 }}>
              {selectedPlanet ? selectedPlanet.englishName : 'Solar Explorer'}
            </span>
            <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>
              Tap to expand
            </span>
          </div>
        )}

        {/* Expanded content */}
        {isExpanded && (
          <div style={contentStyle}>
            {/* Date Selector */}
            <div style={sectionStyle}>
              <DateSelector
                currentDate={currentDate}
                onDateChange={onDateChange}
                onRefresh={onRefresh}
              />
            </div>

            <div style={dividerStyle} />

            {/* Planet Info */}
            <div style={sectionStyle}>
              <PlanetInfo
                planet={selectedPlanet}
                earthPosition={earthPosition}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop sidebar
  return (
    <div style={sidebarStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>Solar Explorer</h1>
        {isFallback && (
          <div style={fallbackBadgeStyle}>
            <span>⚠️</span>
            <span>Offline</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {/* Date Selector */}
        <div style={sectionStyle}>
          <DateSelector
            currentDate={currentDate}
            onDateChange={onDateChange}
            onRefresh={onRefresh}
          />
        </div>

        <div style={dividerStyle} />

        {/* Planet Info */}
        <div style={sectionStyle}>
          <PlanetInfo
            planet={selectedPlanet}
            earthPosition={earthPosition}
          />
        </div>
      </div>
    </div>
  );
}
