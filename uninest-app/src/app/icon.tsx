import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #059669 100%)',
          borderRadius: '112px',
          color: 'white',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '340px',
            height: '340px',
            borderRadius: '80px',
            background: 'rgba(255, 255, 255, 0.14)',
            border: '6px solid rgba(255, 255, 255, 0.35)',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 190,
              fontWeight: 900,
              letterSpacing: '-8px',
              lineHeight: 1,
              color: '#ffffff',
              display: 'flex',
            }}
          >
            U
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: '6px',
              color: '#a7f3d0',
              marginTop: 8,
              display: 'flex',
            }}
          >
            ESCROW
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
