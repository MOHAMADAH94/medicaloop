import { Box, CircularProgress } from '@mui/material';

export default function LoadingBox() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" py={8}>
      <CircularProgress />
    </Box>
  );
}
