import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import SpecialtyChartShell, { ChartLegendItem, ZoneChipPicker } from '@/shared/components/SpecialtyChartShell';
import { AnatomyPin, AnatomyStage } from './anatomy/AnatomyScene';
import SkeletonChart from './SkeletonChart';
import Medical3DViewport from './anatomy3d/Medical3DViewport';
import { ORGAN_BUILDERS, HRA_LOADERS, BP3D_CHARTS } from './anatomy3d/organModels';
import HeartFigure from './anatomy/HeartFigure';
import EyesFigure from './anatomy/EyesFigure';
import {
  BrainFigure,
  DigestiveFigure,
  EndocrineFigure,
  EntFaceFigure,
  LungsFigure,
  NutritionPlateFigure,
  PsychBrainFigure,
  UrinaryFigure,
} from './anatomy/OrganFigures';

interface ClinicalVisualChartProps {
  code: string;
  selected?: string;
  onSelect?: (zone: string, label: string) => void;
  activeZones?: string[];
}

type Pin = { id: string; labelKey: string; color: string; x: number; y: number };

type VisualDef = {
  titleKey: string;
  hintKey: string;
  viewBox: string;
  maxWidth?: number;
  zones: Pin[];
  figure: () => ReactNode;
};

const VISUALS: Record<string, VisualDef> = {
  cardiology: {
    titleKey: 'visuals.cardiology.title',
    hintKey: 'visuals.cardiology.hint',
    viewBox: '0 0 320 286',
    maxWidth: 380,
    figure: () => <HeartFigure />,
    zones: [
      { id: 'aorta', labelKey: 'visuals.cardiology.aorta', color: '#8E0000', x: 204, y: 52 },
      { id: 'pa', labelKey: 'visuals.cardiology.pa', color: '#FF5252', x: 228, y: 98 },
      { id: 'aortic_valve', labelKey: 'visuals.cardiology.aorticValve', color: '#C62828', x: 156, y: 102 },
      { id: 'pulmonary_valve', labelKey: 'visuals.cardiology.pulmonaryValve', color: '#E53935', x: 176, y: 92 },
      { id: 'la', labelKey: 'visuals.cardiology.la', color: '#EF5350', x: 118, y: 128 },
      { id: 'ra', labelKey: 'visuals.cardiology.ra', color: '#EF9A9A', x: 214, y: 128 },
      { id: 'mitral', labelKey: 'visuals.cardiology.mitral', color: '#B71C1C', x: 146, y: 156 },
      { id: 'tricuspid', labelKey: 'visuals.cardiology.tricuspid', color: '#D32F2F', x: 186, y: 156 },
      { id: 'lad', labelKey: 'visuals.cardiology.lad', color: '#FF1744', x: 152, y: 198 },
      { id: 'rca', labelKey: 'visuals.cardiology.rca', color: '#D50000', x: 222, y: 176 },
      { id: 'lv', labelKey: 'visuals.cardiology.lv', color: '#C62828', x: 122, y: 210 },
      { id: 'rv', labelKey: 'visuals.cardiology.rv', color: '#E57373', x: 200, y: 214 },
      { id: 'lcx', labelKey: 'visuals.cardiology.lcx', color: '#FF8A80', x: 108, y: 188 },
      { id: 'pericardium', labelKey: 'visuals.cardiology.pericardium', color: '#FFCDD2', x: 252, y: 230 },
    ],
  },
  ophthalmology: {
    titleKey: 'visuals.ophthalmology.title',
    hintKey: 'visuals.ophthalmology.hint',
    viewBox: '0 0 340 250',
    maxWidth: 420,
    figure: () => <EyesFigure />,
    zones: [
      { id: 'iop', labelKey: 'visuals.ophthalmology.iop', color: '#29B6F6', x: 170, y: 18 },
      { id: 'od_lid', labelKey: 'visuals.ophthalmology.odLid', color: '#90CAF9', x: 90, y: 54 },
      { id: 'os_lid', labelKey: 'visuals.ophthalmology.osLid', color: '#64B5F6', x: 250, y: 54 },
      { id: 'od_cornea', labelKey: 'visuals.ophthalmology.odCornea', color: '#42A5F5', x: 62, y: 92 },
      { id: 'os_cornea', labelKey: 'visuals.ophthalmology.osCornea', color: '#1E88E5', x: 278, y: 92 },
      { id: 'od_lens', labelKey: 'visuals.ophthalmology.odLens', color: '#1565C0', x: 90, y: 92 },
      { id: 'os_lens', labelKey: 'visuals.ophthalmology.osLens', color: '#0D47A1', x: 250, y: 92 },
      { id: 'od_retina', labelKey: 'visuals.ophthalmology.odRetina', color: '#5C6BC0', x: 68, y: 186 },
      { id: 'os_retina', labelKey: 'visuals.ophthalmology.osRetina', color: '#3949AB', x: 228, y: 186 },
      { id: 'od_macula', labelKey: 'visuals.ophthalmology.odMacula', color: '#283593', x: 82, y: 188 },
      { id: 'os_macula', labelKey: 'visuals.ophthalmology.osMacula', color: '#1A237E', x: 242, y: 188 },
      { id: 'od_optic', labelKey: 'visuals.ophthalmology.odOptic', color: '#7E57C2', x: 100, y: 186 },
      { id: 'os_optic', labelKey: 'visuals.ophthalmology.osOptic', color: '#5E35B1', x: 260, y: 186 },
      { id: 'eom', labelKey: 'visuals.ophthalmology.eom', color: '#0277BD', x: 170, y: 236 },
    ],
  },
  ent: {
    titleKey: 'visuals.ent.title',
    hintKey: 'visuals.ent.hint',
    viewBox: '0 0 300 280',
    maxWidth: 340,
    figure: () => <EntFaceFigure />,
    zones: [
      { id: 'sinus_front', labelKey: 'visuals.ent.sinusFront', color: '#00897B', x: 150, y: 68 },
      { id: 'ear_r', labelKey: 'visuals.ent.earR', color: '#4DB6AC', x: 64, y: 128 },
      { id: 'tm_r', labelKey: 'visuals.ent.tmR', color: '#00897B', x: 80, y: 128 },
      { id: 'ear_l', labelKey: 'visuals.ent.earL', color: '#26A69A', x: 236, y: 128 },
      { id: 'tm_l', labelKey: 'visuals.ent.tmL', color: '#00796B', x: 220, y: 128 },
      { id: 'nose', labelKey: 'visuals.ent.nose', color: '#009688', x: 150, y: 140 },
      { id: 'sinus_max', labelKey: 'visuals.ent.sinusMax', color: '#26A69A', x: 118, y: 148 },
      { id: 'nasopharynx', labelKey: 'visuals.ent.nasopharynx', color: '#00695C', x: 150, y: 168 },
      { id: 'tonsils', labelKey: 'visuals.ent.tonsils', color: '#004D40', x: 132, y: 186 },
      { id: 'larynx', labelKey: 'visuals.ent.larynx', color: '#00796B', x: 150, y: 238 },
      { id: 'vocal', labelKey: 'visuals.ent.vocal', color: '#26A69A', x: 150, y: 258 },
    ],
  },
  psychiatry: {
    titleKey: 'visuals.psychiatry.title',
    hintKey: 'visuals.psychiatry.hint',
    viewBox: '0 0 280 260',
    maxWidth: 340,
    figure: () => <PsychBrainFigure />,
    zones: [
      { id: 'mood', labelKey: 'visuals.psychiatry.mood', color: '#7E57C2', x: 140, y: 58 },
      { id: 'anxiety', labelKey: 'visuals.psychiatry.anxiety', color: '#5E35B1', x: 214, y: 100 },
      { id: 'cognition', labelKey: 'visuals.psychiatry.cognition', color: '#673AB7', x: 140, y: 214 },
      { id: 'sleep', labelKey: 'visuals.psychiatry.sleep', color: '#4527A0', x: 214, y: 176 },
      { id: 'psychosis', labelKey: 'visuals.psychiatry.psychosis', color: '#311B92', x: 66, y: 176 },
      { id: 'substance', labelKey: 'visuals.psychiatry.substance', color: '#9575CD', x: 66, y: 100 },
      { id: 'trauma', labelKey: 'visuals.psychiatry.trauma', color: '#7E57C2', x: 96, y: 140 },
      { id: 'function', labelKey: 'visuals.psychiatry.function', color: '#5E35B1', x: 184, y: 140 },
    ],
  },
  gastroenterology: {
    titleKey: 'visuals.gastro.title',
    hintKey: 'visuals.gastro.hint',
    viewBox: '0 0 280 320',
    maxWidth: 360,
    figure: () => <DigestiveFigure />,
    zones: [
      { id: 'esophagus', labelKey: 'visuals.gastro.esophagus', color: '#FFB74D', x: 143, y: 28 },
      { id: 'liver', labelKey: 'visuals.gastro.liver', color: '#EF6C00', x: 90, y: 88 },
      { id: 'stomach', labelKey: 'visuals.gastro.stomach', color: '#FFA726', x: 176, y: 100 },
      { id: 'gallbladder', labelKey: 'visuals.gastro.gallbladder', color: '#F57C00', x: 118, y: 108 },
      { id: 'duodenum', labelKey: 'visuals.gastro.duodenum', color: '#FB8C00', x: 200, y: 124 },
      { id: 'pancreas', labelKey: 'visuals.gastro.pancreas', color: '#E65100', x: 150, y: 132 },
      { id: 'small_bowel', labelKey: 'visuals.gastro.smallBowel', color: '#FF9800', x: 150, y: 190 },
      { id: 'colon', labelKey: 'visuals.gastro.colon', color: '#F57C00', x: 140, y: 248 },
      { id: 'rectum', labelKey: 'visuals.gastro.rectum', color: '#E65100', x: 140, y: 292 },
    ],
  },
  neurology: {
    titleKey: 'visuals.neurology.title',
    hintKey: 'visuals.neurology.hint',
    viewBox: '0 0 300 300',
    maxWidth: 340,
    figure: () => <BrainFigure />,
    zones: [
      { id: 'frontal', labelKey: 'visuals.neurology.frontal', color: '#5C6BC0', x: 150, y: 48 },
      { id: 'parietal', labelKey: 'visuals.neurology.parietal', color: '#3F51B5', x: 150, y: 90 },
      { id: 'temporal_r', labelKey: 'visuals.neurology.temporalR', color: '#3949AB', x: 88, y: 108 },
      { id: 'temporal_l', labelKey: 'visuals.neurology.temporalL', color: '#3949AB', x: 212, y: 108 },
      { id: 'occipital', labelKey: 'visuals.neurology.occipital', color: '#303F9F', x: 150, y: 142 },
      { id: 'cerebellum', labelKey: 'visuals.neurology.cerebellum', color: '#283593', x: 150, y: 176 },
      { id: 'brainstem', labelKey: 'visuals.neurology.brainstem', color: '#1A237E', x: 150, y: 206 },
      { id: 'cranial', labelKey: 'visuals.neurology.cranial', color: '#5C6BC0', x: 214, y: 150 },
      { id: 'spinal', labelKey: 'visuals.neurology.spinal', color: '#3F51B5', x: 150, y: 250 },
      { id: 'peripheral_r', labelKey: 'visuals.neurology.peripheralR', color: '#7986CB', x: 86, y: 250 },
      { id: 'peripheral_l', labelKey: 'visuals.neurology.peripheralL', color: '#7986CB', x: 214, y: 250 },
    ],
  },
  pulmonology: {
    titleKey: 'visuals.pulmonology.title',
    hintKey: 'visuals.pulmonology.hint',
    viewBox: '0 0 300 270',
    maxWidth: 340,
    figure: () => <LungsFigure />,
    zones: [
      { id: 'trachea', labelKey: 'visuals.pulmonology.trachea', color: '#4FC3F7', x: 150, y: 36 },
      { id: 'bronchi', labelKey: 'visuals.pulmonology.bronchi', color: '#29B6F6', x: 150, y: 76 },
      { id: 'rul', labelKey: 'visuals.pulmonology.rul', color: '#039BE5', x: 86, y: 110 },
      { id: 'lul', labelKey: 'visuals.pulmonology.lul', color: '#29B6F6', x: 214, y: 110 },
      { id: 'rml', labelKey: 'visuals.pulmonology.rml', color: '#0288D1', x: 78, y: 156 },
      { id: 'rll', labelKey: 'visuals.pulmonology.rll', color: '#0277BD', x: 90, y: 200 },
      { id: 'lll', labelKey: 'visuals.pulmonology.lll', color: '#0288D1', x: 214, y: 196 },
      { id: 'pleura', labelKey: 'visuals.pulmonology.pleura', color: '#01579B', x: 150, y: 214 },
      { id: 'diaphragm', labelKey: 'visuals.pulmonology.diaphragm', color: '#4FC3F7', x: 150, y: 242 },
    ],
  },
  urology: {
    titleKey: 'visuals.urology.title',
    hintKey: 'visuals.urology.hint',
    viewBox: '0 0 280 310',
    maxWidth: 360,
    figure: () => <UrinaryFigure />,
    zones: [
      { id: 'kidney_r', labelKey: 'visuals.urology.kidneyR', color: '#00838F', x: 78, y: 78 },
      { id: 'kidney_l', labelKey: 'visuals.urology.kidneyL', color: '#006064', x: 202, y: 78 },
      { id: 'ureter_r', labelKey: 'visuals.urology.ureterR', color: '#0097A7', x: 98, y: 154 },
      { id: 'ureter_l', labelKey: 'visuals.urology.ureterL', color: '#00838F', x: 182, y: 154 },
      { id: 'bladder', labelKey: 'visuals.urology.bladder', color: '#00ACC1', x: 140, y: 210 },
      { id: 'prostate', labelKey: 'visuals.urology.prostate', color: '#006064', x: 140, y: 242 },
      { id: 'urethra', labelKey: 'visuals.urology.urethra', color: '#00838F', x: 140, y: 266 },
      { id: 'testis_r', labelKey: 'visuals.urology.testisR', color: '#26C6DA', x: 122, y: 282 },
      { id: 'testis_l', labelKey: 'visuals.urology.testisL', color: '#00BCD4', x: 158, y: 282 },
    ],
  },
  endocrinology: {
    titleKey: 'visuals.endocrinology.title',
    hintKey: 'visuals.endocrinology.hint',
    viewBox: '0 0 260 320',
    maxWidth: 300,
    figure: () => <EndocrineFigure />,
    zones: [
      { id: 'hypothalamus', labelKey: 'visuals.endocrinology.hypothalamus', color: '#F06292', x: 130, y: 18 },
      { id: 'pituitary', labelKey: 'visuals.endocrinology.pituitary', color: '#EC407A', x: 130, y: 48 },
      { id: 'thyroid', labelKey: 'visuals.endocrinology.thyroid', color: '#E91E63', x: 130, y: 88 },
      { id: 'parathyroid', labelKey: 'visuals.endocrinology.parathyroid', color: '#C2185B', x: 152, y: 88 },
      { id: 'adrenal_r', labelKey: 'visuals.endocrinology.adrenalR', color: '#AD1457', x: 100, y: 132 },
      { id: 'adrenal_l', labelKey: 'visuals.endocrinology.adrenalL', color: '#AD1457', x: 160, y: 132 },
      { id: 'pancreas', labelKey: 'visuals.endocrinology.pancreas', color: '#880E4F', x: 130, y: 148 },
      { id: 'gonads', labelKey: 'visuals.endocrinology.gonads', color: '#F48FB1', x: 130, y: 210 },
      { id: 'metabolic', labelKey: 'visuals.endocrinology.metabolic', color: '#EC407A', x: 130, y: 292 },
    ],
  },
  nutrition: {
    titleKey: 'visuals.nutrition.title',
    hintKey: 'visuals.nutrition.hint',
    viewBox: '0 0 280 260',
    maxWidth: 340,
    figure: () => <NutritionPlateFigure />,
    zones: [
      { id: 'protein', labelKey: 'visuals.nutrition.protein', color: '#8BC34A', x: 140, y: 48 },
      { id: 'carbs', labelKey: 'visuals.nutrition.carbs', color: '#7CB342', x: 214, y: 88 },
      { id: 'calories', labelKey: 'visuals.nutrition.calories', color: '#9CCC65', x: 140, y: 130 },
      { id: 'hydration', labelKey: 'visuals.nutrition.hydration', color: '#AED581', x: 96, y: 130 },
      { id: 'minerals', labelKey: 'visuals.nutrition.minerals', color: '#9CCC65', x: 66, y: 88 },
      { id: 'fats', labelKey: 'visuals.nutrition.fats', color: '#689F38', x: 214, y: 172 },
      { id: 'vitamins', labelKey: 'visuals.nutrition.vitamins', color: '#33691E', x: 66, y: 172 },
      { id: 'fiber', labelKey: 'visuals.nutrition.fiber', color: '#558B2F', x: 140, y: 212 },
    ],
  },
};

