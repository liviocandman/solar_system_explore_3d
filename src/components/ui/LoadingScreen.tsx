'use client';

// --- Types ---

export type LoadingStage = 'initializing' | 'fetching_data' | 'loading_textures' | 'ready';

export interface LoadingProgress {
  stage: LoadingStage;
  progress: number; // 0-100
  texturesLoaded?: number;
  texturesTotal?: number;
}

interface LoadingScreenProps {
  message?: string;
  progress?: LoadingProgress;
}

// --- Stage Messages ---

function getStageMessage(progress?: LoadingProgress): string {
  if (!progress) return 'Initializing...';

  switch (progress.stage) {
    case 'initializing':
      return 'Initializing Solar System...';
    case 'fetching_data':
      return 'Fetching orbital data from NASA...';
    case 'loading_textures':
      if (progress.texturesLoaded !== undefined && progress.texturesTotal !== undefined) {
        return `Loading textures (${progress.texturesLoaded}/${progress.texturesTotal})`;
      }
      return 'Loading planet textures...';
    case 'ready':
      return 'Ready!';
    default:
      return 'Loading...';
  }
}

// --- Component ---

export function LoadingScreen({ message, progress }: LoadingScreenProps) {
  const displayMessage = message || getStageMessage(progress);
  const progressPercent = progress?.progress ?? 0;

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] text-white z-[9999]">{/* containerStyle */}
      <div className="relative w-20 h-20 mb-6">{/* spinnerContainerStyle */}
        <div className="absolute w-full h-full border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />{/* orbitRingStyle */}
        <div className="absolute top-[15px] left-[15px] w-[50px] h-[50px] border-2 border-orange-500/20 border-t-orange-400 rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />{/* innerOrbitStyle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.6)]" />{/* planetDotStyle */}
      </div>

      <p className="text-base font-medium tracking-wider opacity-90 mb-4">{/* messageStyle */}
        {displayMessage}
      </p>

      {/* Progress bar */}
      <div className="w-[200px] h-1 bg-white/10 rounded-sm overflow-hidden mb-2">{/* progressContainerStyle */}
        <div
          className="h-full rounded-sm transition-all duration-300 ease-out"
          /* progressBarBaseStyle */
          style={{
            width: `${progressPercent}%`,
            background: progressPercent < 50
              ? 'linear-gradient(90deg, #6496ff, #8b5cf6)'
              : progressPercent < 100
                ? 'linear-gradient(90deg, #8b5cf6, #22c55e)'
                : '#22c55e',
          }}
        />
      </div>

      {/* Progress percentage */}
      <span className="text-xs opacity-60 font-mono tracking-tighter">{/* progressTextStyle */}
        {progressPercent}%
      </span>
    </div>
  );
}
