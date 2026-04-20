import { Box, Typography } from '@mui/material';
import { AppRadioList, SectionCard } from '../../../components';
import type { AccessPoint } from '../../../features/wizard/types';
import {
  selectAccessPoint,
  setAccessPoint,
} from '../../../features/wizard/slice';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { ACCESS_POINT_OPTIONS } from './constants';

export function AccessPointSection() {
  const dispatch = useAppDispatch();
  const accessPoint = useAppSelector(selectAccessPoint);

  return (
    <SectionCard>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="h6" fontWeight={700}>
          Punti di accesso
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Indica dove vuoi erogare l&apos;agevolazione.
        </Typography>
      </Box>
      <AppRadioList
        options={ACCESS_POINT_OPTIONS}
        value={accessPoint}
        onChange={(value) => dispatch(setAccessPoint(value as AccessPoint))}
        itemMaxWidth="100%"
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      />
    </SectionCard>
  );
}
