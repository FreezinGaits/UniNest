import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
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
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #059669 100%)',
          borderRadius: '40px',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1,
            color: '#ffffff',
            display: 'flex',
          }}
        >
          U
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '2px',
            color: '#a7f3d0',
            marginTop: 4,
            display: 'flex',
          }}
        >
          UNINEST
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
