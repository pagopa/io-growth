import { Box, Stack } from '@mui/material';
import { styled } from '@mui/system';

export const StyledDots = styled(Box)`
  appearance: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #0073e6;
    outline-offset: 2px;
  }

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
