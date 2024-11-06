"use client";
import { Box, Chip, IconButton, TextField, Autocomplete, CircularProgress, Menu, MenuItem } from "@mui/material";
import { HTMLAttributes, useEffect, useRef, useState } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { AutocompleteRenderGetTagProps } from "@mui/material/Autocomplete/Autocomplete";
import { NestedMenuItem } from "mui-nested-menu";
import { useOrderClientPreferenceStore } from "@/stores/orders/order-client-preferences";
import { TOrderClientPreferenceModel } from "@/models/orders/order-client-preference";
import { TOrderModel } from "@/models/orders/order";
import { useOrderStore } from "@/stores/orders/orders";
import { enqueueSnackbar } from "notistack";

type TTreeViewPreferenceDialogProps = {
  anchorEl: HTMLButtonElement | null;
  treeViewData: TOrderClientPreferenceModel[];
  selectedData: TOrderClientPreferenceModel[];
  handleClose: () => void;
  setSelected: (value: TOrderClientPreferenceModel | TOrderClientPreferenceModel[]) => void;
};

let assignRequestAbortController: AbortController | null = null;

export function ClientPreferenceCard() {
  const orderStore = useOrderStore();
  const orderClientPreferenceStore = useOrderClientPreferenceStore((state) => state);
  const [order, setOrder] = useState<TOrderModel | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [options, setOptions] = useState<TOrderClientPreferenceModel[]>([]);
  const [selected, setSelected] = useState<TOrderClientPreferenceModel[]>([]);
  const [autoCompleteOpen, setAutoCompleteOpen] = useState(false);
  const [treeViewData, setTreeViewData] = useState<TOrderClientPreferenceModel[]>([]);
  const treeViewOpenButton = useRef<HTMLButtonElement>(null);

  async function onSelectPreference(value: TOrderClientPreferenceModel | TOrderClientPreferenceModel[]) {
    if (!order) {
      enqueueSnackbar("Пока заказ не загружен, нельзя выбрать предпочтения", { variant: "error" });
      return;
    }

    if (assignRequestAbortController) {
      assignRequestAbortController?.abort();
    }

    assignRequestAbortController = new AbortController();

    let preferences: TOrderClientPreferenceModel[] = Array.isArray(value) ? value : [value, ...selected];

    await orderClientPreferenceStore.updatePreferences(order!.id!, preferences, assignRequestAbortController.signal);

    setSelected(preferences);
    assignRequestAbortController = null;
  }

  const getTreeData = () => {
    if (orderClientPreferenceStore.loading) {
      return;
    }
    setTreeViewData(convertDataToTree(options));
  };

  useEffect(() => {
    if (treeViewData.length > 0) {
      setAnchorEl(treeViewOpenButton.current);
    }
  }, [treeViewData]);

  useEffect(() => {
    const controller = new AbortController();

    orderClientPreferenceStore.fetch(controller.signal).then((data) => {
      data && setOptions(data);
    });

    if (orderStore.item) {
      setOrder(orderStore.item);
      setSelected(orderStore?.item?.preference ?? []);
    }

    return () => {
      controller.abort();
    };
  }, [orderStore.item]);

  return (
    <Box sx={{ display: "flex", alignItems: "end" }}>
      <FavoriteIcon sx={{ color: "primary.main", mr: 1, my: 0.5 }} />
      <Autocomplete
        multiple
        disableClearable
        fullWidth
        open={autoCompleteOpen}
        onOpen={() => setAutoCompleteOpen(true)}
        onClose={() => setAutoCompleteOpen(false)}
        getOptionLabel={(option) => option.name}
        getOptionKey={(option) => option.id}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        options={options.filter((e) => e.isChild)}
        loading={orderClientPreferenceStore.loading}
        value={selected}
        limitTags={2}
        renderOption={(props: HTMLAttributes<HTMLLIElement>, option: TOrderClientPreferenceModel) => (
          <li {...props} key={option.id}>
            {option["$t:name"] ?? option.name}
          </li>
        )}
        renderTags={(tagValue: TOrderClientPreferenceModel[], getTagProps: AutocompleteRenderGetTagProps) => {
          return tagValue.map((option, index) => (
            <Chip {...getTagProps({ index })} key={`chip_${option.id}`} label={option["$t:name"] ?? option.name} />
          ));
        }}
        onChange={(_, value) => onSelectPreference(value)}
        renderInput={(params) => (
          <TextField
            placeholder="Предпочтения..."
            variant="standard"
            {...params}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>{orderClientPreferenceStore.loading ? <CircularProgress color="inherit" size={20} /> : null}</>
              ),
            }}
            sx={{ ".MuiAutocomplete-inputRoot": { pr: "0 !important" } }}
          />
        )}
      />

      <IconButton ref={treeViewOpenButton} onClick={getTreeData}>
        <AccountTreeIcon sx={{ color: "secondary.light" }} fontSize="small" />
      </IconButton>

      <TreeViewPreferenceDialog
        anchorEl={anchorEl}
        treeViewData={treeViewData}
        selectedData={selected}
        handleClose={() => setAnchorEl(null)}
        setSelected={onSelectPreference}
      />
    </Box>
  );
}

function TreeViewPreferenceDialog(props: TTreeViewPreferenceDialogProps) {
  const { anchorEl, selectedData, handleClose, setSelected, treeViewData } = props;

  const setPreference = (option: TOrderClientPreferenceModel) => {
    if (selectedData.find((e) => e.id == option.id)) {
      const data = selectedData.filter((e) => e.id != option.id);
      if (data) {
        setSelected(data);
      }
    } else {
      setSelected({ id: option.id, name: option.name, "$t:name": option["$t:name"] });
    }
  };

  const isItemSelected = (item: TOrderClientPreferenceModel): boolean => {
    return selectedData.find((selectedItem) => selectedItem.id === item.id) !== undefined;
  };

  const renderTreeView = (item: TOrderClientPreferenceModel) => {
    if (item.children == undefined || item.children.length === 0) {
      return (
        <MenuItem key={item.id} onClick={() => setPreference(item)} selected={isItemSelected(item)}>
          {item["$t:name"] ?? item.name}
        </MenuItem>
      );
    }
    return (
      <NestedMenuItem key={item.id} label={item["$t:name"] ?? item.name} parentMenuOpen={anchorEl != null}>
        {item.children.map((child: TOrderClientPreferenceModel) => renderTreeView(child))}
      </NestedMenuItem>
    );
  };

  return (
    <Menu anchorEl={anchorEl} open={anchorEl != null} onClose={handleClose}>
      {treeViewData.map((item: TOrderClientPreferenceModel) => renderTreeView(item))}
    </Menu>
  );
}

function convertDataToTree(data: TOrderClientPreferenceModel[]): TOrderClientPreferenceModel[] {
  const tree: TOrderClientPreferenceModel[] = [];
  const map = new Map<number, TOrderClientPreferenceModel>();

  for (const item of data) {
    map.set(item.id, { id: item.id, name: item.name, "$t:name": item["$t:name"], children: [] });
  }

  for (const item of data) {
    if (item.parent) {
      const parent = map.get(item.parent.id);
      if (parent) {
        parent?.children?.push(map.get(item.id)!);
      }
    } else {
      tree.push(map.get(item.id)!);
    }
  }

  return tree;
}
