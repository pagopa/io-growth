import { Box, Divider, Skeleton as MUISkeleton } from "@mui/material";

type Props = {
  length?: number;
  includeMargin?: boolean;
};

export const Skeleton = ({ length = 3, includeMargin = false }: Props) => (
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
            <MUISkeleton
              variant="rounded"
              width={140}
              height={18}
              sx={{ borderRadius: 99, mb: 0.5 }}
            />
            <MUISkeleton
              variant="rounded"
              width={200}
              height={17}
              sx={{ borderRadius: 99 }}
            />
          </Box>
          <MUISkeleton variant="circular" width={24} height={24} />
        </Box>
      </Box>
    ))}
  </Box>
);
