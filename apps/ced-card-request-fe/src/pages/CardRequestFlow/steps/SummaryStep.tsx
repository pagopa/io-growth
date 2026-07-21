import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  useTheme,
} from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { forwardRef, Fragment, useImperativeHandle } from 'react';
import { StepCard } from '../StepCard';
import type { StepRef } from '../types';
import { useGetSummaryValue } from '../hooks/useGetSummaryValue';

const judgmentData = [
  {
    label: 'Provincia',
    value: 'Milano',
  },
  {
    label: 'Comune',
    value: 'Milano',
  },
  {
    label: 'Data di rilascio',
    value: '15/06/2023',
  },
];

interface SummaryProps {
  onEditApplicant?: () => void;
  onEditAddress?: () => void;
  onEditJudgment?: () => void;
  onEditPhoto?: () => void;
  photoPreview?: string | null;
}

export const SummaryStep = forwardRef<StepRef, SummaryProps>(
  function SummaryStep(
    { onEditPhoto, onEditAddress, onEditJudgment, photoPreview },
    ref,
  ) {
    const theme = useTheme();

    useImperativeHandle(ref, () => ({
      validate: () => true,
    }));

    const { addressData, personalData } = useGetSummaryValue();

    const accordionSx = {
      bgcolor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
      '&:before': { display: 'none' },
      '&.Mui-expanded': { margin: 0 },
      p: 1,
    } as const;

    const summarySx = {
      minHeight: 56,
      '& .MuiAccordionSummary-content': { margin: 0 },
      padding: '12px 14px',
      '& .MuiAccordionSummary-expandIconWrapper': {
        color: theme.palette.primary.main,
        transform: 'none',
      },
    } as const;

    const detailsSx = { padding: '12px 16px 16px', mt: 2 } as const;

    const Row = ({
      label,
      value,
      showDivider,
    }: {
      label: string;
      value: string;
      showDivider?: boolean;
    }) => (
      <Box sx={{ pb: 1 }}>
        <Body>{label}</Body>
        <Body fontWeight="Semibold">{value}</Body>
        {showDivider && <Divider sx={{ borderColor: theme.palette.divider }} />}
      </Box>
    );

    return (
      <Fragment>
        <StepCard sx={{ mb: 3 }}>
          <Title variant="SM" text="Riepilogo dei dati" />
          <VSpacer />
          <Body>
            Confermi, ai sensi degli artt. 46 e 47 del DPR n. 445/2000, che i
            dati inseriti e la documentazione allegata sono completi, veritieri
            e conformi alla documentazione in tuo possesso. Le dichiarazioni
            mendaci comportano le conseguenze previste dagli artt. 75 e 76 del
            DPR 445/2000.
          </Body>
        </StepCard>

        <Box sx={{ display: 'grid', gap: 2 }}>
          <Accordion sx={accordionSx} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySx}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Title variant="XS" text="Dati anagrafici" />
                <Body>Di chi è la carta.</Body>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={detailsSx}>
              <Box sx={{ display: 'grid', gap: 0.75 }}>
                {personalData.map((f, i) => (
                  <Row
                    key={f.label}
                    label={f.label}
                    value={f.value}
                    showDivider={i < personalData.length - 1}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={accordionSx} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySx}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Title variant="XS" text="Indirizzo di spedizione" />
                <Body>Dove riceverai la carta.</Body>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={detailsSx}>
              <Box sx={{ display: 'grid', gap: 0.75 }}>
                {addressData.map((f, i) => (
                  <Row
                    key={f.label}
                    label={f.label}
                    value={f.value}
                    showDivider={i < addressData.length - 1}
                  />
                ))}

                <Box sx={{ ml: -2.5, mt: -2 }}>
                  <Button
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: 17,
                      color: theme.palette.common.primaryButton,
                    }}
                    onClick={() => onEditAddress?.()}
                  >
                    Modifica dati
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={accordionSx} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySx}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Title variant="XS" text="Foto" />

                <Body>Sarà stampata sulla carta.</Body>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: '12px 16px 16px' }}>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box>
                  <img
                    alt="Anteprima foto"
                    src={photoPreview ?? 'https://picsum.photos/200/260'}
                    style={{
                      width: 180,
                      height: 230,
                      objectFit: 'cover',
                      borderRadius: 8,
                      display: 'block',
                    }}
                  />
                </Box>

                <Box sx={{ ml: -2 }}>
                  <Button
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: 17,
                      color: theme.palette.common.primaryButton,
                    }}
                    onClick={() => onEditPhoto?.()}
                  >
                    Cambia foto
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={accordionSx} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySx}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Title variant="XS" text="Sentenza giudiziaria" />
                <Body>Attesta la tua condizione.</Body>
              </Box>
            </AccordionSummary>
            {false && (
              <AccordionDetails sx={detailsSx}>
                <Box sx={{ display: 'grid', gap: 0.75 }}>
                  {judgmentData.map((f, i) => (
                    <Row
                      key={f.label}
                      label={f.label}
                      value={f.value}
                      showDivider={i < judgmentData.length - 1}
                    />
                  ))}
                  <Box sx={{ ml: -2.5, mt: -2 }}>
                    <Button
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: 17,
                        color: theme.palette.common.primaryButton,
                      }}
                      onClick={() => onEditJudgment?.()}
                    >
                      Modifica dati
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            )}
          </Accordion>
        </Box>
      </Fragment>
    );
  },
);

export default SummaryStep;
