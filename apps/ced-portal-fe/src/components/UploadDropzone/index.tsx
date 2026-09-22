import { UploadFile } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';

export type UploadDropzoneProps = {
  selectedFileName?: string;
  previewFile?: File | null;
  previewKind?: 'logo' | 'cover';
  uploadLabel?: string;
  title: string;
  subtitle: string;
  onFileSelect: (file: File | null) => void;
  /** Accepted file types, e.g. ['application/pdf'] or ['.pdf', '.p7m'] */
  acceptedTypes?: string[];
  /** Loading state - shows progress bar */
  isLoading?: boolean;
  /** Error state - shows error message */
  isError?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Validation error state for an empty or invalid form field */
  fieldError?: boolean;
  /** Success state - file uploaded */
  isSuccess?: boolean;
  /** Uploaded file name to display in success state */
  uploadedFileName?: string;
  /** Label for uploaded file  */
  uploadedFileLabel?: string;
  /** Callback when cancel is clicked during loading */
  onCancel?: () => void;
  /** Callback when retry is clicked during error */
  onRetry?: () => void;
  /** Callback when delete is clicked in success state */
  onDelete?: () => void;
};

export type UploadState = 'idle' | 'loading' | 'error' | 'success';

const MAX_FILE_NAME_LENGTH = 50;

const truncateFileName = (
  fileName: string,
  maxLength = MAX_FILE_NAME_LENGTH,
) => {
  if (fileName.length <= maxLength) {
    return fileName;
  }

  const extensionIndex = fileName.lastIndexOf('.');
  const extension = extensionIndex > 0 ? fileName.slice(extensionIndex) : '';
  const baseName = extension ? fileName.slice(0, extensionIndex) : fileName;
  const truncatedBase = baseName.slice(0, maxLength - extension.length - 3);

  return `${truncatedBase}...${extension}`;
};

const normalizeImageFileType = (file: File): File => {
  if (file.type === 'image/png' || file.type === 'image/jpeg') return file;

  const fileName = file.name.toLowerCase();
  const type = fileName.endsWith('.png')
    ? 'image/png'
    : fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')
      ? 'image/jpeg'
      : undefined;

  return type
    ? new File([file], file.name, { type, lastModified: file.lastModified })
    : file;
};

export function UploadDropzone({
  selectedFileName,
  previewFile,
  previewKind,
  uploadLabel = 'Carica file',
  title,
  subtitle,
  onFileSelect,
  acceptedTypes,
  isLoading = false,
  isError = false,
  errorMessage,
  fieldError = false,
  isSuccess = false,
  uploadedFileName,
  uploadedFileLabel,
  onCancel,
  onRetry,
  onDelete,
}: Readonly<UploadDropzoneProps>) {
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    if (!previewFile) {
      setPreviewUrl(undefined);
      return;
    }

    const url = URL.createObjectURL(previewFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [previewFile]);

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const isAccepted = (file: File): boolean => {
    if (!acceptedTypes || acceptedTypes.length === 0) return true;
    return acceptedTypes.some((type) =>
      type.startsWith('.')
        ? file.name.toLowerCase().endsWith(type.toLowerCase())
        : file.type === type,
    );
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0]
      ? normalizeImageFileType(event.dataTransfer.files[0])
      : null;
    if (file && !isAccepted(file)) return;
    onFileSelect(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
      ? normalizeImageFileType(event.target.files[0])
      : null;
    if (file && !isAccepted(file)) return;
    onFileSelect(file);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          border: '1px dashed #6D8BEE',
          ...(fieldError && {
            borderColor: 'common.requiredField',
          }),
          borderRadius: '8px',
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 3,
          bgcolor: 'rgba(11, 62, 227, 0.08)',
        }}
      >
        <Stack spacing={1} sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            Caricamento in corso...
          </Typography>
          <LinearProgress sx={{ height: 4, borderRadius: 2 }} />
        </Stack>
        <Button
          variant="outlined"
          color="primary"
          sx={{ whiteSpace: 'nowrap', px: 3 }}
          onClick={onCancel}
        >
          Annulla
        </Button>
      </Box>
    );
  }

  // Error state
  if (isError) {
    return (
      <Box
        sx={{
          border: '1px dashed #6D8BEE',
          borderRadius: '8px',
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 3,
          bgcolor: 'rgba(244, 67, 54, 0.04)',
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ flex: 1 }}>
          <InfoRoundedIcon
            sx={{ color: 'text.secondary', flexShrink: 0, mt: 0.25 }}
          />
          <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={600}>
              Caricamento fallito
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {errorMessage || 'Verifica il formato e la dimensione del file'}
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          sx={{ whiteSpace: 'nowrap', px: 3 }}
          onClick={onRetry}
        >
          Riprova
        </Button>
      </Box>
    );
  }

  // Success state
  if (isSuccess && uploadedFileName) {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '8px',
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <UploadFile sx={{ color: 'text.secondary', flexShrink: 0 }} />
          <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {uploadedFileLabel || title}
            </Typography>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 15,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={uploadedFileName}
            >
              {truncateFileName(uploadedFileName)}
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="text"
          color="error"
          startIcon={<DeleteIcon />}
          sx={{ whiteSpace: 'nowrap', px: 2 }}
          onClick={onDelete}
        >
          Elimina
        </Button>
      </Box>
    );
  }

  // Default upload state
  const displayFileName = selectedFileName
    ? truncateFileName(selectedFileName)
    : subtitle;

  if (previewUrl && previewKind) {
    return (
      <Box
        component="label"
        sx={{
          border: '1px solid',
          borderColor: fieldError ? 'common.requiredField' : 'divider',
          borderRadius: '8px',
          p: { xs: 2, md: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          bgcolor: '#f6f7fa',
        }}
      >
        <Box
          component="img"
          src={previewUrl}
          alt="Anteprima file selezionato"
          sx={{
            width: previewKind === 'logo' ? 100 : 158,
            height: previewKind === 'logo' ? 100 : 102,
            objectFit: previewKind === 'logo' ? 'contain' : 'cover',
            borderRadius: 1,
            bgcolor: 'common.white',
          }}
        />
        <Button component="span" variant="contained" sx={{ px: 2.5, py: 1 }}>
          {uploadLabel}
        </Button>
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
        <Box
          component="input"
          type="file"
          onChange={handleChange}
          accept={acceptedTypes?.join(',')}
          sx={{ display: 'none' }}
        />
      </Box>
    );
  }

  return (
    <Box
      component="label"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      sx={{
        border: '1px dashed #6D8BEE',
        ...(fieldError && {
          borderColor: 'common.requiredField',
          bgcolor: 'rgba(244, 67, 54, 0.04)',
        }),
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
        {previewUrl ? (
          <Box
            component="img"
            src={previewUrl}
            alt="Anteprima file selezionato"
            sx={{
              width: 56,
              height: 56,
              objectFit: 'cover',
              borderRadius: 1,
              flexShrink: 0,
            }}
          />
        ) : (
          <UploadFile
            sx={{ color: fieldError ? 'common.requiredField' : 'common.black' }}
          />
        )}
        <Stack spacing={0.25}>
          <Typography variant="body2" fontWeight={600}>
            {title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            title={selectedFileName ?? undefined}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayFileName}
          </Typography>
        </Stack>
      </Stack>

      <Button
        component="span"
        variant="contained"
        sx={{
          px: 4,
          py: 1.5,
        }}
      >
        Carica file
      </Button>

      <Box
        component="input"
        type="file"
        onChange={handleChange}
        accept={acceptedTypes?.join(',')}
        sx={{ display: 'none' }}
      />
    </Box>
  );
}
