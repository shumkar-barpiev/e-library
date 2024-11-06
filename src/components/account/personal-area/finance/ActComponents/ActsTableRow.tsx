"use client";

import { TableRow, Typography, Box } from "@mui/material";
import { getBadge } from "@/components/other/BadgeComponent";
import { StyledTableCell } from "@/components/other/StyledTableCell";
import { ActsFormatDate } from "@/components/account/personal-area/_helpers";
import ShowDetails from "@/components/account/personal-area/finance/ActsDone/ShowDetails";
import EditDetails from "@/components/account/personal-area/finance/ActsInProgress/EditDetails";
import ActDetailsSave from "@/components/account/personal-area/finance/ActComponents/ActDetailsSave";
import ActDetailsDelete from "@/components/account/personal-area/finance/ActComponents/ActDetailsDelete";

type PropsType = {
  item?: any | null;
  tableType: string;
};

export default function ActsTableRow({ item, tableType }: PropsType) {
  return (
    <TableRow
      key={item?.id}
      sx={{
        height: 8,
      }}
    >
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography sx={{ whiteSpace: "nowrap" }}>{item?.id}</Typography>
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography sx={{ whiteSpace: "nowrap" }}>{item.organization.name}</Typography>
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        <Typography sx={{ whiteSpace: "nowrap" }}>
          по {ActsFormatDate(item.startDate)} - {ActsFormatDate(item.endDate)}
        </Typography>
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        {getBadge(`${item.status}`)}
      </StyledTableCell>
      <StyledTableCell sx={{ padding: "3px", fontSize: "10px", textAlign: "center" }}>
        {tableType === "done" ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShowDetails act={item} />
            <ActDetailsSave showOnlyDownload={true} act={item} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EditDetails act={item} />
            <ActDetailsDelete actId={item.id} />
          </Box>
        )}
      </StyledTableCell>
    </TableRow>
  );
}
