"use client";

import { MouseEvent, useState } from "react";
import { NestedMenuItem } from "mui-nested-menu";
import { Box, Menu, MenuItem, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type TItemType = { id?: number; name?: string; "$t:name"?: string; parent?: TItemType } | null | undefined;
type TTreeItemType = TItemType & { children: TItemType[] };

export default function TreeMenu<T extends TItemType>({
  buttonText,
  items,
  onSelect,
}: {
  buttonText: string;
  items: T[] | null;
  onSelect: (id?: number) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const getTreeItems = (): TTreeItemType[] => {
    const result: TTreeItemType[] = [];
    const map = new Map<number, TTreeItemType>();

    if (items == null) return result;

    for (const item of items) {
      if (item?.id != null)
        map.set(item.id, { id: item.id, name: item.name, "$t:name": item["$t:name"], children: [] });
    }

    for (const item of items) {
      if (item?.id == null) continue;
      if (item?.parent?.id != null) {
        const parent = map.get(item.parent.id);
        if (parent != null) {
          parent?.children?.push(map.get(item.id)!);
        }
      } else {
        result.push(map.get(item.id)!);
      }
    }

    return result;
  };

  const renderTreeView = (item: TTreeItemType) => {
    if (item.children == undefined || item.children.length === 0) {
      return (
        <MenuItem
          key={item.id}
          onClick={() => {
            onSelect(item?.id);
            handleClose();
          }}
        >
          {item?.["$t:name"] ?? item?.name}
        </MenuItem>
      );
    }
    return (
      <NestedMenuItem key={item.id} label={item["$t:name"] ?? item.name} parentMenuOpen={anchorEl != null}>
        {item?.children?.map((child: any) => renderTreeView(child))}
      </NestedMenuItem>
    );
  };

  return (
    <Box>
      <Button startIcon={<AddIcon />} endIcon={<ExpandMoreIcon />} onClick={handleClick}>
        {buttonText}
      </Button>
      <Menu anchorEl={anchorEl} open={anchorEl != null} onClose={handleClose}>
        {getTreeItems().map((item) => renderTreeView(item))}
      </Menu>
    </Box>
  );
}
