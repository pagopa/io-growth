import { Box, Stack } from '@mui/material';
import { styled } from '@mui/system';

export const StyledDots = styled(Box)`
  cursor: none;

  &.inactive {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: transparent;
    border: 1px solid #5c6f82;
  }

  &.active {
    width: 16px;
    height: 4px;
    border-radius: 15px;
    background-color: #0073e6;
    border: none;
  }
`;

export const CarouselContainer = styled(Stack)({
  width: '100%',
  overflow: 'hidden',
  paddingBottom: 8,
});

export const ScrollArea = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  overflowX: 'auto',
  scrollSnapType: 'x mandatory',
  WebkitOverflowScrolling: 'touch',
  scrollBehavior: 'smooth',
  width: '100%',
  columnGap: '16px',
  scrollbarWidth: 'none', // Firefox
  '&::-webkit-scrollbar': {
    display: 'none', // Chrome, Safari
  },
});

export const SlideBox = styled(Box)({
  flexShrink: 0,
  flex: '0 0 80%',
  scrollSnapAlign: 'start',
});
