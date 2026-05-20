import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import type { OpportunityDetail } from '../../../features/opportunities/types';
import { DetailSection } from './DetailSection';

interface OpportunityDetailCardProps {
  detail: OpportunityDetail;
}

export const OpportunityDetailCard = ({
  detail,
}: Readonly<OpportunityDetailCardProps>) => {
  const mainFields = [
    { label: 'Tipo di opportunità', value: detail.opportunity_type },
    { label: 'Modalità di sconto', value: detail.discount_type },
    {
      label: 'Valore dello sconto',
      value: String(detail.discount_value),
    },
    { label: 'Descrizione', value: detail.description },
    { label: 'Categoria', value: detail.category },
    {
      label: 'Inizio validità',
      value: new Date(detail.validity_start).toLocaleDateString('it-IT'),
    },
    {
      label: 'Fine validità',
      value: new Date(detail.validity_end).toLocaleDateString('it-IT'),
    },
    { label: 'Condizioni', value: detail.conditions },
  ];

  const companionFields = [
    {
      label: 'Opportunità per accompagnatore',
      value: detail.companion.enabled ? 'Sì' : 'No',
    },
    ...(detail.companion.enabled
      ? [
          {
            label: 'Modalità di sconto',
            value: detail.companion.discount_type,
          },
          {
            label: 'Valore dello sconto',
            value: `€ ${detail.companion.discount_value}`,
          },
        ]
      : []),
  ];

  return (
    <Accordion defaultExpanded elevation={0} sx={{ borderRadius: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SettingsOutlinedIcon
            sx={{ color: 'text.secondary', fontSize: 20 }}
          />
          <Typography sx={{ fontWeight: 700, fontSize: 18 }}>
            Dettagli dell&apos;opportunità
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <Divider />
        <DetailSection fields={mainFields} />

        {detail.companion.enabled && (
          <>
            <Divider />
            <Box sx={{ py: 2, px: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: 1,
                  color: 'text.secondary',
                }}
              >
                ACCOMPAGNATORE
              </Typography>
            </Box>
            <Divider />
            <DetailSection fields={companionFields} />
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
