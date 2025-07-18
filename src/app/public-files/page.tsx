"use client";
import React from "react";
import Main from "@/components/public-files/Main";
import { SnackbarProvider } from "notistack";

const page = () => {
  return (
    <>
      <SnackbarProvider>
        <Main />
      </SnackbarProvider>
    </>
  );
};

export default page;
