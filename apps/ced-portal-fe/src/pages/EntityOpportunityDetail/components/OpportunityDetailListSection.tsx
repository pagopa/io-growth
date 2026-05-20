import CancelRounded from '@mui/icons-material/CancelRounded';
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
import type { ReactNode } from 'react';
import { theme } from '../../../core/theme';

export interface OpportunityDetailListItem {
  name: string;
  address: string;
}

interface OpportunityDetailListSectionProps {
  title: string;
  icon: ReactNode;
  rows: ReadonlyArray<OpportunityDetailListItem>;
  hideDelete?: boolean;
}

export const OpportunityDetailListSection = ({
  title,
  icon,
  rows,
  hideDelete,
}: Readonly<OpportunityDetailListSectionProps>) => (
  <Accordion defaultExpanded elevation={0} sx={{ borderRadius: 2 }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {icon}
        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{title}</Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails sx={{ px: 3, py: 2 }}>
      <Box
        sx={{
          backgroundColor: theme.palette.divider,
          borderRadius: 2,
          px: 1.5,
          pb: 1.5,
        }}
      >
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 1 }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '30%' }}>Nome</TableCell>
                <TableCell sx={{ width: '50%' }}>Indirizzo</TableCell>
                {!hideDelete && (
                  <TableCell sx={{ width: '20%', textAlign: 'right' }} />
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(({ name, address }) => (
                <TableRow key={name} hover>
                  <TableCell>{name}</TableCell>
                  <TableCell>{address}</TableCell>
                  {!hideDelete && (
                    <TableCell sx={{ textAlign: 'right' }}>
                      <IconButton
                        size="small"
                        sx={{
                          color: theme.palette.error.dark,
                          borderRadius: 0,
                        }}
                        onClick={() => console.info('remove button clicked')}
                      >
                        <Typography variant="button" sx={{ color: 'inherit' }}>
                          Rimuovi
                        </Typography>
                        <CancelRounded />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </AccordionDetails>
  </Accordion>
);
