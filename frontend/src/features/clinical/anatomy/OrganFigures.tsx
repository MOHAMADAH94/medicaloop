import { useId } from 'react';

export function EntFaceFigure() {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`ent-skin-${uid}`} x1="0.3" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#F6D7C5" />
          <stop offset="100%" stopColor="#D7A98A" />
        </linearGradient>
        <radialGradient id={`ent-ear-${uid}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F8BBD0" />
          <stop offset="100%" stopColor="#C48B7A" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="128" rx="72" ry="96" fill={`url(#ent-skin-${uid})`} stroke="#A1887F" strokeWidth="1.2" />
      <ellipse cx="150" cy="70" rx="58" ry="28" fill="#E8C3B0" opacity="0.45" />
      {/* Eyes */}
      <ellipse cx="122" cy="108" rx="12" ry="7" fill="#FAFAFA" stroke="#8D6E63" />
      <ellipse cx="178" cy="108" rx="12" ry="7" fill="#FAFAFA" stroke="#8D6E63" />
      <circle cx="122" cy="108" r="3.4" fill="#4E342E" />
      <circle cx="178" cy="108" r="3.4" fill="#4E342E" />
      {/* Nose */}
      <path d="M150 112 L160 148 L150 156 L140 148 Z" fill="#E0B8A4" stroke="#A1887F" strokeWidth="0.8" />
      <ellipse cx="144" cy="152" rx="4" ry="3" fill="#C48B7A" />
      <ellipse cx="156" cy="152" rx="4" ry="3" fill="#C48B7A" />
      {/* Mouth / throat opening */}
      <path d="M128 176 Q150 196 172 176" fill="#6D2C2C" stroke="#8D6E63" />
      <ellipse cx="150" cy="188" rx="10" ry="6" fill="#B71C1C" opacity="0.7" />
      {/* Ears */}
      <ellipse cx="74" cy="128" rx="16" ry="28" fill={`url(#ent-ear-${uid})`} stroke="#A1887F" />
      <ellipse cx="226" cy="128" rx="16" ry="28" fill={`url(#ent-ear-${uid})`} stroke="#A1887F" />
      <ellipse cx="74" cy="128" rx="6" ry="12" fill="#6D4C41" opacity="0.35" />
      <ellipse cx="226" cy="128" rx="6" ry="12" fill="#6D4C41" opacity="0.35" />
      {/* Neck / larynx */}
      <path d="M128 220 L172 220 L168 258 L132 258 Z" fill={`url(#ent-skin-${uid})`} stroke="#A1887F" />
      <ellipse cx="150" cy="238" rx="14" ry="10" fill="#D7A98A" stroke="#8D6E63" />
    </g>
  );
}

export function LungsFigure() {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`lu-tiss-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFCDD2" />
          <stop offset="45%" stopColor="#EF9A9A" />
          <stop offset="100%" stopColor="#C62828" />
        </linearGradient>
        <linearGradient id={`lu-air-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B3E5FC" />
          <stop offset="100%" stopColor="#4FC3F7" />
        </linearGradient>
      </defs>
      {/* Trachea */}
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x="141" y={18 + i * 9} width="18" height="7" rx="2" fill={`url(#lu-air-${uid})`} stroke="#0288D1" strokeWidth="0.8" />
      ))}
      {/* Carina / bronchi */}
      <path d="M150 72 L104 96" fill="none" stroke="#0288D1" strokeWidth="6" strokeLinecap="round" />
      <path d="M150 72 L196 96" fill="none" stroke="#0288D1" strokeWidth="6" strokeLinecap="round" />
      {/* Right lung (viewer's left) */}
      <path
        d="M118 78 C70 74 48 120 52 168 C56 214 78 236 112 228 C128 224 132 190 128 150 C126 118 130 90 118 78 Z"
        fill={`url(#lu-tiss-${uid})`}
        stroke="#C62828"
        strokeWidth="1.2"
      />
      <path d="M70 128 L118 122" stroke="#FFCDD2" strokeWidth="1" opacity="0.7" />
      <path d="M64 168 L116 160" stroke="#FFCDD2" strokeWidth="1" opacity="0.7" />
      {/* Left lung */}
      <path
        d="M182 78 C230 74 252 120 248 168 C244 214 222 236 196 224 C176 214 168 186 172 150 C174 118 170 90 182 78 Z"
        fill={`url(#lu-tiss-${uid})`}
        stroke="#C62828"
        strokeWidth="1.2"
      />
      <path d="M230 128 L182 122" stroke="#FFCDD2" strokeWidth="1" opacity="0.7" />
      {/* Cardiac notch */}
      <path d="M176 150 Q168 176 188 200" fill="#FAFAFA" opacity="0.15" />
      {/* Diaphragm */}
      <path d="M52 228 Q150 250 248 228" fill="none" stroke="#546E7A" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

