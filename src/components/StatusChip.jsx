import { Chip } from "@mui/material";
import {
  CheckCircle,
  Error,
  Help,
  Warning,
} from "@mui/icons-material";

const config = {
  UP: {
    label: "Up",
    color: "success",
    icon: <CheckCircle />,
  },
  DOWN: {
    label: "Down",
    color: "error",
    icon: <Error />,
  },
  DEGRADED: {
    label: "Degraded",
    color: "warning",
    icon: <Warning />,
  },
  UNKNOWN: {
    label: "Unknown",
    color: "default",
    icon: <Help />,
  },
};

function StatusChip({ status = "UNKNOWN", size = "small" }) {
  const item = config[status] || config.UNKNOWN;

  return (
    <Chip
      size={size}
      color={item.color}
      icon={item.icon}
      label={item.label}
      sx={{
        minWidth: 96,
        justifyContent: "flex-start",
        fontWeight: 700,
      }}
    />
  );
}

export default StatusChip;