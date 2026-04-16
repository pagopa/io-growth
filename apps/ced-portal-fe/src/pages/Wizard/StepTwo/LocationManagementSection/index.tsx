import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import { SectionCard } from '../../../../components';
import {
  selectAccessPoint,
  selectNationwide,
  setNationwide,
} from '../../../../features/wizard/slice';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';

export function LocationManagementSection() {
  const dispatch = useAppDispatch();
  const accessPoint = useAppSelector(selectAccessPoint);
  const nationwide = useAppSelector(selectNationwide);
  const showTerritorySection =
    accessPoint === 'territory' || accessPoint === 'both';

  if (!showTerritorySection) return null;

  return (
    <SectionCard sx={{ gap: '31px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationOnIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
        <Typography
          variant="body2"
          sx={{ color: 'common.neutralBlack' }}
          fontWeight={600}
        >
          Sedi
        </Typography>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={nationwide}
            size="medium"
            onChange={(e) => dispatch(setNationwide(e.target.checked))}
          />
        }
        label={
          <Typography variant="body2" fontWeight={600}>
            Su tutto il territorio nazionale
          </Typography>
        }
        sx={{ ml: 0, gap: 1 }}
      />

      {!nationwide && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
        >
          Aggiungi sedi
        </Button>
      )}
    </SectionCard>
  );
}
