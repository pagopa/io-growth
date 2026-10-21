import { Box, Button } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { IllusMIError } from '@pagopa/mui-italia';
import { PageErrorType } from './types';

export const IN_APP_BROWSER_CLOSE_DEEPLINK = 'iossoapi://cancel';

type ErrorContent = {
  icon: JSX.Element;
  title: string;
  description: string;
};

const errorContentMap: Record<PageErrorType, ErrorContent> = {
  [PageErrorType.OPPORTUNITY_NOT_FOUND]: {
    icon: <IllusMIError />,
    title: 'Non siamo riusciti a caricare la pagina',
    description: 'Riprova più tardi.',
  },
  [PageErrorType.UNAUTHORIZED]: {
    icon: <IllusMIError />,
    title: 'Qualcosa non ha funzionato',
    description: 'Riprova più tardi.',
  },
  [PageErrorType.ENTITY_NOT_FOUND]: {
    icon: <IllusMIError />,
    title: 'Non siamo riusciti a caricare la pagina',
    description: 'Riprova più tardi.',
  },
  [PageErrorType.ACCESS_POINT_NOT_FOUND]: {
    icon: <IllusMIError />,
    title: 'Non siamo riusciti a caricare la pagina',
    description: 'Riprova più tardi.',
  },
  [PageErrorType.GENERIC_ERROR]: {
    icon: <IllusMIError />,
    title: 'Qualcosa non ha funzionato',
    description: 'Riprova più tardi.',
  },
};

type ButtonProps = {
  label: string;
  onClick: () => void;
};

type Props = {
  errorType: PageErrorType;
  firstAction?: ButtonProps;
  secondAction?: ButtonProps;
};

const handleCloseInAppBrowser = () => {
  window.location.replace(IN_APP_BROWSER_CLOSE_DEEPLINK);
};

const defaultCloseAction: ButtonProps = {
  label: 'Chiudi',
  onClick: handleCloseInAppBrowser,
};

const ErrorScreen = ({ errorType, firstAction, secondAction }: Props) => {
  const { icon, title, description } = errorContentMap[errorType];

  let resolvedFirstAction = firstAction;
  let resolvedSecondAction = secondAction;

  if (!resolvedFirstAction && !resolvedSecondAction) {
    resolvedFirstAction = defaultCloseAction;
  } else if (
    resolvedFirstAction &&
    !resolvedSecondAction &&
    resolvedFirstAction.label.toLowerCase() !== 'chiudi'
  ) {
    resolvedSecondAction = defaultCloseAction;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        bgcolor: 'background.paper',
        px: 4,
        textAlign: 'center',
      }}
    >
      {icon}
      <VSpacer size={16} />
      <Title text={title} variant="MD" />
      <VSpacer size={16} />
      <Body>{description}</Body>
      <VSpacer size={16} />
      {resolvedFirstAction && (
        <>
          <Button
            variant="contained"
            onClick={resolvedFirstAction.onClick}
            sx={{ borderRadius: '10px' }}
          >
            {resolvedFirstAction.label}
          </Button>
          <VSpacer size={8} />
        </>
      )}
      {resolvedSecondAction && (
        <Button
          variant="text"
          onClick={resolvedSecondAction.onClick}
          sx={{ borderRadius: '10px' }}
        >
          {resolvedSecondAction.label}
        </Button>
      )}
    </Box>
  );
};

export default ErrorScreen;
