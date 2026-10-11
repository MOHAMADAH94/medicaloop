import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <Box sx={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper sx={{ p: 4, borderRadius: 3, maxWidth: 480, textAlign: 'center' }}>
          <ReportProblemIcon color="error" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            حدث خطأ غير متوقع
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            تعذّر عرض هذا الجزء من التطبيق. يمكنك إعادة المحاولة أو العودة للوحة التحكم.
          </Typography>
          <Button variant="contained" onClick={() => window.location.assign('/dashboard')}>
            العودة للوحة التحكم
          </Button>
        </Paper>
      </Box>
    );
  }
}
