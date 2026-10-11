import { Box3, DoubleSide, Group, Mesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HRA_CDN_BASES } from './hraCatalog';
import { fitOnGround } from './loadHraModel';
import { tissueMaterial, type BuiltModel, type PinPos } from './shared';

export const FRONT_REGIONS = [
  { id: 'scalp', label: 'فروة الرأس', x: 0.5, y: 0.97, z: 0.72 },
  { id: 'forehead', label: 'الجبهة', x: 0.5, y: 0.93, z: 0.92 },
  { id: 'face', label: 'الوجه', x: 0.5, y: 0.88, z: 0.95 },
  { id: 'neck', label: 'الرقبة', x: 0.5, y: 0.82, z: 0.88 },
  { id: 'chest', label: 'الصدر', x: 0.5, y: 0.72, z: 0.92 },
  { id: 'abdomen', label: 'البطن', x: 0.5, y: 0.58, z: 0.92 },
  { id: 'groin', label: 'المغبن', x: 0.5, y: 0.48, z: 0.88 },
  { id: 'shoulder_r', label: 'الكتف الأيمن', x: 0.22, y: 0.78, z: 0.78 },
  { id: 'shoulder_l', label: 'الكتف الأيسر', x: 0.78, y: 0.78, z: 0.78 },
  { id: 'upper_arm_r', label: 'العضد الأيمن', x: 0.14, y: 0.66, z: 0.72 },
  { id: 'upper_arm_l', label: 'العضد الأيسر', x: 0.86, y: 0.66, z: 0.72 },
  { id: 'forearm_r', label: 'الساعد الأيمن', x: 0.1, y: 0.52, z: 0.7 },
  { id: 'forearm_l', label: 'الساعد الأيسر', x: 0.9, y: 0.52, z: 0.7 },
  { id: 'hand_r', label: 'اليد اليمنى', x: 0.08, y: 0.4, z: 0.68 },
  { id: 'hand_l', label: 'اليد اليسرى', x: 0.92, y: 0.4, z: 0.68 },
  { id: 'thigh_r', label: 'الفخذ الأيمن', x: 0.4, y: 0.36, z: 0.82 },
  { id: 'thigh_l', label: 'الفخذ الأيسر', x: 0.6, y: 0.36, z: 0.82 },
  { id: 'knee_r', label: 'الركبة اليمنى', x: 0.4, y: 0.22, z: 0.85 },
  { id: 'knee_l', label: 'الركبة اليسرى', x: 0.6, y: 0.22, z: 0.85 },
  { id: 'shin_r', label: 'الساق اليمنى', x: 0.4, y: 0.12, z: 0.8 },
  { id: 'shin_l', label: 'الساق اليسرى', x: 0.6, y: 0.12, z: 0.8 },
  { id: 'foot_r', label: 'القدم اليمنى', x: 0.4, y: 0.03, z: 0.78 },
  { id: 'foot_l', label: 'القدم اليسرى', x: 0.6, y: 0.03, z: 0.78 },
] as const;

