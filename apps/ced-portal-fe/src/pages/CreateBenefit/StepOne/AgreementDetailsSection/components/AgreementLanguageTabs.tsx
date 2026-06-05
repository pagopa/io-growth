import { Tab, Tabs } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import { AGREEMENT_LANGUAGE_TABS } from '../../AgreementCompanionSection/utils/agreementLanguageTabs.config';
import { setActiveLanguage } from '../../../../../features/opportunityCreation/opportunityCreationSlice';
import { LocalizedMetadataItemLanguage } from '../../../../../core/api/generated/model';
import { selectActiveFormLanguage } from '../../../../../features/opportunityCreation/selectors';

export function AgreementLanguageTabs() {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveFormLanguage);

  return (
    <Tabs
      value={activeLanguage}
      onChange={(_event, value: LocalizedMetadataItemLanguage) =>
        dispatch(setActiveLanguage(value))
      }
      variant="scrollable"
      scrollButtons="auto"
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      {AGREEMENT_LANGUAGE_TABS.map((tab) => (
        <Tab key={tab.id} value={tab.id} label={tab.label} sx={{ px: 2.5 }} />
      ))}
    </Tabs>
  );
}
