import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns as AdapterDateFnsV3 } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { it } from 'date-fns/locale';
import type { PropsWithChildren } from 'react';
import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../core/store';
import { appTheme } from '../core/theme/createAppTheme';

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
              <BrowserRouter>{children}</BrowserRouter>
            </LocalizationProvider>
          </ThemeProvider>
        </PersistGate>
      </Suspense>
    </Provider>
  );
}
