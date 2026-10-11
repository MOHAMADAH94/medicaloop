import {
  Box3,
  DoubleSide,
  Group,
  Mesh,
  type Object3D,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SKELETON_BONES } from '../anatomy/skeletonRegions';
import { cameraFor, fitOnGround } from './loadHraModel';
import { boneMaterial, pinsFromZones, type BuiltModel, type PinPos } from './shared';

const SKELETON_URL = '/anatomy/skeleton.glb';
const BONE_IDS = SKELETON_BONES.map((z) => z.id);
const loader = new GLTFLoader();
let cachedScene: Promise<Group> | null = null;

async function fetchSkeletonScene(): Promise<Group> {
  if (!cachedScene) {
    cachedScene = loader.loadAsync(SKELETON_URL).then((gltf) => gltf.scene);
    cachedScene.catch(() => {
      cachedScene = null;
    });
  }
  const scene = await cachedScene;
  return scene.clone(true);
}

function applyBoneLook(root: Group) {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    const mat = boneMaterial();
    mat.side = DoubleSide;
    mat.roughness = 0.58;
    mat.metalness = 0.04;
    obj.material = mat;
    obj.geometry.computeVertexNormals();
    obj.castShadow = true;
    obj.receiveShadow = true;
  });
}

function tagBoneZones(root: Group) {
  const known = new Set(BONE_IDS);
  root.traverse((obj) => {
    const name = obj.name;
    if (known.has(name)) obj.userData.zoneId = name;
  });
  root.traverse((obj) => {
    if (obj.userData.zoneId) return;
    let parent = obj.parent;
    while (parent) {
      if (parent.userData.zoneId) {
        obj.userData.zoneId = parent.userData.zoneId;
        return;
      }
      parent = parent.parent;
    }
  });
}

function zoneBox(root: Object3D, id: string): Box3 | null {
  const box = new Box3();
  const scratch = new Box3();
  let hit = false;
  root.traverse((obj) => {
    if (!(obj instanceof Mesh) || obj.userData.zoneId !== id) return;
    scratch.setFromObject(obj);
    if (scratch.isEmpty()) return;
    box.union(scratch);
    hit = true;
  });
  return hit ? box : null;
}

function midX(box: Box3) {
  return (box.min.x + box.max.x) * 0.5;
}

function midY(box: Box3) {
  return (box.min.y + box.max.y) * 0.5;
}

function front(box: Box3, x: number, y: number, extra = 0.032): [number, number, number] {
  return [x, y, box.max.z + extra];
}

function jointPinsFromBones(root: Object3D): PinPos[] {
  const pins: PinPos[] = [];
  const add = (id: string, position: [number, number, number]) => pins.push({ id, position });

  for (const side of ['r', 'l'] as const) {
    const humerus = zoneBox(root, `humerus_${side}`);
    const forearm = zoneBox(root, `radius_ulna_${side}`);
    const femur = zoneBox(root, `femur_${side}`);
    const tibia = zoneBox(root, `tibia_fibula_${side}`);
    if (humerus) {
      const span = humerus.max.y - humerus.min.y;
      add(`shoulder_${side}`, front(humerus, midX(humerus), humerus.max.y - span * 0.05));
      add(`elbow_${side}`, front(humerus, midX(humerus), humerus.min.y + 0.012));
    }
    if (forearm) add(`wrist_${side}`, front(forearm, midX(forearm), forearm.min.y + 0.012));
    if (femur) {
      add(`hip_${side}`, front(femur, midX(femur), femur.max.y - 0.018));
      add(`knee_${side}`, front(femur, midX(femur), femur.min.y + 0.016));
    }
    if (tibia) add(`ankle_${side}`, front(tibia, midX(tibia), tibia.min.y + 0.02));
  }

  const cspine = zoneBox(root, 'cspine');
  const tspine = zoneBox(root, 'tspine');
  const lspine = zoneBox(root, 'lspine');
  if (cspine) add('cervical', front(cspine, midX(cspine), midY(cspine), 0.05));
  if (tspine) add('thoracic', front(tspine, midX(tspine), midY(tspine), 0.055));
  if (lspine) add('lumbar', front(lspine, midX(lspine), midY(lspine), 0.05));

  const footR = zoneBox(root, 'foot_r');
  const footL = zoneBox(root, 'foot_l');
  if (footR && footL) {
    add('gait', [
      (footR.max.x + footL.min.x) * 0.5 + 0.16,
      0.05,
      Math.max(footR.max.z, footL.max.z) + 0.08,
    ]);
  }
  return pins;
}

export async function loadSkeletonGlb(): Promise<BuiltModel> {
  const group = new Group();
  group.add(await fetchSkeletonScene());
  applyBoneLook(group);
  tagBoneZones(group);
  fitOnGround(group, 1.66);
  return {
    group,
    pins: [...pinsFromZones(group, BONE_IDS), ...jointPinsFromBones(group)],
    camera: cameraFor(group),
    sharedAssets: true,
  };
}
