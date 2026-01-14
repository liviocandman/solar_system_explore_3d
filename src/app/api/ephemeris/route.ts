/**
 * Ephemeris API Route
 * GET /api/ephemeris
 * 
 * Query params:
 * - date: ISO date string (default: today)
 * - ids: comma-separated body IDs (default: all planets)
 * - force: if 'true', bypass cache and fetch fresh data from NASA
 * 
 * Response includes meta.source field:
 * - CACHE_HIT: Data from Redis cache
 * - NASA_LIVE: Fresh data from NASA API
 * - FALLBACK_DATASET: Static fallback data (offline mode)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  fetchBodyEphemeris,
  BODY_IDS,
  type EphemerisData
} from '@/services/nasaClient';
import {
  getCachedBulkEphemeris,
  setCachedBulkEphemeris
} from '@/services/cacheService';
import fallbackData from '@/lib/fallback_planets.json';

// --- Types ---

type DataSource = 'NASA_LIVE' | 'CACHE_HIT' | 'FALLBACK_DATASET';

interface EphemerisResponse {
  data: EphemerisData[];
  meta: {
    source: DataSource;
    timestamp: string;
    requestedDate: string;
    cacheHits?: number;
    cacheMisses?: number;
  };
}

// --- Constants ---

const ALL_PLANET_IDS = Object.values(BODY_IDS);

// --- Helper Functions ---

/**
 * Get fallback data for specified body IDs
 */
function getFallbackData(bodyIds: string[]): EphemerisData[] {
  const now = new Date().toISOString();

  return fallbackData.data
    .filter(item => bodyIds.includes(item.bodyId))
    .map(item => ({
      bodyId: item.bodyId,
      name: item.name,
      position: item.position,
      timestamp: now,
    }));
}

// --- Route Handler ---

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const dateParam = searchParams.get('date');
  const idsParam = searchParams.get('ids');
  const forceParam = searchParams.get('force');

  const requestedDate = dateParam || new Date().toISOString().split('T')[0];
  const bodyIds = idsParam
    ? idsParam.split(',').map(id => id.trim())
    : ALL_PLANET_IDS;
  const forceRefresh = forceParam === 'true';

  try {
    // Step 1: Check cache for existing data (skip if force=true)
    let cached: EphemerisData[] = [];
    let missing: string[] = bodyIds;

    if (!forceRefresh) {
      const cacheResult = await getCachedBulkEphemeris(bodyIds, requestedDate);
      cached = cacheResult.cached;
      missing = cacheResult.missing;
    }

    // If all data is cached (and not forcing), return immediately
    if (missing.length === 0 && cached.length > 0) {
      const response: EphemerisResponse = {
        data: cached,
        meta: {
          source: 'CACHE_HIT',
          timestamp: new Date().toISOString(),
          requestedDate,
          cacheHits: cached.length,
          cacheMisses: 0,
        },
      };

      return NextResponse.json(response);
    }

    // Step 2: Fetch missing data from NASA API
    const freshData: EphemerisData[] = [];
    const bodiesToFetch = missing.length > 0 ? missing : bodyIds;

    for (const bodyId of bodiesToFetch) {
      // Sun is always at origin
      if (bodyId === BODY_IDS.SUN) {
        freshData.push({
          bodyId: BODY_IDS.SUN,
          name: 'Sun',
          position: { x: 0, y: 0, z: 0 },
          timestamp: new Date().toISOString(),
        });
        continue;
      }

      const data = await fetchBodyEphemeris(bodyId, requestedDate);

      if (data) {
        freshData.push(data);
      } else {
        // If NASA API fails for this body, use fallback for it
        const fallback = getFallbackData([bodyId]);
        if (fallback.length > 0) {
          freshData.push(fallback[0]);
        }
      }
    }

    // Step 3: Cache the fresh data
    if (freshData.length > 0) {
      await setCachedBulkEphemeris(requestedDate, freshData);
    }

    // Combine cached and fresh data
    const allData = [...cached, ...freshData];

    // Determine source based on what we used
    let source: DataSource = 'NASA_LIVE';
    if (cached.length > 0 && freshData.length === 0) {
      source = 'CACHE_HIT';
    } else if (cached.length > 0) {
      source = 'NASA_LIVE'; // Mixed, but primarily live
    }

    const response: EphemerisResponse = {
      data: allData,
      meta: {
        source,
        timestamp: new Date().toISOString(),
        requestedDate,
        cacheHits: cached.length,
        cacheMisses: missing.length,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Ephemeris API] Error:', error);

    // Step 4: Fall back to static data on complete failure
    const fallback = getFallbackData(bodyIds);

    const response: EphemerisResponse = {
      data: fallback,
      meta: {
        source: 'FALLBACK_DATASET',
        timestamp: new Date().toISOString(),
        requestedDate,
      },
    };

    return NextResponse.json(response);
  }
}