export const BACK_REGIONS = [
  { id: 'scalp_back', label: 'فروة الرأس', x: 0.5, y: 0.97, z: 0.22 },
  { id: 'nape', label: 'القفا', x: 0.5, y: 0.84, z: 0.12 },
  { id: 'upper_back', label: 'أعلى الظهر', x: 0.5, y: 0.72, z: 0.1 },
  { id: 'lower_back', label: 'أسفل الظهر', x: 0.5, y: 0.58, z: 0.1 },
  { id: 'buttocks', label: 'الأليتين', x: 0.5, y: 0.48, z: 0.12 },
  { id: 'shoulder_r', label: 'الكتف الأيمن', x: 0.22, y: 0.78, z: 0.22 },
  { id: 'shoulder_l', label: 'الكتف الأيسر', x: 0.78, y: 0.78, z: 0.22 },
  { id: 'upper_arm_r', label: 'العضد الأيمن', x: 0.14, y: 0.66, z: 0.28 },
  { id: 'upper_arm_l', label: 'العضد الأيسر', x: 0.86, y: 0.66, z: 0.28 },
  { id: 'forearm_r', label: 'الساعد الأيمن', x: 0.1, y: 0.52, z: 0.3 },
  { id: 'forearm_l', label: 'الساعد الأيسر', x: 0.9, y: 0.52, z: 0.3 },
  { id: 'hand_r', label: 'ظهر اليد اليمنى', x: 0.08, y: 0.4, z: 0.32 },
  { id: 'hand_l', label: 'ظهر اليد اليسرى', x: 0.92, y: 0.4, z: 0.32 },
  { id: 'thigh_r', label: 'الفخذ الأيمن', x: 0.4, y: 0.36, z: 0.18 },
  { id: 'thigh_l', label: 'الفخذ الأيسر', x: 0.6, y: 0.36, z: 0.18 },
  { id: 'knee_r', label: 'الركبة اليمنى', x: 0.4, y: 0.22, z: 0.2 },
  { id: 'knee_l', label: 'الركبة اليسرى', x: 0.6, y: 0.22, z: 0.2 },
  { id: 'calf_r', label: 'بطة الساق اليمنى', x: 0.4, y: 0.12, z: 0.16 },
  { id: 'calf_l', label: 'بطة الساق اليسرى', x: 0.6, y: 0.12, z: 0.16 },
  { id: 'sole_r', label: 'أخمص القدم اليمنى', x: 0.4, y: 0.03, z: 0.22 },
  { id: 'sole_l', label: 'أخمص القدم اليسرى', x: 0.6, y: 0.03, z: 0.22 },
] as const;

export const BODY_REGIONS = [...FRONT_REGIONS, ...BACK_REGIONS];

const loader = new GLTFLoader();
let cached: Promise<Group> | null = null;

async function fetchSkin(): Promise<Group> {
  if (!cached) {
    cached = (async () => {
      let last: unknown;
      for (const base of HRA_CDN_BASES) {
        try {
          const gltf = await loader.loadAsync(`${base}VH_M_Skin.glb`);
          return gltf.scene;
        } catch (err) {
          last = err;
        }
      }
      throw last ?? new Error('skin glb');
    })();
    cached.catch(() => { cached = null; });
  }
  return (await cached).clone(true);
}

function worldFromNorm(box: Box3, x: number, y: number, z: number): [number, number, number] {
  const size = box.getSize(new Vector3());
  return [
    box.min.x + size.x * x,
    box.min.y + size.y * y,
    box.min.z + size.z * z,
  ];
}

export async function loadSkinGlb(view: 'front' | 'back' = 'front'): Promise<BuiltModel> {
  const group = new Group();
  const skin = await fetchSkin();
  const mat = tissueMaterial(0xe8b99a, 0.62);
  mat.side = DoubleSide;
  skin.traverse((obj) => {
    if (!(obj instanceof Mesh)) return;
    obj.material = mat.clone();
    obj.geometry.computeVertexNormals();
    obj.castShadow = true;
    obj.receiveShadow = true;
    obj.userData.zoneId = 'skin';
  });
  group.add(skin);
  fitOnGround(group, 1.68);
  const box = new Box3().setFromObject(group);
  const regions = view === 'front' ? FRONT_REGIONS : BACK_REGIONS;
  const pins: PinPos[] = regions.map((r) => ({
    id: r.label,
    position: worldFromNorm(box, r.x, r.y, r.z),
  }));
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const dist = Math.max(size.x, size.y, size.z) * 2.05;
  const camera = view === 'front'
    ? { position: [0.15, center.y + size.y * 0.08, dist] as [number, number, number], target: [center.x, center.y, center.z] as [number, number, number] }
    : { position: [0.15, center.y + size.y * 0.08, -dist] as [number, number, number], target: [center.x, center.y, center.z] as [number, number, number] };
  return { group, pins, camera, sharedAssets: true };
}
