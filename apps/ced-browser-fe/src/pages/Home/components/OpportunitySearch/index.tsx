import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useNavigate } from 'react-router-dom';
import { useSearchEntitiesQuery } from '../../../../features/entities/api';
import { SearchEmptyState } from './SearchEmptyState';
import { SearchInitialState } from './SearchInitialState';
import { SearchResults } from './SearchResults';
import { SearchResultsSkeleton } from './SearchResultsSkeleton';

type OpportunitySearchProps = {
  isSearchActive: boolean;
  setIsSearchActive: (value: boolean) => void;
};
export function OpportunitySearch({
  isSearchActive,
  setIsSearchActive,
}: OpportunitySearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
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
    !isLoading && query.length >= 3 && data != null && data.items.length > 0;
  const showEmpty =
    !isLoading && query.length >= 3 && data != null && data.items.length === 0;

  const handleCancel = () => {
    setQuery('');
    setDebouncedQuery('');
    setIsSearchActive(false);
    inputRef.current?.blur();
  };

  const renderPanel = () => {
    if (isLoading) return <SearchResultsSkeleton />;
    if (showResults)
      return (
        <SearchResults
          total={data.total}
          items={data.items}
          query={debouncedQuery}
          onItemPress={(id) => navigate(`/enti/${id}`)}
        />
      );
    if (showEmpty) return <SearchEmptyState />;
    if (isSearchActive) return <SearchInitialState />;
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
