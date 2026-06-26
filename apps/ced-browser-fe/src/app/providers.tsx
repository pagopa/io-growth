import type { PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns as AdapterDateFnsV3 } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { it } from 'date-fns/locale';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../contexts';
import { persistor, store } from '../core/store';
import { Suspense } from 'react';
import { appTheme } from '../core/theme/createAppTheme';
import { PersistGate } from 'redux-persist/integration/react';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <Suspense>
        <PersistGate persistor={persistor}>
          <ThemeProvider theme={appTheme}>
            <CssBaseline />
            <LocalizationProvider
              dateAdapter={AdapterDateFnsV3}
              adapterLocale={it}
            >
              <ToastProvider>
                <BrowserRouter>{children}</BrowserRouter>
              </ToastProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </PersistGate>
      </Suspense>
    </Provider>
  );
}
