import { ArrowBack, PriorityHigh } from '@mui/icons-material';
import { Box, Button, ButtonBase, useTheme } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { useCallback, useMemo, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { CopyToClipboardButton } from '../../components/CopyToClipboardButton';
import { GENERIC_ERROR_CONFIG } from './constants';

export interface GenericErrorConfig {
  errorCode?: string | number | Array<string | number>;
  title: string;
  description: ReactNode;
  additionalDescription?: ReactNode;
  cAcLink: string;
  icon?: SvgIconComponent;
  multiTitle?: string;
}

interface Props extends Partial<GenericErrorConfig> {
  config?: GenericErrorConfig;
  onClose?: () => void;
  onRetry?: () => void;
  onBack?: () => void;
}

export default function GenericError({
  config,
  errorCode,
  title = 'Errore generico',
  description = 'Si è verificato un errore. Riprova più tardi.',
  additionalDescription,
  onClose,
  onBack,
  onRetry,
  multiTitle,
}: Props) {
  const theme = useTheme();
  const location = useLocation();

  const locationErrorCode = (
    location.state as { errorCode?: GenericErrorConfig['errorCode'] } | null
  )?.errorCode;

  const resolvedErrorCode = errorCode ?? locationErrorCode;

  const resolvedErrorCodes = useMemo(
    () =>
      resolvedErrorCode === undefined
        ? []
        : Array.isArray(resolvedErrorCode)
          ? resolvedErrorCode
          : [resolvedErrorCode],
    [resolvedErrorCode],
  );

  const configuredErrors = useMemo(
    () =>
      resolvedErrorCodes
        .map((code) => GENERIC_ERROR_CONFIG[Number(code)])
        .filter((error): error is GenericErrorConfig => error !== undefined),
    [resolvedErrorCodes],
  );

  const content = useMemo(() => {
    if (config) return config;
    if (configuredErrors.length === 0) {
      return {
        errorCode: resolvedErrorCode,
        title,
        description,
        additionalDescription,
        cAcLink: 'https://test.it',
      };
    }

    const isMulti = configuredErrors.length > 1;
    const firstError = configuredErrors[0];

    const uniqueErrors = configuredErrors.reduce<typeof configuredErrors>(
      (acc, curr) =>
        acc.some(({ description }) => description === curr.description)
          ? acc
          : [...acc, curr],
      [],
    );

    return {
      ...firstError,
      errorCode: resolvedErrorCode,
      title: isMulti ? (multiTitle ?? firstError.title) : firstError.title,
      description: isMulti ? (
        <Box component="ul" sx={{ m: 0, pl: 3, textAlign: 'left' }}>
          {uniqueErrors.map((error) => (
            <Box component="li" key={String(error.errorCode)}>
              <Body>{error.description}</Body>
            </Box>
          ))}
        </Box>
      ) : (
        firstError.description
      ),
    };
  }, [
    config,
    configuredErrors,
    resolvedErrorCode,
    title,
    description,
    additionalDescription,
    multiTitle,
  ]);

  const ErrorIcon = content.icon ?? PriorityHigh;
  const errorCodeLabel = Array.isArray(content.errorCode)
    ? content.errorCode.join(', ')
    : String(content.errorCode);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const closeButtonProps = useMemo(
    () =>
      resolvedErrorCode
        ? { variant: 'contained' as const, label: 'Ho capito' }
        : { variant: 'text' as const, label: 'Chiudi' },
    [resolvedErrorCode],
  );

  return (
    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
      {onBack && (
        <ButtonBase
          onClick={onBack}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.primary',
            fontSize: 16,
            fontWeight: 600,
            mb: 3,
          }}
        >
          <ArrowBack sx={{ fontSize: 20 }} />
          Indietro
        </ButtonBase>
      )}

      <Box
        sx={{
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.common.neutralGray,
          p: 2,
          mx: 2,
        }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'center' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: theme.palette.common.decorativeBlue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              mx: 'auto',
            }}
          >
            <ErrorIcon
              sx={{ color: theme.palette.primary.main, fontSize: 32 }}
            />
          </Box>

          <Title variant="MD" text={content.title} />
          <VSpacer size={8} />
          <Body>{content.description}</Body>

          {content.additionalDescription && (
            <>
              <VSpacer size={16} />
              <Body>{content.additionalDescription}</Body>
            </>
          )}

          {content.errorCode !== undefined && (
            <>
              <VSpacer size={16} />
              <CopyToClipboardButton
                textToCopy={errorCodeLabel}
                label={`Errore ${errorCodeLabel}`}
                variant="outlined"
                iconColor="primary"
                sx={{
                  width: '100%',
                  justifyContent: 'space-between',
                  '&.MuiButton-outlined': {
                    borderColor: theme.palette.common.neutralGray,
                    color: theme.palette.text.primary,
                    bgcolor: 'common.white',
                  },
                }}
              />
            </>
          )}

          <VSpacer size={32} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'center',
            }}
          >
            {!errorCode && onRetry && (
              <Button
                variant="text"
                onClick={onRetry}
                sx={{ color: theme.palette.common.primaryButton, fontSize: 16 }}
              >
                Riprova
              </Button>
            )}

            <Button
              variant={closeButtonProps.variant}
              onClick={handleClose}
              sx={{ fontSize: 16 }}
            >
              {closeButtonProps.label}
            </Button>

            {resolvedErrorCode && (
              <Button
                variant="text"
                onClick={() => window.location.replace(content.cAcLink)}
                sx={{ color: theme.palette.common.primaryButton, fontSize: 16 }}
              >
                Cosa puoi fare
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
