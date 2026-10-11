import { DoubleSide, Group, Mesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { cameraFor, fitOnGround } from './loadHraModel';
import {
  boneMaterial,
  pinOnBox,
  pinsFromZones,
  tissueMaterial,
  zoneBox,
  type BuiltModel,
  type PinPos,
} from './shared';

const loader = new GLTFLoader();
const cache = new Map<string, Promise<Group>>();

async function fetchLocal(url: string): Promise<Group> {
  let pending = cache.get(url);
  if (!pending) {
    pending = loader.loadAsync(url).then((gltf) => gltf.scene);
    cache.set(url, pending);
    pending.catch(() => cache.delete(url));
  }
  return (await pending).clone(true);
}

function tagByName(root: Group, known: Set<string>) {
  root.traverse((obj) => {
    if (known.has(obj.name)) obj.userData.zoneId = obj.name;
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

function paintMeshes(root: Group, colorFor: (zoneId: string) => number | undefined) {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    const hex = colorFor(obj.userData.zoneId as string) ?? 0xe8c3b0;
    const mat = tissueMaterial(hex, 0.48);
    mat.side = DoubleSide;
    obj.material = mat;
    obj.geometry.computeVertexNormals();
    obj.castShadow = true;
    obj.receiveShadow = true;
  });
}

const GI_COLOR: Record<string, number> = {
  esophagus: 0xffcc80,
  liver: 0x8d1b1b,
  stomach: 0xef6c00,
  gallbladder: 0xf9a825,
  duodenum: 0xfb8c00,
  pancreas: 0xffcc80,
  small_bowel: 0xff9800,
  colon: 0xf57c00,
  rectum: 0xe65100,
};

const ENT_COLOR: Record<string, number> = {
  skull: 0xf3e6d4,
  mandible: 0xe8d5c4,
  nose: 0xe8c3b0,
  hyoid: 0xd7ccc8,
  trachea: 0xffccbc,
  esophagus: 0xef9a9a,
};

const ENDO_COLOR: Record<string, number> = {
  pituitary: 0xec407a,
  trachea: 0xe91e63,
  hyoid: 0xf48fb1,
  adrenal_r: 0xad1457,
  adrenal_l: 0xad1457,
  pancreas: 0x880e4f,
  esophagus: 0xf06292,
};

function extraFrom(
  root: Group,
  rules: { id: string; from: string; x?: number; y?: number; z?: number }[],
  existing: PinPos[],
) {
  const have = new Set(existing.map((p) => p.id));
  const extra: PinPos[] = [];
  for (const rule of rules) {
    if (have.has(rule.id)) continue;
    const box = zoneBox(root, rule.from);
    if (!box) continue;
    extra.push(pinOnBox(box, rule.id, rule.x ?? 0.5, rule.y ?? 0.5, rule.z ?? 1));
  }
  return extra;
}

export async function loadDigestiveGlb(): Promise<BuiltModel> {
  const group = new Group();
  group.add(await fetchLocal('/anatomy/digestive.glb'));
  const ids = Object.keys(GI_COLOR);
  tagByName(group, new Set(ids));
  paintMeshes(group, (id) => GI_COLOR[id]);
  fitOnGround(group, 1.28);
  return { group, pins: pinsFromZones(group, ids), camera: cameraFor(group), sharedAssets: true };
}

export async function loadNutritionGlb(): Promise<BuiltModel> {
  const built = await loadDigestiveGlb();
  const remap: Record<string, string> = {
    small_bowel: 'protein',
    pancreas: 'carbs',
    liver: 'calories',
    stomach: 'hydration',
    duodenum: 'minerals',
    gallbladder: 'fats',
    colon: 'fiber',
    esophagus: 'vitamins',
  };
  built.group.traverse((obj) => {
    const src = obj.userData.zoneId as string | undefined;
    if (src && remap[src]) obj.userData.zoneId = remap[src];
  });
  const ids = Object.values(remap);
  built.pins = pinsFromZones(built.group, ids);
  return built;
}

export async function loadEntGlb(): Promise<BuiltModel> {
  const group = new Group();
  group.add(await fetchLocal('/anatomy/ent.glb'));
  tagByName(group, new Set(Object.keys(ENT_COLOR)));
  paintMeshes(group, (id) => (id === 'skull' || id === 'mandible' ? undefined : ENT_COLOR[id]));
  group.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    if (obj.userData.zoneId === 'skull' || obj.userData.zoneId === 'mandible') {
      const mat = boneMaterial();
      mat.side = DoubleSide;
      obj.material = mat;
      obj.geometry.computeVertexNormals();
    }
  });
  fitOnGround(group, 1.15);
  const mapped: Record<string, string> = {
    nose: 'nose',
    trachea: 'larynx',
    hyoid: 'vocal',
  };
  group.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    if (obj.userData.zoneId === 'skull' || obj.userData.zoneId === 'mandible' || obj.userData.zoneId === 'esophagus') {
      obj.userData.context = true;
      obj.raycast = () => {};
    }
    const src = obj.userData.zoneId as string | undefined;
    if (src && mapped[src]) obj.userData.zoneId = mapped[src];
  });
  const ids = ['nose', 'larynx', 'vocal'];
  const pins = pinsFromZones(group, ids);
  const extra = extraFrom(group, [
    { id: 'sinus_front', from: 'skull', x: 0.5, y: 0.88, z: 0.95 },
    { id: 'ear_r', from: 'skull', x: 0.06, y: 0.58, z: 0.38 },
    { id: 'ear_l', from: 'skull', x: 0.94, y: 0.58, z: 0.38 },
    { id: 'tm_r', from: 'skull', x: 0.14, y: 0.56, z: 0.48 },
    { id: 'tm_l', from: 'skull', x: 0.86, y: 0.56, z: 0.48 },
    { id: 'sinus_max', from: 'nose', x: 0.22, y: 0.42, z: 1 },
    { id: 'nasopharynx', from: 'skull', x: 0.5, y: 0.5, z: 0.22 },
    { id: 'tonsils', from: 'mandible', x: 0.5, y: 0.68, z: 0.92 },
  ], pins);
  return { group, pins: [...pins, ...extra], camera: cameraFor(group, { distScale: 1.85 }), sharedAssets: true };
}

