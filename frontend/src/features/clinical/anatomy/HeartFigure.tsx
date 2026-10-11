import { useId } from 'react';

/** Anatomical heart (anterior), shaded as a 2.5D medical illustration. */
export default function HeartFigure() {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`ht-myo-${uid}`} x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#FF8A80" />
          <stop offset="40%" stopColor="#E53935" />
          <stop offset="100%" stopColor="#7F0000" />
        </linearGradient>
        <linearGradient id={`ht-vessel-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF9A9A" />
          <stop offset="100%" stopColor="#B71C1C" />
        </linearGradient>
        <filter id={`ht-soft-${uid}`} x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="8" stdDeviation="5" floodColor="#B71C1C" floodOpacity="0.28" />
        </filter>
      </defs>

      <ellipse cx="160" cy="248" rx="70" ry="12" fill="#90A4AE" opacity="0.2" />

      <g filter={`url(#ht-soft-${uid})`}>
        {/* Aorta arch */}
        <path
          d="M148 92 C148 58 176 44 204 58 C226 70 228 96 206 108"
          fill="none"
          stroke={`url(#ht-vessel-${uid})`}
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path d="M204 58 C210 36 198 24 188 22" fill="none" stroke="#C62828" strokeWidth="7" strokeLinecap="round" />
        <path d="M216 66 C228 48 236 52 240 62" fill="none" stroke="#C62828" strokeWidth="6" strokeLinecap="round" />
        <path d="M222 80 C238 74 246 86 242 98" fill="none" stroke="#C62828" strokeWidth="6" strokeLinecap="round" />

        {/* Pulmonary trunk */}
        <path
          d="M168 96 C196 78 228 86 236 108"
          fill="none"
          stroke="#E57373"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* SVC */}
        <path d="M186 78 L186 52" fill="none" stroke="#EF9A9A" strokeWidth="10" strokeLinecap="round" />

        {/* Myocardium body */}
        <path
          d="M156 96
             C118 100 86 128 84 168
             C82 214 108 250 148 268
             C168 278 176 272 186 258
             C228 248 250 210 246 168
             C242 122 214 96 176 92
             C168 90 162 92 156 96 Z"
          fill={`url(#ht-myo-${uid})`}
          stroke="#7F0000"
          strokeWidth="1.4"
        />

        {/* Epicardial fat / highlight */}
        <path
          d="M130 130 C118 148 122 180 138 198 C128 160 124 140 130 130 Z"
          fill="#FFCDD2"
          opacity="0.35"
        />
        <path
          d="M200 128 C216 146 220 176 206 198 C210 160 206 138 200 128 Z"
          fill="#7F0000"
          opacity="0.22"
        />

        {/* Interventricular groove + LAD */}
        <path
          d="M164 118 C158 160 150 210 144 250"
          fill="none"
          stroke="#FFCDD2"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M164 118 C158 160 150 210 144 250"
          fill="none"
          stroke="#B71C1C"
          strokeWidth="2.2"
        />
        {/* Diagonal / LCx suggestion */}
        <path d="M160 150 C140 158 122 176 112 198" fill="none" stroke="#B71C1C" strokeWidth="2" />
        {/* RCA */}
        <path d="M190 128 C214 140 226 168 224 198" fill="none" stroke="#B71C1C" strokeWidth="2.1" />

        {/* Apex highlight */}
        <ellipse cx="148" cy="258" rx="16" ry="10" fill="#FF8A80" opacity="0.35" />
      </g>
    </g>
  );
}
