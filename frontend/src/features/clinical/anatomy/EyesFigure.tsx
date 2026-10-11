import { useId } from 'react';

function Globe({ cx, cy, iris = '#1B5E20' }: { cx: number; cy: number; iris?: string }) {
  return (
    <g>
      {/* Orbit / lids */}
      <path
        d={`M${cx - 58} ${cy} C${cx - 48} ${cy - 38}, ${cx + 48} ${cy - 38}, ${cx + 58} ${cy}
            C${cx + 48} ${cy + 36}, ${cx - 48} ${cy + 36}, ${cx - 58} ${cy} Z`}
        fill="#D7CCC8"
        stroke="#8D6E63"
        strokeWidth="1.2"
      />
      <path
        d={`M${cx - 52} ${cy - 2} C${cx - 36} ${cy - 28}, ${cx + 36} ${cy - 28}, ${cx + 52} ${cy - 2}`}
        fill="none"
        stroke="#5D4037"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d={`M${cx - 50} ${cy + 6} C${cx - 30} ${cy + 26}, ${cx + 30} ${cy + 26}, ${cx + 50} ${cy + 6}`}
        fill="none"
        stroke="#A1887F"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Sclera */}
      <ellipse cx={cx} cy={cy} rx="44" ry="26" fill="#FAFAFA" stroke="#B0BEC5" strokeWidth="1" />
      <path
        d={`M${cx - 38} ${cy + 4} Q${cx - 20} ${cy + 10} ${cx - 8} ${cy + 6}`}
        fill="none"
        stroke="#EF9A9A"
        strokeWidth="0.8"
        opacity="0.7"
      />
      <path
        d={`M${cx + 12} ${cy + 8} Q${cx + 24} ${cy + 12} ${cx + 36} ${cy + 4}`}
        fill="none"
        stroke="#EF9A9A"
        strokeWidth="0.7"
        opacity="0.55"
      />

      {/* Iris */}
      <circle cx={cx} cy={cy} r="16" fill={iris} stroke="#0D47A1" strokeWidth="0.6" />
      <g opacity="0.35">
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(a) * 15}
              y2={cy + Math.sin(a) * 15}
              stroke="#E3F2FD"
              strokeWidth="0.7"
            />
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r="6.2" fill="#0D0D0D" />
      {/* Catchlight */}
      <circle cx={cx - 4} cy={cy - 4} r="2.4" fill="#fff" />
      <circle cx={cx + 3} cy={cy + 2} r="1.1" fill="#fff" opacity="0.7" />

      {/* Medial canthus */}
      <ellipse cx={cx - 48} cy={cy + 2} rx="5" ry="3.2" fill="#EF9A9A" opacity="0.85" />
    </g>
  );
}

function Fundus({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="28" fill="#3E1F1C" stroke="#4E342E" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="24" fill="#6D2C2C" />
      {/* Optic disc */}
      <circle cx={cx + 10} cy={cy} r="5.2" fill="#F5E6A3" stroke="#E6C35C" strokeWidth="0.8" />
      {/* Macula */}
      <circle cx={cx - 8} cy={cy + 2} r="4" fill="#4A1515" />
      <circle cx={cx - 8} cy={cy + 2} r="1.4" fill="#2A0C0C" />
      {/* Vessels */}
      <path d={`M${cx + 10} ${cy} C${cx + 4} ${cy - 14}, ${cx - 10} ${cy - 16}, ${cx - 18} ${cy - 8}`} fill="none" stroke="#C62828" strokeWidth="1.3" />
      <path d={`M${cx + 10} ${cy} C${cx + 2} ${cy + 14}, ${cx - 12} ${cy + 16}, ${cx - 18} ${cy + 8}`} fill="none" stroke="#C62828" strokeWidth="1.3" />
      <path d={`M${cx + 10} ${cy} C${cx + 18} ${cy - 10}, ${cx + 20} ${cy - 4}, ${cx + 22} ${cy}`} fill="none" stroke="#B71C1C" strokeWidth="1.1" />
    </g>
  );
}

export default function EyesFigure() {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <filter id={`ey-soft-${uid}`}>
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#37474F" floodOpacity="0.2" />
        </filter>
      </defs>
      <g filter={`url(#ey-soft-${uid})`}>
        <Globe cx={90} cy={92} iris="#1565C0" />
        <Globe cx={250} cy={92} iris="#2E7D32" />
      </g>
      <text x="90" y="38" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1565C0">OD</text>
      <text x="250" y="38" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1565C0">OS</text>
      <Fundus cx={90} cy={186} />
      <Fundus cx={250} cy={186} />
      <text x="90" y="228" textAnchor="middle" fontSize="8" fill="#78909C">قاع العين</text>
      <text x="250" y="228" textAnchor="middle" fontSize="8" fill="#78909C">قاع العين</text>
    </g>
  );
}
