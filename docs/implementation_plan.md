# 🚀 Sprint 1 Implementation Plan: Solar Explorer 3D

Establish the foundational infrastructure for the Solar Explorer 3D application, including Next.js setup, 3D scene rendering with React Three Fiber, and the NASA ephemeris API integration.

## User Review Required

> [!IMPORTANT]
> **NASA API Key Required**: You'll need to obtain a free API key from [NASA API Portal](https://api.nasa.gov/) before the API integration phase.

> [!WARNING]  
> **Upstash Redis Setup**: An Upstash account is required for the caching layer. We can start with local development without Redis and add it later if preferred.

---

## Proposed Changes

### Phase 1: Project Initialization

#### [NEW] Next.js Project Scaffold

Initialize fresh Next.js 14 project with required dependencies:

```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

**Dependencies to install:**
- `@react-three/fiber` - React Three Fiber core
- `@react-three/drei` - Useful R3F helpers (OrbitControls, Stars, etc.)
- `three` - Three.js core
- `@types/three` - TypeScript types

---

### Phase 2: 3D Scene Components

#### [NEW] [SceneManager.tsx](file:///c:/SENAC/solar-explore-3d/src/components/Scene/SceneManager.tsx)

Main 3D canvas wrapper with:
- `Canvas` from R3F with camera config
- `OrbitControls` for navigation
- Quality tier system integration
- Suspense boundary for loading

#### [NEW] [qualityTier.ts](file:///c:/SENAC/solar-explore-3d/src/lib/qualityTier.ts)

Hardware detection utility:
- Detect GPU capabilities via `WebGLRenderer.capabilities`
- Detect device memory via `navigator.deviceMemory`
- Return tier: `'low' | 'mid' | 'high'`

#### [NEW] [Sun.tsx](file:///c:/SENAC/solar-explore-3d/src/components/Scene/Sun.tsx)

Sun component with:
- Sphere geometry at origin
- Emissive material with glow
- Point light for illumination

#### [NEW] [CelestialBody.tsx](file:///c:/SENAC/solar-explore-3d/src/components/Scene/CelestialBody.tsx)

Base component for planets:
- Position from ephemeris data
- Texture loading with LOD support
- Click-to-focus handler

#### [NEW] [Earth.tsx](file:///c:/SENAC/solar-explore-3d/src/components/Scene/Earth.tsx)

Earth implementation extending CelestialBody:
- Earth texture application
- Rotation animation

---

### Phase 3: API & Data Layer

#### [NEW] [route.ts](file:///c:/SENAC/solar-explore-3d/src/app/api/ephemeris/route.ts)

Next.js API route handler:
- GET endpoint with query params (`date`, `ids`)
- Cache-first strategy
- Error handling with fallback

#### [NEW] [nasaClient.ts](file:///c:/SENAC/solar-explore-3d/src/services/nasaClient.ts)

NASA JPL Horizons API wrapper:
- Fetch ephemeris data for celestial bodies
- Parse and normalize response
- Rate limiting protection

#### [NEW] [cacheService.ts](file:///c:/SENAC/solar-explore-3d/src/services/cacheService.ts)

Redis caching layer:
- Check/set cache operations
- Dynamic TTL (24h slow planets, 1h fast planets)
- Graceful degradation if Redis unavailable

#### [NEW] [fallback_planets.json](file:///c:/SENAC/solar-explore-3d/src/lib/fallback_planets.json)

Static fallback data with approximate positions for all celestial bodies.

---

### Phase 4: Main Application

#### [MODIFY] [page.tsx](file:///c:/SENAC/solar-explore-3d/src/app/page.tsx)

Main entry point:
- Render `SceneManager`
- Fetch ephemeris data on load
- Display loading/error states
- Toast notification for fallback mode

---

## Final Project Structure

```
solar-explore-3d/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── ephemeris/
│   │   │       └── route.ts
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── Scene/
│   │       ├── SceneManager.tsx
│   │       ├── Sun.tsx
│   │       ├── CelestialBody.tsx
│   │       └── Earth.tsx
│   ├── services/
│   │   ├── nasaClient.ts
│   │   └── cacheService.ts
│   └── lib/
│       ├── qualityTier.ts
│       └── fallback_planets.json
├── public/
│   └── textures/
│       └── earth_2k.webp
├── .env.local.example
└── docs/
```

---

## Verification Plan

### Automated Tests

**1. Build Verification**
```bash
npm run build
```
- Expected: Build completes without errors

**2. Lint Check**
```bash
npm run lint
```
- Expected: No linting errors

### Browser Testing

**3. 3D Scene Rendering**
- Run `npm run dev`
- Open http://localhost:3000 in browser
- Expected: 3D scene loads with Sun at center and Earth visible
- Expected: OrbitControls allow zoom/pan/rotate
- Expected: Console shows quality tier detected

**4. API Endpoint Test**
- With dev server running, open http://localhost:3000/api/ephemeris
- Expected: JSON response with ephemeris data or fallback data
- Expected: Response includes `meta.source` field (`CACHE_HIT`, `NASA_LIVE`, or `FALLBACK_DATASET`)

**5. Fallback Mode Test**
- Temporarily set invalid NASA_API_KEY in `.env.local`
- Restart dev server and reload page
- Expected: Scene still renders with approximate positions
- Expected: Toast notification appears: "Modo Offline: Posições aproximadas"

### Manual Verification (User)

**6. Mobile Performance Test**
- Open the deployed Vercel URL on a mobile device
- Expected: Scene renders at ~30 FPS (can check via React DevTools profiler or visual smoothness)
- Expected: Controls work with touch gestures

---

## Questions for User

1. **Do you already have a NASA API key**, or should I include instructions to obtain one?
2. **Do you want to set up Upstash Redis now**, or start with local development first (no caching)?
3. **For textures**, should I use placeholder colors initially or do you have texture assets ready?
