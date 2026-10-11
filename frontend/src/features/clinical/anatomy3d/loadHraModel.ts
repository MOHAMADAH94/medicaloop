import {
  Box3,
  Color,
  DoubleSide,
  Group,
  Mesh,
  Vector3,
  type Material,
  type MeshStandardMaterial,
  type Object3D,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { compileZoneRules, HRA_CDN_BASES, type ExtraPinRule, type HraSpec } from './hraCatalog';
import { pinOnBox, pinsFromZones, zoneBox, type BuiltModel, type PinPos } from './shared';

const loader = new GLTFLoader();
const sceneCache = new Map<string, Promise<Group>>();

async function fetchGlbScene(file: string): Promise<Group> {
  let pending = sceneCache.get(file);
  if (!pending) {
    pending = loadFromMirrors(file);
    sceneCache.set(file, pending);
    pending.catch(() => sceneCache.delete(file));
  }
  const scene = await pending;
  return scene.clone(true);
}

async function loadFromMirrors(file: string): Promise<Group> {
  let lastError: unknown;
  for (const base of HRA_CDN_BASES) {
    try {
      const gltf = await loader.loadAsync(base + file);
      return gltf.scene;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error(`Failed to load ${file}`);
}

function prepareMaterials(root: Group) {
  root.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    const source = obj.material;
    const list = Array.isArray(source) ? source : [source];
    const cloned = list.map((mat) => {
      const next = mat.clone() as MeshStandardMaterial;
      if ('emissive' in next) {
        next.emissive = new Color(0x000000);
        next.emissiveIntensity = 0;
      }
      if ('side' in next) next.side = DoubleSide;
      return next;
    });
    obj.material = Array.isArray(source) ? cloned : cloned[0];
    obj.castShadow = true;
    obj.receiveShadow = true;
  });
}

function hideUnwanted(root: Group, needles: string[] | undefined) {
  if (!needles?.length) return;
  const lowered = needles.map((n) => n.toLowerCase());
  root.traverse((obj) => {
    const name = (obj.name || '').toLowerCase();
    if (!name) return;
    if (lowered.some((needle) => name.includes(needle))) {
      obj.visible = false;
      obj.raycast = () => {};
    }
  });
}

function isWorldVisible(obj: Mesh) {
  let current: typeof obj.parent | typeof obj = obj;
  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }
  return true;
}

function objectPath(obj: Object3D) {
  const names: string[] = [];
  let current: Object3D | null = obj;
  while (current) {
    if (current.name) names.push(current.name.toLowerCase());
    current = current.parent;
  }
  return names.join(' ');
}

function assignZones(root: Group, spec: HraSpec) {
  const rules = compileZoneRules(spec.zones);
  if (rules.length) {
    root.traverse((obj) => {
      const haystack = `${(obj.name || '').toLowerCase()} ${objectPath(obj)}`;
      if (!haystack.trim()) return;
      const hit = rules.find((rule) => haystack.includes(rule.needle));
      if (hit) obj.userData.zoneId = hit.zone;
    });
  }
  const lat = spec.laterality;
  if (lat) {
    root.traverse((obj) => {
      const haystack = objectPath(obj);
      const side = lat.sides.find((item) => item.needles.some((n) => haystack.includes(n)));
      if (!side) return;
      const part = lat.parts.find((item) => item.needles.some((n) => haystack.includes(n)));
      if (part) obj.userData.zoneId = `${side.prefix}${part.suffix}`;
      else if (lat.leftover && !obj.userData.zoneId) obj.userData.zoneId = lat.leftover;
    });
  }
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

function extraPinsFromRules(root: Group, rules: ExtraPinRule[] | undefined, existing: PinPos[]): PinPos[] {
  if (!rules?.length) return [];
  const have = new Set(existing.map((p) => p.id));
  const extra: PinPos[] = [];
  for (const rule of rules) {
    if (have.has(rule.id)) continue;
    const box = zoneBox(root, rule.from);
    if (!box) continue;
    extra.push(pinOnBox(box, rule.id, rule.x ?? 0.5, rule.y ?? 0.5, rule.z ?? 1));
    have.add(rule.id);
  }
  return extra;
}

export type BoundOpts = {
  skipContext?: boolean;
  ignoreNeedles?: string[];
  distScale?: number;
};

function skipFromBounds(obj: Mesh, opts?: BoundOpts) {
  if (opts?.skipContext && obj.userData.context) return true;
  if (!opts?.ignoreNeedles?.length) return false;
  const hay = objectPath(obj);
  return opts.ignoreNeedles.some((needle) => hay.includes(needle.toLowerCase()));
}

function visibleBounds(root: Group, opts?: BoundOpts) {
  const box = new Box3();
  const scratch = new Box3();
  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    if (!(obj instanceof Mesh) || !isWorldVisible(obj) || skipFromBounds(obj, opts)) return;
    scratch.setFromObject(obj);
    if (!scratch.isEmpty()) box.union(scratch);
  });
  return box;
}

export function fitOnGround(root: Group, targetSize = 1.18, opts?: BoundOpts) {
  const box = visibleBounds(root, opts);
  if (box.isEmpty()) return;
  const size = box.getSize(new Vector3());
  const scale = targetSize / Math.max(size.x, size.y, size.z, 0.0001);
  root.scale.multiplyScalar(scale);
  const fitted = visibleBounds(root, opts);
  const center = fitted.getCenter(new Vector3());
  root.position.x -= center.x;
  root.position.z -= center.z;
  root.position.y -= fitted.min.y;
  root.updateMatrixWorld(true);
}

export function cameraFor(root: Group, opts?: BoundOpts): BuiltModel['camera'] {
  const focused = visibleBounds(root, opts);
  const box = focused.isEmpty() ? visibleBounds(root) : focused;
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.4);
  const dist = maxDim * (opts?.distScale ?? 2.2);
  return {
    position: [dist * 0.62, center.y + maxDim * 0.22, dist],
    target: [center.x, center.y, center.z],
  };
}

export async function loadHraModel(spec: HraSpec): Promise<BuiltModel> {
  const group = new Group();
  const parts = await Promise.all(spec.files.map((file) => fetchGlbScene(file)));
  for (const part of parts) group.add(part);
  prepareMaterials(group);
  hideUnwanted(group, spec.hide);
  assignZones(group, spec);
  const focus = spec.cameraIgnore?.length ? { ignoreNeedles: spec.cameraIgnore } : undefined;
  fitOnGround(group, spec.targetSize, focus);
  const zoneIds = new Set(Object.keys(spec.zones));
  if (spec.laterality) {
    for (const side of spec.laterality.sides) {
      for (const part of spec.laterality.parts) zoneIds.add(`${side.prefix}${part.suffix}`);
    }
    if (spec.laterality.leftover) zoneIds.add(spec.laterality.leftover);
  }
  spec.extraPins?.forEach((rule) => zoneIds.add(rule.id));
  const pins = pinsFromZones(group, [...zoneIds]);
  return {
    group,
    pins: [...pins, ...extraPinsFromRules(group, spec.extraPins, pins)],
    camera: cameraFor(group, focus),
    sharedAssets: true,
  };
}

export function disposeBuiltModel(model: BuiltModel) {
  model.group.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    const mat = obj.material as Material | Material[];
    if (Array.isArray(mat)) mat.forEach((item) => item.dispose());
    else mat.dispose();
    if (!model.sharedAssets) obj.geometry.dispose();
  });
}
