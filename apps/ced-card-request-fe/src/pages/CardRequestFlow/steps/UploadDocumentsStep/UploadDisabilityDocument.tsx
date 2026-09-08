import { Body, ErrorBody, Title, VSpacer } from '@pagopa/io-core-ui';
import { StepCard } from '../../StepCard';
import { MarkdownRenderer } from '../../../../components/Typography/MarkdownRender';
import { alpha, Box, Button, FormControl, Link } from '@mui/material';
import { theme } from '../../../../core/theme';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CloseIcon from '@mui/icons-material/Close';
import {
  fileToBase64,
  validateBase64DocumentSize,
  validateDocumentFile,
} from './utils';
import { useAppDispatch } from '../../../../hooks';
import { setField } from '../../../../features/confirmation/reducer';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { CompanionAvailabilityRadioGroup } from './CompanionAvailabilityRadioGroup';
import type { StepRef } from '../../types';

const markdownContent = `Dimensione massima 2 MB
Formato .pdf o .jpg
`;

type UploadState = 'idle' | 'loading' | 'preview';

type UploadedDocument = {
  name: string;
  size: number;
};

const formatFileSize = (bytes: number) => {
  if (bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;

  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
};

export const UploadDisabilityDocument = forwardRef<StepRef>(
  function UploadDisabilityDocument(_, ref) {
    const dispatch = useAppDispatch();

    const [uploadState, setUploadState] = useState<UploadState>('idle');
    const [uploadedDocument, setUploadedDocument] =
      useState<UploadedDocument | null>(null);
    const [validationError, setValidationError] = useState<string>();

    useImperativeHandle(ref, () => ({
      validate: () => {
        if (!uploadedDocument) {
          setValidationError('Campo obbligatorio');
          return false;
        }

        setValidationError(undefined);
        return true;
      },
    }));

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;

      const validation = validateDocumentFile(file);

      if (!validation.isValid) {
        console.warn(validation.message);
        e.target.value = '';
        return;
      }

      try {
        const fileBase64 = await fileToBase64(file);
        const base64Validation = validateBase64DocumentSize(fileBase64);

        if (!base64Validation.isValid) {
          console.warn(base64Validation.message);
          e.target.value = '';
          return;
        }

        dispatch(setField({ field: 'nomeFile', value: file.name }));
        dispatch(setField({ field: 'allegato', value: fileBase64 }));
        setUploadedDocument({ name: file.name, size: file.size });
        setValidationError(undefined);
        setUploadState('preview');
      } catch (error) {
        console.error('Errore durante la conversione del file:', error);
        e.target.value = '';
      }
    };

    const handleRemoveDocument = () => {
      dispatch(setField({ field: 'nomeFile', value: null }));
      dispatch(setField({ field: 'allegato', value: null }));
      setUploadedDocument(null);
      setValidationError('Campo obbligatorio');
      setUploadState('idle');
    };

    if (uploadState === 'preview' && uploadedDocument) {
      return (
        <>
          <StepCard>
            <Title
              variant="SM"
              text="Carica il documento che attesta l'invalidità"
            />
            <VSpacer />
            <Body>
              Invieremo i dati all’INPS per completare la richiesta della carta.
            </Body>
            <VSpacer size={4} />

            <Box
              sx={{
                mt: 3,
                border: `2px solid ${theme.palette.common.neutralGray}`,
                borderRadius: 2,
                p: 3,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  backgroundColor: alpha(
                    theme.palette.common.primaryButton,
                    0.12,
                  ),
                  color: theme.palette.common.primaryButton,
                }}
              >
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Link
                  href="#"
                  underline="hover"
                  sx={{
                    display: 'block',
                    color: theme.palette.common.primaryButton,
                    fontWeight: 600,
                    fontSize: 17,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 240,
                  }}
                  onClick={(event) => event.preventDefault()}
                >
                  {uploadedDocument.name}
                </Link>
                <Body fontSize="14px">
                  {formatFileSize(uploadedDocument.size)}
                </Body>
              </Box>

              <Button
                type="button"
                onClick={handleRemoveDocument}
                aria-label="Rimuovi file"
                sx={{
                  minWidth: 'auto',
                  p: 0.5,
                  color: theme.palette.common.neutralBlack,
                  borderRadius: '50%',
                }}
              >
                <CloseIcon sx={{ fontSize: 26 }} />
              </Button>
            </Box>
          </StepCard>
          <StepCard>
            <Title text="Hai diritto all'accompagnatore?" variant="SM" />

            <Body>
              Devi essere in possesso di una certificazione che lo conferma.
            </Body>

            <FormControl sx={{ mt: 3, width: '100%', bgcolor: 'transparent' }}>
              <CompanionAvailabilityRadioGroup />
            </FormControl>
          </StepCard>
        </>
      );
    }

    return (
      <StepCard>
        <Title
          variant="SM"
          text="Carica il documento che attesta l'invalidità"
        />
        <VSpacer />
        <Body>Assicurati di caricare la documentazione completa.</Body>
        <VSpacer size={4} />

        <Box
          sx={{
            backgroundColor: alpha(theme.palette.common.primaryButton, 0.08),
            mt: 3,
            border: `2px dashed ${theme.palette.common.primaryButton}`,
            borderRadius: 2,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <FileUploadOutlinedIcon
            sx={{ fontSize: 32, color: theme.palette.common.neutralBlack }}
          />
          <Body fontWeight="Semibold">Carica il documento di invalidità</Body>
          <MarkdownRenderer content={markdownContent} />
          <Button
            variant="contained"
            component="label"
            sx={{
              bgcolor: theme.palette.common.primaryButton,
              textTransform: 'none',
              px: 3,
            }}
          >
            Carica file
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg"
              hidden
              onChange={handleFileChange}
            />
          </Button>
        </Box>

        {validationError && (
          <ErrorBody fontSize="14px">* {validationError}</ErrorBody>
        )}
      </StepCard>
    );
  },
);
