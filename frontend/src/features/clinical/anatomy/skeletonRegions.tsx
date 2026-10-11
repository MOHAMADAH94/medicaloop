import type { ReactNode } from 'react';

export type BoneShape =
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { kind: 'path'; d: string }
  | { kind: 'rect'; x: number; y: number; w: number; h: number };

export type SkeletonZone = {
  id: string;
  labelKey: string;
  color: string;
  x: number;
  y: number;
  shape?: BoneShape;
};

/** Clickable bones — patient's right is on the viewer's left. Large areas first, precise last. */
export const SKELETON_BONES: SkeletonZone[] = [
  { id: 'ribs_r', labelKey: 'visuals.orthopedics.ribsR', color: '#8D6E63', x: 102, y: 138, shape: { kind: 'path', d: 'M128 100 C78 96 62 128 66 168 C70 198 96 204 128 168 Z' } },
  { id: 'ribs_l', labelKey: 'visuals.orthopedics.ribsL', color: '#8D6E63', x: 178, y: 138, shape: { kind: 'path', d: 'M152 100 C202 96 218 128 214 168 C210 198 184 204 152 168 Z' } },
  { id: 'pelvis', labelKey: 'visuals.orthopedics.pelvis', color: '#5D4037', x: 140, y: 204, shape: { kind: 'path', d: 'M104 182 C118 166 162 166 176 182 C192 200 194 222 170 230 L154 222 140 234 126 222 110 230 C86 222 88 200 104 182 Z' } },
  { id: 'skull', labelKey: 'visuals.orthopedics.skull', color: '#8D6E63', x: 140, y: 28, shape: { kind: 'ellipse', cx: 140, cy: 32, rx: 29, ry: 34 } },
  { id: 'clavicle_r', labelKey: 'visuals.orthopedics.clavicleR', color: '#A1887F', x: 100, y: 92, shape: { kind: 'path', d: 'M140 88 C108 82 82 86 64 98 C66 108 96 100 140 104 Z' } },
  { id: 'clavicle_l', labelKey: 'visuals.orthopedics.clavicleL', color: '#A1887F', x: 180, y: 92, shape: { kind: 'path', d: 'M140 88 C172 82 198 86 216 98 C214 108 184 100 140 104 Z' } },
  { id: 'scapula_r', labelKey: 'visuals.orthopedics.scapulaR', color: '#795548', x: 78, y: 118, shape: { kind: 'path', d: 'M62 96 L92 108 L84 136 L58 124 Z' } },
  { id: 'scapula_l', labelKey: 'visuals.orthopedics.scapulaL', color: '#795548', x: 202, y: 118, shape: { kind: 'path', d: 'M218 96 L188 108 L196 136 L222 124 Z' } },
  { id: 'humerus_r', labelKey: 'visuals.orthopedics.humerusR', color: '#6D4C41', x: 58, y: 144, shape: { kind: 'path', d: 'M62 108 C56 112 42 168 46 180 C56 188 68 180 64 164 C78 116 76 108 62 108 Z' } },
  { id: 'humerus_l', labelKey: 'visuals.orthopedics.humerusL', color: '#6D4C41', x: 222, y: 144, shape: { kind: 'path', d: 'M218 108 C224 112 238 168 234 180 C224 188 212 180 216 164 C202 116 204 108 218 108 Z' } },
  { id: 'radius_ulna_r', labelKey: 'visuals.orthopedics.forearmR', color: '#795548', x: 46, y: 214, shape: { kind: 'path', d: 'M42 182 C34 186 28 232 32 244 C44 250 58 242 54 226 C62 190 58 180 42 182 Z' } },
  { id: 'radius_ulna_l', labelKey: 'visuals.orthopedics.forearmL', color: '#795548', x: 234, y: 214, shape: { kind: 'path', d: 'M238 182 C246 186 252 232 248 244 C236 250 222 242 226 226 C218 190 222 180 238 182 Z' } },
  { id: 'femur_r', labelKey: 'visuals.orthopedics.femurR', color: '#6D4C41', x: 114, y: 258, shape: { kind: 'path', d: 'M112 220 C104 224 100 286 106 300 C120 310 132 300 126 282 C130 228 126 218 112 220 Z' } },
  { id: 'femur_l', labelKey: 'visuals.orthopedics.femurL', color: '#6D4C41', x: 166, y: 258, shape: { kind: 'path', d: 'M168 220 C176 224 180 286 174 300 C160 310 148 300 154 282 C150 228 154 218 168 220 Z' } },
  { id: 'tibia_fibula_r', labelKey: 'visuals.orthopedics.tibiaR', color: '#5D4037', x: 112, y: 338, shape: { kind: 'path', d: 'M104 308 C98 312 96 362 104 374 C118 382 128 372 122 354 C126 316 118 304 104 308 Z' } },
  { id: 'tibia_fibula_l', labelKey: 'visuals.orthopedics.tibiaL', color: '#5D4037', x: 168, y: 338, shape: { kind: 'path', d: 'M176 308 C182 312 184 362 176 374 C162 382 152 372 158 354 C154 316 162 304 176 308 Z' } },
  { id: 'mandible', labelKey: 'visuals.orthopedics.mandible', color: '#6D4C41', x: 140, y: 66, shape: { kind: 'path', d: 'M116 54 Q140 84 164 54 L157 66 Q140 86 123 66 Z' } },
  { id: 'cspine', labelKey: 'visuals.orthopedics.cspine', color: '#8D6E63', x: 140, y: 78, shape: { kind: 'rect', x: 128, y: 66, w: 24, h: 28 } },
  { id: 'tspine', labelKey: 'visuals.orthopedics.tspine', color: '#5D4037', x: 140, y: 132, shape: { kind: 'rect', x: 129, y: 98, w: 22, h: 56 } },
  { id: 'lspine', labelKey: 'visuals.orthopedics.lspine', color: '#4E342E', x: 140, y: 172, shape: { kind: 'rect', x: 128, y: 154, w: 24, h: 36 } },
  { id: 'sternum', labelKey: 'visuals.orthopedics.sternum', color: '#6D4C41', x: 140, y: 128, shape: { kind: 'rect', x: 130, y: 98, w: 20, h: 64 } },
  { id: 'sacrum', labelKey: 'visuals.orthopedics.sacrum', color: '#4E342E', x: 140, y: 222, shape: { kind: 'path', d: 'M126 210 Q140 236 154 210 Z' } },
  { id: 'hand_r', labelKey: 'visuals.orthopedics.handR', color: '#A1887F', x: 28, y: 268, shape: { kind: 'path', d: 'M12 248 C8 252 8 272 18 286 L42 278 C48 262 46 248 36 246 Z' } },
  { id: 'hand_l', labelKey: 'visuals.orthopedics.handL', color: '#A1887F', x: 252, y: 268, shape: { kind: 'path', d: 'M268 248 C272 252 272 272 262 286 L238 278 C232 262 234 248 244 246 Z' } },
  { id: 'foot_r', labelKey: 'visuals.orthopedics.footR', color: '#4E342E', x: 96, y: 390, shape: { kind: 'path', d: 'M74 380 C68 384 70 400 92 402 C118 404 126 390 118 384 C108 376 90 376 74 380 Z' } },
  { id: 'foot_l', labelKey: 'visuals.orthopedics.footL', color: '#4E342E', x: 184, y: 390, shape: { kind: 'path', d: 'M206 380 C212 384 210 400 188 402 C162 404 154 390 162 384 C172 376 190 376 206 380 Z' } },
];

