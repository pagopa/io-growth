import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toEntityAccessPointDetailRoute } from '../../../../app/routeConfig';
import { useSearchPlacesQuery } from '../../../../features/places/api';
import { useDebounce } from '../../../../hooks/useDebounce';
import { SearchEmptyState } from './SearchEmptyState';
import { SearchInitialState } from './SearchInitialState';
import { SearchResults } from './SearchResults';
import { SearchResultsSkeleton } from './SearchResultsSkeleton';
import { PlaceSearchItem } from '../../../../core/api/generated/model';
import { RecentSearches } from './RecentSearches';
import { trackBrowserEvent } from '../../../../mixpanel/trackEvent';

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

  const [recentSearches, setRecentSearches] = useState<PlaceSearchItem[]>(() =>
    JSON.parse(sessionStorage.getItem('search_history') || '[]'),
  );

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);
  const trimmedQuery = query.trim();
  const hasMinInputLength = trimmedQuery.length >= 3;
  const shouldRunSearch = isSearchActive && debouncedQuery.trim().length >= 3;
  const hasTrackedSearchPageView = useRef(false);

  const { data, isFetching, isError, isSuccess, isUninitialized, refetch } =
    useSearchPlacesQuery(debouncedQuery, {
      skip: !shouldRunSearch,
    });

  useEffect(() => {
    if (!isSearchActive) {
      hasTrackedSearchPageView.current = false;
      return;
    }

    if (!hasTrackedSearchPageView.current) {
      trackBrowserEvent('CED_SEARCH_PAGE', { event_type: 'screen_view' });
      hasTrackedSearchPageView.current = true;
    }
  }, [isSearchActive]);

  useEffect(() => {
    // event tracking after debouncedQuery changes
    if (shouldRunSearch && hasMinInputLength) {
      trackBrowserEvent('CED_SEARCH_INPUT', {
        search_term: debouncedQuery,
      });
    }
  }, [debouncedQuery, shouldRunSearch, hasMinInputLength]);

  useEffect(() => {
    // event tracking search completed after api response
    if (data) {
      trackBrowserEvent('CED_SEARCH_RESULT_PAGE', {
        search_term: debouncedQuery,
        results_count: data?.total,
      });
    }
  }, [debouncedQuery, data]);

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
        sessionStorage.setItem(
          'search_history',
          JSON.stringify(updatedRecentSearches),
        );
      }
      trackBrowserEvent('CED_SEARCH_RESULTS_TAPPED', {
        type: selectedItem?.type,
        location_name: selectedItem?.name,
        organization_name: selectedItem?.entityId,
        // The API currently returns the entity identifier rather than the display name.
        city_name: selectedItem?.address?.city,
      });
      navigate(toEntityAccessPointDetailRoute(accessPointId), {
        state: { source: 'search_result' },
      });
    },
    [data?.items, navigate, recentSearches],
  );

  const handleRemoveSearch = useCallback(
    (idToRemove: string) => {
      const updatedSearches = recentSearches.filter(
        (item) => item.id !== idToRemove,
      );
      setRecentSearches(updatedSearches);
      sessionStorage.setItem('search_history', JSON.stringify(updatedSearches));

      // If we've removed the last recent search, refocus the search input
      if (updatedSearches.length === 0) {
        setIsSearchActive(true);
        inputRef.current?.focus();
      }
    },
    [recentSearches, setIsSearchActive],
  );

  const handleResetSearchHistory = useCallback(() => {
    setRecentSearches([]);
    sessionStorage.setItem('search_history', JSON.stringify([]));
    inputRef.current?.focus();
  }, []);

  const onBlur = useCallback(() => {
    if (!query && recentSearches.length === 0) {
      setIsSearchActive(false);
    }
  }, [query, recentSearches, setIsSearchActive]);

  const onFocus = useCallback(() => {
    trackBrowserEvent('CED_SEARCH_START', { event_type: 'tap' });
    setIsSearchActive(true);
  }, [setIsSearchActive]);

  const renderPanel = () => {
    if (!isSearchActive) return null;

    if (recentSearches.length > 0 && !hasMinInputLength)
      return (
        <RecentSearches
          items={recentSearches}
          onItemPress={handleItemPress}
          onResetHistory={handleResetSearchHistory}
          onRemoveSearchElement={handleRemoveSearch}
        />
      );
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
        onItemPress={handleItemPress}
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
          onFocus={onFocus}
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