const DEFAULT_VISUAL: VisualDef = {
  titleKey: 'visuals.default.title',
  hintKey: 'visuals.default.hint',
  viewBox: '0 0 240 200',
  figure: () => <circle cx="120" cy="110" r="55" fill="#E3F2FD" stroke="#1565C0" strokeWidth="2" />,
  zones: [
    { id: 'exam', labelKey: 'visuals.default.exam', color: '#1565C0', x: 120, y: 110 },
  ],
};

export default function ClinicalVisualChart({ code, selected, onSelect, activeZones = [] }: ClinicalVisualChartProps) {
  const { t } = useTranslation();
  if (code === 'orthopedics') {
    return <SkeletonChart variant="ortho" selected={selected} onSelect={onSelect} activeZones={activeZones} />;
  }
  if (code === 'physiotherapy') {
    return <SkeletonChart variant="physio" selected={selected} onSelect={onSelect} activeZones={activeZones} />;
  }
  const visual = VISUALS[code] ?? DEFAULT_VISUAL;
  const builder = Object.prototype.hasOwnProperty.call(ORGAN_BUILDERS, code)
    ? ORGAN_BUILDERS[code]
    : undefined;
  const hraLoader = Object.prototype.hasOwnProperty.call(HRA_LOADERS, code)
    ? HRA_LOADERS[code]
    : undefined;

  return (
    <SpecialtyChartShell
      title={t(visual.titleKey)}
      subtitle={builder ? t('visuals.orbitHint') : t(visual.hintKey)}
      legend={(
        <>
          <ChartLegendItem color="#fff" border="#90A4AE" label={t('visuals.legendIdle')} />
          <ChartLegendItem color="#FFF8E1" border="#F9A825" label={t('visuals.legendActive')} />
          <ChartLegendItem color="#1565C0" label={t('visuals.legendSelected')} />
        </>
      )}
      picker={(
        <ZoneChipPicker
          zones={visual.zones.map((z) => ({ id: z.id, label: t(z.labelKey), color: z.color }))}
          selected={selected}
          activeIds={activeZones}
          onSelect={(id, label) => onSelect?.(id, label)}
        />
      )}
    >
      {builder ? (
        <Medical3DViewport
          createModel={builder}
          loadModel={hraLoader}
          pinMeta={visual.zones.map((z) => ({ id: z.id, label: t(z.labelKey), color: z.color }))}
          selectedId={selected}
          activeIds={activeZones}
          onSelect={onSelect}
          height={480}
          loadingLabel={t('visuals.loadingModel')}
          credit={hraLoader ? t(BP3D_CHARTS.has(code) ? 'visuals.bp3dCredit' : 'visuals.hraCredit') : undefined}
        />
      ) : (
        <AnatomyStage viewBox={visual.viewBox} maxWidth={visual.maxWidth}>
          {visual.figure()}
          {visual.zones.map((z, i) => (
            <AnatomyPin
              key={z.id}
              x={z.x}
              y={z.y}
              index={i + 1}
              color={z.color}
              label={t(z.labelKey)}
              selected={selected === z.id}
              active={activeZones.includes(z.id)}
              onClick={onSelect ? () => onSelect(z.id, t(z.labelKey)) : undefined}
            />
          ))}
        </AnatomyStage>
      )}
    </SpecialtyChartShell>
  );
}
