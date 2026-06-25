import { Typography, useTheme } from "@mui/material";
import type { TypographyProps } from "@mui/material/Typography";

const titleStyles = {
  XXL: {
    size: "36px",
    lineHeight: "50px",
  },
  XL: {
    size: "32px",
    lineHeight: "48px",
  },
  LG: {
    size: "28px",
    lineHeight: "40px",
  },
  MD: {
    size: "24px",
    lineHeight: "36px",
  },
  SM: {
    size: "20px",
    lineHeight: "32px",
  },
  XS: {
    size: "18px",
    lineHeight: "28px",
  },
} as const;

type Variant = keyof typeof titleStyles;

type TitleProps = {
  text: string;
  variant: Variant;
  fontWeight?: TypographyProps["fontWeight"];
};

export const Title = ({ text, variant, fontWeight = 600 }: TitleProps) => {
  const theme = useTheme();
  return (
    <Typography
      sx={{
        fontWeight,
        fontSize: titleStyles[variant].size,
        lineHeight: titleStyles[variant].lineHeight,
        color: theme.palette.common.neutralBlack,
      }}
    >
      {text}
    </Typography>
  );
};

const fontWeights = {
  Thin: "200",
  Light: "300",
  Regular: "400",
  Medium: "500",
  Semibold: "600",
  Bold: "700",
  Black: "900",
};

type BodyFontSizes =
  | "12px"
  | "14px"
  | "16px"
  | "20px"
  | "22px"
  | "26px"
  | "28px"
  | "32px";

type BaseBodyProps = {
  fontWeight?: keyof typeof fontWeights;
  fontSize?: BodyFontSizes;
  children?: React.ReactNode;
};

type BodyProps =
  | (BaseBodyProps & {
      asLink: true;
      onClick: () => void;
      avoidTextDecoration?: boolean;
    })
  | (BaseBodyProps & {
      asLink?: false;
      onClick?: never;
      avoidTextDecoration?: false;
    });

export const Body = ({
  children,
  fontWeight = "Regular",
  fontSize = "16px",
  asLink = false,
  avoidTextDecoration = false,
  onClick,
}: BodyProps) => {
  const { palette } = useTheme();
  return (
    <Typography
      onClick={onClick}
      sx={{
        fontSize,
        lineHeight: "24px",
        fontWeight: fontWeights[fontWeight],
        color: asLink
          ? palette.common.linkColor
          : fontWeight === "Regular"
            ? palette.common.neutralDarkGray
            : palette.common.neutralBlack,
        textDecoration: asLink && !avoidTextDecoration ? "underline" : "none",
      }}
    >
      {children}
    </Typography>
  );
};

export const ErrorBody = (props: Omit<BodyProps, "asLink">) => {
  const theme = useTheme();

  return (
    <Typography
      sx={{
        fontSize: props.fontSize || "16px",
        lineHeight: "24px",
        fontWeight: fontWeights[props.fontWeight || "Regular"],
        color: theme.palette.error.main,
      }}
    >
      {props.children}
    </Typography>
  );
};
