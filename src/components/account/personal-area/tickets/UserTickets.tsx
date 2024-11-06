import React from "react";
import { Box, Card } from "@mui/material";
import { UserTicketsTabbar } from "@/components/account/personal-area/tickets/UserTicketsTabbar";

export const INITIAL = {
  fields: [
    "tot",
    "com",
    "opera",
    "sales",
    "docNum",
    "docIss",
    "valCar",
    "recLoc",
    "lasNam",
    "serFee",
    "status",
    "invNum",
    "serFee",
    "firName",
    "totCur",
    "account",
    "serFeeCur",
    "comAmount",
    "createdOn",
    "statusOneC",
    "comCurrency",
  ],
};

function UserTickets() {
  return (
    <>
      <Box sx={{ height: "100%", width: "100%" }}>
        <Card sx={{ p: 1 }}>
          <UserTicketsTabbar />
        </Card>
      </Box>
    </>
  );
}

export default UserTickets;
