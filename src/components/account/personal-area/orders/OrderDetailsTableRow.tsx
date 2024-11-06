"use client";

import { Checkbox, TableRow, Typography } from "@mui/material";
import { StyledTableCell } from "@/components/other/StyledTableCell";
import { TicketsFormatDate } from "@/components/account/personal-area/_helpers";

export default function OrderDetailsTableRow({
  item,
  checked,
  onCheckboxChange,
}: {
  item?: any | null;
  checked: boolean;
  onCheckboxChange: () => void;
}) {
  const itemRewardVal = item.serFee == 15 ? 5 * 84.28 : item.serFee == 25 ? 10 * 84.28 : 0;

  return (
    <TableRow
      key={item?.id}
      onClick={onCheckboxChange}
      sx={{
        height: 8,
        transition: "background-color 0.3s ease",
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          cursor: "pointer",
        },
      }}
    >
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Checkbox checked={checked} />
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography sx={{ whiteSpace: "nowrap" }}>{item?.service?.name}</Typography>
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography sx={{ whiteSpace: "nowrap" }}>{TicketsFormatDate(item.tIsDate)}</Typography>
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography sx={{ whiteSpace: "nowrap" }}>{item.numberInvoice}</Typography>
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography sx={{ whiteSpace: "nowrap" }}>{item.tNumber}</Typography>
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography>{item.srvcStatus}</Typography>
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography sx={{ whiteSpace: "nowrap" }}>
          {item.name} {item.pSurname}
        </Typography>
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography>{item.unitPrice}</Typography>
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography>{item.serFee * 84.28}</Typography>
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography>{itemRewardVal}</Typography>
      </StyledTableCell>

      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography sx={{ whiteSpace: "nowrap" }}>не оплачен</Typography>
      </StyledTableCell>
    </TableRow>
  );
}
