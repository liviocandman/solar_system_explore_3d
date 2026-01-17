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
  velocity?: { x: number; y: number; z: number }; // km/s
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

// Scale factor: 1 AU = 149,597,870.7 km
const AU_TO_KM = 149_597_870.7;

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
 * The response contains a text table with position and velocity vectors
 * 
 * VEC_TABLE='3' format example:
 * $$SOE
 *  2460318.500000000 = A.D. 2024-Jan-15 00:00:00.0000 TDB
 *   X = 9.876543210987654E-01 Y = 2.345678901234567E-01 Z = 1.234567890123456E-04
 *   VX= 1.234567890123456E-02 VY= 5.678901234567890E-02 VZ= 9.012345678901234E-04
 * $$EOE
 */
interface ParsedVectors {
  position: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
}

// AU per day to km per second conversion
const AU_PER_DAY_TO_KM_PER_SEC = AU_TO_KM / 86400;

function parseVectorFromResponse(result: string): ParsedVectors | null {
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

  // Find the line containing X =, Y =, Z = (position vector format)
  const positionLine = lines.find(line =>
    line.includes('X =') && line.includes('Y =') && line.includes('Z =')
  );

  // Find the line containing VX=, VY=, VZ= (velocity vector format)
  const velocityLine = lines.find(line =>
    line.includes('VX=') && line.includes('VY=') && line.includes('VZ=')
  );

  if (!positionLine) {
    console.error('[NASA Client] Could not find position vector line');
    return null;
  }

  // Parse position "X = 1.234E-01 Y = 5.678E-02 Z = 9.012E-03" format
  const xMatch = positionLine.match(/X\s*=\s*([-+]?\d+\.?\d*E?[+-]?\d*)/i);
  const yMatch = positionLine.match(/Y\s*=\s*([-+]?\d+\.?\d*E?[+-]?\d*)/i);
  const zMatch = positionLine.match(/Z\s*=\s*([-+]?\d+\.?\d*E?[+-]?\d*)/i);

  if (!xMatch || !yMatch || !zMatch) {
    console.error('[NASA Client] Could not parse X/Y/Z values from:', positionLine);
    return null;
  }

  const xAU = parseFloat(xMatch[1]);
  const yAU = parseFloat(yMatch[1]);
  const zAU = parseFloat(zMatch[1]);

  // Convert AU to km for consistent scale system (1 unit = 1M km)
  const position = {
    x: xAU * AU_TO_KM,
    y: zAU * AU_TO_KM, // Z in astronomy -> Y in Three.js (up)
    z: yAU * AU_TO_KM, // Y in astronomy -> Z in Three.js
  };

  // Parse velocity if available
  let velocity: { x: number; y: number; z: number } | undefined;
  if (velocityLine) {
    const vxMatch = velocityLine.match(/VX\s*=\s*([-+]?\d+\.?\d*E?[+-]?\d*)/i);
    const vyMatch = velocityLine.match(/VY\s*=\s*([-+]?\d+\.?\d*E?[+-]?\d*)/i);
    const vzMatch = velocityLine.match(/VZ\s*=\s*([-+]?\d+\.?\d*E?[+-]?\d*)/i);

    if (vxMatch && vyMatch && vzMatch) {
      const vxAU = parseFloat(vxMatch[1]);
      const vyAU = parseFloat(vyMatch[1]);
      const vzAU = parseFloat(vzMatch[1]);

      // Convert AU/day to km/s and apply same coordinate swap
      velocity = {
        x: vxAU * AU_PER_DAY_TO_KM_PER_SEC,
        y: vzAU * AU_PER_DAY_TO_KM_PER_SEC, // Z -> Y
        z: vyAU * AU_PER_DAY_TO_KM_PER_SEC, // Y -> Z
      };
      console.log(`[NASA Client] Parsed velocity: VX=${velocity.x.toFixed(2)}, VY=${velocity.y.toFixed(2)}, VZ=${velocity.z.toFixed(2)} km/s`);
    }
  }

  console.log(`[NASA Client] Parsed position: X=${xAU}, Y=${yAU}, Z=${zAU} AU`);

  return { position, velocity };
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
    VEC_TABLE: "'3'", // Position + Velocity vectors
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

    const parsed = parseVectorFromResponse(data.result);

    if (!parsed) {
      return null;
    }

    return {
      bodyId,
      name: BODY_NAMES[bodyId] || `Body ${bodyId}`,
      position: parsed.position,
      velocity: parsed.velocity,
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
