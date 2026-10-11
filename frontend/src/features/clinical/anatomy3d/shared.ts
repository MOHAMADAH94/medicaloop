import {
  Box3,
  CapsuleGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  Vector3,
  type Material,
  type Object3D,
} from 'three';

export type PinPos = { id: string; position: [number, number, number] };

export type BuiltModel = {
  group: Group;
  pins: PinPos[];
  camera: { position: [number, number, number]; target: [number, number, number] };
  /** True when geometries are shared with an HRA cache and must not be disposed. */
  sharedAssets?: boolean;
};

export function boneMaterial(hex = 0xf3e6d4) {
  return new MeshStandardMaterial({
    color: hex,
    roughness: 0.46,
    metalness: 0.07,
  });
}

export function tissueMaterial(hex: number, roughness = 0.5) {
  return new MeshStandardMaterial({
    color: hex,
    roughness,
    metalness: 0.04,
  });
}

export function tag(mesh: Mesh, id: string, mat: Material) {
  mesh.userData.zoneId = id;
  mesh.material = (mat as MeshStandardMaterial).clone();
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = id;
  return mesh;
}

export function capsule(radius: number, length: number) {
  return new CapsuleGeometry(radius, length, 6, 14);
}

export function sphere(radius: number, det = 18) {
  return new SphereGeometry(radius, det, Math.max(12, det - 4));
}

export function place(mesh: Mesh, x: number, y: number, z: number, rot?: [number, number, number]) {
  mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
  return mesh;
}

export function boneGroup(parent: Object3D, id: string) {
  const g = new Group();
  g.name = id;
  g.userData.zoneId = id;
  parent.add(g);
  return g;
}

export function addTagged(parent: Object3D, mesh: Mesh, id: string, mat: Material) {
  tag(mesh, id, mat);
  parent.add(mesh);
  return mesh;
}

export function pinsFromNamed(root: Object3D, ids: string[]): PinPos[] {
  const box = new Box3();
  const center = new Vector3();
  const pins: PinPos[] = [];
  for (const id of ids) {
    const obj = root.getObjectByName(id);
    if (!obj) continue;
    obj.updateWorldMatrix(true, true);
    box.setFromObject(obj);
    box.getCenter(center);
    const depth = Math.max(0.028, (box.max.z - box.min.z) * 0.42);
    pins.push({ id, position: [center.x, center.y, center.z + depth] });
  }
  return pins;
}

/** Pin at the combined bounds of every mesh tagged with a zone id. */
export function zoneBox(root: Object3D, id: string): Box3 | null {
  const box = new Box3();
  const scratch = new Box3();
  let hit = false;
  root.updateMatrixWorld(true);
  root.traverse((obj) => {
    if (!(obj instanceof Mesh) || obj.userData.zoneId !== id) return;
    let current: typeof obj.parent | typeof obj = obj;
    while (current) {
      if (!current.visible) return;
      current = current.parent;
    }
    scratch.setFromObject(obj);
    if (scratch.isEmpty()) return;
    box.union(scratch);
    hit = true;
  });
  return hit ? box : null;
}

export function pinOnBox(
  box: Box3,
  id: string,
  x = 0.5,
  y = 0.5,
  z = 1,
): PinPos {
  return {
    id,
    position: [
      box.min.x + (box.max.x - box.min.x) * x,
      box.min.y + (box.max.y - box.min.y) * y,
      box.min.z + (box.max.z - box.min.z) * z,
    ],
  };
}

export function pinsFromZones(root: Object3D, ids: string[]): PinPos[] {
  const box = new Box3();
  const scratch = new Box3();
  const center = new Vector3();
  const pins: PinPos[] = [];
  root.updateMatrixWorld(true);
  for (const id of ids) {
    box.makeEmpty();
    root.traverse((obj) => {
      if (!(obj instanceof Mesh) || obj.userData.zoneId !== id) return;
      let current: typeof obj.parent | typeof obj = obj;
      let hidden = false;
      while (current) {
        if (!current.visible) {
          hidden = true;
          break;
        }
        current = current.parent;
      }
      if (hidden) return;
      scratch.setFromObject(obj);
      box.union(scratch);
    });
    if (box.isEmpty()) continue;
    box.getCenter(center);
    const depth = Math.max(0.02, (box.max.z - box.min.z) * 0.38);
    pins.push({ id, position: [center.x, center.y, center.z + depth] });
  }
  return pins;
}
