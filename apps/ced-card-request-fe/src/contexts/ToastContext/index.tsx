import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import ReportIcon from '@mui/icons-material/Report';
import { Box, IconButton, keyframes, useTheme } from '@mui/material';
import { Body } from '@pagopa/io-core-ui';
import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import { ToastContext } from './context';
import { ToastState, ToastVariant } from './types';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export function ToastProvider({ children }: Readonly<PropsWithChildren>) {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      setToast({ message, variant });
      window.setTimeout(() => setToast(null), 4000);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  const theme = useTheme();

  const config = useMemo(() => {
    switch (toast?.variant) {
      case 'error':
        return {
          bg: theme.colors.error[100],
          border: theme.palette.error.light,
          text: theme.palette.common.toastError,
          iconColor: theme.palette.common.toastError,
          Icon: ReportIcon,
        };
      case 'success':
        return {
          bg: theme.colors.success[100],
          border: theme.palette.common.alertSuccessBorder,
          text: theme.colors.success[850],
          iconColor: theme.palette.common.white,
          iconBg: theme.colors.success[850],
          Icon: CheckRoundedIcon,
        };
      default:
        return {
          bg: theme.colors.info[100],
          border: theme.palette.info.light,
          text: theme.colors.info[850],
          iconColor: theme.palette.common.white,
          iconBg: theme.palette.info.main,
          Icon: InfoIcon,
        };
    }
  }, [toast?.variant, theme]);

  const { Icon } = config;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Box
          sx={{
            position: 'fixed',
            right: 40,
            bottom: 40,
            padding: '12px 16px',
            borderRadius: '12px',
            border: `1px solid ${config.border}`,
            background: config.bg,
            color: config.text,
            boxShadow:
              '0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minWidth: 320,
            maxWidth: '90vw',
            zIndex: 9999,
            animation: `${slideUp} 0.3s ease-out`,
          }}
        >
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: config.iconBg || 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon
              sx={{
                color: config.iconColor,
                fontSize: config.Icon === CheckRoundedIcon ? 16 : 24,
                ...(config.Icon === CheckRoundedIcon && {
                  stroke: theme.palette.common.white,
                  strokeWidth: 1.5,
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                }),
              }}
            />
          </Box>

          <Body fontWeight="Medium">{toast.message}</Body>

          <IconButton
            size="small"
            onClick={() => setToast(null)}
            sx={{ color: theme.palette.common.neutralBlack, p: 0.5 }}
          >
            <CloseIcon
              sx={{ fontSize: 14, stroke: 'currentColor', strokeWidth: 1.5 }}
            />
          </IconButton>
        </Box>
      ) : null}
    </ToastContext.Provider>
  );
}
