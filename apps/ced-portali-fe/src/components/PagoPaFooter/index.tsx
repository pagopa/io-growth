import { FooterLegal, FooterPostLogin } from '@pagopa/mui-italia';
import { Box, Typography } from '@mui/material';
import {
  footerCompanyLink,
  footerPostLoginLinks,
  languages,
} from './constants';

const legalContent = (
  <Typography variant="body2">
    <Box component="span" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
      PagoPA S.p.A.
    </Box>{' '}
    - Societa per azioni con socio unico - Capitale sociale di euro 1,000,000
    interamente versato - Sede legale in Roma, Piazza Colonna 370, CAP 00187 -
    N. di iscrizione a Registro Imprese di Roma, CF e P.IVA 15376371009
  </Typography>
);

export const Footer = () => {
  return (
    <Box component="footer">
      <FooterPostLogin
        companyLink={footerCompanyLink}
        links={footerPostLoginLinks}
        languages={languages}
        currentLangCode="it"
        onLanguageChanged={() => undefined}
      />
      <FooterLegal content={legalContent} />
    </Box>
  );
};
