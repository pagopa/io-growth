import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useNavigate } from 'react-router-dom';
import { DiscoveryListItem } from '../../../components/DiscoveryListItem';
import { useSearchEntitiesQuery } from '../../../features/entities/api';
import type { EntitySearchItem } from '../../../features/entities/types';

function SearchResultsSkeleton() {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: '#555C70',
          letterSpacing: '0.08em',
          mb: 1,
        }}
      >
        RISULTATI
      </Typography>
      {[0, 1, 2].map((i) => (
        <Box key={i}>
          {i > 0 ? <Divider /> : null}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="rounded"
                width={120}
                height={13}
                sx={{ borderRadius: 99, mb: 1 }}
              />
              <Skeleton
                variant="rounded"
                width={160}
                height={13}
                sx={{ borderRadius: 99 }}
              />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function SearchResults({
  total,
  items,
  onItemPress,
}: {
  total: number;
  items: EntitySearchItem[];
  onItemPress: (id: string) => void;
}) {
  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: '#555C70',
            letterSpacing: '0.08em',
          }}
        >
          RISULTATI
        </Typography>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '100px',
            backgroundColor: '#E7ECFC',
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
            color: '#555C70',
            lineHeight: 1,
          }}
        >
          {total}
        </Box>
      </Box>
      {items.map((item, i) => (
        <Box key={item.id}>
          {i > 0 ? <Divider /> : null}
          <DiscoveryListItem
            variant="simple"
            title={item.name}
            subtitle={item.address}
            onClick={() => onItemPress(item.id)}
            sx={{ bgcolor: 'white', px: 0 }}
          />
        </Box>
      ))}
    </Box>
  );
}

export function EntitySearch() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isFetching } = useSearchEntitiesQuery(debouncedQuery, {
    skip: debouncedQuery.length < 3,
  });

  const showClearButton = isSearchActive || query.length > 0;
  const isLoading =
    query.length >= 3 && (query !== debouncedQuery || isFetching);
  const showResults =
    !isLoading &&
    query.length >= 3 &&
    debouncedQuery.length >= 3 &&
    data != null;

  const handleCancel = () => {
    setQuery('');
    setDebouncedQuery('');
    setIsSearchActive(false);
    inputRef.current?.blur();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <TextField
          className="SearchTextField"
          inputRef={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsSearchActive(true)}
          onBlur={() => {
            if (!query) {
              setIsSearchActive(false);
            }
          }}
          label="Cerca per città, struttura o ente"
          variant="outlined"
          fullWidth
          size="small"
          InputLabelProps={{
            shrink: isSearchActive || query.length > 0,
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon
                  className="SearchInputIcon"
                  aria-hidden="true"
                />
              </InputAdornment>
            ),
            endAdornment: showClearButton ? (
              <InputAdornment position="end">
                <IconButton
                  className="SearchClearButton"
                  aria-label="Cancella ricerca"
                  edge="end"
                  size="small"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery('');
                    setDebouncedQuery('');
                    inputRef.current?.focus();
                  }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{ flex: 1 }}
        />

        {isSearchActive ? (
          <Button
            className="SearchCancelButton"
            variant="text"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleCancel}
          >
            Annulla
          </Button>
        ) : null}
      </Box>

      {isLoading ? (
        <SearchResultsSkeleton />
      ) : showResults ? (
        <SearchResults
          total={data.total}
          items={data.items}
          onItemPress={(id) => navigate(`/enti/${id}`)}
        />
      ) : isSearchActive ? (
        <Box
          sx={{
            minHeight: 296,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                mx: 'auto',
                mb: 2.5,
              }}
            >
              <svg width="31" height="43" viewBox="0 0 31 43" fill="none">
                <path
                  d="M30.3333 15.0403C30.2442 11.135 28.6743 7.40945 25.9415 4.61817C23.2087 1.82688 19.5172 0.178427 15.6147 0.00661852C13.5856 -0.0533442 11.5651 0.294638 9.67296 1.02994C7.78083 1.76525 6.05557 2.87291 4.59942 4.28728C3.14327 5.70165 1.98587 7.39395 1.19581 9.26388C0.405752 11.1338 -0.000884355 13.1433 1.44408e-06 15.1733C0.241953 19.3522 1.9738 23.306 4.88134 26.3173C6.63803 28.0166 7.77773 30.2533 8.12 32.6733H22.2133C22.5181 30.2871 23.6276 28.0763 25.3587 26.406C28.4083 23.3923 30.1884 19.3253 30.3333 15.0403Z"
                  fill={theme.palette.common.searchDecorativeBlue}
                />
                <path
                  d="M16.9168 32.6731V24.0631L21.0701 19.9098C21.3792 19.5781 21.5475 19.1393 21.5395 18.6859C21.5315 18.2326 21.3479 17.8 21.0272 17.4794C20.7066 17.1587 20.274 16.9751 19.8207 16.9671C19.3673 16.9591 18.9285 17.1274 18.5968 17.4365L15.1668 20.8665L11.7368 17.4365C11.405 17.1274 10.9663 16.9591 10.5129 16.9671C10.0595 16.9751 9.62697 17.1587 9.30633 17.4794C8.9857 17.8 8.80204 18.2326 8.79404 18.6859C8.78604 19.1393 8.95433 19.5781 9.26345 19.9098L13.4168 24.0631V32.6731H8.12012C8.14112 32.9181 8.16678 33.1631 8.16678 33.4245V35.0065C8.09708 35.9436 8.23033 36.8847 8.55746 37.7656C8.88459 38.6465 9.39789 39.4465 10.0624 40.1109C10.7268 40.7754 11.5268 41.2887 12.4077 41.6158C13.2886 41.9429 14.2297 42.0762 15.1668 42.0065C16.1039 42.0762 17.045 41.9429 17.9259 41.6158C18.8068 41.2887 19.6068 40.7754 20.2712 40.1109C20.9357 39.4465 21.449 38.6465 21.7761 37.7656C22.1032 36.8847 22.2365 35.9436 22.1668 35.0065V33.4128C22.1668 33.1538 22.1901 32.9158 22.2111 32.6731H16.9168Z"
                  fill={theme.palette.common.primaryButton}
                />
              </svg>
            </Box>

            <Typography
              component="h1"
              sx={{
                mb: 1.5,
                color: theme.palette.common.searchText,
                fontSize: 26,
                lineHeight: 1.15,
                fontWeight: 700,
              }}
            >
              Inizia a cercare
            </Typography>
            <Typography
              sx={{
                color: theme.palette.common.searchTextSecondary,
                fontSize: 17,
                lineHeight: 1.35,
                fontWeight: 400,
              }}
            >
              Prova a cercare una città, una struttura o un ente.
            </Typography>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
