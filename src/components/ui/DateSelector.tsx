'use client';

import { useState, CSSProperties } from 'react';

// --- Types ---

interface DateSelectorProps {
  currentDate: string;
  onDateChange: (date: string) => void;
  onRefresh?: () => void;
}

// --- Constants ---

const MIN_DATE = '1600-01-01';
const MAX_DATE = '2500-01-01';

// --- Helper Functions ---

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;

  const minDate = new Date(MIN_DATE);
  const maxDate = new Date(MAX_DATE);

  return date >= minDate && date <= maxDate;
}

function addYears(dateString: string, years: number): string {
  const date = new Date(dateString);
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().split('T')[0];
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// --- Styles ---

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const labelStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'rgba(255, 255, 255, 0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const inputContainerStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const inputStyle: CSSProperties = {
  flex: 1,
  padding: '10px 12px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '0.875rem',
  fontFamily: 'monospace',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const inputErrorStyle: CSSProperties = {
  ...inputStyle,
  borderColor: 'rgba(239, 68, 68, 0.5)',
  boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)',
};

const refreshButtonStyle: CSSProperties = {
  padding: '10px 12px',
  background: 'rgba(59, 130, 246, 0.2)',
  border: '1px solid rgba(59, 130, 246, 0.3)',
  borderRadius: '8px',
  color: '#3b82f6',
  fontSize: '1rem',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const presetsContainerStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
};

const presetButtonStyle: CSSProperties = {
  padding: '6px 12px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '0.75rem',
  cursor: 'pointer',
  transition: 'background 0.2s, border-color 0.2s',
};

const presetButtonActiveStyle: CSSProperties = {
  ...presetButtonStyle,
  background: 'rgba(139, 92, 246, 0.2)',
  borderColor: 'rgba(139, 92, 246, 0.5)',
  color: '#a78bfa',
};

const errorTextStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: '#ef4444',
  marginTop: '4px',
};

// --- Component ---

export function DateSelector({ currentDate, onDateChange, onRefresh }: DateSelectorProps) {
  const [inputValue, setInputValue] = useState(currentDate);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value && !isValidDate(value)) {
      setError(`Date must be between ${MIN_DATE} and ${MAX_DATE}`);
    } else {
      setError(null);
    }
  };

  const handleInputBlur = () => {
    if (inputValue && isValidDate(inputValue) && inputValue !== currentDate) {
      onDateChange(inputValue);
    } else if (!isValidDate(inputValue)) {
      setInputValue(currentDate);
      setError(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const handlePreset = (preset: 'today' | '-1year' | '+1year') => {
    let newDate: string;

    switch (preset) {
      case 'today':
        newDate = getTodayString();
        break;
      case '-1year':
        newDate = addYears(currentDate, -1);
        break;
      case '+1year':
        newDate = addYears(currentDate, 1);
        break;
    }

    if (isValidDate(newDate)) {
      setInputValue(newDate);
      setError(null);
      onDateChange(newDate);
    }
  };

  const today = getTodayString();
  const isToday = currentDate === today;

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Simulation Date</label>

      {/* Date input + refresh button */}
      <div style={inputContainerStyle}>
        <input
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyPress}
          min={MIN_DATE}
          max={MAX_DATE}
          style={error ? inputErrorStyle : inputStyle}
        />
        {onRefresh && (
          <button
            style={refreshButtonStyle}
            onClick={onRefresh}
            title="Refresh data"
          >
            🔄
          </button>
        )}
      </div>

      {/* Error message */}
      {error && <span style={errorTextStyle}>{error}</span>}

      {/* Preset buttons */}
      <div style={presetsContainerStyle}>
        <button
          style={isToday ? presetButtonActiveStyle : presetButtonStyle}
          onClick={() => handlePreset('today')}
        >
          Today
        </button>
        <button
          style={presetButtonStyle}
          onClick={() => handlePreset('-1year')}
        >
          − 1 Year
        </button>
        <button
          style={presetButtonStyle}
          onClick={() => handlePreset('+1year')}
        >
          + 1 Year
        </button>
      </div>
    </div>
  );
}
