import CancelRounded from '@mui/icons-material/CancelRounded';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Place from '@mui/icons-material/Place';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { OpportunityDetail } from '../../../features/opportunities/types';
import { theme } from '../../../core/theme';

const PLACES = [
  { name: 'Sede 1', address: 'Via Roma 1, Milano' },
  { name: 'Sede 2', address: 'Corso Italia 2, Torino' },
  { name: 'Sede 3', address: 'Piazza del Duomo 3, Firenze' },
];

interface OpportunityPlacesProps {
  detail: OpportunityDetail;
}

export const OpportunityPlaces = ({
  detail,
}: Readonly<OpportunityPlacesProps>) => {
  const {} = detail;
  return (
    <Accordion defaultExpanded elevation={0} sx={{ borderRadius: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Place sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Sedi</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 3, py: 2 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '30%' }}>Nome</TableCell>
                <TableCell sx={{ width: '50%' }}>Indirizzo</TableCell>
                <TableCell sx={{ width: '20%', textAlign: 'right' }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {PLACES.map(({ name, address }) => (
                <TableRow key={name} hover>
                  <TableCell>{name}</TableCell>
                  <TableCell>{address}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <IconButton
                      size="small"
                      sx={{ color: theme.palette.error.dark }}
                    >
                      <Typography variant="button" sx={{ color: 'inherit' }}>
                        Rimuovi
                      </Typography>
                      <CancelRounded />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};
