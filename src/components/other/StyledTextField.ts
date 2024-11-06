import { styled } from "@mui/system";
import { TextField } from "@mui/material";

export const StyledTextField = styled(TextField)({
  "& .MuiInputBase-input": {
    fontSize: "0.6964285714285714rem",
    lineHeight: "1.5",
    maxWidth: "200px",
    fontWeight: "bold",
  },
  "& .MuiInput-underline:before": {
    borderBottomColor: "transparent",
  },
});
