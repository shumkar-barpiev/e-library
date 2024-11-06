import React from "react";
import { styled } from "@mui/system";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";

const CustomTypography = styled(Typography)({
  fontWeight: 700,
  color: "#005DAA", // Adjust this color as needed
});

const StyledTableCell = styled(TableCell)({
  border: "1px solid #E0E0E0", // Border for cell
  padding: "8px",
  fontSize: "14px",
});

const StyledTableRow = styled(TableRow)({
  "&:nth-of-type(odd)": {
    backgroundColor: "#F5F5F5", // Light grey for odd rows
  },
});

const HeaderRow = styled(TableRow)({
  backgroundColor: "#E9F6FF", // Light blue background for header
});

type PropsType = {
  total: Record<string, any>[] | null;
  serFee: Record<string, any>[] | null;
  commission: Record<string, any>[] | null;
};

function UserTicketsListInfoCard({ total, serFee, commission }: PropsType) {
  // Function to format a row of amounts
  const formatRow = (items: Record<string, any>[] | null) => {
    return items?.map((item) => item.amount) || [];
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table aria-label="amounts table">
          <TableHead>
            <HeaderRow>
              <StyledTableCell>
                <CustomTypography variant="body1"> </CustomTypography>
              </StyledTableCell>
              <StyledTableCell align="center">
                <CustomTypography variant="body1">USD</CustomTypography>
              </StyledTableCell>
              <StyledTableCell align="center">
                <CustomTypography variant="body1">KGS</CustomTypography>
              </StyledTableCell>
              <StyledTableCell align="center">
                <CustomTypography variant="body1">EUR</CustomTypography>
              </StyledTableCell>
              <StyledTableCell align="center">
                <CustomTypography variant="body1">RUB</CustomTypography>
              </StyledTableCell>
              <StyledTableCell align="center">
                <CustomTypography variant="body1">KZT</CustomTypography>
              </StyledTableCell>
            </HeaderRow>
          </TableHead>
          <TableBody>
            {/* Total Row */}
            <StyledTableRow>
              <StyledTableCell component="th" scope="row">
                <CustomTypography variant="body1">Total</CustomTypography>
              </StyledTableCell>
              {formatRow(total).map((amount, index) => (
                <StyledTableCell key={index} align="center">
                  {amount}
                </StyledTableCell>
              ))}
            </StyledTableRow>

            {/* Service Fee Row */}
            <StyledTableRow>
              <StyledTableCell component="th" scope="row">
                <CustomTypography variant="body1">Service Fee</CustomTypography>
              </StyledTableCell>
              {formatRow(serFee).map((amount, index) => (
                <StyledTableCell key={index} align="center">
                  {amount}
                </StyledTableCell>
              ))}
            </StyledTableRow>

            {/* Commission Row */}
            <StyledTableRow>
              <StyledTableCell component="th" scope="row">
                <CustomTypography variant="body1">Commission</CustomTypography>
              </StyledTableCell>
              {formatRow(commission).map((amount, index) => (
                <StyledTableCell key={index} align="center">
                  {amount}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default UserTicketsListInfoCard;
