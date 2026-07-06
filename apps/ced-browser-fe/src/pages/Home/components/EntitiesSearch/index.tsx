import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { useRef, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../../app/routeConfig';
import { useSearchPlacesQuery } from '../../../../features/places/api';
import { useDebounce } from '../../../../hooks/useDebounce';
import { SearchEmptyState } from './SearchEmptyState';
import { SearchInitialState } from './SearchInitialState';
import { SearchResults } from './SearchResults';
import { SearchResultsSkeleton } from './SearchResultsSkeleton';

type EntitiesSearchProps = {
  isSearchActive: boolean;
  setIsSearchActive: (value: boolean) => void;
};

export function EntitiesSearch({
  isSearchActive,
  setIsSearchActive,
}: Readonly<EntitiesSearchProps>) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const trimmedQuery = query.trim();
  const hasMinInputLength = trimmedQuery.length >= 3;
  const shouldRunSearch = isSearchActive && debouncedQuery.trim().length >= 3;

  const { data, isFetching, isError, isSuccess, isUninitialized, refetch } =
    useSearchPlacesQuery(debouncedQuery, {
      skip: !shouldRunSearch,
    });
  const showClearButton = isSearchActive || query.length > 0;

  const handleCancel = () => {
    setQuery('');
    setIsSearchActive(false);
    inputRef.current?.blur();
  };

  const renderPanel = () => {
    if (!isSearchActive) return null;
    if (!hasMinInputLength || isUninitialized) return <SearchInitialState />;

    if (isFetching) return <SearchResultsSkeleton />;

    if (isSuccess && data) {
      if (data.items.length === 0) return <SearchEmptyState />;
    }
    return (
      <SearchResults
        isError={isError}
        onRetry={() => void refetch()}
        total={data?.total}
        items={data?.items}
        query={debouncedQuery}
        onItemPress={(accessPointId) =>
          navigate(
            generatePath(APP_ROUTES.ENTITY_ACCESS_POINT_DETAIL, {
              accessPointId,
            }),
          )
        }
      />
    );
  };
  return (
    <Box>
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
                    setQuery(''); // Only reset the main query.
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

        {isSearchActive && (
          <Button
            className="SearchCancelButton"
            variant="text"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleCancel}
          >
            Annulla
          </Button>
        )}
      </Box>

      {renderPanel()}
    </Box>
  );
}
