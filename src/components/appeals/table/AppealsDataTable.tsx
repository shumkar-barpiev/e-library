"use client";
import { useEffect, useState } from "react";
import { Button, Card, CircularProgress, Stack, Typography } from "@mui/material";
import { appealType, useAppealsStore } from "@/stores/appeals/appeals";
import TextsmsIcon from "@mui/icons-material/Textsms";

import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import TableHead from "@mui/material/TableHead";
import { isProduction } from "@/utils/utils";
import { parseISO, format } from "date-fns";
import { useChatStore } from "@/stores/chat/chat";
import { messageTypeEnum } from "@/models/chat/chat";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { Description } from "@mui/icons-material";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import { useRouter } from "next/navigation";

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

interface AppealsDataTableProps {
  onClickStartChat?: (appeal: appealType) => void;
  currentUserId?: {
    id: number;
  } | null;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
        {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

export default function AppealsDataTable(props: AppealsDataTableProps) {
  const appealsStore = useAppealsStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState(appealsStore.appeals);
  const router = useRouter();

  useEffect(() => {
    let newMessageClient = new Audio();
    newMessageClient.controls = true;
    newMessageClient.src = "audio/new_message_notice.mp3";

    let newMessageTone = new Audio();
    newMessageTone.controls = true;
    newMessageTone.src = "audio/new_message_tone.mp3";

    appealsStore.setNewMessageClient(newMessageClient);
    appealsStore.setNewMessageTone(newMessageTone);
  }, []);

  useEffect(() => {
    setRows(appealsStore.appeals);
  }, [appealsStore.appeals]);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    // setRows([]);

    // appealsStore
    //   .fetchItems({
    //     page: page,
    //     pageSize: rowsPerPage,
    //   })
    //   .then((rows) => {
    //     ///
    //     setRows(rows || []);
    //     // setRows(rows[0].saleOrders || []);
    //   })
    // appealsStore.fetchAppeals();
    appealsStore.startSocket();
    return () => {
      appealsStore.disconnect();
      appealsStore.clearStore();
    };
  }, [page]);

  const beginChat = (appeal: appealType, startChatAddress: string) => {
    appealsStore.setAppealLoading(appeal);
    appealsStore.sendEvent({
      event: "updateAppeal",
      data: {
        currentUserId: props.currentUserId,
        appeal,
        status: 2,
      },
    });
    router.push(startChatAddress);
  };

  return (
    <TableContainer component={Card}>
      <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
        <TableHead sx={{ borderBottom: "2px solid #c9c9c9", background: "#ededed" }}>
          <TableRow sx={{ width: "100%" }}>
            <TableCell>Действие</TableCell>
            <TableCell>Последний оператор</TableCell>
            <TableCell>Гражданин</TableCell>
            <TableCell>Последнее сообщение</TableCell>
            <TableCell>Первое сообщение</TableCell>
            <TableCell>Дата первого сообщения</TableCell>
          </TableRow>
        </TableHead>
        <TableBody
          sx={{
            width: "100%",
          }}
        >
          {(rowsPerPage > 0 ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : rows).map((row) => {
            let startChatAddress = isProduction
              ? `/foms/front/orders.html?appeal=${row.id}&chat=${row?.chat?.id}`
              : `/orders?appeal=${row.id}&chat=${row?.chat?.id}`;
            if (row.saleOrder) {
              startChatAddress += `&id=${row.saleOrder.id}`;
            }

            return (
              <TableRow key={row.id} sx={{ borderBottom: "2px solid #f3f3f3" }}>
                <TableCell sx={{ py: 1 }} component="th" scope="row">
                  <Box display={"flex"} gap={1}>
                    {/* <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PhoneIcon fontSize="small" />}
                    sx={{
                      whiteSpace: "nowrap",
                      minWidth: "auto",
                    }}
                    href={
                      isProduction
                        ? `/foms/front/orders.html?appeal=${row.id}&id=84`
                        : `/orders?appeal=${row.id}&id=84`
                    }
                    href={isProduction ? `/foms/front/orders.html?appeal=1&id=1` : `/orders?appeal=1&id=1`}
                  >
                    Звонит
                  </Button> */}
                    {!row.loading && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<TextsmsIcon fontSize="small" />}
                        sx={{
                          whiteSpace: "nowrap",
                          minWidth: "auto",
                        }}
                        onClick={() => {
                          if (props.onClickStartChat) {
                            props.onClickStartChat(row);
                          } else {
                            beginChat(row, startChatAddress);
                          }
                        }}
                      >
                        Начать чат
                      </Button>
                    )}
                    {row.loading && (
                      <Stack direction="row" alignItems="center" justifyContent="center">
                        <CircularProgress size={20} />
                      </Stack>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 1 }}>{row?.lastUser?.fullName ?? ""}</TableCell>
                <TableCell sx={{ py: 1 }}>{row?.phoneNumber ?? ""}</TableCell>
                {/* <TableCell sx={{ py: 1 }}>13.09.2021 12:00</TableCell> */}
                <TableCell sx={{ py: 1 }}>
                  {row?.lastMessage?.type === messageTypeEnum.TEXT ? row?.lastMessage?.body.slice(0, 40) + "..." : ""}
                  {row?.lastMessage?.type === messageTypeEnum.IMAGE ? (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PhotoCameraIcon sx={{ width: "18px", height: "18px" }} /> <Typography>Фото</Typography>
                    </Stack>
                  ) : (
                    ""
                  )}
                  {row?.lastMessage?.type === messageTypeEnum.DOCUMENT ? (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Description sx={{ width: "18px", height: "18px" }} />{" "}
                      <Typography>{row.lastMessage.fileName}</Typography>
                    </Stack>
                  ) : (
                    ""
                  )}
                  {row?.lastMessage?.type === messageTypeEnum.AUDIO && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <KeyboardVoiceIcon sx={{ width: "18px", height: "18px" }} /> <Typography>Аудио</Typography>
                    </Stack>
                  )}
                </TableCell>
                {/* <TableCell sx={{ py: 1 }}>13.09.2021 12:00</TableCell> */}
                <TableCell sx={{ py: 1 }}>
                  {row?.firstMessage?.type === messageTypeEnum.TEXT ? row?.firstMessage?.body.slice(0, 40) + "..." : ""}
                  {row?.firstMessage?.type === messageTypeEnum.IMAGE ? (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PhotoCameraIcon sx={{ width: "18px", height: "18px" }} /> <Typography>Фото</Typography>
                    </Stack>
                  ) : (
                    ""
                  )}
                  {row?.firstMessage?.type === messageTypeEnum.DOCUMENT ? (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Description sx={{ width: "18px", height: "18px" }} />{" "}
                      <Typography>{row.firstMessage.fileName}</Typography>
                    </Stack>
                  ) : (
                    ""
                  )}
                  {row?.firstMessage?.type === messageTypeEnum.AUDIO && (
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <KeyboardVoiceIcon sx={{ width: "18px", height: "18px" }} /> <Typography>Аудио</Typography>
                    </Stack>
                  )}
                </TableCell>
                <TableCell sx={{ py: 1 }}>{format(parseISO(row.createdOn), "dd.MM.yyyy HH:mm")}</TableCell>
              </TableRow>
            );
          })}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )}
          {appealsStore.loading && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          )}
          {appealsStore.error && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                Error
              </TableCell>
            </TableRow>
          )}
          {!appealsStore.loading && !appealsStore.error && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
