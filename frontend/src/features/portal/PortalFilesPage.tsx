import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import { fmtDateTime } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';

interface FileAsset {
  id: string;
  original_name: string;
  category: string;
  description: string;
  created_at: string;
}

export default function PortalFilesPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<FileAsset[]>([]);

  useEffect(() => {
    apiClient.get('/patient/files/').then((res) => setItems(unwrapList(res.data)));
  }, []);

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.files')} />
      {items.length === 0 ? (
        <Typography color="text.secondary">{t('files.empty')}</Typography>
      ) : items.map((f) => (
        <Card key={f.id}>
          <CardContent>
            <Typography fontWeight={600}>{f.original_name}</Typography>
            <Chip label={f.category} size="small" sx={{ my: 1 }} />
            {f.description && <Typography variant="body2">{f.description}</Typography>}
            <Typography variant="caption" color="text.secondary">{fmtDateTime(f.created_at)}</Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
