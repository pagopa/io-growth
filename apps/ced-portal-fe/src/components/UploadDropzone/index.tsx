import { UploadFile } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';

export type UploadDropzoneProps = {
  selectedFileName?: string;
  title: string;
  subtitle: string;
  onFileSelect: (file: File | null) => void;
};

export function UploadDropzone({
  selectedFileName,
  title,
  subtitle,
  onFileSelect,
}: UploadDropzoneProps) {
  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0] ?? null;
    onFileSelect(file);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelect(file);
  };

  return (
    <Box
      component="label"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{
        border: '1px dashed #6D8BEE',
        borderRadius: '8px',
        p: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 3,
        alignSelf: 'stretch',
        cursor: 'pointer',
        bgcolor: 'rgba(11, 62, 227, 0.08)',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ minWidth: 0 }}
      >
        <UploadFile sx={{ color: 'common.black' }} />
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {selectedFileName ?? subtitle}
          </Typography>
        </Stack>
      </Stack>

      <Button
        component="span"
        variant="contained"
        sx={{
          display: 'flex',
          height: '48px',
          px: 3,
          py: 1.5,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textTransform: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Carica file
      </Button>

      <Box
        component="input"
        type="file"
        onChange={handleChange}
        sx={{ display: 'none' }}
      />
    </Box>
  );
}
