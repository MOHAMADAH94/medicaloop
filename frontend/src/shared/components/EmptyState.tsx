import { Typography } from '@mui/material';

export default function EmptyState({ message }: { message: string }) {
  return (
    <Typography color="text.secondary" align="center" py={4}>
      {message}
    </Typography>
  );
}
