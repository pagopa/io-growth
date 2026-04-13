import type { PropsWithChildren } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../core/store';
import { appTheme } from '../core/theme/createAppTheme';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <BrowserRouter>{children}</BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
