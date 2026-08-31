import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { PageHeader } from '../../components';

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
          {opportunities.map((opportunity, index) => (
            <Box key={opportunity.country}>
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href={opportunity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${opportunity.country}, si apre in una risorsa esterna`}
                  sx={{ py: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <OpenInNewIcon color="action" aria-hidden />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      // Plain Typography instead of Body: `asLink` prop removed from io-core-ui
                      <Typography
                        sx={{
                          fontSize: '16px',
                          lineHeight: '24px',
                          fontWeight: 600,
                          color: 'common.linkColor',
                          textDecoration: 'underline',
                        }}
                      >
                        {opportunity.country}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
              {index < opportunities.length - 1 && <Divider aria-hidden />}
            </Box>
          ))}
        </List>
      </Box>
    </Box>
  );
}
