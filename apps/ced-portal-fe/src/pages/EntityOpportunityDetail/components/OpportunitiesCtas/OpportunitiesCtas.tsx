import { Button, Stack } from '@mui/material';
import { useState } from 'react';
import { AppModal } from '../../../../components';
import { OpportunitiesCtaItem, OpportunitiesCtasProps } from './types';
import { useGetCtasConfiguration } from './useGetCtasConfiguration';

const CTA_BUTTON_SX = { fontWeight: 700, borderRadius: 2, px: 3 };

const renderCta = (cta: OpportunitiesCtaItem) => (
  <Button
    key={`${cta.variant}-${cta.label}`}
    variant={cta.variant}
    color={cta.color ?? (cta.variant === 'text' ? 'inherit' : 'primary')}
    startIcon={cta.startIcon}
    onClick={cta.action}
    sx={CTA_BUTTON_SX}
  >
    {cta.label}
  </Button>
);

export const OpportunitiesCtas = ({ status, id }: OpportunitiesCtasProps) => {
  const { ctasConfig, isRequestingApproval, handleRequestApproval } =
    useGetCtasConfiguration(id);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  const layout = ctasConfig[status];
  const ctas = layout?.ctas;
  const leftCtas = layout?.leftCtas;
  const rightCtas = layout?.rightCtas;
  const hasSplitLayout = leftCtas !== undefined || rightCtas !== undefined;
  const hasAnyCta =
    (ctas?.length ?? 0) > 0 ||
    (leftCtas?.length ?? 0) > 0 ||
    (rightCtas?.length ?? 0) > 0;

  const canRequestApproval =
    status === 'DRAFT' || status === 'CHANGES_REQUESTED';

  const renderCtaWithApprovalOverride = (cta: OpportunitiesCtaItem) => {
    if (cta.actionId === 'REQUEST_APPROVAL') {
      return (
        <Button
          key={`${cta.variant}-${cta.label}`}
          variant={cta.variant}
          color={cta.color ?? 'primary'}
          startIcon={cta.startIcon}
          onClick={() => setApprovalDialogOpen(true)}
          disabled={isRequestingApproval}
          sx={CTA_BUTTON_SX}
        >
          {cta.label}
        </Button>
      );
    }
    return renderCta(cta);
  };

  if (!hasAnyCta && !canRequestApproval) {
    return null;
  }

  return (
    <>
      {hasSplitLayout ? (
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          sx={{ pt: 2, pb: 4 }}
        >
          <Stack direction="row" spacing={2}>
            {leftCtas?.map((cta) => renderCtaWithApprovalOverride(cta))}
          </Stack>
          <Stack direction="row" spacing={2}>
            {rightCtas?.map((cta) => renderCtaWithApprovalOverride(cta))}
          </Stack>
        </Stack>
      ) : (
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ pt: 2, pb: 4 }}
        >
          {ctas?.map((cta) => renderCtaWithApprovalOverride(cta))}
        </Stack>
      )}

      <AppModal
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        title="Richiedi approvazione"
        description="Il Dipartimento effettuerà la revisione della tua opportunità. Il processo potrebbe richiedere diverso tempo. Se approvata, sarà pubblicata su IO a partire dalla data di inizio validità che hai scelto."
      >
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() => setApprovalDialogOpen(false)}
          >
            Annulla
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              setApprovalDialogOpen(false);
              await handleRequestApproval();
            }}
            disabled={isRequestingApproval}
          >
            Invia in revisione
          </Button>
        </Stack>
      </AppModal>
    </>
  );
};
