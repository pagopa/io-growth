import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Box, Button, Stack, Typography } from '@mui/material';

export type DownloadItemProps = {
  label: string;
  fileName: string;
  downloadUrl: string;
  downloadLabel?: string;
};

export const DownloadItem = ({
  label,
  fileName,
  downloadUrl,
  downloadLabel = 'Scarica e firma',
}: DownloadItemProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
    }}
  >
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ minWidth: 0 }}
    >
      <AttachFileRoundedIcon sx={{ color: 'text.secondary', flexShrink: 0 }} />
      <Stack spacing={0}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
          {fileName}
        </Typography>
      </Stack>
    </Stack>

    <Button
      component="a"
      href={downloadUrl}
      download
      startIcon={<FileDownloadOutlinedIcon />}
      sx={{ whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600 }}
    >
      {downloadLabel}
    </Button>
  </Box>
);
