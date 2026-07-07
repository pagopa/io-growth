import { useCallback, useRef, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { generatePath, useNavigate } from 'react-router-dom';
import { SearchEmptyState } from './SearchEmptyState';
import { SearchInitialState } from './SearchInitialState';
import { SearchResults } from './SearchResults';
import { SearchResultsSkeleton } from './SearchResultsSkeleton';
import { useDebounce } from '../../../../hooks/useDebounce';
import { APP_ROUTES } from '../../../../app/routeConfig';
import { useSearchPlacesQuery } from '../../../../features/places/api';
import { PlaceSearchItem } from '../../../../core/api/generated/model';
import { RecentSearches } from './RecentSearches';

type EntitiesSearchProps = {
  isSearchActive: boolean;
  setIsSearchActive: (value: boolean) => void;
};

export function EntitiesSearch({
  isSearchActive,
  setIsSearchActive,
}: EntitiesSearchProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [recentSearches, setRecentSearches] = useState<PlaceSearchItem[]>(
    () => {
      const saved = localStorage.getItem('search_history');
      return saved ? JSON.parse(saved) : [];
    },
  );

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  const hasMinQueryLength = query.length >= 3;
  const isDebouncing = query !== debouncedQuery;

  const { data, isFetching } = useSearchPlacesQuery(debouncedQuery, {
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

  const handleItemPress = useCallback(
    (accessPointId: string) => {
      const selectedItem = data?.items.find(
        (item) => item.id === accessPointId,
      );
      if (selectedItem) {
        const updatedRecentSearches = [
          selectedItem,
          ...recentSearches.filter((item) => item.id !== accessPointId),
        ].slice(0, 5);
        setRecentSearches(updatedRecentSearches);
        localStorage.setItem(
          'search_history',
          JSON.stringify(updatedRecentSearches),
        );
      }
      navigate(
        generatePath(APP_ROUTES.ENTITY_ACCESS_POINT_DETAIL, {
          accessPointId,
        }),
      );
    },
    [data?.items, navigate, recentSearches],
  );

  const handleRemoveSearch = useCallback(
    (idToRemove: string) => {
      const updatedSearches = recentSearches.filter(
        (item) => item.id !== idToRemove,
      );
      setRecentSearches(updatedSearches);
      localStorage.setItem('search_history', JSON.stringify(updatedSearches));

      // If we've removed the last recent search, refocus the search input
      if (updatedSearches.length === 0) {
        setIsSearchActive(true);
        inputRef.current?.focus();
      }
    },
    [recentSearches, setIsSearchActive],
  );

  const onBlur = useCallback(() => {
    if (!query && recentSearches.length === 0) {
      setIsSearchActive(false);
    }
  }, [query, recentSearches, setIsSearchActive]);

  const renderPanel = () => {
    if (!isSearchActive) return null;

    if (isLoading) return <SearchResultsSkeleton />;
    if (showResults) {
      return (
        <SearchResults
          total={data.total}
          items={data.items}
          query={debouncedQuery}
          onItemPress={handleItemPress}
        />
      );
    }
    if (recentSearches.length > 0 && !hasMinQueryLength)
      return (
        <RecentSearches
          items={recentSearches}
          onItemPress={handleItemPress}
          onRemoveSearchElement={handleRemoveSearch}
        />
      );
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
          onBlur={onBlur}
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
