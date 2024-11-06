"use client";

import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import { ChangeEvent } from "react";

export default function OrderDetailsPagination({
  page = 1,
  total = 1,
  isLoading = false,
  onChange,
}: {
  page?: number;
  total?: number;
  isLoading?: boolean;
  onChange?: Function;
}) {
  const handleChange = (e: ChangeEvent<unknown>, page: number) => {
    if (onChange != null) onChange(page);
  };

  return (
    <Stack mt="auto">
      <Pagination
        page={page}
        count={total}
        siblingCount={1}
        boundaryCount={2}
        onChange={handleChange}
        disabled={isLoading}
      />
    </Stack>
  );
}
