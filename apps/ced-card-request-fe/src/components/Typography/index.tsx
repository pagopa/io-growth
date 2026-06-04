// eslint-disable-next-line no-restricted-imports
import { Typography } from '@mui/material';

type TitleFontSizes = '36px' | '32px' | '28px' | '24px' | '20px' | '18px';

const titleStyles: Record<
  string,
  { size: TitleFontSizes; lineHeight: string }
> = {
  XXL: {
    size: '36px',
    lineHeight: '50px',
  },
  XL: {
    size: '32px',
    lineHeight: '48px',
  },
  LG: {
    size: '28px',
    lineHeight: '40px',
  },
  MD: {
    size: '24px',
    lineHeight: '36px',
  },
  SM: {
    size: '20px',
    lineHeight: '32px',
  },
  XS: {
    size: '18px',
    lineHeight: '28px',
  },
};

type Variant = keyof typeof titleStyles;

type TitleProps = {
  text: string;
  variant: Variant;
};

export const Title = ({ text, variant }: TitleProps) => (
  <Typography
    sx={{
      fontWeight: 600,
      fontSize: titleStyles[variant].size,
      lineHeight: titleStyles[variant].lineHeight,
    }}
  >
    {text}
  </Typography>
);

const fontWeights = {
  Thin: '200',
  Light: '300',
  Regular: '400',
  Medium: '500',
  Semibold: '600',
  Bold: '700',
  Black: '900',
};

type BodyFontSizes =
  | '12px'
  | '14px'
  | '16px'
  | '20px'
  | '22px'
  | '26px'
  | '28px'
  | '32px';

type BodyProps = {
  fontWeight?: keyof typeof fontWeights;
  fontSize?: BodyFontSizes;
  asLink?: boolean;
  children?: React.ReactNode;
};

export const Body = ({
  children,
  fontWeight = 'Regular',
  fontSize = '16px',
  asLink = false,
}: BodyProps) => (
  <Typography
    sx={{
      fontSize,
      lineHeight: '24px',
      fontWeight: fontWeights[fontWeight],
      color: asLink ? '#007BFF' : '#555C70',
      textDecoration: asLink ? 'underline' : 'none',
    }}
  >
    {children}
  </Typography>
);
