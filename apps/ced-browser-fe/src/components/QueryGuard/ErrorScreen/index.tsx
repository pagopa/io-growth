import { Box, Button } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { IllusMIError, IllusMIMaintenance } from '@pagopa/mui-italia';
import { PageErrorType } from './types';

type ErrorContent = {
  icon: JSX.Element;
  title: string;
  description: string;
};

const errorContentMap: Record<PageErrorType, ErrorContent> = {
  [PageErrorType.OPPORTUNITY_NOT_FOUND]: {
    icon: <IllusMIMaintenance />,
    title: "Non è stato possibile caricare i dettagli dell'opportunità",
    description: 'Se il problema persiste, riprova in un secondo momento.',
  },
  [PageErrorType.UNAUTHORIZED]: {
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

const ErrorScreen = ({ errorType, firstAction, secondAction }: Props) => {
  const { icon, title, description } = errorContentMap[errorType];

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
      {firstAction && (
        <>
          <Button
            variant="contained"
            onClick={firstAction.onClick}
            sx={{ borderRadius: '10px' }}
          >
            {firstAction.label}
          </Button>
          <VSpacer size={8} />
        </>
      )}
      {secondAction && (
        <Button
          variant="text"
          onClick={secondAction.onClick}
          sx={{ borderRadius: '10px' }}
        >
          {secondAction.label}
        </Button>
      )}
    </Box>
  );
};

export default ErrorScreen;
