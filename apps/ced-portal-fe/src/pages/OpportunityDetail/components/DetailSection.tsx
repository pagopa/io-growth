import { Box, Divider, Stack, Typography } from '@mui/material';

interface DetailFieldProps {
  label: string;
  value: string;
}

export const DetailField = ({ label, value }: Readonly<DetailFieldProps>) => (
  <Stack spacing={0.5}>
    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 14 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{value}</Typography>
  </Stack>
);

interface DetailSectionProps {
  fields: DetailFieldProps[];
}

export const DetailSection = ({ fields }: Readonly<DetailSectionProps>) => (
  <Box>
    {fields.map((field, index) => (
      <Box key={field.label}>
        <Box sx={{ py: 2, px: 3 }}>
          <DetailField label={field.label} value={field.value} />
        </Box>
        {index < fields.length - 1 && <Divider />}
      </Box>
    ))}
  </Box>
);
