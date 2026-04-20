import { Tab, Tabs } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../../../hooks';
import { setActiveLanguage } from '../../../../../features/agreementDetailCreation/agreementDetailCreationSlice';
import { AGREEMENT_LANGUAGE_TABS } from '../../AgreementCompanionSection/utils/agreementLanguageTabs.config';
import { selectActiveAgreementLanguage } from '../../../../../features/agreementDetailCreation/selectors';

export function AgreementLanguageTabs() {
  const dispatch = useAppDispatch();
  const activeLanguage = useAppSelector(selectActiveAgreementLanguage);

  return (
    <Tabs
      value={activeLanguage}
      onChange={(_event, value: string) => dispatch(setActiveLanguage(value))}
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
