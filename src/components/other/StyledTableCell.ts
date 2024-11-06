import { styled } from "@mui/system";
import { TableCell } from "@mui/material";

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: 1,
  borderBottomStyle: "solid",
  borderColor: theme.palette.divider,
  overflow: "hidden",
  padding: 5,
}));
