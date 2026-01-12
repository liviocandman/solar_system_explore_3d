/**
 * NASA JPL Horizons API Client
 * Fetches ephemeris (position) data for solar system bodies
 * Docs: https://ssd-api.jpl.nasa.gov/doc/horizons.html
 */

// --- Types ---

export interface EphemerisData {
  bodyId: string;
  name: string;
  position: { x: number; y: number; z: number };
  timestamp: string;
}

interface HorizonsResponse {
  result: string;
  signature: { source: string; version: string };
}

// --- Constants ---

// NASA body IDs for major solar system objects
export const BODY_IDS = {
  SUN: '10',
  MERCURY: '199',
  VENUS: '299',
  EARTH: '399',
  MARS: '499',
  JUPITER: '599',
  SATURN: '699',
  URANUS: '799',
  NEPTUNE: '899',
} as const;

export const BODY_NAMES: Record<string, string> = {
  '10': 'Sun',
  '199': 'Mercury',
  '299': 'Venus',
  '399': 'Earth',
  '499': 'Mars',
  '599': 'Jupiter',
  '699': 'Saturn',
  '799': 'Uranus',
  '899': 'Neptune',
};

// Scale factor: 1 AU = 30 scene units (arbitrary scale for visualization)
const AU_TO_SCENE_SCALE = 30;

// Horizons API base URL
const HORIZONS_API_URL = 'https://ssd.jpl.nasa.gov/api/horizons.api';

// Rate limiting: track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 1000; // 1 second between requests

// --- Helper Functions ---

/**
 * Wait to respect rate limiting
 */
async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    await new Promise(resolve =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();
}

/**
 * Parse XYZ vector coordinates from Horizons API response
 * The response contains a text table with position vectors
 */
function parseVectorFromResponse(result: string): { x: number; y: number; z: number } | null {
  // Look for the data section between $$SOE and $$EOE markers
  const soeIndex = result.indexOf('$$SOE');
  const eoeIndex = result.indexOf('$$EOE');

  if (soeIndex === -1 || eoeIndex === -1) {
    console.error('[NASA Client] Could not find SOE/EOE markers in response');
    return null;
  }

  const dataSection = result.substring(soeIndex + 5, eoeIndex).trim();
  const lines = dataSection.split('\n').map(line => line.trim()).filter(Boolean);

  if (lines.length === 0) {
    console.error('[NASA Client] No data lines found between SOE/EOE');
    return null;
  }

  // Parse the vector line - format varies but typically: X, Y, Z in AU
  // Example line: " 9.876543210987654E-01  2.345678901234567E-01  1.234567890123456E-04"
  const dataLine = lines[0];
  const values = dataLine.split(/\s+/).filter(Boolean);

  // Find numeric values that look like scientific notation
  const numbers = values
    .map(v => parseFloat(v))
    .filter(n => !isNaN(n));

  if (numbers.length >= 3) {
    return {
      x: numbers[0] * AU_TO_SCENE_SCALE,
      y: numbers[2] * AU_TO_SCENE_SCALE, // Z in astronomy -> Y in Three.js (up)
      z: numbers[1] * AU_TO_SCENE_SCALE, // Y in astronomy -> Z in Three.js
    };
  }

  console.error('[NASA Client] Could not parse vector values from:', dataLine);
  return null;
}

// --- Main API Functions ---

/**
 * Fetch ephemeris data for a single celestial body
 */
export async function fetchBodyEphemeris(
  bodyId: string,
  date?: string
): Promise<EphemerisData | null> {
  await enforceRateLimit();

  const targetDate = date || new Date().toISOString().split('T')[0];
  const stopDate = new Date(new Date(targetDate).getTime() + 86400000)
    .toISOString()
    .split('T')[0];

  const params = new URLSearchParams({
    format: 'json',
    COMMAND: `'${bodyId}'`,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'VECTORS',
    CENTER: "'500@10'", // Sun-centered
    START_TIME: `'${targetDate}'`,
    STOP_TIME: `'${stopDate}'`,
    STEP_SIZE: "'1 d'",
    VEC_TABLE: "'2'", // Position vectors only
    REF_PLANE: 'ECLIPTIC',
    REF_SYSTEM: 'ICRF',
    VEC_CORR: "'NONE'",
    OUT_UNITS: "'AU-D'",
    CSV_FORMAT: 'NO',
  });

  try {
    const response = await fetch(`${HORIZONS_API_URL}?${params.toString()}`);

    if (!response.ok) {
      console.error(`[NASA Client] HTTP error: ${response.status}`);
      return null;
    }

    const data: HorizonsResponse = await response.json();

    if (!data.result) {
      console.error('[NASA Client] No result in response');
      return null;
    }

    const position = parseVectorFromResponse(data.result);

    if (!position) {
      return null;
    }

    return {
      bodyId,
      name: BODY_NAMES[bodyId] || `Body ${bodyId}`,
      position,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[NASA Client] Error fetching ephemeris for ${bodyId}:`, error);
    return null;
  }
}

/**
 * Fetch ephemeris data for multiple celestial bodies
 */
export async function fetchAllEphemeris(
  bodyIds?: string[],
  date?: string
): Promise<EphemerisData[]> {
  const ids = bodyIds || Object.values(BODY_IDS).filter(id => id !== BODY_IDS.SUN);
  const results: EphemerisData[] = [];

  // Add Sun at origin
  results.push({
    bodyId: BODY_IDS.SUN,
    name: 'Sun',
    position: { x: 0, y: 0, z: 0 },
    timestamp: new Date().toISOString(),
  });

  // Fetch each planet sequentially to respect rate limits
  for (const bodyId of ids) {
    if (bodyId === BODY_IDS.SUN) continue;

    const data = await fetchBodyEphemeris(bodyId, date);
    if (data) {
      results.push(data);
    }
  }

  return results;
}
