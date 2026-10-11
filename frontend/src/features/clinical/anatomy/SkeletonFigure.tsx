import { useId } from 'react';

/** Anterior 2.5D skeleton — patient's right is on the viewer's left. */
export default function SkeletonFigure({ accent = '#8D6E63' }: { accent?: string }) {
  const uid = useId().replace(/:/g, '');
  const bone = `url(#sk-bone-${uid})`;
  const boneD = `url(#sk-bone-d-${uid})`;
  const joint = `url(#sk-joint-${uid})`;
  return (
    <g>
      <defs>
        <linearGradient id={`sk-bone-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFEF8" />
          <stop offset="35%" stopColor="#F3E6D2" />
          <stop offset="100%" stopColor="#BCAAA4" />
        </linearGradient>
        <linearGradient id={`sk-bone-d-${uid}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFE0CC" />
          <stop offset="100%" stopColor="#8D6E63" />
        </linearGradient>
        <radialGradient id={`sk-joint-${uid}`} cx="32%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="55%" stopColor="#E0D0BC" />
          <stop offset="100%" stopColor="#6D4C41" />
        </radialGradient>
        <filter id={`sk-soft-${uid}`} x="-18%" y="-8%" width="136%" height="124%">
          <feDropShadow dx="0" dy="4" stdDeviation="2.6" floodColor="#4E342E" floodOpacity="0.28" />
        </filter>
      </defs>

      <ellipse cx="140" cy="408" rx="82" ry="11" fill="#607D8B" opacity="0.2" />

      <g filter={`url(#sk-soft-${uid})`} stroke={accent} strokeWidth="0.9" strokeLinejoin="round" pointerEvents="none">
        {/* Skull */}
        <ellipse cx="140" cy="32" rx="27" ry="31" fill={bone} />
        <ellipse cx="127" cy="24" rx="11" ry="13" fill="#FFFDE7" opacity="0.5" />
        <path d="M116 38 Q140 18 164 38 Q168 58 158 66 L140 70 L122 66 Q112 58 116 38 Z" fill={boneD} opacity="0.25" stroke="none" />
        <ellipse cx="128" cy="36" rx="7.5" ry="6.5" fill="#3E2723" opacity="0.5" />
        <ellipse cx="152" cy="36" rx="7.5" ry="6.5" fill="#3E2723" opacity="0.5" />
        <ellipse cx="128" cy="35" rx="2.2" ry="2" fill="#D7CCC8" opacity="0.4" stroke="none" />
        <path d="M140 40 L134 52 L146 52 Z" fill="#5D4037" opacity="0.55" stroke="none" />
        <rect x="129" y="52" width="22" height="5" rx="1" fill="#F5F0E6" />
        <path d="M116 54 Q140 80 164 54 L157 64 Q140 84 123 64 Z" fill={bone} />

        {/* Cervical */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={`c${i}`} x="131" y={68 + i * 6.6} width="18" height="5.8" rx="1.8" fill={bone} />
        ))}

        {/* Clavicles as filled bones */}
        <path d="M140 93 C112 86 88 88 70 98 C72 104 90 98 140 100 Z" fill={bone} />
        <path d="M140 93 C168 86 192 88 210 98 C208 104 190 98 140 100 Z" fill={boneD} />

        {/* Scapula / GH joints */}
        <circle cx="70" cy="102" r="12" fill={joint} />
        <circle cx="210" cy="102" r="12" fill={joint} />
        <circle cx="70" cy="102" r="4.5" fill="#6D4C41" opacity="0.25" stroke="none" />
        <circle cx="210" cy="102" r="4.5" fill="#6D4C41" opacity="0.25" stroke="none" />

        {/* Ribs — filled bands */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const y = 104 + i * 10.5;
          const rx = 38 + Math.min(i, 3) * 6 - Math.max(i - 3, 0) * 8;
          return (
            <g key={`rib${i}`}>
              <path
                d={`M146 ${y} C ${140 - rx} ${y - 7}, ${126 - rx} ${y + 9}, 146 ${y + 7} C ${140 - rx + 8} ${y + 3}, ${140 - rx + 8} ${y - 2}, 146 ${y} Z`}
                fill={bone}
              />
              <path
                d={`M134 ${y} C ${140 + rx} ${y - 7}, ${154 + rx} ${y + 9}, 134 ${y + 7} C ${140 + rx - 8} ${y + 3}, ${140 + rx - 8} ${y - 2}, 134 ${y} Z`}
                fill={boneD}
              />
            </g>
          );
        })}
        <rect x="133" y="100" width="14" height="60" rx="3.5" fill={bone} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={`st${i}`} x="136" y={106 + i * 13} width="8" height="6" rx="1" fill="#D7CCC8" stroke="none" />
        ))}

        {/* Visible spine */}
        {Array.from({ length: 11 }).map((_, i) => (
          <rect key={`v${i}`} x="132" y={100 + i * 7.4} width="16" height="6.4" rx="1.6" fill={bone} />
        ))}

        {/* Humerus filled */}
        <path d="M64 112 C60 114 46 168 48 178 C54 184 62 180 60 168 C74 116 76 110 64 112 Z" fill={bone} />
        <path d="M216 112 C220 114 234 168 232 178 C226 184 218 180 220 168 C206 116 204 110 216 112 Z" fill={boneD} />
        <ellipse cx="52" cy="178" rx="10" ry="9" fill={joint} />
        <ellipse cx="228" cy="178" rx="10" ry="9" fill={joint} />

        {/* Forearm */}
        <path d="M46 186 C40 188 32 230 34 240 C40 244 46 240 44 228 C54 190 54 184 46 186 Z" fill={bone} />
        <path d="M58 186 C54 188 46 230 48 240 C52 242 58 238 56 226 C64 190 64 184 58 186 Z" fill={boneD} />
        <path d="M234 186 C240 188 248 230 246 240 C240 244 234 240 236 228 C226 190 226 184 234 186 Z" fill={bone} />
        <path d="M222 186 C226 188 234 230 232 240 C228 242 222 238 224 226 C216 190 216 184 222 186 Z" fill={boneD} />
        <ellipse cx="40" cy="242" rx="8.5" ry="6.5" fill={joint} />
        <ellipse cx="240" cy="242" rx="8.5" ry="6.5" fill={joint} />

        {/* Hands */}
        <ellipse cx="28" cy="260" rx="15" ry="11" fill={bone} />
        <ellipse cx="252" cy="260" rx="15" ry="11" fill={bone} />
        {[0, 1, 2, 3].map((i) => (
          <g key={`f${i}`}>
            <rect x={15 + i * 6.4} y="268" width="4.2" height="17" rx="1.6" fill={bone} />
            <rect x={251 + i * 6.4} y="268" width="4.2" height="17" rx="1.6" fill={bone} />
          </g>
        ))}

        {/* Pelvis */}
        <path
          d="M106 186 C118 170 162 170 174 186 C188 202 190 218 172 226 L154 220 140 230 126 220 108 226 C90 218 92 202 106 186 Z"
          fill={bone}
        />
        <ellipse cx="122" cy="206" rx="11" ry="9" fill="#8D6E63" opacity="0.28" stroke="none" />
        <ellipse cx="158" cy="206" rx="11" ry="9" fill="#8D6E63" opacity="0.28" stroke="none" />
        <path d="M126 216 Q140 232 154 216" fill="none" stroke="#6D4C41" strokeWidth="2.6" />

        {/* Femur */}
        <path d="M116 224 C108 226 104 286 108 296 C118 304 128 298 124 284 C128 228 126 222 116 224 Z" fill={bone} />
        <path d="M164 224 C172 226 176 286 172 296 C162 304 152 298 156 284 C152 228 154 222 164 224 Z" fill={boneD} />
        <ellipse cx="114" cy="300" rx="13" ry="11" fill={joint} />
        <ellipse cx="166" cy="300" rx="13" ry="11" fill={joint} />

        {/* Tibia */}
        <path d="M108 310 C104 312 102 360 108 370 C116 376 122 370 118 356 C122 314 118 308 108 310 Z" fill={bone} />
        <path d="M172 310 C176 312 178 360 172 370 C164 376 158 370 162 356 C158 314 162 308 172 310 Z" fill={boneD} />
        <path d="M122 314 L118 364" fill="none" stroke="#A1887F" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M158 314 L162 364" fill="none" stroke="#A1887F" strokeWidth="3.2" strokeLinecap="round" />
        <ellipse cx="112" cy="374" rx="10" ry="7.5" fill={joint} />
        <ellipse cx="168" cy="374" rx="10" ry="7.5" fill={joint} />

        {/* Feet */}
        <path d="M88 382 C78 384 74 394 90 398 C108 400 122 392 118 386 C110 380 100 380 88 382 Z" fill={bone} />
        <path d="M192 382 C202 384 206 394 190 398 C172 400 158 392 162 386 C170 380 180 380 192 382 Z" fill={bone} />
      </g>
    </g>
  );
}
