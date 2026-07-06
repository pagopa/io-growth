import { Box, Divider, Skeleton } from "@mui/material";

type Props = {
  length?: number;
  includeMargin?: boolean;
};

export const ListSkeleton = ({ length = 3, includeMargin = false }: Props) => (
  <Box px={includeMargin ? 3 : 0}>
    {Array.from({ length }, (_, i) => (
      <Box key={i}>
        {i > 0 ? <Divider /> : null}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            py: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Skeleton
              variant="rounded"
              width={140}
              height={18}
              sx={{ borderRadius: 99, mb: 0.5 }}
            />
            <Skeleton
              variant="rounded"
              width={200}
              height={17}
              sx={{ borderRadius: 99 }}
            />
          </Box>
          <Skeleton variant="circular" width={24} height={24} />
        </Box>
      </Box>
    ))}
  </Box>
);