export async function loadEndocrineGlb(): Promise<BuiltModel> {
  const group = new Group();
  const skeleton = await fetchLocal('/anatomy/skeleton.glb');
  applyBoneFade(skeleton);
  group.add(skeleton);
  const glands = await fetchLocal('/anatomy/endocrine.glb');
  tagByName(glands, new Set(Object.keys(ENDO_COLOR)));
  paintMeshes(glands, (id) => ENDO_COLOR[id]);
  group.add(glands);
  const mapped: Record<string, string> = {
    pituitary: 'pituitary',
    trachea: 'thyroid',
    hyoid: 'parathyroid',
    adrenal_r: 'adrenal_r',
    adrenal_l: 'adrenal_l',
    pancreas: 'pancreas',
  };
  group.traverse((obj) => {
    const src = obj.userData.zoneId as string | undefined;
    if (src && mapped[src]) obj.userData.zoneId = mapped[src];
  });
  fitOnGround(group, 1.66);
  const ids = ['hypothalamus', 'pituitary', 'thyroid', 'parathyroid', 'adrenal_r', 'adrenal_l', 'pancreas', 'gonads', 'metabolic'];
  const pins = pinsFromZones(group, ids);
  const extra = extraFrom(group, [
    { id: 'hypothalamus', from: 'pituitary', x: 0.5, y: 1.35, z: 1 },
    { id: 'gonads', from: 'pancreas', x: 0.5, y: -1.15, z: 1 },
    { id: 'metabolic', from: 'pancreas', x: 0.5, y: 0.15, z: 1.15 },
  ], pins);
  return {
    group,
    pins: [...pins, ...extra],
    camera: cameraFor(group, { skipContext: true, distScale: 2.05 }),
    sharedAssets: true,
  };
}

function applyBoneFade(root: Group) {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    const mat = boneMaterial(0xece4d8);
    mat.side = DoubleSide;
    mat.transparent = true;
    mat.opacity = 0.28;
    mat.depthWrite = false;
    obj.material = mat;
    obj.geometry.computeVertexNormals();
    obj.userData.context = true;
    obj.castShadow = false;
    obj.receiveShadow = true;
    obj.raycast = () => {};
  });
}
