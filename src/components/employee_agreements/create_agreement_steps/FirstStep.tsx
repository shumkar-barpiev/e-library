"use client";

import {
  Box,
  Card,
  Table,
  Paper,
  useTheme,
  TableRow,
  Checkbox,
  TableHead,
  TextField,
  TableCell,
  TableBody,
  Typography,
  IconButton,
  TableFooter,
  Autocomplete,
  TableContainer,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import React, { ReactNode, useEffect, useState } from "react";
import { StyledTableCell } from "@/components/other/StyledTableCell";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { useEmployeeAgreementsStore } from "@/stores/hr/employee-agreements/employee-agreements";
interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
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

type PropType = {
  data: Record<string, any> | null;
  toggleNextBtn: (value: boolean) => void;
  updateVisibilityWarning: (value: boolean) => void;
  updateData: (step: string, data: Record<string, any>) => void;
};

function FirstStep({ toggleNextBtn, updateData, updateVisibilityWarning, data }: PropType) {
  const rowsPerPage = 5;
  const [page, setPage] = useState(0);
  const firstStepData = data?.firstStepData;
  const agreementStore = useEmployeeAgreementsStore();
  const [loadingEmployees, setLoadingEmployees] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<number[]>(firstStepData?.userId ?? []);
  const [typeOfTemplates, setTypeOfTemplates] = useState<Record<string, any> | null>(null);
  const [employees, setEmployees] = useState<Record<string, any>[]>(firstStepData?.employees ?? []);
  const [departments, setDepartments] = useState<Record<string, any>[]>(firstStepData?.departments ?? []);
  const [employeeStages, setEmployeeStages] = useState<Record<string, any>[]>(firstStepData?.employeeStages ?? []);
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - employees?.length) : 0;

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = employees.map((row) => row.id);
      setSelectedRows(newSelected);
      return;
    }
    setSelectedRows([]);
  };

  const handleRowSelection = (id: number) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id) ? prevSelectedRows.filter((rowId) => rowId !== id) : [...prevSelectedRows, id]
    );
  };

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const { control, watch, reset, setValue } = useForm({
    defaultValues: {
      departmentId: undefined,
      employeeStage: undefined,
    },
  });

  const departmentId = watch("departmentId");
  const employeeStage = watch("employeeStage");

  useEffect(() => {
    if (departmentId || employeeStage || selectedRows.length > 0) {
      updateVisibilityWarning(true);
    } else {
      updateVisibilityWarning(false);
    }

    if (departmentId !== undefined && employeeStage !== undefined && selectedRows.length > 0) {
      const selectedUsers = employees.filter((user) => selectedRows.includes(user.id));

      const formData = {
        stage: employeeStage,
        userId: selectedRows,
        employees: employees,
        departments: departments,
        departmentId: departmentId,
        selectedUsers: selectedUsers,
        employeeStages: employeeStages,
        typeOfTemplates: typeOfTemplates,
      };

      updateData("firstStepData", formData);
      toggleNextBtn(false);
    } else {
      toggleNextBtn(true);
    }
  }, [departmentId, employeeStage, selectedRows]);

  useEffect(() => {
    if (!(departments?.length > 0)) {
      agreementStore.fetchDepartments((data: Record<string, any>) => {
        if (data.status === 0) setDepartments(data.data);
        else console.log("Something has gone wrong!!!");
      });
    }

    if (!(employeeStages?.length > 0)) {
      agreementStore.fetchEmployeeStages((data: Record<string, any>) => {
        if (data.status === 0) setEmployeeStages(data.data);
        else console.log("Something has gone wrong!!!");
      });
    }

    if (firstStepData) {
      setValue("departmentId", firstStepData?.departmentId);
      setValue("employeeStage", firstStepData?.stage);
    }

    if (!firstStepData?.typeOfTemplates) {
      agreementStore.fetchTemplatesType((data: Record<string, any>) => {
        if (data.status === 0) setTypeOfTemplates(data.data);
      });
    }
  }, []);

  const EmployeesTableRow = ({ employee }: { employee: Record<string, any> }) => {
    const isSelected = selectedRows.includes(employee.id);
    const stage = employeeStages.find((obj) => obj?.order_seq === employee?.stepStatusSelect);

    return (
      <TableRow
        key={employee?.id}
        sx={{ height: "40px", cursor: "pointer" }}
        onClick={() => handleRowSelection(employee.id)}
      >
        <StyledTableCell sx={{ fontSize: "10px", textAlign: "center", ...(isSelected ? { bgcolor: "#f5f5f5" } : {}) }}>
          <Checkbox checked={isSelected} inputProps={{ "aria-label": `select employee ${employee.name}` }} />
        </StyledTableCell>
        <StyledTableCell sx={{ fontSize: "10px", textAlign: "left", ...(isSelected ? { bgcolor: "#f5f5f5" } : {}) }}>
          <Typography sx={{ whiteSpace: "nowrap" }}>{employee?.name}</Typography>
        </StyledTableCell>
        <StyledTableCell sx={{ fontSize: "10px", textAlign: "left", ...(isSelected ? { bgcolor: "#f5f5f5" } : {}) }}>
          <Typography sx={{ whiteSpace: "nowrap" }}>{employee?.roles[0]?.name}</Typography>
        </StyledTableCell>
        <StyledTableCell sx={{ fontSize: "10px", textAlign: "left", ...(isSelected ? { bgcolor: "#f5f5f5" } : {}) }}>
          <Typography sx={{ whiteSpace: "nowrap" }}>{stage?.title_ru}</Typography>
        </StyledTableCell>
      </TableRow>
    );
  };

  const getTableRow = (employee: Record<string, any>): ReactNode => {
    return <EmployeesTableRow key={employee.id} employee={employee} />;
  };

  return (
    <Card sx={{ mt: 3, p: 2 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "row", gap: 3, width: 1 }}>
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                disabled={departments?.length === 0}
                sx={{ minWidth: 250, maxWidth: 250 }}
                options={departments}
                getOptionLabel={(option: any) => `${option?.name}`}
                noOptionsText="Нет данных"
                onChange={(e, v) => {
                  if (!v?.id) {
                    reset();
                    setEmployees([]);
                    setSelectedRows([]);
                    updateData("firstStepData", {});
                  } else if (v?.id && employees?.length > 0) {
                    setEmployees([]);
                    setValue("employeeStage", undefined);
                  }

                  field.onChange(v?.id ?? null);
                }}
                value={departments?.find((item: any) => item?.id === field.value) ?? null}
                renderOption={(props, option) => (
                  <li {...props} key={option?.id}>
                    <Typography noWrap sx={{ maxWidth: "240px" }}>
                      {option?.name}
                    </Typography>
                  </li>
                )}
                renderInput={(params) => <TextField {...params} variant="standard" label="Отдел" />}
              />
            )}
          />

          <Controller
            name="employeeStage"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                disabled={departmentId == undefined}
                sx={{ minWidth: 250, maxWidth: 250 }}
                options={employeeStages}
                getOptionLabel={(option: any) => `${option?.title_ru}`}
                noOptionsText="Нет данных"
                onChange={(e, v) => {
                  field.onChange(v?.order_seq ?? undefined);
                  if (v?.order_seq != undefined) {
                    setLoadingEmployees(true);
                    const requestBody = {
                      fields: [
                        "id",
                        "name",
                        "roles",
                        "activeCompany",
                        "stepStatusSelect",
                        "partner.mainAddress",
                        "partner.dateOfIssue",
                        "partner.passportNumber",
                        "partner.issuingAuthority",
                      ],
                      data: {
                        _domain: "self.group.id =: groupId and self.stepStatusSelect =: stepStatus",
                        _domainContext: {
                          groupId: departmentId,
                          stepStatus: v?.order_seq,
                        },
                      },
                    };

                    agreementStore.fetchEmployees(requestBody, (data: Record<string, any>) => {
                      setLoadingEmployees(false);
                      if (data.status === 0) setEmployees(data.data);
                      else console.log("Something has gone wrong!");
                    });
                  } else {
                    setEmployees([]);
                    setSelectedRows([]);
                  }
                }}
                value={employeeStages?.find((item: any) => item?.order_seq === field.value) ?? null}
                renderOption={(props, option) => (
                  <li {...props} key={option?.order_seq}>
                    <Typography noWrap sx={{ maxWidth: "240px" }}>
                      {option?.title_ru}
                    </Typography>
                  </li>
                )}
                renderInput={(params) => <TextField {...params} variant="standard" label="Период" />}
              />
            )}
          />
        </Box>

        <Box>
          {loadingEmployees && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="inherit" color={"inherit"}>
                Загрузка данных...
              </Typography>
              <CircularProgress color="inherit" size={15} />
            </Box>
          )}
          {employees?.length > 0 && (
            <TableContainer component={Paper} sx={{ overflowX: "auto", maxWidth: 800 }}>
              <Table sx={{ minWidth: 500, maxWidth: 800 }} aria-label="custom pagination table">
                <TableHead>
                  <TableRow sx={{ height: 50, backgroundColor: "#5F8CCC" }}>
                    <StyledTableCell
                      align="center"
                      sx={{
                        borderTopLeftRadius: "5px",
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: "#fff",
                        width: "10%",
                      }}
                    >
                      <Checkbox
                        sx={{
                          color: "#fff",
                          "&.Mui-checked": {
                            color: "#fff",
                          },
                          "&.MuiCheckbox-indeterminate": {
                            color: "#fff",
                          },
                        }}
                        indeterminate={selectedRows.length > 0 && selectedRows.length < employees?.length}
                        checked={employees?.length > 0 && selectedRows.length === employees?.length}
                        onChange={(event) => handleSelectAllClick(event)}
                        inputProps={{ "aria-label": "select all rows" }}
                      />
                    </StyledTableCell>
                    <StyledTableCell
                      align="left"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: "#fff",
                        width: "40%",
                      }}
                    >
                      Сотрудник
                    </StyledTableCell>
                    <StyledTableCell
                      align="left"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: "#fff",
                        width: "30%",
                      }}
                    >
                      Должность
                    </StyledTableCell>
                    <StyledTableCell
                      align="left"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: "#fff",
                        width: "30%",
                      }}
                    >
                      Стадия
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage > 0
                    ? employees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : employees
                  ).map((row) => getTableRow(row))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={3} />
                    </TableRow>
                  )}
                </TableBody>
                {employees?.length > rowsPerPage && (
                  <TableFooter>
                    <TableRow>
                      <TablePagination
                        rowsPerPageOptions={[]}
                        colSpan={3}
                        count={employees?.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        ActionsComponent={TablePaginationActions}
                      />
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Card>
  );
}

export default FirstStep;
