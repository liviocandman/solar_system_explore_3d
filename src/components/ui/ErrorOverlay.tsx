'use client';

import { CSSProperties } from 'react';

// --- Types ---

export type ErrorType =
  | 'NASA_API_ERROR'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'WEBGL_NOT_SUPPORTED'
  | 'WEBGL_CONTEXT_LOST'
  | 'TEXTURE_LOAD_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppError {
  type: ErrorType;
  message: string;
  technicalDetails?: string;
  canRetry: boolean;
}

interface ErrorOverlayProps {
  error: AppError;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
  isFallbackActive?: boolean;
}

// --- Error Messages ---

const ERROR_MESSAGES: Record<ErrorType, { title: string; description: string; icon: string }> = {
  NASA_API_ERROR: {
    title: 'NASA API Error',
    description: 'Unable to fetch orbital data from NASA. The service may be temporarily unavailable.',
    icon: '🛰️',
  },
  NETWORK_ERROR: {
    title: 'Network Error',
    description: 'Unable to connect to the server. Please check your internet connection.',
    icon: '📡',
  },
  VALIDATION_ERROR: {
    title: 'Data Validation Error',
    description: 'The data received from the server was invalid or corrupted.',
    icon: '⚠️',
  },
  TIMEOUT_ERROR: {
    title: 'Request Timeout',
    description: 'The server took too long to respond. Please try again.',
    icon: '⏱️',
  },
  WEBGL_NOT_SUPPORTED: {
    title: 'WebGL Not Supported',
    description: 'Your browser does not support WebGL, which is required for 3D rendering.',
    icon: '🖥️',
  },
  WEBGL_CONTEXT_LOST: {
    title: 'Graphics Context Lost',
    description: 'The 3D rendering context was lost. This can happen due to GPU memory issues.',
    icon: '⚠️',
  },
  TEXTURE_LOAD_ERROR: {
    title: 'Texture Load Error',
    description: 'Some planet textures could not be loaded. The scene may appear incomplete.',
    icon: '🎨',
  },
  UNKNOWN_ERROR: {
    title: 'Unknown Error',
    description: 'An unexpected error occurred. Please try again or refresh the page.',
    icon: '❌',
  },
};

// --- Styles ---

const overlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
  backdropFilter: 'blur(10px)',
  color: '#ffffff',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  zIndex: 10000,
  padding: '24px',
};

const cardStyle: CSSProperties = {
  maxWidth: '480px',
  width: '100%',
  padding: '32px',
  background: 'rgba(0, 0, 0, 0.5)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  textAlign: 'center',
};

const iconStyle: CSSProperties = {
  fontSize: '48px',
  marginBottom: '16px',
};

const titleStyle: CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 600,
  marginBottom: '12px',
  color: '#fff',
};

const descriptionStyle: CSSProperties = {
  fontSize: '1rem',
  lineHeight: 1.6,
  color: 'rgba(255, 255, 255, 0.7)',
  marginBottom: '24px',
};

const buttonStyle: CSSProperties = {
  padding: '12px 32px',
  fontSize: '1rem',
  fontWeight: 500,
  color: '#fff',
  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'transform 0.2s, box-shadow 0.2s',
  marginRight: '12px',
};

const buttonDisabledStyle: CSSProperties = {
  ...buttonStyle,
  opacity: 0.5,
  cursor: 'not-allowed',
};

const secondaryButtonStyle: CSSProperties = {
  padding: '12px 32px',
  fontSize: '1rem',
  fontWeight: 500,
  color: 'rgba(255, 255, 255, 0.8)',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  background: 'rgba(234, 179, 8, 0.2)',
  border: '1px solid rgba(234, 179, 8, 0.3)',
  borderRadius: '8px',
  color: '#fbbf24',
  fontSize: '0.875rem',
  fontWeight: 500,
  marginBottom: '24px',
};

const technicalStyle: CSSProperties = {
  marginTop: '24px',
  padding: '12px',
  background: 'rgba(0, 0, 0, 0.3)',
  borderRadius: '8px',
  fontSize: '0.75rem',
  fontFamily: 'monospace',
  color: 'rgba(255, 255, 255, 0.5)',
  textAlign: 'left',
  maxHeight: '100px',
  overflow: 'auto',
};

const retryInfoStyle: CSSProperties = {
  fontSize: '0.75rem',
  color: 'rgba(255, 255, 255, 0.5)',
  marginTop: '12px',
};

// --- Component ---

export function ErrorOverlay({
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  isFallbackActive = false,
}: ErrorOverlayProps) {
  const errorInfo = ERROR_MESSAGES[error.type] || ERROR_MESSAGES.UNKNOWN_ERROR;
  const canRetry = error.canRetry && retryCount < maxRetries;
  const isWebGLError = error.type === 'WEBGL_NOT_SUPPORTED' || error.type === 'WEBGL_CONTEXT_LOST';

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        {/* Fallback mode badge */}
        {isFallbackActive && (
          <div style={badgeStyle}>
            <span>⚠️</span>
            <span>Fallback Mode Active</span>
          </div>
        )}

        {/* Error icon */}
        <div style={iconStyle}>{errorInfo.icon}</div>

        {/* Title */}
        <h2 style={titleStyle}>{errorInfo.title}</h2>

        {/* Description */}
        <p style={descriptionStyle}>{errorInfo.description}</p>

        {/* Action buttons */}
        <div>
          {isWebGLError ? (
            <button style={buttonStyle} onClick={handleReload}>
              Reload Page
            </button>
          ) : (
            <>
              {error.canRetry && (
                <button
                  style={canRetry ? buttonStyle : buttonDisabledStyle}
                  onClick={canRetry ? onRetry : undefined}
                  disabled={!canRetry}
                >
                  {canRetry ? 'Try Again' : 'Max Retries Reached'}
                </button>
              )}
              <button style={secondaryButtonStyle} onClick={handleReload}>
                Refresh Page
              </button>
            </>
          )}
        </div>

        {/* Retry count info */}
        {error.canRetry && retryCount > 0 && (
          <p style={retryInfoStyle}>
            Retry attempt {retryCount} of {maxRetries}
          </p>
        )}

        {/* Technical details (collapsible in future) */}
        {error.technicalDetails && (
          <div style={technicalStyle}>
            <strong>Technical Details:</strong>
            <br />
            {error.technicalDetails}
          </div>
        )}
      </div>
    </div>
  );
}
