import { ArrowBack, PriorityHigh } from '@mui/icons-material';
import { Box, Button, ButtonBase, useTheme } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { useCallback, useMemo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CopyToClipboardButton } from '../../components/CopyToClipboardButton';
import { NoticeIcon, NoticeLayout } from '../../components/FlowNotice';
import maintenanceIcon from '../../components/FlowNotice/maintenance.svg';
import { useTrackErrorEvent } from '../../mixpanel/useTrackErrorEvent';
import { GENERIC_ERROR_CONFIG } from './constants';
import { APP_ROUTES } from '../../app/routeConfig';
import { closeError } from './closeError';

export interface GenericErrorConfig {
  errorCode?: string | number | Array<string | number>;
  title: string;
  description: ReactNode;
  additionalDescription?: ReactNode;
  cAcLink: string;
  icon?: SvgIconComponent | string;
  multiTitle?: string;
  multiDescription?: string;
  showErrorCode?: boolean;
  showMoreInfo?: boolean;
  moreInfoLabel?: string;
  closeLabel?: string;
  showSecondaryClose?: boolean;
}

interface Props extends Partial<GenericErrorConfig> {
  config?: GenericErrorConfig;
  onClose?: () => void;
  onRetry?: () => void;
  onBack?: () => void;
  technical?: boolean;
  network?: boolean;
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
  closeLabel,
  moreInfoLabel,
  technical = false,
  network = false,
}: Props) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const errorState = location.state as {
    errorCode?: GenericErrorConfig['errorCode'];
    recovering?: boolean;
    retry?: boolean;
    retryTo?: string;
    network?: boolean;
  } | null;
  const locationErrorCode = errorState?.errorCode;

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

  useTrackErrorEvent('CED_CARD_REQUEST_ERROR', true, {
    error_codes: resolvedErrorCodes.map(String).join(','),
  });

  const configuredErrors = useMemo(
    () =>
      resolvedErrorCodes
        .map((code) => GENERIC_ERROR_CONFIG[Number(code)])
        .filter((error): error is GenericErrorConfig => error !== undefined),
    [resolvedErrorCodes],
  );

  const content = useMemo(() => {
    if (config) return config;
    if (
      technical ||
      configuredErrors.length !== resolvedErrorCodes.length ||
      configuredErrors.length === 0
    ) {
      return {
        errorCode: resolvedErrorCode,
        title: errorState?.recovering
          ? 'Non è stato possibile recuperare la richiesta'
          : title,
        description:
          network || errorState?.network
            ? 'Si è verificato un errore di connessione. Controlla la rete e riprova.'
            : errorState?.recovering
              ? "Stiamo riscontrando dei problemi a recuperare i dati dall'ente. Riprova più tardi."
              : description,
        additionalDescription,
        icon: errorState?.recovering ? maintenanceIcon : PriorityHigh,
        cAcLink: 'https://www.inps.it/',
        showMoreInfo: false,
      };
    }

    const firstError = configuredErrors[0];

    const uniqueErrors = configuredErrors.reduce<typeof configuredErrors>(
      (acc, curr) =>
        acc.some(({ title }) => title === curr.title) ? acc : [...acc, curr],
      [],
    );
    const isMulti = uniqueErrors.length > 1;

    return {
      ...firstError,
      errorCode: resolvedErrorCode,
      title: isMulti ? (multiTitle ?? firstError.title) : firstError.title,
      description: isMulti ? (
        <Box component="ul" sx={{ m: 0, pl: 3, textAlign: 'left' }}>
          {uniqueErrors.map((error) => (
            <Box component="li" key={String(error.errorCode)}>
              <Body>{error.multiDescription ?? error.title}</Body>
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
    errorState?.recovering,
    errorState?.network,
    technical,
    network,
    resolvedErrorCodes.length,
  ]);

  const ErrorIcon = content.icon ?? PriorityHigh;
  const errorCodeLabel = Array.isArray(content.errorCode)
    ? content.errorCode.join(', ')
    : String(content.errorCode);

  const handleClose = useCallback(() => {
    closeError({
      onClose,
      retry: Boolean(errorState?.retry),
      localBrowser:
        import.meta.env.DEV &&
        import.meta.env.VITE_LOCAL_BROWSER_CLOSE_TO_HOME === 'true',
      goHome: () => navigate(APP_ROUTES.HOME, { replace: true }),
      goBack: () => navigate(-1),
      closeWebview: () => window.location.replace('iossoapi://cancel'),
    });
  }, [navigate, onClose, errorState?.retry]);

  const handleRetry =
    onRetry ??
    (errorState?.retry
      ? () =>
          navigate(errorState.retryTo ?? APP_ROUTES.LOADING, { replace: true })
      : undefined);

  const isTechnical =
    technical ||
    configuredErrors.length !== resolvedErrorCodes.length ||
    resolvedErrorCodes.length === 0;
  const closeButtonProps = useMemo(
    () =>
      !isTechnical && resolvedErrorCode
        ? {
            variant: 'contained' as const,
            label: closeLabel ?? content.closeLabel ?? 'Ho capito',
          }
        : { variant: 'text' as const, label: closeLabel ?? 'Chiudi' },
    [resolvedErrorCode, closeLabel, content.closeLabel, isTechnical],
  );

  return (
    <Box>
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

      <NoticeLayout>
        <NoticeIcon icon={ErrorIcon} />

        <Title variant="MD" text={content.title} />
        <VSpacer size={8} />
        {typeof content.description === 'string' ? (
          <Body>{content.description}</Body>
        ) : (
          content.description
        )}

        {content.additionalDescription && (
          <>
            <VSpacer size={16} />
            <Body>{content.additionalDescription}</Body>
          </>
        )}

        {content.errorCode !== undefined && content.showErrorCode !== false && (
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
                fontFamily: '"DM Mono", monospace',
                fontWeight: 400,
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
          {isTechnical && handleRetry && (
            <Button
              variant="contained"
              onClick={handleRetry}
              sx={{
                fontSize: 16,
              }}
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

          {resolvedErrorCodes.includes(500) && !isTechnical && handleRetry && (
            <Button variant="text" onClick={handleRetry}>
              Riprova
            </Button>
          )}

          {content.showSecondaryClose && (
            <Button variant="text" onClick={handleClose}>
              Chiudi
            </Button>
          )}

          {resolvedErrorCode && content.showMoreInfo !== false && (
            <Button
              variant="text"
              onClick={() => window.location.replace(content.cAcLink)}
              sx={{ color: theme.palette.common.primaryButton, fontSize: 16 }}
            >
              {moreInfoLabel ?? content.moreInfoLabel ?? 'Cosa puoi fare'}
            </Button>
          )}
        </Box>
      </NoticeLayout>
    </Box>
  );
}
