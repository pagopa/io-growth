import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, useTheme } from '@mui/material';
import { AppSelect, AppTextField } from '../../../../components';
import type { Contact } from '../../../../features/location/types';
import {
  removeLocationContact,
  updateLocationContact,
} from '../../../../features/location/locationSlice';
import { useAppDispatch } from '../../../../hooks/store';

const CONTACT_TYPE_OPTIONS = ['Telefono', 'Sito web'];

interface ContactRowProps {
  contact: Contact;
  index: number;
}

export function ContactRow({ contact, index }: ContactRowProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        alignItems: 'flex-start',
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          flex: { xs: '1 1 100%', sm: '0 0 auto' },
        }}
      >
        {index > 0 && (
          <IconButton
            onClick={() => dispatch(removeLocationContact(index))}
            sx={{ color: theme.palette.error.dark, p: 2 }}
          >
            <DeleteIcon />
          </IconButton>
        )}
        <AppSelect
          label="Tipo di contatto"
          options={CONTACT_TYPE_OPTIONS}
          value={contact.type}
          onChange={(e) =>
            dispatch(
              updateLocationContact({
                index,
                field: 'type',
                value: e.target.value as string,
              }),
            )
          }
          sx={{
            minWidth: { xs: 0, sm: '200px' },
            maxWidth: { xs: '100%', sm: '200px' },
            flex: { xs: 1, sm: '0 0 auto' },
          }}
        />
      </Box>

      <AppTextField
        label="Inserisci contatto"
        value={contact.value}
        onChange={(e) =>
          dispatch(
            updateLocationContact({ index, field: 'value', value: e.target.value }),
          )
        }
        sx={{ flex: 1 }}
      />
    </Box>
  );
}
