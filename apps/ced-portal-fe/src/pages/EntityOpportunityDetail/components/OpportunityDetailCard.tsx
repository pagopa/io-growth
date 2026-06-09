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
import {
  getBenefitsDetailData,
  getLocalizedMetadataDetailsMultipleKeys,
} from '../../../utils';

interface OpportunityDetailCardProps {
  detail: OpportunityDetail;
}

export const OpportunityDetailCard = ({
  detail,
}: Readonly<OpportunityDetailCardProps>) => {
  const [description, condition] = getLocalizedMetadataDetailsMultipleKeys(
    detail.localizedMetadata,
    ['description', 'condition'],
  );

  const beneficiaryBenefitFields = getBenefitsDetailData(
    detail.beneficiaryBenefit,
  );

  const caregiverBenefitFields = getBenefitsDetailData(detail.caregiverBenefit);

  const mainFields = [
    ...(beneficiaryBenefitFields ?? []),
    {
      label: 'Descrizione',
      value: description,
    },
    { label: 'Categoria', value: detail.categoryTitle },
    {
      label: 'Inizio validità',
      value: new Date(detail.dateFrom).toLocaleDateString('it-IT'),
    },
    ...(detail.dateTo
      ? [
          {
            label: 'Fine validità',
            value: new Date(detail.dateTo).toLocaleDateString('it-IT'),
          },
        ]
      : []),
    ...(condition ? [{ label: 'Condizioni', value: condition }] : []),
    ...(detail.url ? [{ label: 'URL', value: detail.url }] : []),
  ];

  const hasCaregiver = !!detail.caregiverBenefit;

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

        {hasCaregiver && (
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
            <DetailSection fields={caregiverBenefitFields ?? []} />
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
