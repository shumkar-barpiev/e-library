export const AutocompletePopperProps = {
  popper: { style: { width: "fit-content" } },
  paper: {
    sx: {
      ".MuiAutocomplete-option": {
        display: "block !important",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
      },
    },
  },
};
