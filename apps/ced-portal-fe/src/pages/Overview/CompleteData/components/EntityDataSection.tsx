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
  sede: '' | 'fisica' | 'sito_web';
  sedeError?: string;
  websiteUrl: string;
  street: string;
  city: string;
  postalCode: string;
  province: string;
  logoFile: File | null;
  coverFile: File | null;
  onNameChange: (value: string) => void;
  onSedeChange: (value: '' | 'fisica' | 'sito_web') => void;
  onWebsiteUrlChange: (value: string) => void;
  onStreetChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onLogoSelect: (file: File | null) => void;
  onCoverSelect: (file: File | null) => void;
  onInfoClick: (type: 'logo' | 'cover') => void;
  nameError?: string;
  websiteUrlError?: string;
  streetError?: string;
  cityError?: string;
  postalCodeError?: string;
  provinceError?: string;
}

export const EntityDataSection = ({
  name,
  sede,
  sedeError,
  websiteUrl,
  street,
  city,
  postalCode,
  province,
  logoFile,
  coverFile,
  onNameChange,
  onSedeChange,
  onWebsiteUrlChange,
  onStreetChange,
  onCityChange,
  onPostalCodeChange,
  onProvinceChange,
  onLogoSelect,
  onCoverSelect,
  onInfoClick,
  nameError,
  websiteUrlError,
  streetError,
  cityError,
  postalCodeError,
  provinceError,
}: EntityDataSectionProps) => {
  const isWebsite = sede === 'sito_web';
  const isPhysical = sede === 'fisica';

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
          <Typography fontSize={16} fontWeight={600} sx={{ lineHeight: 1.25 }}>
            Dati dell&apos;ente
          </Typography>
        </Stack>

        <AppTextField
          required
          label="Nome visibile su IO"
          placeholder="Inserisci il nome visibile su IO"
          value={name}
          error={Boolean(nameError)}
          helperText={nameError}
          onChange={(e) => onNameChange(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
          }}
        />

        <AppRadioGroup
          value={sede}
          onChange={(e) =>
            onSedeChange(e.target.value as '' | 'fisica' | 'sito_web')
          }
          options={SEDE_OPTIONS}
          sx={{
            flexFlow: 'nowrap',
            py: 1,
            gap: 3,
            '& .MuiFormControlLabel-root': { m: 0 },
            color: 'common.neutralBlack',
            fontWeight: 600,
          }}
        />

        {sedeError ? (
          <Typography variant="body2" color="common.requiredField">
            {sedeError}
          </Typography>
        ) : null}

        {isWebsite ? (
          <AppTextField
            required
            label="URL"
            placeholder="Inserisci URL"
            value={websiteUrl}
            error={Boolean(websiteUrlError)}
            helperText={websiteUrlError}
            onChange={(e) => onWebsiteUrlChange(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '8px' },
            }}
          />
        ) : isPhysical ? (
          <Stack spacing={1.5}>
            <AppTextField
              required
              label="Indirizzo"
              placeholder="Via/Piazza e numero civico"
              value={street}
              error={Boolean(streetError)}
              helperText={streetError}
              onChange={(e) => onStreetChange(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: '8px' },
              }}
            />

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              sx={{ width: '100%' }}
            >
              <AppTextField
                required
                label="Città"
                value={city}
                error={Boolean(cityError)}
                helperText={cityError}
                onChange={(e) => onCityChange(e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />
              <AppTextField
                required
                label="CAP"
                value={postalCode}
                error={Boolean(postalCodeError)}
                helperText={postalCodeError}
                onChange={(e) => onPostalCodeChange(e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />
              <AppTextField
                required
                label="Provincia"
                value={province}
                error={Boolean(provinceError)}
                helperText={provinceError}
                onChange={(e) => onProvinceChange(e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                }}
              />
            </Stack>
          </Stack>
        ) : null}

        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              fontSize={14}
              fontWeight={600}
              sx={{
                lineHeight: 1,
                color: 'common.neutralDarkGray',
              }}
            >
              LOGO ENTE
            </Typography>
            <IconButton
              size="small"
              onClick={() => onInfoClick('logo')}
              sx={{ color: 'text.action' }}
              aria-label="Informazioni logo ente"
            >
              <InfoOutlinedIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Stack>
          <UploadDropzone
            selectedFileName={logoFile?.name}
            onFileSelect={onLogoSelect}
            title="Trascina qui il logo del tuo ente"
            subtitle={'Dimensione massima 300 x 300px - Formato .jpg o .png'}
          />
          <Typography
            variant="body2"
            sx={{ ml: 4 }}
            color="common.requiredField"
          >
            * Campo obbligatorio
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography
              fontSize={14}
              color={'text.description'}
              fontWeight={600}
              sx={{
                lineHeight: 1,
                color: 'common.neutralDarkGray',
              }}
            >
              IMMAGINE DI COPERTINA
            </Typography>
            <IconButton
              size="small"
              onClick={() => onInfoClick('cover')}
              sx={{ color: 'text.action' }}
              aria-label="Informazioni immagine di copertina"
            >
              <InfoOutlinedIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Stack>
          <UploadDropzone
            selectedFileName={coverFile?.name}
            onFileSelect={onCoverSelect}
            title={"Trascina qui un'immagine di copertina"}
            subtitle={'Dimensione massima 300 x 600 px - Formato .jpg o .png'}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};
