/** Human Reference Atlas GLBs (CC BY 4.0). Loaded at runtime from public CDNs. */

export type ExtraPinRule = {
  id: string;
  from: string;
  x?: number;
  y?: number;
  z?: number;
};

export type LateralitySpec = {
  sides: { prefix: string; needles: string[] }[];
  parts: { suffix: string; needles: string[] }[];
  leftover?: string;
};

export type HraSpec = {
  files: string[];
  zones: Record<string, string[]>;
  hide?: string[];
  laterality?: LateralitySpec;
  extraPins?: ExtraPinRule[];
  targetSize?: number;
  /** Mesh name needles excluded from fit/camera so small organs fill the view. */
  cameraIgnore?: string[];
};

export const HRA_CDN_BASES = [
  'https://cdn.jsdelivr.net/gh/hubmapconsortium/ccf-3d-reference-object-library@main/VH_Male/v1.2/',
  'https://ccf-ontology.hubmapconsortium.org/objects/v1.2/',
];

export const HRA_SPECS: Record<string, HraSpec> = {
  cardiology: {
    files: ['VH_M_Heart.glb', 'VH_M_Blood_Vasculature_Heart.glb'],
    hide: [
      'brachiocephalic',
      'carotid',
      'subclavian',
      'descending_aorta',
      'vena_cava',
      'pulmonary_vein',
      'cardiac_vein',
      'coronary_sinus',
    ],
    zones: {
      lv: ['heart_left_ventricle'],
      rv: ['heart_right_ventricle'],
      la: ['left_cardiac_atrium'],
      ra: ['right_cardiac_atrium'],
      mitral: ['mitral_valve'],
      tricuspid: ['tricuspid_valve'],
      aortic_valve: ['aortic_valve'],
      pulmonary_valve: ['pulmonary_valve'],
      aorta: ['ascending_aorta', 'aortic_arch', 'vh_m_aorta'],
      pa: ['pulmonary_trunk', 'pulmonary_artery'],
      lad: ['left_anterior_descending_artery'],
      rca: ['right_coronary_artery'],
      lcx: ['left_marginal_branch', 'left_coronary_artery'],
    },
  },
  pulmonology: {
    files: ['VH_M_Lung.glb'],
    zones: {
      trachea: ['vh_m_trachea', 'tracheal_cartilage'],
      bronchi: ['bronchi', 'bronchus'],
      rul: ['lungs_r_upper_lobe'],
      rml: ['lungs_r_middle_lobe'],
      rll: ['lungs_r_lower_lobe'],
      lul: ['lungs_l_upper_lobe'],
      lll: ['lungs_l_lower_lobe'],
    },
  },
  urology: {
    files: [
      'VH_M_Kidney_L.glb',
      'VH_M_Kidney_R.glb',
      'VH_M_Ureter_L.glb',
      'VH_M_Ureter_R.glb',
      'VH_M_Urinary_Bladder.glb',
      'VH_M_Prostate.glb',
      'VH_M_Urethra.glb',
    ],
    zones: {
      kidney_l: ['left_kidney', 'kidney_capsule_l', 'cortex_of_kidney_l'],
      kidney_r: ['right_kidney', 'kidney_capsule_r', 'cortex_of_kidney_r'],
      ureter_l: ['vh_m_ureter_l'],
      ureter_r: ['vh_m_ureter_r'],
      bladder: ['urinary_bladder'],
      prostate: ['prostate_gland', 'apex_of_prostate', 'base_of_prostate', 'peripheral_zone_of_prostate'],
      urethra: ['urethra'],
    },
  },
  gastroenterology: {
    files: [
      'VH_M_Liver.glb',
      'VH_M_Pancreas.glb',
      'VH_M_Gallbladder.glb',
      'SBU_M_Intestine_Large.glb',
      'VH_M_Small_Intestine.glb',
    ],
    zones: {
      liver: ['vh_m_liver', 'liver_capsule', 'right_lobe_of_liver', 'left_lobe_of_liver'],
      pancreas: ['vh_m_pancreas', 'head_of_pancreas', 'body_of_pancreas', 'tail_of_pancreas'],
      gallbladder: ['vh_m_gallbladder'],
      duodenum: ['vh_m_duodenum', 'duodenum_'],
      small_bowel: ['small_intestine', 'vh_m_jejunum', 'vh_m_ileum'],
      colon: ['vh_m_colon', 'ascending_colon', 'transverse_colon', 'descending_colon', 'sigmoid_colon', 'caecum'],
      rectum: ['vh_m_rectum'],
    },
  },
  neurology: {
    files: ['Allen_M_Brain.glb', 'VH_M_Spinal_Cord.glb'],
    targetSize: 1.35,
    zones: {
      frontal: ['frontal_gyrus', 'frontal_pole', 'frontal_operculum', 'frontal'],
      parietal: ['parietal', 'supraparietal'],
      temporal_r: ['temporal_gyrus_r', 'temporal_pole_r', 'planum_temporale_r', 'right_temporal'],
      temporal_l: ['temporal_gyrus_l', 'temporal_pole_l', 'planum_temporale_l', 'left_temporal'],
      occipital: ['occipital'],
      cerebellum: ['cerebellum'],
      brainstem: ['medulla_oblongata', 'basilar_part_of_pons', 'brain_stem', 'brainstem', 'pons', 'midbrain'],
      spinal: ['spinal_cord', 'spinal', 'cervical_segment', 'thoracic_segment', 'lumbar_segment', 'sacral_segment'],
    },
    extraPins: [
      { id: 'cranial', from: 'brainstem', x: 0.5, y: 0.72, z: 1 },
      { id: 'peripheral_r', from: 'spinal', x: 0.12, y: 0.18, z: 1 },
      { id: 'peripheral_l', from: 'spinal', x: 0.88, y: 0.18, z: 1 },
    ],
  },
  psychiatry: {
    files: ['Allen_M_Brain.glb'],
    zones: {
      mood: ['frontal_pole', 'middle_frontal_gyrus', 'orbitofrontal', 'cingulate'],
      cognition: ['superior_frontal_gyrus', 'frontal_pole', 'dorsolateral'],
      anxiety: ['temporal_pole', 'amygdala', 'insula'],
      psychosis: ['superior_temporal_gyrus', 'temporal'],
      trauma: ['hippocampus', 'parahippocampal'],
      sleep: ['thalamus', 'basilar_part_of_pons', 'hypothalamus'],
      substance: ['accumbens', 'inferior_frontal_gyrus', 'striatum', 'putamen'],
      function: ['supraparietal', 'parietal_operculum', 'parietal'],
    },
  },
  ophthalmology: {
    files: ['VH_M_Eye_R.glb', 'VH_M_Eye_L.glb', 'VH_M_Muscles_Eye_R.glb', 'VH_M_Muscles_Eye_L.glb'],
    hide: ['blood', 'vasculature', 'vein', 'artery', 'ciliary_artery', 'optic_nerve'],
    cameraIgnore: ['optic'],
    targetSize: 1.02,
    laterality: {
      sides: [
        { prefix: 'od', needles: ['eye_r', 'right_eye', 'muscles_eye_r', 'vh_m_eye_r', 'eye_right'] },
        { prefix: 'os', needles: ['eye_l', 'left_eye', 'muscles_eye_l', 'vh_m_eye_l', 'eye_left'] },
      ],
      parts: [
        { suffix: '_cornea', needles: ['cornea'] },
        { suffix: '_lens', needles: ['lens', 'iris', 'pupil'] },
        { suffix: '_retina', needles: ['retina', 'choroid', 'sclera'] },
        { suffix: '_macula', needles: ['macula', 'fovea'] },
        { suffix: '_lid', needles: ['lid', 'palpebra', 'eyelid'] },
      ],
      leftover: 'eom',
    },
    zones: {},
    extraPins: [
      { id: 'iop', from: 'od_cornea', x: 0.5, y: 1.08, z: 1 },
      { id: 'od_lid', from: 'od_cornea', x: 0.5, y: 1.02, z: 0.75 },
      { id: 'os_lid', from: 'os_cornea', x: 0.5, y: 1.02, z: 0.75 },
      { id: 'od_macula', from: 'od_retina', x: 0.42, y: 0.48, z: 0.15 },
      { id: 'os_macula', from: 'os_retina', x: 0.58, y: 0.48, z: 0.15 },
      { id: 'od_optic', from: 'od_retina', x: 0.22, y: 0.5, z: 0.12 },
      { id: 'os_optic', from: 'os_retina', x: 0.78, y: 0.5, z: 0.12 },
    ],
  },
};

export function compileZoneRules(zones: Record<string, string[]>) {
  const rules: { zone: string; needle: string }[] = [];
  for (const [zone, needles] of Object.entries(zones)) {
    for (const needle of needles) {
      rules.push({ zone, needle: needle.toLowerCase() });
    }
  }
  rules.sort((a, b) => b.needle.length - a.needle.length);
  return rules;
}
