import AddIcon from '@mui/icons-material/Add';
import { Box, Typography, useTheme } from '@mui/material';
import { ButtonNaked } from '@pagopa/mui-italia';
import {
  addLocationContact,
  selectLocationForm,
} from '../../../../features/location/locationSlice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import { ContactRow } from './ContactRow';

export function LocationContactsSection() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { contacts } = useAppSelector(selectLocationForm);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ color: theme.palette.text.secondary }}
      >
        Contatti di assistenza
      </Typography>

      {contacts.map((contact, index) => (
        <ContactRow key={index} contact={contact} index={index} />
      ))}

      <ButtonNaked
        startIcon={<AddIcon />}
        onClick={() => dispatch(addLocationContact())}
        sx={{
          alignSelf: 'flex-start',
          textTransform: 'none',
          color: (theme.palette.common as any).primaryButton,
          fontSize: 16,
          '& .MuiButton-startIcon svg': { fontSize: 24 },
        }}
      >
        Aggiungi contatto
      </ButtonNaked>
    </Box>
  );
}
