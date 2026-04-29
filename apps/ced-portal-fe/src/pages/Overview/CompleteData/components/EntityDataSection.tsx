import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { IconButton, Paper, Stack, Typography } from '@mui/material';
import {
  AppRadioGroup,
  AppTextField,
  UploadDropzone,
} from '../../../../components';

const SEDE_OPTIONS = [
  { label: 'Sede fisica', value: 'fisica' },
  { label: 'Sito web', value: 'sito_web' },
];

interface EntityDataSectionProps {
  name: string;
  sede: 'fisica' | 'sito_web';
  address: string;
  logoFile: File | null;
  coverFile: File | null;
  onNameChange: (value: string) => void;
  onSedeChange: (value: 'fisica' | 'sito_web') => void;
  onAddressChange: (value: string) => void;
  onLogoSelect: (file: File | null) => void;
  onCoverSelect: (file: File | null) => void;
  onInfoClick: (type: 'logo' | 'cover') => void;
}

export const EntityDataSection = ({
  name,
  sede,
  address,
  logoFile,
  coverFile,
  onNameChange,
  onSedeChange,
  onAddressChange,
  onLogoSelect,
  onCoverSelect,
  onInfoClick,
}: EntityDataSectionProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, p: { xs: 1.5, md: 2 }, width: '100%' }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <StorefrontOutlinedIcon
            sx={{ color: 'common.decorativeIcon', fontSize: 20 }}
          />
          <Typography fontSize={16} fontWeight={700} sx={{ lineHeight: 1.25 }}>
            Dati dell&apos;ente
          </Typography>
        </Stack>

        <AppTextField
          required
          label="Nome visibile su IO"
          placeholder="Inserisci il nome visibile su IO"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
          }}
        />

        <AppRadioGroup
          value={sede}
          onChange={(e) =>
            onSedeChange(e.target.value as 'fisica' | 'sito_web')
          }
          options={SEDE_OPTIONS}
          sx={{
            py: 1,
            gap: 3,
            '& .MuiFormControlLabel-root': { m: 0 },
            color: 'common.neutralBlack',
            fontWeight: 600,
          }}
        />

        <AppTextField
          required
          label="Indirizzo"
          placeholder="Inserisci l'indirizzo"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
          }}
        />

        <Stack spacing={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Typography
              fontSize={14}
              fontWeight={600}
              sx={{
                pb: 2,
                pt: 1,
                color: 'common.neutralDarkGray',
              }}
            >
              LOGO ENTE
            </Typography>
            <IconButton
              size="small"
              onClick={() => onInfoClick('logo')}
              sx={{ color: 'text.action', mt: 0.5 }}
              aria-label="Informazioni logo ente"
            >
              <InfoOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
          <UploadDropzone
            selectedFileName={logoFile?.name}
            onFileSelect={onLogoSelect}
            title="Trascina qui il logo del tuo ente"
            subtitle={'Dimensione massima 300 x 300px - Formato .jpg o .png'}
          />
          <Typography variant="body2" sx={{ ml: 4, color: 'error.dark' }}>
            * Campo obbligatorio
          </Typography>
        </Stack>

        <Stack spacing={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Typography
              fontSize={14}
              color={'text.description'}
              fontWeight={600}
              sx={{
                pb: 2,
                pt: 1,
                color: 'common.neutralDarkGray',
              }}
            >
              IMMAGINE DI COPERTINA
            </Typography>
            <IconButton
              size="small"
              onClick={() => onInfoClick('cover')}
              sx={{ color: 'text.action', mt: 0.5 }}
              aria-label="Informazioni immagine di copertina"
            >
              <InfoOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
          <UploadDropzone
            selectedFileName={coverFile?.name}
            onFileSelect={onCoverSelect}
            title={'Trascina qui immagine di copertina'}
            subtitle={'Dimensione massima 300 x 600 px - Formato .jpg o .png'}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};
