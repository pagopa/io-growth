import { Box, Typography } from '@mui/material';

type AgreementDetailHeadingProps = {
  sectionTitle: string;
  sectionDescription: string;
};

export const AgreementDetailHeading = ({
  sectionTitle,
  sectionDescription,
}: AgreementDetailHeadingProps) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, fontSize: 28 }}>
        {sectionTitle}
      </Typography>
      <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 14 }}>
        {sectionDescription}
      </Typography>
    </Box>
  );
};
