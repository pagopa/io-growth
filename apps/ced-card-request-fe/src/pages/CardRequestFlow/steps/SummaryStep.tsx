import { forwardRef, useImperativeHandle, useState, Fragment } from 'react';
import {
  Box,
  Typography,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { StepRef } from '../types';

const personalData = [
  { label: 'Nome', value: 'Anna' },
  { label: 'Cognome', value: 'Verdi' },
  { label: 'Sesso', value: 'F' },
  { label: 'Data di nascita', value: '31/03/1995' },
  { label: 'Comune di nascita', value: 'Como' },
  { label: 'Provincia di nascita', value: 'CO' },
  { label: 'Codice Fiscale', value: 'VRDNNA95C71C933I' },
  { label: 'Cittadinanza', value: 'Italiana' },
];

const addressData = [
  { label: 'Indirizzo', value: 'Corso Vittorio Emanuele' },
  { label: 'CAP', value: '12100' },
  { label: 'Altri dettagli', value: 'Scala B' },
  { label: 'Provincia', value: 'AL' },
  { label: 'Comune', value: 'Alessandria' },
];

interface SummaryProps {
  onEditApplicant?: () => void;
  onEditAddress?: () => void;
  onEditPhoto?: () => void;
  photoPreview?: string | null;
}

export const SummaryStep = forwardRef<StepRef, SummaryProps>(
  function SummaryStep({ onEditPhoto, onEditAddress, photoPreview }, ref) {
    const theme = useTheme();
    const [expanded, setExpanded] = useState<string | false>('personal');

    useImperativeHandle(ref, () => ({
      validate: () => true,
    }));

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
        <Typography
          sx={{ color: theme.palette.common.neutralDarkGray, fontSize: 14 }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: 16,
            color: theme.palette.common.neutralBlack,
            mb: 1.5,
          }}
        >
          {value}
        </Typography>
        {showDivider && <Divider sx={{ borderColor: theme.palette.divider }} />}
      </Box>
    );

    return (
      <Fragment>
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            borderRadius: 3,
            p: 3,
            mb: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{ color: theme.palette.common.neutralBlack }}
          >
            Riepilogo dei dati
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: theme.palette.common.neutralDarkGray,
              fontSize: 17,
              lineHeight: 1.45,
            }}
          >
            Confermi, ai sensi degli artt. 46 e 47 del DPR n. 445/2000, che i
            dati inseriti e la documentazione allegata sono completi, veritieri
            e conformi alla documentazione in tuo possesso. Le dichiarazioni
            mendaci comportano le conseguenze previste dagli artt. 75 e 76 del
            DPR 445/2000.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gap: 2 }}>
          <Accordion
            expanded={expanded === 'personal'}
            onChange={() =>
              setExpanded((s) => (s === 'personal' ? false : 'personal'))
            }
            sx={accordionSx}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySx}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
                  Dati anagrafici
                </Typography>
                {expanded === 'personal' && (
                  <Typography
                    sx={{
                      color: theme.palette.common.neutralDarkGray,
                      fontSize: 15,
                      mt: 0.5,
                    }}
                  >
                    Di chi è la carta.
                  </Typography>
                )}
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

          <Accordion
            expanded={expanded === 'address'}
            onChange={() =>
              setExpanded((s) => (s === 'address' ? false : 'address'))
            }
            sx={accordionSx}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySx}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
                  Indirizzo di spedizione
                </Typography>
                {expanded === 'address' && (
                  <Typography
                    sx={{
                      color: theme.palette.common.neutralDarkGray,
                      fontSize: 15,
                      mt: 0.5,
                    }}
                  >
                    Dove ricevere la carta.
                  </Typography>
                )}
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

          <Accordion
            expanded={expanded === 'photo'}
            onChange={() =>
              setExpanded((s) => (s === 'photo' ? false : 'photo'))
            }
            sx={accordionSx}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={summarySx}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontWeight: 600, fontSize: 18 }}>
                  Foto
                </Typography>
                {expanded === 'photo' && (
                  <Typography
                    sx={{ color: theme.palette.common.neutralDarkGray }}
                  >
                    Sarà stampata sulla carta.
                  </Typography>
                )}
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
        </Box>
      </Fragment>
    );
  },
);

export default SummaryStep;
