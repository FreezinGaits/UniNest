import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'UniNest — Student Housing & Escrow OS',
    short_name: 'UniNest',
    description:
      'Verified Student PG Marketplace, Two-Stage OTP Escrow Handshake, Direct UPI UTR Ledger, and 5-Portal Campus Housing Operating System.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0f172a',
    theme_color: '#2563eb',
    categories: ['lifestyle', 'finance', 'education', 'business'],
    icons: [
      {
        src: '/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Student OTP & Escrow',
        short_name: 'Escrow OTP',
        description: 'Open Stage 1 Visit OTP & Stage 2 Move-In Key Workspace',
        url: '/student/bookings',
      },
      {
        name: 'Find Verified PGs',
        short_name: 'Search PGs',
        description: 'Browse verified campus PGs near PCTE Ludhiana',
        url: '/student/search',
      },
      {
        name: 'Landlord OTP Console',
        short_name: 'Landlord OTP',
        description: 'Generate 4-digit Visit OTP & verify 6-digit Move-In Key',
        url: '/landlord/bookings',
      },
      {
        name: 'Legal & Escrow Charter',
        short_name: 'Legal Charter',
        description: 'Indian Contract Act Sec 73/74 Escrow & 11-Month Leave License',
        url: '/legal',
      },
    ],
  };
}
