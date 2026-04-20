import { createTheme } from '@mui/material/styles';
import { theme as muiItaliaTheme } from '@pagopa/mui-italia';

const PRIMARY_BUTTON_BACKGROUND = '#0B3EE3';
const PRIMARY_BUTTON_BACKGROUND_HOVER = '#004A96';
const APP_NEUTRAL_GRAY = '#F4F5F8';

declare module '@mui/material/styles' {
  interface CommonColors {
    neutralGray: string;
    primaryButton: string;
    primaryButtonHover: string;
  }
}

export const createAppTheme = () =>
  createTheme(muiItaliaTheme, {
    typography: {
      fontFamily: '"Titillium Web", Arial, sans-serif',
      allVariants: {
        fontFamily: '"Titillium Web", Arial, sans-serif',
      },
    },
    palette: {
      common: {
        neutralGray: APP_NEUTRAL_GRAY,
        primaryButton: PRIMARY_BUTTON_BACKGROUND,
        primaryButtonHover: PRIMARY_BUTTON_BACKGROUND_HOVER,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: '"Titillium Web", Arial, sans-serif',
          },
          'input, button, textarea, select': {
            fontFamily: '"Titillium Web", Arial, sans-serif',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: '"Titillium Web", Arial, sans-serif',
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          asterisk: {
            color: '#d32f2f',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          containedPrimary: {
            backgroundColor: PRIMARY_BUTTON_BACKGROUND,
            '&:hover': {
              backgroundColor: PRIMARY_BUTTON_BACKGROUND_HOVER,
            },
          },
        },
      },
    },
  });

export const appTheme = createAppTheme();
