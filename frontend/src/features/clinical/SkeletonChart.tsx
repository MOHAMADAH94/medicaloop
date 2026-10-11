import { Tab, Tabs, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SpecialtyChartShell, { ChartLegendItem, ZoneChipPicker } from '@/shared/components/SpecialtyChartShell';
import Medical3DViewport from './anatomy3d/Medical3DViewport';
import { loadSkeletonGlb } from './anatomy3d/loadSkeletonModel';
import { createSkeletonModel } from './anatomy3d/skeletonModel';
import {
  PHYSIO_JOINTS,
  SKELETON_BONES,
  SKELETON_JOINTS,
  type SkeletonZone,
} from './anatomy/skeletonRegions';

interface SkeletonChartProps {
  variant: 'ortho' | 'physio';
  selected?: string;
  onSelect?: (zone: string, label: string) => void;
  activeZones?: string[];
}

export default function SkeletonChart({
  variant,
  selected,
  onSelect,
  activeZones = [],
}: SkeletonChartProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const accent = variant === 'physio' ? '#00897B' : '#8D6E63';
  const joints = variant === 'physio' ? PHYSIO_JOINTS : SKELETON_JOINTS;
  const zones: SkeletonZone[] = tab === 0 ? SKELETON_BONES : joints;
  const hoveredZone = useMemo(
    () => zones.find((z) => z.id === (hovered || selected)),
    [zones, hovered, selected],
  );

  return (
    <SpecialtyChartShell
      title={t(variant === 'physio' ? 'visuals.physio.title' : 'visuals.orthopedics.title')}
      subtitle={t('visuals.orbitHint')}
      legend={(
        <>
          <ChartLegendItem color="#fff" border="#90A4AE" label={t('visuals.legendIdle')} />
          <ChartLegendItem color="#FFF8E1" border="#F9A825" label={t('visuals.legendActive')} />
          <ChartLegendItem color={accent} label={t('visuals.legendSelected')} />
        </>
      )}
      picker={(
        <ZoneChipPicker
          zones={zones.map((z) => ({ id: z.id, label: t(z.labelKey), color: z.color }))}
          selected={selected}
          activeIds={activeZones}
          onSelect={(id, label) => onSelect?.(id, label)}
        />
      )}
    >
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 1, minHeight: 36 }}>
        <Tab label={t('visuals.orthopedics.tabBones')} sx={{ minHeight: 36, py: 0.5 }} />
        <Tab label={t('visuals.orthopedics.tabJoints')} sx={{ minHeight: 36, py: 0.5 }} />
      </Tabs>
      <Medical3DViewport
        key="skeleton-fullbody"
        createModel={createSkeletonModel}
        loadModel={loadSkeletonGlb}
        pinMeta={zones.map((z) => ({ id: z.id, label: t(z.labelKey), color: z.color }))}
        selectedId={selected}
        activeIds={activeZones}
        pickMeshes={tab === 0}
        onSelect={onSelect}
        onHover={setHovered}
        height={500}
        loadingLabel={t('visuals.loadingModel')}
        credit={t('visuals.bp3dCredit')}
      />
      {hoveredZone && (
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center" fontWeight={700} mt={0.5}>
          {t(hoveredZone.labelKey)}
        </Typography>
      )}
    </SpecialtyChartShell>
  );
}
