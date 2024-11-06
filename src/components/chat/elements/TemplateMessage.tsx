import { templateButton } from "@/models/chat/chat";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import UndoIcon from "@mui/icons-material/Undo";
import { blue, grey } from "@mui/material/colors";
import PhoneIcon from "@mui/icons-material/Phone";

export default function TemplateMessage({ body }: { body: any }) {
  return (
    <Box>
      <Typography fontSize={13} fontWeight={600} color={grey[800]}>
        {JSON.parse(body).header}
      </Typography>
      <Typography fontSize={11.5}>{JSON.parse(body).body}</Typography>
      <Typography fontSize={11.5} color={grey[600]}>
        {JSON.parse(body).footer}
      </Typography>
      {JSON.parse(body)?.buttons?.map((el: templateButton) => {
        if (el.type === "PHONE_NUMBER") {
          return (
            <Box key={Math.random() * 1000} sx={{ borderTop: "1px solid #e0e0e0", marginTop: "10px" }}>
              <Stack direction="row" justifyContent="center">
                <IconButton sx={{ color: blue[500] }} size="small">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneIcon sx={{ fontSize: 14 }} />
                    <Typography fontSize={12} sx={{}}>
                      {el.text}
                    </Typography>
                  </Stack>
                </IconButton>
              </Stack>
            </Box>
          );
        }
        if (el.type === "URL") {
          return (
            <Box key={Math.random() * 1000} sx={{ borderTop: "1px solid #e0e0e0", marginTop: "10px" }}>
              <Stack direction="row" justifyContent="center">
                <IconButton sx={{ color: blue[500] }} size="small">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LaunchIcon sx={{ fontSize: 14 }} />
                    <Typography fontSize={12} sx={{}}>
                      {el.text}
                    </Typography>
                  </Stack>
                </IconButton>
              </Stack>
            </Box>
          );
        }
        if (el.type === "QUICK_REPLY") {
          return (
            <Box key={Math.random() * 1000} sx={{ borderTop: "1px solid #e0e0e0", marginTop: "10px" }}>
              <Stack direction="row" justifyContent="center">
                <IconButton sx={{ color: blue[500] }} size="small">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <UndoIcon sx={{ fontSize: 14 }} />
                    <Typography fontSize={12} sx={{}}>
                      {el.text}
                    </Typography>
                  </Stack>
                </IconButton>
              </Stack>
            </Box>
          );
        }
      })}
    </Box>
  );
}
