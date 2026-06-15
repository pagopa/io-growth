import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

type SectionCardProps = {
  title: string;
  children: ReactNode;
};

export const SectionCard = ({ title, children }: SectionCardProps) => (
  <Accordion defaultExpanded elevation={0} sx={{ borderRadius: 2 }}>
    <AccordionSummary
      expandIcon={<ExpandMoreIcon color="primary" />}
      sx={{ px: 3, py: 1 }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{title}</Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ p: 0 }}>{children}</AccordionDetails>
  </Accordion>
);
