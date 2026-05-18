import CancelRounded from '@mui/icons-material/CancelRounded';
import WebOutlined from '@mui/icons-material/WebOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
const WEBSITES = [
  { name: 'Sede 1', address: 'www.sede1.it' },
  { name: 'Sede 2', address: 'www.sede2.it' },
  { name: 'Sede 3', address: 'www.sede3.it' },
];

interface OpportunitySitesProps {
  detail: OpportunityDetail;
}

export const OpportunitySites = ({
  detail,
}: Readonly<OpportunitySitesProps>) => {
  const {} = detail;
  return (
    <Accordion defaultExpanded elevation={0} sx={{ borderRadius: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WebOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
            Siti web
          </Typography>
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
              {WEBSITES.map(({ name, address }) => (
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
