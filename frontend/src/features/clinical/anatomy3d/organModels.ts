import {
  BoxGeometry,
  CatmullRomCurve3,
  CircleGeometry,
  DoubleSide,
  Group,
  Mesh,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three';
import {
  addTagged,
  boneGroup,
  pinsFromNamed,
  place,
  sphere,
  tissueMaterial,
  type BuiltModel,
} from './shared';
import { HRA_SPECS } from './hraCatalog';
import { loadHraModel } from './loadHraModel';
import { loadDigestiveGlb, loadEndocrineGlb, loadEntGlb, loadNutritionGlb } from './loadLocalAnatomy';

function model(group: Group, ids: string[], camera: BuiltModel['camera']): BuiltModel {
  group.updateMatrixWorld(true);
  return { group, pins: pinsFromNamed(group, ids), camera };
}

export function createHeartModel(): BuiltModel {
  const group = new Group();
  const myo = tissueMaterial(0xc62828, 0.38);
  const vessel = tissueMaterial(0x8e0000, 0.35);
  const pale = tissueMaterial(0xef9a9a, 0.45);
  group.position.y = 0.55;

  const body = boneGroup(group, 'lv');
  const lv = place(new Mesh(sphere(0.16, 28), myo), -0.05, 0.02, 0.02);
  lv.scale.set(0.92, 1.15, 0.88);
  addTagged(body, lv, 'lv', myo);

  const rvG = boneGroup(group, 'rv');
  addTagged(rvG, place(new Mesh(sphere(0.12, 22), pale), 0.09, 0.0, 0.06), 'rv', pale);

  const laG = boneGroup(group, 'la');
  addTagged(laG, place(new Mesh(sphere(0.08, 18), pale), -0.08, 0.14, -0.02), 'la', pale);
  const raG = boneGroup(group, 'ra');
  addTagged(raG, place(new Mesh(sphere(0.075, 18), pale), 0.1, 0.13, 0.0), 'ra', pale);

  const aortaC = new CatmullRomCurve3([
    new Vector3(0.02, 0.12, 0.02),
    new Vector3(0.02, 0.28, 0.0),
    new Vector3(0.12, 0.32, -0.02),
    new Vector3(0.16, 0.22, 0.0),
    new Vector3(0.14, 0.08, 0.02),
  ]);
  const aortaG = boneGroup(group, 'aorta');
  addTagged(aortaG, new Mesh(new TubeGeometry(aortaC, 24, 0.028, 10, false), vessel), 'aorta', vessel);

  const paG = boneGroup(group, 'pa');
  const paC = new CatmullRomCurve3([
    new Vector3(0.04, 0.14, 0.04),
    new Vector3(0.14, 0.2, 0.06),
    new Vector3(0.2, 0.16, 0.04),
  ]);
  addTagged(paG, new Mesh(new TubeGeometry(paC, 12, 0.02, 8, false), pale), 'pa', pale);

  addTagged(boneGroup(group, 'aortic_valve'), place(new Mesh(sphere(0.028), vessel), 0.0, 0.1, 0.04), 'aortic_valve', vessel);
  addTagged(boneGroup(group, 'pulmonary_valve'), place(new Mesh(sphere(0.024), pale), 0.05, 0.12, 0.06), 'pulmonary_valve', pale);
  addTagged(boneGroup(group, 'mitral'), place(new Mesh(sphere(0.026), vessel), -0.04, 0.06, 0.05), 'mitral', vessel);
  addTagged(boneGroup(group, 'tricuspid'), place(new Mesh(sphere(0.026), pale), 0.05, 0.05, 0.06), 'tricuspid', pale);
  addTagged(boneGroup(group, 'lad'), place(new Mesh(sphere(0.02), vessel), -0.03, -0.04, 0.14), 'lad', vessel);
  addTagged(boneGroup(group, 'rca'), place(new Mesh(sphere(0.02), vessel), 0.1, 0.0, 0.13), 'rca', vessel);
  addTagged(boneGroup(group, 'lcx'), place(new Mesh(sphere(0.02), vessel), -0.12, 0.02, 0.08), 'lcx', vessel);
  addTagged(boneGroup(group, 'pericardium'), place(new Mesh(sphere(0.22, 16), tissueMaterial(0xffcdd2, 0.7)), 0, 0.04, 0), 'pericardium', tissueMaterial(0xffcdd2, 0.7));
  const peri = group.getObjectByName('pericardium') as Mesh | undefined;
  if (peri) {
    peri.scale.set(1.15, 1.25, 1.1);
    const periMat = peri.material as { transparent?: boolean; opacity?: number };
    periMat.transparent = true;
    periMat.opacity = 0.16;
    peri.raycast = () => {};
  }

  return model(group, ['aorta', 'pa', 'aortic_valve', 'pulmonary_valve', 'la', 'ra', 'mitral', 'tricuspid', 'lad', 'rca', 'lv', 'rv', 'lcx', 'pericardium'], {
    position: [0.55, 0.85, 1.55],
    target: [0, 0.58, 0],
  });
}

export function createLungsModel(): BuiltModel {
  const group = new Group();
  const tissue = tissueMaterial(0xe57373, 0.55);
  const air = tissueMaterial(0x4fc3f7, 0.35);
  group.position.y = 0.7;
  const trachea = boneGroup(group, 'trachea');
  addTagged(trachea, place(new Mesh(new TubeGeometry(new CatmullRomCurve3([new Vector3(0, 0.32, 0), new Vector3(0, 0.08, 0)]), 8, 0.022, 10, false), air), 0, 0, 0), 'trachea', air);
  const bronchi = boneGroup(group, 'bronchi');
  addTagged(bronchi, new Mesh(new TubeGeometry(new CatmullRomCurve3([new Vector3(0, 0.08, 0), new Vector3(-0.08, -0.02, 0.02)]), 8, 0.016, 8, false), air), 'bronchi', air);
  addTagged(bronchi, new Mesh(new TubeGeometry(new CatmullRomCurve3([new Vector3(0, 0.08, 0), new Vector3(0.08, -0.02, 0.02)]), 8, 0.016, 8, false), air), 'bronchi', air);

  const rul = boneGroup(group, 'rul');
  const rLung = place(new Mesh(sphere(0.16, 24), tissue), -0.16, 0.02, 0);
  rLung.scale.set(0.85, 1.25, 0.7);
  addTagged(rul, rLung, 'rul', tissue);
  addTagged(boneGroup(group, 'rml'), place(new Mesh(sphere(0.09, 16), tissue), -0.18, -0.08, 0.04), 'rml', tissue);
  addTagged(boneGroup(group, 'rll'), place(new Mesh(sphere(0.11, 16), tissue), -0.15, -0.16, 0), 'rll', tissue);

  const lul = boneGroup(group, 'lul');
  const lLung = place(new Mesh(sphere(0.15, 24), tissue), 0.16, 0.04, 0);
  lLung.scale.set(0.8, 1.15, 0.68);
  addTagged(lul, lLung, 'lul', tissue);
  addTagged(boneGroup(group, 'lll'), place(new Mesh(sphere(0.11, 16), tissue), 0.15, -0.14, 0), 'lll', tissue);
  addTagged(boneGroup(group, 'pleura'), place(new Mesh(sphere(0.02), air), 0, -0.18, 0.12), 'pleura', air);
  addTagged(boneGroup(group, 'diaphragm'), place(new Mesh(new TorusGeometry(0.22, 0.012, 8, 28, Math.PI), tissueMaterial(0x78909c)), 0, -0.26, 0, [Math.PI / 2, 0, 0]), 'diaphragm', tissueMaterial(0x78909c));

  return model(group, ['trachea', 'bronchi', 'rul', 'lul', 'rml', 'rll', 'lll', 'pleura', 'diaphragm'], {
    position: [0.5, 0.85, 1.7],
    target: [0, 0.65, 0],
  });
}

export function createBrainModel(): BuiltModel {
  const group = new Group();
  const cortex = tissueMaterial(0xf48fb1, 0.5);
  const cere = tissueMaterial(0x7e57c2, 0.45);
  group.position.y = 0.7;
  const frontal = boneGroup(group, 'frontal');
  const brain = place(new Mesh(sphere(0.18, 28), cortex), 0, 0.12, 0.02);
  brain.scale.set(1.05, 0.85, 0.9);
  addTagged(frontal, brain, 'frontal', cortex);
  addTagged(boneGroup(group, 'parietal'), place(new Mesh(sphere(0.1, 18), cortex), 0, 0.16, -0.06), 'parietal', cortex);
  addTagged(boneGroup(group, 'temporal_r'), place(new Mesh(sphere(0.07, 14), cortex), -0.14, 0.06, 0.04), 'temporal_r', cortex);
  addTagged(boneGroup(group, 'temporal_l'), place(new Mesh(sphere(0.07, 14), cortex), 0.14, 0.06, 0.04), 'temporal_l', cortex);
  addTagged(boneGroup(group, 'occipital'), place(new Mesh(sphere(0.08, 14), cortex), 0, 0.08, -0.14), 'occipital', cortex);
  addTagged(boneGroup(group, 'cerebellum'), place(new Mesh(sphere(0.09, 16), cere), 0, -0.04, -0.08), 'cerebellum', cere);
  addTagged(boneGroup(group, 'brainstem'), place(new Mesh(new BoxGeometry(0.04, 0.1, 0.04), cere), 0, -0.08, -0.02), 'brainstem', cere);
  addTagged(boneGroup(group, 'cranial'), place(new Mesh(sphere(0.025), cere), 0.12, 0.0, 0.08), 'cranial', cere);
  addTagged(boneGroup(group, 'spinal'), place(new Mesh(new BoxGeometry(0.035, 0.22, 0.035), cere), 0, -0.24, 0), 'spinal', cere);
  addTagged(boneGroup(group, 'peripheral_r'), place(new Mesh(sphere(0.03), cere), -0.12, -0.28, 0.06), 'peripheral_r', cere);
  addTagged(boneGroup(group, 'peripheral_l'), place(new Mesh(sphere(0.03), cere), 0.12, -0.28, 0.06), 'peripheral_l', cere);

  return model(group, ['frontal', 'parietal', 'temporal_r', 'temporal_l', 'occipital', 'cerebellum', 'brainstem', 'cranial', 'spinal', 'peripheral_r', 'peripheral_l'], {
    position: [0.45, 0.85, 1.55],
    target: [0, 0.62, 0],
  });
}

export function createPsychBrainModel(): BuiltModel {
  const group = new Group();
  const cortex = tissueMaterial(0x7e57c2, 0.48);
  group.position.y = 0.65;
  const ids = ['mood', 'anxiety', 'cognition', 'sleep', 'psychosis', 'substance', 'trauma', 'function'] as const;
  const brain = place(new Mesh(sphere(0.2, 28), cortex), 0, 0.08, 0);
  brain.scale.set(1.05, 0.9, 0.95);
  addTagged(boneGroup(group, 'mood'), brain, 'mood', cortex);
  addTagged(boneGroup(group, 'anxiety'), place(new Mesh(sphere(0.045), cortex), 0.14, 0.12, 0.08), 'anxiety', cortex);
  addTagged(boneGroup(group, 'cognition'), place(new Mesh(sphere(0.045), cortex), 0, -0.04, 0.12), 'cognition', cortex);
  addTagged(boneGroup(group, 'sleep'), place(new Mesh(sphere(0.04), cortex), 0.12, 0.0, -0.08), 'sleep', cortex);
  addTagged(boneGroup(group, 'psychosis'), place(new Mesh(sphere(0.04), cortex), -0.12, 0.0, -0.06), 'psychosis', cortex);
  addTagged(boneGroup(group, 'substance'), place(new Mesh(sphere(0.04), cortex), -0.14, 0.1, 0.06), 'substance', cortex);
  addTagged(boneGroup(group, 'trauma'), place(new Mesh(sphere(0.035), cortex), -0.08, 0.04, 0.12), 'trauma', cortex);
  addTagged(boneGroup(group, 'function'), place(new Mesh(sphere(0.035), cortex), 0.08, 0.04, 0.12), 'function', cortex);
  return model(group, [...ids], { position: [0.4, 0.8, 1.45], target: [0, 0.65, 0] });
}

export function createDigestiveModel(): BuiltModel {
  const group = new Group();
  const liverM = tissueMaterial(0xb71c1c, 0.5);
  const sto = tissueMaterial(0xef6c00, 0.45);
  const bowel = tissueMaterial(0xffa726, 0.5);
  group.position.y = 0.55;
  addTagged(boneGroup(group, 'esophagus'), place(new Mesh(new TubeGeometry(new CatmullRomCurve3([new Vector3(0, 0.42, 0), new Vector3(0, 0.22, 0)]), 6, 0.014, 8, false), sto), 0, 0, 0), 'esophagus', sto);
  const liver = place(new Mesh(sphere(0.14, 20), liverM), -0.1, 0.16, 0);
  liver.scale.set(1.3, 0.7, 0.9);
  addTagged(boneGroup(group, 'liver'), liver, 'liver', liverM);
  const stomach = place(new Mesh(sphere(0.1, 18), sto), 0.1, 0.12, 0.04);
  stomach.scale.set(1.2, 0.75, 0.85);
  addTagged(boneGroup(group, 'stomach'), stomach, 'stomach', sto);
  addTagged(boneGroup(group, 'gallbladder'), place(new Mesh(sphere(0.03), tissueMaterial(0xffc107)), -0.04, 0.1, 0.08), 'gallbladder', tissueMaterial(0xffc107));
  addTagged(boneGroup(group, 'duodenum'), place(new Mesh(sphere(0.035), sto), 0.14, 0.04, 0.04), 'duodenum', sto);
  addTagged(boneGroup(group, 'pancreas'), place(new Mesh(new BoxGeometry(0.16, 0.035, 0.04), tissueMaterial(0xffcc80)), 0.02, 0.05, -0.02), 'pancreas', tissueMaterial(0xffcc80));
  const small = place(new Mesh(sphere(0.13, 16), bowel), 0.02, -0.06, 0.02);
  small.scale.set(1.1, 0.7, 1);
  addTagged(boneGroup(group, 'small_bowel'), small, 'small_bowel', bowel);
  addTagged(boneGroup(group, 'colon'), new Mesh(new TorusGeometry(0.16, 0.028, 8, 24, Math.PI * 1.6), sto), 'colon', sto);
  const colon = group.getObjectByName('colon') as Mesh;
  if (colon) colon.position.set(0.02, -0.14, 0);
  addTagged(boneGroup(group, 'rectum'), place(new Mesh(sphere(0.04), sto), 0.0, -0.28, 0.02), 'rectum', sto);
  return model(group, ['esophagus', 'liver', 'stomach', 'gallbladder', 'duodenum', 'pancreas', 'small_bowel', 'colon', 'rectum'], {
    position: [0.45, 0.7, 1.7],
    target: [0, 0.5, 0],
  });
}

export function createUrinaryModel(): BuiltModel {
  const group = new Group();
  const kid = tissueMaterial(0xc62828, 0.48);
  const urine = tissueMaterial(0x0288d1, 0.4);
  group.position.y = 0.55;
  const kr = place(new Mesh(sphere(0.08, 18), kid), -0.14, 0.22, 0);
  kr.scale.set(0.75, 1.2, 0.6);
  addTagged(boneGroup(group, 'kidney_r'), kr, 'kidney_r', kid);
  const kl = place(new Mesh(sphere(0.08, 18), kid), 0.14, 0.22, 0);
  kl.scale.set(0.75, 1.2, 0.6);
  addTagged(boneGroup(group, 'kidney_l'), kl, 'kidney_l', kid);
  addTagged(boneGroup(group, 'ureter_r'), new Mesh(new TubeGeometry(new CatmullRomCurve3([new Vector3(-0.14, 0.12, 0), new Vector3(-0.06, -0.04, 0.02)]), 8, 0.01, 8, false), urine), 'ureter_r', urine);
  addTagged(boneGroup(group, 'ureter_l'), new Mesh(new TubeGeometry(new CatmullRomCurve3([new Vector3(0.14, 0.12, 0), new Vector3(0.06, -0.04, 0.02)]), 8, 0.01, 8, false), urine), 'ureter_l', urine);
  const bladder = place(new Mesh(sphere(0.09, 18), urine), 0, -0.1, 0.03);
  bladder.scale.set(1.15, 0.8, 0.9);
  addTagged(boneGroup(group, 'bladder'), bladder, 'bladder', urine);
  addTagged(boneGroup(group, 'prostate'), place(new Mesh(sphere(0.035), tissueMaterial(0x8e24aa)), 0, -0.18, 0.03), 'prostate', tissueMaterial(0x8e24aa));
  addTagged(boneGroup(group, 'urethra'), place(new Mesh(new BoxGeometry(0.02, 0.08, 0.02), urine), 0, -0.24, 0.03), 'urethra', urine);
  addTagged(boneGroup(group, 'testis_r'), place(new Mesh(sphere(0.028), tissueMaterial(0xffab91)), -0.04, -0.3, 0.03), 'testis_r', tissueMaterial(0xffab91));
  addTagged(boneGroup(group, 'testis_l'), place(new Mesh(sphere(0.028), tissueMaterial(0xffab91)), 0.04, -0.3, 0.03), 'testis_l', tissueMaterial(0xffab91));
  return model(group, ['kidney_r', 'kidney_l', 'ureter_r', 'ureter_l', 'bladder', 'prostate', 'urethra', 'testis_r', 'testis_l'], {
    position: [0.4, 0.7, 1.6],
    target: [0, 0.5, 0],
  });
}

export function createEndocrineModel(): BuiltModel {
  const group = new Group();
  const skin = tissueMaterial(0xe0b8a4, 0.6);
  const gland = tissueMaterial(0xe91e63, 0.4);
  group.position.y = 0.55;
  const head = place(new Mesh(sphere(0.12, 16), skin), 0, 0.28, 0);
  addTagged(boneGroup(group, 'metabolic'), head, 'metabolic', skin);
  const torso = place(new Mesh(sphere(0.16, 18), skin), 0, 0.02, 0);
  torso.scale.set(0.9, 1.3, 0.55);
  addTagged(boneGroup(group, 'metabolic'), torso, 'metabolic', skin);
  addTagged(boneGroup(group, 'hypothalamus'), place(new Mesh(sphere(0.03), gland), 0, 0.34, 0.08), 'hypothalamus', gland);
  addTagged(boneGroup(group, 'pituitary'), place(new Mesh(sphere(0.022), gland), 0, 0.28, 0.1), 'pituitary', gland);
  addTagged(boneGroup(group, 'thyroid'), place(new Mesh(sphere(0.035), gland), 0, 0.18, 0.1), 'thyroid', gland);
  addTagged(boneGroup(group, 'parathyroid'), place(new Mesh(sphere(0.016), gland), 0.03, 0.18, 0.11), 'parathyroid', gland);
  addTagged(boneGroup(group, 'adrenal_r'), place(new Mesh(sphere(0.025), gland), -0.07, 0.04, 0.08), 'adrenal_r', gland);
  addTagged(boneGroup(group, 'adrenal_l'), place(new Mesh(sphere(0.025), gland), 0.07, 0.04, 0.08), 'adrenal_l', gland);
  addTagged(boneGroup(group, 'pancreas'), place(new Mesh(new BoxGeometry(0.1, 0.025, 0.03), gland), 0, -0.02, 0.08), 'pancreas', gland);
  addTagged(boneGroup(group, 'gonads'), place(new Mesh(sphere(0.03), gland), 0, -0.18, 0.08), 'gonads', gland);
  return model(group, ['hypothalamus', 'pituitary', 'thyroid', 'parathyroid', 'adrenal_r', 'adrenal_l', 'pancreas', 'gonads', 'metabolic'], {
    position: [0.35, 0.75, 1.55],
    target: [0, 0.55, 0],
  });
}

export function createEyesModel(): BuiltModel {
  const group = new Group();
  const sclera = tissueMaterial(0xfafafa, 0.35);
  const iris = tissueMaterial(0x1565c0, 0.3);
  group.position.y = 0.7;
  const makeEye = (idPrefix: 'od' | 'os', x: number, irisHex: number) => {
    const globe = place(new Mesh(sphere(0.12, 28), sclera), x, 0.12, 0);
    addTagged(boneGroup(group, `${idPrefix}_cornea`), globe, `${idPrefix}_cornea`, sclera);
    addTagged(boneGroup(group, `${idPrefix}_lens`), place(new Mesh(sphere(0.045), tissueMaterial(irisHex)), x, 0.12, 0.08), `${idPrefix}_lens`, tissueMaterial(irisHex));
    addTagged(boneGroup(group, `${idPrefix}_lid`), place(new Mesh(new TorusGeometry(0.13, 0.018, 8, 20, Math.PI), tissueMaterial(0xd7ccc8)), x, 0.18, 0.02, [Math.PI, 0, 0]), `${idPrefix}_lid`, tissueMaterial(0xd7ccc8));
    addTagged(boneGroup(group, `${idPrefix}_retina`), place(new Mesh(sphere(0.07, 16), tissueMaterial(0x6d2c2c)), x, -0.12, 0.04), `${idPrefix}_retina`, tissueMaterial(0x6d2c2c));
    addTagged(boneGroup(group, `${idPrefix}_macula`), place(new Mesh(sphere(0.02), tissueMaterial(0x4a1515)), x - 0.02, -0.12, 0.08), `${idPrefix}_macula`, tissueMaterial(0x4a1515));
    addTagged(boneGroup(group, `${idPrefix}_optic`), place(new Mesh(sphere(0.018), tissueMaterial(0xf5e6a3)), x + 0.025, -0.12, 0.08), `${idPrefix}_optic`, tissueMaterial(0xf5e6a3));
  };
  makeEye('od', -0.18, 0x1565c0);
  makeEye('os', 0.18, 0x2e7d32);
  addTagged(boneGroup(group, 'iop'), place(new Mesh(sphere(0.03), iris), 0, 0.32, 0.08), 'iop', iris);
  addTagged(boneGroup(group, 'eom'), place(new Mesh(sphere(0.03), tissueMaterial(0x0277bd)), 0, -0.02, 0.1), 'eom', tissueMaterial(0x0277bd));
  return model(group, ['iop', 'od_lid', 'os_lid', 'od_cornea', 'os_cornea', 'od_lens', 'os_lens', 'od_retina', 'os_retina', 'od_macula', 'os_macula', 'od_optic', 'os_optic', 'eom'], {
    position: [0, 0.75, 1.55],
    target: [0, 0.65, 0],
  });
}

export function createEntHeadModel(): BuiltModel {
  const group = new Group();
  const skin = tissueMaterial(0xe8c3b0, 0.55);
  const inner = tissueMaterial(0x00897b, 0.4);
  group.position.y = 0.65;
  const head = place(new Mesh(sphere(0.18, 28), skin), 0, 0.1, 0);
  head.scale.set(0.9, 1.15, 0.95);
  addTagged(boneGroup(group, 'sinus_front'), head, 'sinus_front', skin);
  addTagged(boneGroup(group, 'ear_r'), place(new Mesh(sphere(0.04, 12), skin), -0.18, 0.08, 0), 'ear_r', skin);
  addTagged(boneGroup(group, 'ear_l'), place(new Mesh(sphere(0.04, 12), skin), 0.18, 0.08, 0), 'ear_l', skin);
  addTagged(boneGroup(group, 'tm_r'), place(new Mesh(sphere(0.016), inner), -0.16, 0.08, 0.02), 'tm_r', inner);
  addTagged(boneGroup(group, 'tm_l'), place(new Mesh(sphere(0.016), inner), 0.16, 0.08, 0.02), 'tm_l', inner);
  addTagged(boneGroup(group, 'nose'), place(new Mesh(sphere(0.04), skin), 0, 0.04, 0.16), 'nose', skin);
  addTagged(boneGroup(group, 'sinus_max'), place(new Mesh(sphere(0.03), inner), -0.06, 0.02, 0.14), 'sinus_max', inner);
  addTagged(boneGroup(group, 'nasopharynx'), place(new Mesh(sphere(0.03), inner), 0, -0.02, 0.08), 'nasopharynx', inner);
  addTagged(boneGroup(group, 'tonsils'), place(new Mesh(sphere(0.025), tissueMaterial(0xb71c1c)), -0.03, -0.06, 0.12), 'tonsils', tissueMaterial(0xb71c1c));
  addTagged(boneGroup(group, 'larynx'), place(new Mesh(sphere(0.04), skin), 0, -0.16, 0.08), 'larynx', skin);
  addTagged(boneGroup(group, 'vocal'), place(new Mesh(sphere(0.02), inner), 0, -0.2, 0.1), 'vocal', inner);
  return model(group, ['sinus_front', 'ear_r', 'tm_r', 'ear_l', 'tm_l', 'nose', 'sinus_max', 'nasopharynx', 'tonsils', 'larynx', 'vocal'], {
    position: [0.35, 0.75, 1.45],
    target: [0, 0.6, 0],
  });
}

export function createNutritionModel(): BuiltModel {
  const group = new Group();
  const plate = tissueMaterial(0xeceff1, 0.35);
  group.position.y = 0.45;
  const disc = new Mesh(new CircleGeometry(0.32, 40), plate);
  disc.rotation.x = -Math.PI / 2;
  disc.material.side = DoubleSide;
  addTagged(boneGroup(group, 'calories'), place(disc, 0, 0.02, 0), 'calories', plate);
  addTagged(boneGroup(group, 'protein'), place(new Mesh(sphere(0.07), tissueMaterial(0x8bc34a)), 0, 0.08, -0.12), 'protein', tissueMaterial(0x8bc34a));
  addTagged(boneGroup(group, 'carbs'), place(new Mesh(sphere(0.065), tissueMaterial(0xffcc80)), 0.14, 0.08, 0.02), 'carbs', tissueMaterial(0xffcc80));
  addTagged(boneGroup(group, 'fats'), place(new Mesh(sphere(0.055), tissueMaterial(0xfff176)), 0.1, 0.08, 0.14), 'fats', tissueMaterial(0xfff176));
  addTagged(boneGroup(group, 'vitamins'), place(new Mesh(sphere(0.05), tissueMaterial(0xff8a65)), -0.12, 0.08, 0.1), 'vitamins', tissueMaterial(0xff8a65));
  addTagged(boneGroup(group, 'minerals'), place(new Mesh(sphere(0.045), tissueMaterial(0x90caf9)), -0.14, 0.08, -0.04), 'minerals', tissueMaterial(0x90caf9));
  addTagged(boneGroup(group, 'fiber'), place(new Mesh(sphere(0.05), tissueMaterial(0x558b2f)), 0, 0.08, 0.16), 'fiber', tissueMaterial(0x558b2f));
  addTagged(boneGroup(group, 'hydration'), place(new Mesh(sphere(0.04), tissueMaterial(0x4fc3f7)), -0.04, 0.1, 0.0), 'hydration', tissueMaterial(0x4fc3f7));
  return model(group, ['protein', 'carbs', 'calories', 'hydration', 'minerals', 'fats', 'vitamins', 'fiber'], {
    position: [0.4, 0.85, 1.2],
    target: [0, 0.45, 0],
  });
}

export const ORGAN_BUILDERS: Record<string, () => BuiltModel> = {
  cardiology: createHeartModel,
  ophthalmology: createEyesModel,
  ent: createEntHeadModel,
  psychiatry: createPsychBrainModel,
  gastroenterology: createDigestiveModel,
  neurology: createBrainModel,
  pulmonology: createLungsModel,
  urology: createUrinaryModel,
  endocrinology: createEndocrineModel,
  nutrition: createNutritionModel,
};

export const HRA_LOADERS: Record<string, () => Promise<BuiltModel>> = {
  ...Object.fromEntries(Object.entries(HRA_SPECS).map(([code, spec]) => [code, () => loadHraModel(spec)])),
  gastroenterology: loadDigestiveGlb,
  nutrition: loadNutritionGlb,
  ent: loadEntGlb,
  endocrinology: loadEndocrineGlb,
};

export const BP3D_CHARTS = new Set(['gastroenterology', 'nutrition', 'ent', 'endocrinology']);