export function DigestiveFigure() {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`gi-liv-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EF9A9A" />
          <stop offset="100%" stopColor="#8D2B2B" />
        </linearGradient>
        <linearGradient id={`gi-sto-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFCC80" />
          <stop offset="100%" stopColor="#EF6C00" />
        </linearGradient>
        <linearGradient id={`gi-bow-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE0B2" />
          <stop offset="100%" stopColor="#FB8C00" />
        </linearGradient>
      </defs>
      <rect x="136" y="8" width="14" height="52" rx="6" fill="#E57373" stroke="#C62828" />
      <ellipse cx="96" cy="92" rx="48" ry="30" fill={`url(#gi-liv-${uid})`} stroke="#6D1B1B" />
      <ellipse cx="118" cy="108" rx="8" ry="12" fill="#FFC107" stroke="#F9A825" />
      <path
        d="M148 58 C176 62 210 78 208 104 C206 128 176 138 154 128 C138 120 148 96 160 88 C176 78 168 64 148 58 Z"
        fill={`url(#gi-sto-${uid})`}
        stroke="#E65100"
      />
      <ellipse cx="150" cy="132" rx="36" ry="10" fill="#FFCC80" stroke="#EF6C00" />
      <path
        d="M86 168 C70 190 88 220 120 226 C160 234 200 214 210 186 C220 158 186 148 160 160 C130 174 110 150 86 168 Z"
        fill={`url(#gi-bow-${uid})`}
        stroke="#EF6C00"
      />
      <path
        d="M64 200 C58 230 80 258 140 262 C210 266 228 236 220 210"
        fill="none"
        stroke="#E65100"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <ellipse cx="140" cy="292" rx="16" ry="14" fill="#E65100" />
    </g>
  );
}

export function BrainFigure() {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`br-cortex-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#F8BBD0" />
          <stop offset="50%" stopColor="#F48FB1" />
          <stop offset="100%" stopColor="#AD1457" />
        </linearGradient>
        <linearGradient id={`br-cer-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#CE93D8" />
          <stop offset="100%" stopColor="#6A1B9A" />
        </linearGradient>
      </defs>
      <path
        d="M150 24 C92 24 64 62 70 104 C76 144 108 158 150 158 C192 158 224 144 230 104 C236 62 208 24 150 24 Z"
        fill={`url(#br-cortex-${uid})`}
        stroke="#880E4F"
        strokeWidth="1.3"
      />
      {/* Sulci */}
      <path d="M92 88 Q120 70 150 80 Q180 70 208 88" fill="none" stroke="#FCE4EC" strokeWidth="1.4" opacity="0.8" />
      <path d="M100 112 Q150 98 200 112" fill="none" stroke="#FCE4EC" strokeWidth="1.2" opacity="0.7" />
      <path d="M118 48 Q150 58 182 48" fill="none" stroke="#FCE4EC" strokeWidth="1.2" opacity="0.7" />
      <ellipse cx="150" cy="176" rx="34" ry="18" fill={`url(#br-cer-${uid})`} stroke="#4A148C" />
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={i} x1={128 + i * 11} y1="166" x2={128 + i * 11} y2="186" stroke="#E1BEE7" strokeWidth="1.4" />
      ))}
      <rect x="142" y="192" width="16" height="28" rx="6" fill="#7E57C2" stroke="#4527A0" />
      <rect x="144" y="220" width="12" height="58" rx="5" fill="#5C6BC0" stroke="#3949AB" />
      <path d="M150 278 L86 250" stroke="#7986CB" strokeWidth="3" strokeLinecap="round" />
      <path d="M150 278 L214 250" stroke="#7986CB" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

export function UrinaryFigure() {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`ur-kid-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EF9A9A" />
          <stop offset="100%" stopColor="#C62828" />
        </linearGradient>
        <linearGradient id={`ur-bla-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B3E5FC" />
          <stop offset="100%" stopColor="#0277BD" />
        </linearGradient>
      </defs>
      <ellipse cx="78" cy="78" rx="28" ry="40" fill={`url(#ur-kid-${uid})`} stroke="#8B1A1A" />
      <ellipse cx="78" cy="78" rx="10" ry="16" fill="#FFCDD2" opacity="0.5" />
      <ellipse cx="202" cy="78" rx="28" ry="40" fill={`url(#ur-kid-${uid})`} stroke="#8B1A1A" />
      <ellipse cx="202" cy="78" rx="10" ry="16" fill="#FFCDD2" opacity="0.5" />
      <path d="M78 116 C90 150 110 176 128 190" fill="none" stroke="#4FC3F7" strokeWidth="5" />
      <path d="M202 116 C190 150 170 176 152 190" fill="none" stroke="#4FC3F7" strokeWidth="5" />
      <ellipse cx="140" cy="210" rx="42" ry="28" fill={`url(#ur-bla-${uid})`} stroke="#01579B" />
      <ellipse cx="140" cy="242" rx="16" ry="10" fill="#CE93D8" stroke="#6A1B9A" />
      <rect x="134" y="250" width="12" height="26" rx="4" fill="#4FC3F7" stroke="#0277BD" />
      <ellipse cx="122" cy="282" rx="12" ry="14" fill="#FFAB91" stroke="#E64A19" />
      <ellipse cx="158" cy="282" rx="12" ry="14" fill="#FFAB91" stroke="#E64A19" />
    </g>
  );
}