export const SKELETON_JOINTS: SkeletonZone[] = [
  { id: 'shoulder_r', labelKey: 'visuals.orthopedics.shoulderR', color: '#A1887F', x: 70, y: 102 },
  { id: 'shoulder_l', labelKey: 'visuals.orthopedics.shoulderL', color: '#A1887F', x: 210, y: 102 },
  { id: 'elbow_r', labelKey: 'visuals.orthopedics.elbowR', color: '#8D6E63', x: 52, y: 178 },
  { id: 'elbow_l', labelKey: 'visuals.orthopedics.elbowL', color: '#8D6E63', x: 228, y: 178 },
  { id: 'wrist_r', labelKey: 'visuals.orthopedics.wristR', color: '#795548', x: 40, y: 242 },
  { id: 'wrist_l', labelKey: 'visuals.orthopedics.wristL', color: '#795548', x: 240, y: 242 },
  { id: 'hip_r', labelKey: 'visuals.orthopedics.hipR', color: '#6D4C41', x: 122, y: 210 },
  { id: 'hip_l', labelKey: 'visuals.orthopedics.hipL', color: '#6D4C41', x: 158, y: 210 },
  { id: 'knee_r', labelKey: 'visuals.orthopedics.kneeR', color: '#5D4037', x: 114, y: 300 },
  { id: 'knee_l', labelKey: 'visuals.orthopedics.kneeL', color: '#5D4037', x: 166, y: 300 },
  { id: 'ankle_r', labelKey: 'visuals.orthopedics.ankleR', color: '#4E342E', x: 112, y: 374 },
  { id: 'ankle_l', labelKey: 'visuals.orthopedics.ankleL', color: '#4E342E', x: 168, y: 374 },
];

