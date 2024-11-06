import ChatBox from "@/components/chat/ChatBox";
import Contacts from "@/components/chat/Contacts";
import { Box, Grid } from "@mui/material";

export default function Chat() {
  return (
    <Box sx={{ maxWidth: "fixed" }}>
      <Grid container flexWrap="nowrap" sx={{ px: "8px" }}>
        <Grid item sx={{ minWidth: "350px", maxWidth: "350px" }}>
          <Contacts />
        </Grid>
        <Grid item flexGrow={1}>
          <ChatBox order={false} chatId={null} page="/chat" />
        </Grid>
      </Grid>
    </Box>
  );
}
