import { SnackbarProvider } from "notistack";
import { styled } from "@mui/system";
import { MaterialDesignContent } from "notistack";

const StyledMaterialDesignContent = styled(MaterialDesignContent)(() => ({
  "&.notistack-MuiContent-success": {
    fontFamily: "__Inter_35e491",
  },
  "&.notistack-MuiContent-error": {
    fontFamily: "__Inter_35e491",
  },
  "&.notistack-MuiContent-warning": {
    fontFamily: "__Inter_35e491",
  },
}));

export default function Snackbar({ duration = 3000 }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={duration}
      Components={{
        success: StyledMaterialDesignContent,
        error: StyledMaterialDesignContent,
        warning: StyledMaterialDesignContent,
      }}
    ></SnackbarProvider>
  );
}
