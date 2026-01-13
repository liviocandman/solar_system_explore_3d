/**
 * useEphemeris Hook
 * Fetches and manages ephemeris data with error handling, validation, and fallback support
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { EphemerisData, EphemerisResponse, DataSource } from '@/lib/types';

// --- Types ---

export interface EphemerisState {
  data: EphemerisData[];
  isLoading: boolean;
  error: EphemerisError | null;
  source: DataSource | null;
  isFallback: boolean;
}

export interface EphemerisError {
  type: EphemerisErrorType;
  message: string;
  technicalDetails?: string;
  canRetry: boolean;
}

export type EphemerisErrorType =
  | 'NASA_API_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';

interface UseEphemerisOptions {
  date?: string; // YYYY-MM-DD format
  autoFetch?: boolean;
  timeoutMs?: number;
}

// --- Constants ---

const DEFAULT_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// --- Helper Functions (outside hook for stability) ---

function validateData(data: EphemerisData[]): EphemerisData[] {
  return data.filter((item) => {
    if (!item.bodyId || !item.name || !item.position) {
      console.warn(`[useEphemeris] Invalid entry - missing fields:`, item);
      return false;
    }

    const { x, y, z } = item.position;
    if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
      console.warn(`[useEphemeris] Invalid position for ${item.name}:`, item.position);
      return false;
    }

    return true;
  });
}

async function loadFallbackData(): Promise<EphemerisData[]> {
  try {
    const fallback = await import('@/lib/fallback_planets.json');
    const validated = validateData(fallback.data as EphemerisData[]);
    console.log(`[useEphemeris] Loaded ${validated.length} bodies from fallback`);
    return validated;
  } catch (error) {
    console.error('[useEphemeris] Failed to load fallback data:', error);
    return [];
  }
}

// --- Hook ---

export function useEphemeris(options: UseEphemerisOptions = {}) {
  const {
    date = new Date().toISOString().split('T')[0],
    autoFetch = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options;

  const [state, setState] = useState<EphemerisState>({
    data: [],
    isLoading: false,
    error: null,
    source: null,
    isFallback: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // Fetch function - React 19 compiler handles memoization
  const fetchEphemeris = async (retryAttempt = 0): Promise<void> => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // Create timeout
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeoutMs);

      const response = await fetch(`/api/ephemeris?date=${date}`, {
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result: EphemerisResponse = await response.json();

      // Validate response structure
      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Invalid API response format: missing data array');
      }

      // Validate individual entries
      const validatedData = validateData(result.data);

      if (validatedData.length === 0) {
        throw new Error('No valid ephemeris data received');
      }

      const isFallback = result.meta.source === 'FALLBACK_DATASET';

      setState({
        data: validatedData,
        isLoading: false,
        error: null,
        source: result.meta.source,
        isFallback,
      });

      retryCountRef.current = 0;
      console.log(
        `[useEphemeris] Loaded ${validatedData.length} bodies from ${result.meta.source}`
      );
    } catch (error) {
      // Handle abort (user-initiated or timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        const isTimeout = retryAttempt === 0;

        if (isTimeout && retryAttempt < MAX_RETRIES) {
          console.log(`[useEphemeris] Request timeout, retrying (${retryAttempt + 1}/${MAX_RETRIES})`);
          setTimeout(() => fetchEphemeris(retryAttempt + 1), RETRY_DELAY_MS);
          return;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: {
            type: 'TIMEOUT_ERROR',
            message: 'Request timed out',
            technicalDetails: `Timeout after ${timeoutMs}ms`,
            canRetry: true,
          },
        }));
        return;
      }

      // Determine error type
      let errorType: EphemerisErrorType = 'UNKNOWN_ERROR';
      let canRetry = true;

      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorType = 'NETWORK_ERROR';
      } else if (error instanceof Error && error.message.includes('API error')) {
        errorType = 'NASA_API_ERROR';
      } else if (error instanceof Error && error.message.includes('Invalid')) {
        errorType = 'VALIDATION_ERROR';
        canRetry = false;
      }

      // Retry logic for retryable errors
      if (canRetry && retryAttempt < MAX_RETRIES) {
        console.log(
          `[useEphemeris] Error, retrying (${retryAttempt + 1}/${MAX_RETRIES}):`,
          error
        );
        retryCountRef.current = retryAttempt + 1;
        setTimeout(() => fetchEphemeris(retryAttempt + 1), RETRY_DELAY_MS * (retryAttempt + 1));
        return;
      }

      // Load fallback data
      console.log('[useEphemeris] Loading fallback data due to error');
      const fallbackData = await loadFallbackData();

      setState({
        data: fallbackData,
        isLoading: false,
        error: {
          type: errorType,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          technicalDetails: error instanceof Error ? error.stack : undefined,
          canRetry,
        },
        source: 'FALLBACK_DATASET',
        isFallback: true,
      });
    }
  };

  // Manual retry function
  const retry = () => {
    retryCountRef.current = 0;
    fetchEphemeris(0);
  };

  // Manual refresh function (forces new fetch even if cached)
  const refresh = () => {
    retryCountRef.current = 0;
    fetchEphemeris(0);
  };

  // Auto-fetch on mount and date change
  useEffect(() => {
    if (autoFetch) {
      fetchEphemeris(0);
    }

    return () => {
      // Cleanup: abort pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch, date, timeoutMs]);

  return {
    ...state,
    retry,
    refresh,
    retryCount: retryCountRef.current,
  };
}
