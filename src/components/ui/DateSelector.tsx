'use client';

import { useState } from 'react';

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
    <div className="flex flex-col gap-3">{/* containerStyle */}
      <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">{/* labelStyle */}
        Simulation Date
      </label>

      {/* Date input + refresh button */}
      <div className="flex gap-2">{/* inputContainerStyle */}
        <input
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyPress}
          min={MIN_DATE}
          max={MAX_DATE}
          className={`flex-1 px-4 py-2 bg-white/5 border rounded-xl text-sm font-mono transition-all duration-300 outline-none focus:ring-2 focus:ring-white/10 ${error
            ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' /* inputErrorStyle */
            : 'border-white/10 hover:border-white/20 focus:border-white/30' /* inputStyle */
            }`}
        />
        {onRefresh && (
          <button
            className="px-3.5 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/30 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-blue-500/10"
            /* buttonStyle */
            onClick={onRefresh}
            title="Refresh data"
          >
            🔄
          </button>
        )}
      </div>

      {/* Error message */}
      <div className={`overflow-hidden transition-all duration-300 ${error ? 'h-6 opacity-100' : 'h-0 opacity-0'}`}>{/* errorStyle */}
        <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider italic">
          {error}
        </span>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2 flex-wrap">{/* presetsContainerStyle */}
        <button
          className={`flex-1 min-w-[70px] px-3 py-1.5 transition-all duration-300 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${isToday
            ? 'bg-purple-500/30 border-purple-500/50 text-purple-200 shadow-lg shadow-purple-500/20' /* presetButtonActiveStyle */
            : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20 hover:text-white/60' /* presetButtonStyle */
            }`}
          onClick={() => handlePreset('today')}
        >
          Today
        </button>
        <button
          className="flex-1 min-w-[70px] px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white/40 hover:bg-white/10 hover:border-white/20 hover:text-white/60 transition-all duration-300"
          /* presetButtonStyle */
          onClick={() => handlePreset('-1year')}
        >
          - 1 Year
        </button>
        <button
          className="flex-1 min-w-[70px] px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white/40 hover:bg-white/10 hover:border-white/20 hover:text-white/60 transition-all duration-300"
          /* presetButtonStyle */
          onClick={() => handlePreset('+1year')}
        >
          + 1 Year
        </button>
      </div>
    </div>
  );
}
