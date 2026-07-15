import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Body } from '@pagopa/io-core-ui';
import { PageHeader } from '../../components';
import { useTrackLandedInPage } from '../../mixpanel/useTrackLandedInPage';
import { useCallback } from 'react';
import { trackBrowserEvent } from '../../mixpanel/trackEvent';

interface EuropeanOpportunity {
  country: string;
  url: string;
}

const opportunities: EuropeanOpportunity[] = [
  {
    country: 'Belgio',
    url: 'https://eudisabilitycard.be/en',
  },
  {
    country: 'Finlandia',
    url: 'https://vammaiskortti.fi/en/frontpage/',
  },
  {
    country: 'Estonia',
    url: 'https://www.eesti.ee/eraisik/en/artikkel/disabled-people/determination-of-disability/disability-card',
  },
  {
    country: 'Cipro',
    url: 'https://www.eudisabilitycard.gov.cy/en/home',
  },
  {
    country: 'Malta',
    url: 'https://www.eudisabilitycard.org.mt/',
  },
  {
    country: 'Romania',
    url: 'http://www.dizab.eurocard.gov.ro/?lang=en',
  },
  {
    country: 'Slovenia',
    url: 'https://invalidska-kartica.si/en/',
  },
];

export default function EuropeanOpportunitiesPage() {
  useTrackLandedInPage('CED_EUROPE_OPPORTUNITY_LIST');

  const euOpportunityClick = useCallback(
    ({ url, country }: { url: string; country: string }) => {
      trackBrowserEvent('CED_EUROPE_COUNTRY_SELECTED', {
        country_selected: country,
      });
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [],
  );

  if (opportunities.length === 0) {
    return (
      <Box>
        <PageHeader
          title="Opportunità in Europa"
          subtitle="Nessuna opportunità disponibile al momento."
        />
      </Box>
    );
  }
  // TODO: after backed implementation, handle loading and error states, and fetch the opportunities from the backend instead of using a static list.
  // if (isError) {
  //   <WarningBanner
  //     title="C’è stato un problema nel caricamento delle opportunità."
  //     action={{
  //       label: 'Ricarica',
  //       onClick: () => void refetch(),
  //     }}
  //   />;
  // }

  return (
    <Box>
      <PageHeader
        title="Opportunità in Europa"
        subtitle="Puoi accedere alle opportunità anche in questi Paesi, presentando la versione fisica della tua Carta Europea della Disabilità."
      />
      <Box sx={{ px: 2 }}>
        <List disablePadding>
          {opportunities.map(({ url, country }, index) => (
            <Box key={country}>
              <ListItem disablePadding>
                <ListItemButton sx={{ py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <OpenInNewIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Body
                        onClick={() => euOpportunityClick({ url, country })}
                        fontWeight="Semibold"
                        asLink
                      >
                        {country}
                      </Body>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < opportunities.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Box>
    </Box>
  );
}
