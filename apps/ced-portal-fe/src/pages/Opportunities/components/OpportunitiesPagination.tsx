import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
} from '@mui/material';

interface OpportunitiesPaginationProps {
  totalItems: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export const OpportunitiesPagination = ({
  totalItems,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: OpportunitiesPaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ pt: 1 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <InputLabel sx={{ fontSize: 14, color: 'text.secondary' }}>
          Risultati per pagina
        </InputLabel>
        <FormControl size="small">
          <Select
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            sx={{ minWidth: 80, fontSize: 14 }}
          >
            {ROWS_PER_PAGE_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, value) => onPageChange(value)}
        color="primary"
        shape="rounded"
      />
    </Stack>
  );
};
