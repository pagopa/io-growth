import { Box, Stack } from '@mui/material';
import { styled } from '@mui/system';

export const StyledDots = styled('button')(({ theme }) => ({
  appearance: 'none',
  background: 'transparent',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.common.focusRing}`,
    outlineOffset: 2,
  },
  '&.inactive': {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: '1px solid',
    borderColor: theme.palette.common.carouselDotInactive,
  },
  '&.active': {
    width: 16,
    height: 4,
    borderRadius: 15,
    backgroundColor: theme.palette.common.focusRing,
    border: 'none',
  },
}));

export const CarouselContainer = styled(Stack)({
  width: '100%',
  overflow: 'hidden',
  gap: '8px',
});

export const ScrollArea = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  overflowX: 'auto',
  overflowY: 'hidden',
  scrollSnapType: 'x mandatory',
  WebkitOverflowScrolling: 'touch',
  width: '100%',
  columnGap: '16px',
  scrollbarWidth: 'none',
  justifyContent: 'flex-start',
  paddingLeft: 'calc(50% - 105px)',
  paddingRight: 'calc(50% - 105px)',
  height: 'fit-content',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

export const SlideBox = styled(Box)({
  flexShrink: 0,
  flex: '0 0 210px',
  scrollSnapAlign: 'center',
  height: 'fit-content',
  marginBottom: 2,
});
