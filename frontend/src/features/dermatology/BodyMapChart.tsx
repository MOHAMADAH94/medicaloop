import { Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SpecialtyChartShell, { ChartLegendItem, ZoneChipPicker } from '@/shared/components/SpecialtyChartShell';
import Medical3DViewport from '@/features/clinical/anatomy3d/Medical3DViewport';
import {
  BACK_REGIONS,
  BODY_REGIONS,
  FRONT_REGIONS,
  loadSkinGlb,
} from '@/features/clinical/anatomy3d/loadSkinModel';
import { createEndocrineModel } from '@/features/clinical/anatomy3d/organModels';

export { BODY_REGIONS };

interface CaseRef { body_area: string; status: string }

interface BodyMapChartProps {
  selected?: string;
  onSelect: (area: string) => void;
  cases?: CaseRef[];
}

export default function BodyMapChart({ selected, onSelect, cases = [] }: BodyMapChartProps) {
  const { t } = useTranslation();
  const [view, setView] = useState(0);
  const regions = view === 0 ? FRONT_REGIONS : BACK_REGIONS;
  const activeIds = cases.filter((c) => c.status === 'active').map((c) => c.body_area);

  return (
    <SpecialtyChartShell
      title={t('dermatology.bodyMapTitle')}
      subtitle={t('visuals.orbitHint')}
      legend={(
        <>
          <ChartLegendItem color="#fff" border="#AB47BC" label={t('dermatology.legendNormal')} />
          <ChartLegendItem color="#FFF8E1" border="#F9A825" label={t('dermatology.legendActive')} />
          <ChartLegendItem color="#7B1FA2" label={t('dermatology.legendSelected')} />
        </>
      )}
      picker={(
        <ZoneChipPicker
          zones={regions.map((r) => ({ id: r.label, label: r.label, color: '#AB47BC' }))}
          selected={selected}
          activeIds={activeIds}
          onSelect={(id) => onSelect(id)}
        />
      )}
    >
      <Tabs value={view} onChange={(_, v) => setView(v)} centered sx={{ mb: 1, minHeight: 36 }}>
        <Tab label={t('dermatology.viewFront')} sx={{ minHeight: 36, py: 0.5 }} />
        <Tab label={t('dermatology.viewBack')} sx={{ minHeight: 36, py: 0.5 }} />
      </Tabs>
      <Medical3DViewport
        key={`skin-${view}`}
        createModel={createEndocrineModel}
        loadModel={() => loadSkinGlb(view === 0 ? 'front' : 'back')}
        pinMeta={regions.map((r) => ({ id: r.label, label: r.label, color: '#8E24AA' }))}
        selectedId={selected}
        activeIds={activeIds}
        pickMeshes={false}
        onSelect={(id) => onSelect(id)}
        height={500}
        loadingLabel={t('visuals.loadingModel')}
        credit={t('visuals.hraCredit')}
      />
      {selected && (
        <Typography variant="caption" color="secondary.main" display="block" textAlign="center" fontWeight={700} mt={0.5}>
          {selected}
        </Typography>
      )}
    </SpecialtyChartShell>
  );
}
