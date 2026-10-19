/**
 * Generates an evocative SVG portrait data URL based on NPC details
 */
export function generateCharacterAvatar(name: string, race: string, role: string, tier: 'main' | 'side'): string {
  // Hash name for deterministic variety
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const bgPalette = tier === 'main'
    ? ['#450a0a', '#172554', '#3b0764', '#14532d', '#701a75']
    : ['#1e293b', '#27272a', '#292524', '#0f172a', '#1f2937'];

  const accentPalette = tier === 'main'
    ? ['#ef4444', '#f59e0b', '#a855f7', '#06b6d4', '#10b981']
    : ['#94a3b8', '#a1a1aa', '#cbd5e1', '#d4d4d8', '#fbbf24'];

  const bg = bgPalette[Math.abs(hash) % bgPalette.length];
  const accent = accentPalette[Math.abs(hash * 3) % accentPalette.length];

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${bg}" stop-opacity="1"/>
      </radialGradient>
      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accent}"/>
        <stop offset="100%" stop-color="${bg}"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <!-- Background -->
    <rect width="400" height="400" fill="url(#bgGrad)"/>

    <!-- Subtle magic runic circles -->
    <circle cx="200" cy="200" r="160" fill="none" stroke="${accent}" stroke-width="2" stroke-opacity="0.2" stroke-dasharray="8 6"/>
    <circle cx="200" cy="200" r="120" fill="none" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.25"/>

    <!-- Silhouette Cloak / Armor Body -->
    <path d="M 90 390 C 110 260, 150 220, 200 220 C 250 220, 290 260, 310 390 Z" fill="#09090b" opacity="0.95"/>
    <path d="M 120 390 C 140 270, 160 235, 200 235 C 240 235, 260 270, 280 390 Z" fill="url(#bodyGrad)" opacity="0.4"/>

    <!-- Head / Hood / Helm -->
    <circle cx="200" cy="165" r="58" fill="#18181b" stroke="${accent}" stroke-width="3" filter="url(#glow)"/>

    <!-- Eyes / Visor Glow -->
    <ellipse cx="182" cy="162" rx="7" ry="4" fill="${accent}"/>
    <ellipse cx="218" cy="162" rx="7" ry="4" fill="${accent}"/>

    <!-- Shoulders & Cloak Clasp / Sigil -->
    <circle cx="200" cy="235" r="14" fill="${accent}" stroke="#ffffff" stroke-width="2"/>
    <polygon points="200,225 208,242 192,242" fill="#ffffff" opacity="0.8"/>

    <!-- Role / Tier Crest Ribbon -->
    <g transform="translate(200, 320)">
      <rect x="-80" y="-14" width="160" height="28" rx="6" fill="#09090b" stroke="${accent}" stroke-width="1.5"/>
      <text x="0" y="5" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" fill="#f8fafc" text-anchor="middle" letter-spacing="1">
        ${(role || 'ADVENTURER').toUpperCase().slice(0, 14)}
      </text>
    </g>

    <!-- Initials Crest in Header -->
    <g transform="translate(200, 75)">
      <circle cx="0" cy="0" r="22" fill="#09090b" stroke="${accent}" stroke-width="2"/>
      <text x="0" y="6" font-family="system-ui, sans-serif" font-size="14" font-weight="900" fill="#f8fafc" text-anchor="middle">
        ${initials}
      </text>
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