export const PHYSIO_JOINTS: SkeletonZone[] = [
  { id: 'cervical', labelKey: 'visuals.physio.cervical', color: '#4DB6AC', x: 140, y: 78 },
  { id: 'shoulder_r', labelKey: 'visuals.physio.shoulderR', color: '#26A69A', x: 70, y: 102 },
  { id: 'shoulder_l', labelKey: 'visuals.physio.shoulderL', color: '#26A69A', x: 210, y: 102 },
  { id: 'thoracic', labelKey: 'visuals.physio.thoracic', color: '#26A69A', x: 140, y: 128 },
  { id: 'elbow_r', labelKey: 'visuals.physio.elbowR', color: '#00897B', x: 52, y: 178 },
  { id: 'elbow_l', labelKey: 'visuals.physio.elbowL', color: '#00897B', x: 228, y: 178 },
  { id: 'lumbar', labelKey: 'visuals.physio.lumbar', color: '#00897B', x: 140, y: 172 },
  { id: 'hip_r', labelKey: 'visuals.physio.hipR', color: '#26A69A', x: 122, y: 210 },
  { id: 'hip_l', labelKey: 'visuals.physio.hipL', color: '#26A69A', x: 158, y: 210 },
  { id: 'wrist_r', labelKey: 'visuals.physio.wristR', color: '#00695C', x: 40, y: 242 },
  { id: 'wrist_l', labelKey: 'visuals.physio.wristL', color: '#00695C', x: 240, y: 242 },
  { id: 'knee_r', labelKey: 'visuals.physio.kneeR', color: '#00897B', x: 114, y: 300 },
  { id: 'knee_l', labelKey: 'visuals.physio.kneeL', color: '#00897B', x: 166, y: 300 },
  { id: 'ankle_r', labelKey: 'visuals.physio.ankleR', color: '#00695C', x: 112, y: 374 },
  { id: 'ankle_l', labelKey: 'visuals.physio.ankleL', color: '#00695C', x: 168, y: 374 },
  { id: 'gait', labelKey: 'visuals.physio.gait', color: '#4DB6AC', x: 236, y: 400 },
];

export function BoneHit({
  zone,
  label,
  selected,
  active,
  hovered,
  onClick,
  onHover,
}: {
  zone: SkeletonZone;
  label: string;
  selected?: boolean;
  active?: boolean;
  hovered?: boolean;
  onClick?: () => void;
  onHover?: (id: string | null) => void;
}) {
  if (!zone.shape) return null;
  const lit = selected || hovered;
  const fill = selected ? `${zone.color}99` : hovered ? `${zone.color}55` : active ? `${zone.color}33` : `${zone.color}14`;
  const stroke = lit ? zone.color : active ? zone.color : `${zone.color}88`;
  const common = {
    fill,
    stroke,
    strokeWidth: selected ? 2.6 : hovered ? 2 : 1.15,
    style: { cursor: onClick ? 'pointer' : 'default', transition: 'fill 0.12s ease, stroke 0.12s ease' } as const,
    onClick,
    onMouseEnter: () => onHover?.(zone.id),
    onMouseLeave: () => onHover?.(null),
  };

  let shape: ReactNode;
  if (zone.shape.kind === 'ellipse') {
    shape = <ellipse cx={zone.shape.cx} cy={zone.shape.cy} rx={zone.shape.rx} ry={zone.shape.ry} {...common} />;
  } else if (zone.shape.kind === 'rect') {
    shape = <rect x={zone.shape.x} y={zone.shape.y} width={zone.shape.w} height={zone.shape.h} rx={4} {...common} />;
  } else {
    shape = <path d={zone.shape.d} {...common} />;
  }

  return (
    <g>
      <title>{label}</title>
      {shape}
    </g>
  );
}