export function EndocrineFigure() {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`en-body-${uid}`} x1="0.4" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#F6D7C5" />
          <stop offset="100%" stopColor="#D7A98A" />
        </linearGradient>
      </defs>
      <ellipse cx="130" cy="28" rx="22" ry="24" fill={`url(#en-body-${uid})`} stroke="#A1887F" />
      <rect x="118" y="50" width="24" height="16" rx="8" fill={`url(#en-body-${uid})`} stroke="#A1887F" />
      <path d="M88 70 Q130 62 172 70 L176 150 Q130 162 84 150 Z" fill={`url(#en-body-${uid})`} stroke="#A1887F" />
      <rect x="72" y="72" width="18" height="70" rx="9" fill={`url(#en-body-${uid})`} stroke="#A1887F" />
      <rect x="170" y="72" width="18" height="70" rx="9" fill={`url(#en-body-${uid})`} stroke="#A1887F" />
      <rect x="102" y="152" width="24" height="70" rx="10" fill={`url(#en-body-${uid})`} stroke="#A1887F" />
      <rect x="134" y="152" width="24" height="70" rx="10" fill={`url(#en-body-${uid})`} stroke="#A1887F" />
      {/* Gland highlights */}
      <ellipse cx="130" cy="22" rx="8" ry="6" fill="#F48FB1" />
      <circle cx="130" cy="48" r="6" fill="#EC407A" />
      <path d="M114 88 Q130 74 146 88 Q130 102 114 88" fill="#E91E63" />
      <ellipse cx="100" cy="132" rx="10" ry="8" fill="#C2185B" />
      <ellipse cx="160" cy="132" rx="10" ry="8" fill="#C2185B" />
      <ellipse cx="130" cy="148" rx="22" ry="8" fill="#AD1457" />
      <ellipse cx="130" cy="210" rx="14" ry="12" fill="#F48FB1" />
    </g>
  );
}

export function PsychBrainFigure() {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <radialGradient id={`ps-glow-${uid}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#EDE7F6" />
          <stop offset="100%" stopColor="#B39DDB" />
        </radialGradient>
        <linearGradient id={`ps-cortex-${uid}`} x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#D1C4E9" />
          <stop offset="100%" stopColor="#5E35B1" />
        </linearGradient>
      </defs>
      <circle cx="140" cy="130" r="108" fill={`url(#ps-glow-${uid})`} opacity="0.55" />
      <path
        d="M140 36 C84 36 48 78 52 128 C56 184 96 224 140 228 C184 224 224 184 228 128 C232 78 196 36 140 36 Z"
        fill={`url(#ps-cortex-${uid})`}
        stroke="#4527A0"
        strokeWidth="1.6"
      />
      <path d="M80 110 Q140 88 200 110" fill="none" stroke="#EDE7F6" strokeWidth="1.5" opacity="0.7" />
      <path d="M88 148 Q140 132 192 148" fill="none" stroke="#EDE7F6" strokeWidth="1.3" opacity="0.6" />
    </g>
  );
}

export function NutritionPlateFigure() {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <radialGradient id={`nu-plate-${uid}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FAFAFA" />
          <stop offset="80%" stopColor="#ECEFF1" />
          <stop offset="100%" stopColor="#B0BEC5" />
        </radialGradient>
      </defs>
      <ellipse cx="140" cy="130" rx="118" ry="108" fill={`url(#nu-plate-${uid})`} stroke="#90A4AE" strokeWidth="8" />
      <path d="M140 28 L140 232" stroke="#CFD8DC" strokeWidth="2" />
      <path d="M34 130 L246 130" stroke="#CFD8DC" strokeWidth="2" />
      <path d="M140 130 L230 70" stroke="#CFD8DC" strokeWidth="1.5" />
      <path d="M140 130 L50 70" stroke="#CFD8DC" strokeWidth="1.5" />
      <circle cx="140" cy="130" r="28" fill="#FFF8E1" stroke="#FBC02D" strokeWidth="2" />
    </g>
  );
}
