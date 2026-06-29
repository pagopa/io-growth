import { Box, Button } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { IllusMIMaintenance } from '@pagopa/mui-italia';
import { useNavigate } from 'react-router-dom';
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
};

type Props = {
  errorType: PageErrorType;
  reloadAction?: () => void;
};

const ErrorScreen = ({ errorType, reloadAction }: Props) => {
  const { icon, title, description } = errorContentMap[errorType];
  const navigate = useNavigate();

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
      {reloadAction && (
        <>
          <Button
            variant="contained"
            onClick={reloadAction}
            sx={{ borderRadius: '10px' }}
          >
            Riprova
          </Button>
          <VSpacer size={8} />
        </>
      )}
      <Button variant="text" onClick={() => navigate(-1)}>
        Torna indietro
      </Button>
    </Box>
  );
};

export default ErrorScreen;
