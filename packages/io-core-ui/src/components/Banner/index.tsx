import { Box } from "@mui/material";
import { MIButton } from "@pagopa/mui-italia";
import { VSpacer } from "../Spacer";
import { Body } from "../Typography";

type Props = {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const WarningBanner = ({ title, action }: Props) => (
  <Box
    sx={{
      mx: 3,
      bgcolor: "#F4F5F8",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    }}
  >
    <VSpacer size={16} />
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.5228 3.04651L23.449 16.8605C25.0146 19.5891 23.0575 23 19.9262 23H4.0738C0.942459 23 -1.01463 19.5891 0.551041 16.8605L8.47724 3.04651C10.0429 0.317829 13.9571 0.31783 15.5228 3.04651ZM12.0281 16.5046C12.872 16.5046 13.5562 17.1887 13.5562 18.0326C13.5562 18.8766 12.872 19.5607 12.0281 19.5607C11.1841 19.5607 10.5 18.8766 10.5 18.0326C10.5 17.1887 11.1841 16.5046 12.0281 16.5046ZM12.0281 14.5607H12.0286C12.5964 14.5607 13.0567 14.1004 13.0567 13.5326V5.52809C13.0567 4.96029 12.5964 4.5 12.0286 4.5H12.0281C11.4603 4.5 11 4.96029 11 5.52809V13.5326C11 14.1004 11.4603 14.5607 12.0281 14.5607Z"
        fill="#555C70"
      />
    </svg>

    <VSpacer size={8} />
    <Body fontSize="14px">{title}</Body>
    {action && (
      <>
        <VSpacer size={8} />
        <MIButton variant="text" onClick={action.onClick}>
          {action.label}
        </MIButton>
      </>
    )}
    <VSpacer size={16} />
  </Box>
);
