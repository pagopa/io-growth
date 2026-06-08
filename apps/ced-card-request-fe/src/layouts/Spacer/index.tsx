import { Box } from '@mui/material';
import { useMemo } from 'react';

type SpacingScale =
  | 4
  | 6
  | 8
  | 12
  | 16
  | 20
  | 24
  | 28
  | 32
  | 40
  | 48
  | 56
  | 64
  | 72
  | 80
  | 96;

type BaseSpacerProps = {
  orientation: 'vertical' | 'horizontal';
  size: SpacingScale;
};

const DEFAULT_SIZE = 16;

const Spacer = ({ orientation, size }: BaseSpacerProps) => {
  const style = useMemo(
    () => ({
      ...(orientation === 'vertical' && {
        height: size,
      }),
      ...(orientation === 'horizontal' && {
        width: size,
      }),
    }),
    [orientation, size],
  );

  return <Box style={style} />;
};

export const HSpacer = ({ size = DEFAULT_SIZE }: { size?: SpacingScale }) => (
  <Spacer orientation={'horizontal'} size={size} />
);

export const VSpacer = ({ size = DEFAULT_SIZE }: { size?: SpacingScale }) => (
  <Spacer orientation={'vertical'} size={size} />
);
