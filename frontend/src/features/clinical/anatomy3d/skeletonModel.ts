import {
  BoxGeometry,
  CatmullRomCurve3,
  Group,
  Mesh,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import {
  addTagged,
  boneGroup,
  boneMaterial,
  capsule,
  pinsFromNamed,
  place,
  sphere,
  type BuiltModel,
} from './shared';
import { PHYSIO_JOINTS, SKELETON_BONES, SKELETON_JOINTS } from '../anatomy/skeletonRegions';

const BONE_IDS = SKELETON_BONES.map((z) => z.id);

export function createSkeletonModel(): BuiltModel {
  const group = new Group();
  const mat = boneMaterial();
  const dark = boneMaterial(0xddd0c0);

  const skull = boneGroup(group, 'skull');
  addTagged(skull, place(new Mesh(sphere(0.105, 28), mat), 0, 1.62, 0.02), 'skull', mat);
  addTagged(skull, place(new Mesh(sphere(0.078, 20), mat), 0, 1.545, 0.055), 'skull', mat);
  const mandible = boneGroup(group, 'mandible');
  addTagged(mandible, place(new Mesh(new BoxGeometry(0.12, 0.04, 0.08), mat), 0, 1.49, 0.04), 'mandible', mat);

  const cspine = boneGroup(group, 'cspine');
  for (let i = 0; i < 5; i += 1) {
    addTagged(cspine, place(new Mesh(new BoxGeometry(0.045, 0.018, 0.036), mat), 0, 1.45 - i * 0.024, -0.01), 'cspine', mat);
  }
  const tspine = boneGroup(group, 'tspine');
  for (let i = 0; i < 10; i += 1) {
    addTagged(tspine, place(new Mesh(new BoxGeometry(0.05, 0.02, 0.04), mat), 0, 1.32 - i * 0.028, -0.025), 'tspine', mat);
  }
  const lspine = boneGroup(group, 'lspine');
  for (let i = 0; i < 5; i += 1) {
    addTagged(lspine, place(new Mesh(new BoxGeometry(0.058, 0.024, 0.044), mat), 0, 1.04 - i * 0.03, -0.02), 'lspine', mat);
  }

  const sternum = boneGroup(group, 'sternum');
  addTagged(sternum, place(new Mesh(new BoxGeometry(0.034, 0.2, 0.016), mat), 0, 1.22, 0.09), 'sternum', mat);

  const ribsR = boneGroup(group, 'ribs_r');
  const ribsL = boneGroup(group, 'ribs_l');
  for (let i = 0; i < 10; i += 1) {
    const y = 1.34 - i * 0.038;
    const rx = 0.13 + Math.min(i, 5) * 0.012 - Math.max(i - 6, 0) * 0.016;
    const drop = 0.02 + i * 0.006;
    for (const [side, parent, id] of [[-1, ribsR, 'ribs_r'], [1, ribsL, 'ribs_l']] as const) {
      const curve = new CatmullRomCurve3([
        new Vector3(0.02 * side, y, 0.08),
        new Vector3(rx * side, y - drop * 0.3, 0.07),
        new Vector3(rx * 1.05 * side, y - drop, -0.01),
        new Vector3(0.04 * side, y - drop * 1.15, -0.055),
      ]);
      addTagged(parent, new Mesh(new TubeGeometry(curve, 18, 0.0075, 8, false), mat), id, mat);
    }
  }

  for (const [id, side] of [['clavicle_r', -1], ['clavicle_l', 1]] as const) {
    const g = boneGroup(group, id);
    const curve = new CatmullRomCurve3([
      new Vector3(0.03 * side, 1.40, 0.06),
      new Vector3(0.11 * side, 1.415, 0.05),
      new Vector3(0.18 * side, 1.39, 0.02),
    ]);
    addTagged(g, new Mesh(new TubeGeometry(curve, 10, 0.011, 8, false), mat), id, mat);
  }

  for (const [id, side] of [['scapula_r', -1], ['scapula_l', 1]] as const) {
    const g = boneGroup(group, id);
    const blade = place(new Mesh(new BoxGeometry(0.09, 0.13, 0.012), dark), 0.17 * side, 1.30, -0.05, [0.35, 0.4 * side, 0.2 * side]);
    addTagged(g, blade, id, dark);
  }

  for (const [id, side] of [['humerus_r', -1], ['humerus_l', 1]] as const) {
    const g = boneGroup(group, id);
    addTagged(g, place(new Mesh(capsule(0.022, 0.24), mat), 0.20 * side, 1.22, 0), id, mat);
    addTagged(g, place(new Mesh(sphere(0.028), mat), 0.20 * side, 1.36, 0.01), id, mat);
  }
  for (const [id, side] of [['radius_ulna_r', -1], ['radius_ulna_l', 1]] as const) {
    const g = boneGroup(group, id);
    addTagged(g, place(new Mesh(capsule(0.013, 0.21), mat), 0.215 * side, 0.96, 0.012), id, mat);
    addTagged(g, place(new Mesh(capsule(0.011, 0.20), dark), 0.185 * side, 0.96, -0.01), id, dark);
  }
  for (const [id, side] of [['hand_r', -1], ['hand_l', 1]] as const) {
    const g = boneGroup(group, id);
    addTagged(g, place(new Mesh(new BoxGeometry(0.055, 0.07, 0.022), mat), 0.21 * side, 0.80, 0.01), id, mat);
    for (let f = 0; f < 4; f += 1) {
      addTagged(g, place(new Mesh(capsule(0.006, 0.045), mat), (0.19 + f * 0.014) * side, 0.74, 0.01), id, mat);
    }
  }

  const pelvis = boneGroup(group, 'pelvis');
  const ring = place(new Mesh(new TorusGeometry(0.105, 0.032, 10, 28, Math.PI * 1.35), mat), 0, 0.93, 0, [Math.PI / 2, 0, Math.PI * 0.12]);
  addTagged(pelvis, ring, 'pelvis', mat);
  addTagged(pelvis, place(new Mesh(new BoxGeometry(0.16, 0.04, 0.08), mat), 0, 0.90, 0.01), 'pelvis', mat);

  const sacrum = boneGroup(group, 'sacrum');
  addTagged(sacrum, place(new Mesh(new BoxGeometry(0.06, 0.09, 0.04), dark), 0, 0.88, -0.03, [0.35, 0, 0]), 'sacrum', dark);

  for (const [id, side] of [['femur_r', -1], ['femur_l', 1]] as const) {
    const g = boneGroup(group, id);
    addTagged(g, place(new Mesh(capsule(0.028, 0.36), mat), 0.09 * side, 0.68, 0), id, mat);
    addTagged(g, place(new Mesh(sphere(0.036), mat), 0.09 * side, 0.90, 0.01), id, mat);
  }
  for (const [id, side] of [['tibia_fibula_r', -1], ['tibia_fibula_l', 1]] as const) {
    const g = boneGroup(group, id);
    addTagged(g, place(new Mesh(capsule(0.02, 0.32), mat), 0.09 * side, 0.28, 0.008), id, mat);
    addTagged(g, place(new Mesh(capsule(0.01, 0.30), dark), 0.12 * side, 0.28, -0.012), id, dark);
  }
  for (const [id, side] of [['foot_r', -1], ['foot_l', 1]] as const) {
    const g = boneGroup(group, id);
    addTagged(g, place(new Mesh(new BoxGeometry(0.055, 0.04, 0.14), mat), 0.09 * side, 0.045, 0.04), id, mat);
  }

  const jointPins: { id: string; position: [number, number, number] }[] = [
    { id: 'shoulder_r', position: [-0.20, 1.36, 0.04] },
    { id: 'shoulder_l', position: [0.20, 1.36, 0.04] },
    { id: 'elbow_r', position: [-0.20, 1.08, 0.04] },
    { id: 'elbow_l', position: [0.20, 1.08, 0.04] },
    { id: 'wrist_r', position: [-0.21, 0.84, 0.04] },
    { id: 'wrist_l', position: [0.21, 0.84, 0.04] },
    { id: 'hip_r', position: [-0.09, 0.91, 0.05] },
    { id: 'hip_l', position: [0.09, 0.91, 0.05] },
    { id: 'knee_r', position: [-0.09, 0.48, 0.05] },
    { id: 'knee_l', position: [0.09, 0.48, 0.05] },
    { id: 'ankle_r', position: [-0.09, 0.10, 0.05] },
    { id: 'ankle_l', position: [0.09, 0.10, 0.05] },
    { id: 'cervical', position: [0, 1.42, 0.05] },
    { id: 'thoracic', position: [0, 1.22, 0.08] },
    { id: 'lumbar', position: [0, 1.00, 0.05] },
    { id: 'gait', position: [0.22, 0.06, 0.12] },
  ];

  for (const j of jointPins) {
    const marker = new Group();
    marker.name = `joint:${j.id}`;
    marker.position.set(...j.position);
    group.add(marker);
  }

  group.updateMatrixWorld(true);
  const bonePins = pinsFromNamed(group, BONE_IDS);
  const extraJoints = jointPins.filter((j) => !bonePins.some((p) => p.id === j.id));

  return {
    group,
    pins: [...bonePins, ...extraJoints],
    camera: { position: [0.85, 0.9, 3.55], target: [0, 0.86, 0] },
  };
}

export const SKELETON_PIN_IDS = {
  bones: SKELETON_BONES.map((z) => z.id),
  joints: SKELETON_JOINTS.map((z) => z.id),
  physio: PHYSIO_JOINTS.map((z) => z.id),
};
