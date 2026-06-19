import { useRef, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { generatePath } from 'react-router-dom';
import { useSearchEntitiesQuery } from '../../../../features/entities/api';
import { SearchEmptyState } from './SearchEmptyState';
import { SearchInitialState } from './SearchInitialState';
import { SearchResults } from './SearchResults';
import { SearchResultsSkeleton } from './SearchResultsSkeleton';
import { useDebounce } from '../../../../hooks/useDebounce';
import { APP_ROUTES } from '../../../../app/routeConfig';

type EntitiesSearchProps = {
  isSearchActive: boolean;
  setIsSearchActive: (value: boolean) => void;
};

export function EntitiesSearch({
  isSearchActive,
  setIsSearchActive,
}: EntitiesSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  const hasMinQueryLength = query.length >= 3;
  const isDebouncing = query !== debouncedQuery;

  const { data, isFetching } = useSearchEntitiesQuery(debouncedQuery, {
    skip: !hasMinQueryLength,
  });

  const isLoading = hasMinQueryLength && (isDebouncing || isFetching);
  const hasResults = hasMinQueryLength && !!data?.items.length;
  const showResults = !isLoading && hasResults;
  const showInitialState = isSearchActive && !hasMinQueryLength;
  const showEmpty = !isLoading && hasMinQueryLength && !hasResults;
  const showClearButton = isSearchActive || query.length > 0;

  const handleCancel = () => {
    setQuery('');
    setIsSearchActive(false);
    inputRef.current?.blur();
  };

  const renderPanel = () => {
    if (!isSearchActive) return null;

    if (isLoading) return <SearchResultsSkeleton />;
    if (showResults) {
      return (
        <SearchResults
          total={data.total}
          items={data.items}
          query={debouncedQuery}
          onItemPress={(id) => generatePath(APP_ROUTES.ENTITY_DETAIL, { id })}
        />
      );
    }
    if (showInitialState) return <SearchInitialState />;
    if (showEmpty) return <SearchEmptyState />;

    return null;
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
