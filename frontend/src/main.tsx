import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

import App from './App';
import { SpecialtyThemeProvider } from './shared/theme/SpecialtyThemeProvider';
import { PermissionsProvider } from './shared/auth/PermissionsProvider';
import { ToastProvider } from './shared/feedback/ToastProvider';
import ErrorBoundary from './shared/components/ErrorBoundary';
import './shared/i18n';

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CacheProvider value={rtlCache}>
      <SpecialtyThemeProvider>
        <CssBaseline />
        <ToastProvider>
          <PermissionsProvider>
            <BrowserRouter>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </BrowserRouter>
          </PermissionsProvider>
        </ToastProvider>
      </SpecialtyThemeProvider>
    </CacheProvider>
  </React.StrictMode>,
);
