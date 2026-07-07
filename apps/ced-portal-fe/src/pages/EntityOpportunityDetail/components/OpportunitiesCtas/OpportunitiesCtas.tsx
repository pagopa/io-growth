import { Button, Stack } from '@mui/material';
import { OpportunitiesCtaItem, OpportunitiesCtasProps } from './types';
import { useGetCtasConfiguration } from './useGetCtasConfiguration';
import { DeleteOpportunityModal } from '../../../Home/components/DeleteOpportunityModal';

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
  const { ctasConfig, deleteModal } = useGetCtasConfiguration(id);

  const layout = ctasConfig[status];
  const ctas = layout?.ctas;
  const leftCtas = layout?.leftCtas;
  const rightCtas = layout?.rightCtas;
  const hasSplitLayout = leftCtas !== undefined || rightCtas !== undefined;
  const hasAnyCta =
    (ctas?.length ?? 0) > 0 ||
    (leftCtas?.length ?? 0) > 0 ||
    (rightCtas?.length ?? 0) > 0;

  const canRequestApproval = status === 'draft';

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
            {leftCtas?.map((cta) => renderCta(cta))}
          </Stack>
          <Stack direction="row" spacing={2}>
            {rightCtas?.map((cta) => renderCta(cta))}
          </Stack>
        </Stack>
      ) : (
        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ pt: 2, pb: 4 }}
        >
          {ctas?.map((cta) => renderCta(cta))}
        </Stack>
      )}
      <DeleteOpportunityModal
        open={deleteModal.open}
        onClose={deleteModal.onClose}
        onConfirm={deleteModal.onConfirm}
      />
    </>
  );
};
