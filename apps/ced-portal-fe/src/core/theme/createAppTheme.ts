import { createTheme } from '@mui/material/styles';
import { theme as muiItaliaTheme, italia } from '@pagopa/mui-italia';

const PRIMARY_BUTTON_BACKGROUND = '#0B3EE3';
const PRIMARY_BUTTON_BACKGROUND_HOVER = '#004A96';
const APP_NEUTRAL_GRAY = '#F4F5F8';
const APP_NEUTRAL_DARK_GRAY = '#555C70';
const DECORATIVE_ICON = '#BBC2D6';
const NEUTRAL_BLACK = '#0E0F13';
const ALERT_ERROR_BG = '#FFD9D9';
const ALERT_ERROR_BORDER = '#FF6666';
const ALERT_SUCCESS_BORDER = '#89D188';

declare module '@mui/material/styles' {
  interface CommonColors {
    neutralGray: string;
    neutralDarkGray: string;
    primaryButton: string;
    primaryButtonHover: string;
    decorativeIcon: string;
    neutralBlack: string;
    alertErrorBg: string;
    alertErrorBorder: string;
    alertSuccessBorder: string;
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
        decorativeIcon: DECORATIVE_ICON,
        neutralBlack: NEUTRAL_BLACK,
        alertErrorBg: ALERT_ERROR_BG,
        alertErrorBorder: ALERT_ERROR_BORDER,
        alertSuccessBorder: ALERT_SUCCESS_BORDER,
        neutralDarkGray: APP_NEUTRAL_DARK_GRAY,
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
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            '& .MuiAutocomplete-clearIndicator': {
              display: 'none',
            },
          },
        },
      },

      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: muiItaliaTheme.palette.common.primaryButton,
            '&.Mui-checked': { color: 'common.primaryButton' },
            padding: 0,
            '& .MuiSvgIcon-root': { fontSize: 18 },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: muiItaliaTheme.palette.common.white,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              minHeight: 56,
            },
            '& .MuiFormLabel-asterisk': {
              color: '#e53935',
            },
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            minWidth: { xs: '100%', lg: 160 },
            maxWidth: { xs: '100%', lg: 160 },
            backgroundColor: muiItaliaTheme.palette.common.white,
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              minHeight: 56,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 3,
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            ml: 0,
            width: '100%',
            '& .MuiFormControlLabel-label': { fontSize: 16, fontWeight: 600 },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            p: 0,
            mr: 1,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 2,
            bgcolor: muiItaliaTheme.palette.background.paper,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            minHeight: 64,
            px: { xs: 2, md: 3 },
            borderRight: '4px solid transparent',
            '&.Mui-selected': {
              borderRightColor: muiItaliaTheme.palette.primary.main,
              bgcolor: italia[50],
            },
            '&.Mui-selected:hover': {
              bgcolor: italia[100],
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            minWidth: 36,
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: 'separate',
            borderSpacing: 0,
            '& .MuiTableCell-root': {
              borderBottom: 'none',
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              height: 48,
              backgroundColor: muiItaliaTheme.palette.divider,
              '& .MuiTableCell-root': {
                backgroundColor: muiItaliaTheme.palette.divider,
                fontWeight: 700,
                fontSize: 16,
                paddingY: 1.8,
              },
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            '& .MuiTableRow-root': {
              height: 48,
              backgroundColor: muiItaliaTheme.palette.background.paper,
              '& .MuiTableCell-root': {
                backgroundColor: muiItaliaTheme.palette.background.paper,
                paddingY: 1.65,
                fontSize: 16,
                color: muiItaliaTheme.palette.text.primary,
              },
              '&:not(:first-of-type) .MuiTableCell-root': {
                borderTop: `1px solid ${muiItaliaTheme.palette.divider}`,
              },
            },
          },
        },
      },
      MuiDatePicker: {
        styleOverrides: {
          root: {
            width: '100%',
            backgroundColor: muiItaliaTheme.palette.common.white,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              minHeight: 56,
            },
            '& .MuiOutlinedInput-root.Mui-disabled': {
              backgroundColor: muiItaliaTheme.palette.common.neutralGray,
            },
            '& .MuiFormHelperText-root': {
              fontSize: '0.875rem',
              fontWeight: 400,
            },
            '& .MuiFormLabel-asterisk': {
              color: muiItaliaTheme.palette.error.main,
            },
          },
        },
      },
      MuiStepper: {
        styleOverrides: {
          root: {
            p: 0,
            mb: 4,
            width: '100%',
            alignItems: 'flex-start',
            '& .MuiStep-root': { p: 0, flex: 'none' },
            '& .MuiStepLabel-root': {
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
            },
            '& .MuiStepLabel-iconContainer': { p: 0 },
            '& .MuiStepLabel-labelContainer': { mt: 0.5, width: 'auto' },
            '& .MuiStepLabel-label': {
              color: NEUTRAL_BLACK,
              fontWeight: 600,
            },
            '& .MuiStepIcon-root': {
              width: 20,
              height: 20,
              color: '#D2D6E3',
              '&.Mui-active, &.Mui-completed': {
                color: muiItaliaTheme.palette.common.primaryButton,
              },
            },
            '& .MuiStepIcon-text': {
              fontSize: '12px',
              fontWeight: 700,
              fill: '#636B82',
            },
            '& .Mui-active .MuiStepIcon-text, & .Mui-completed .MuiStepIcon-text':
              {
                fill: '#ffffff',
              },
          },
        },
      },
      MuiStepConnector: {
        styleOverrides: {
          root: {
            flex: 1,
            alignSelf: 'flex-start',
            mt: '8px',
          },
          line: {
            borderTopWidth: 4,
            borderRadius: 2,
            borderColor: '#D2D6E3',
          },
          active: {
            '& .MuiStepConnector-line': {
              borderColor: muiItaliaTheme.palette.common.primaryButton,
            },
          },
          completed: {
            '& .MuiStepConnector-line': {
              borderColor: muiItaliaTheme.palette.common.primaryButton,
            },
          },
        },
      },
    },
  });

export const appTheme = createAppTheme();
