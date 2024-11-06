"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  Box,
  Checkbox,
  Tooltip,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  ListItemButton,
  ListItem,
  List,
  ListItemIcon,
  Badge,
  CircularProgress,
} from "@mui/material";
import {
  BaseSingleInputFieldProps,
  DatePicker,
  DateValidationError,
  DayCalendarSkeleton,
  FieldSection,
  LocalizationProvider,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { TOrderUserTaskModel } from "@/models/orders/order-user-task";
import { useOrderUserTaskStore } from "@/stores/orders/order-user-tasks";
import { TModelFilters } from "@/types/model";
import { TOrderModel } from "@/models/orders/order";
import { useOrderStore } from "@/stores/orders/orders";
import { enqueueSnackbar } from "notistack";
import DeleteIcon from "@mui/icons-material/Delete";

interface TaskTextFieldProps
  extends BaseSingleInputFieldProps<Dayjs | null, Dayjs, FieldSection, false, DateValidationError> {
  calendarSetOpen?: Dispatch<SetStateAction<boolean>>;
  fetchTasks: () => void;
  selectedDate: Dayjs;
  order: TOrderModel | null;
}

export function TaskListCard() {
  const orderStore = useOrderStore();
  const orderUserTaskStore = useOrderUserTaskStore((state) => state);
  const [order, setOrder] = useState<TOrderModel | null>(null);
  const [filters, setFilters] = useState<TModelFilters | null>(null);
  const [tasks, setTasks] = useState<TOrderUserTaskModel[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TOrderUserTaskModel[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [taskLoading, setTaskLoading] = useState(new Set<number | undefined>());
  const [highlightedDays, setHighlightedDays] = useState<Dayjs[]>([]);
  const [calendarOpen, calendarSetOpen] = useState(false);

  const highlightDays = () => {
    setHighlightedDays(tasks.map((task: TOrderUserTaskModel) => dayjs(task.deadline)));
  };

  const handleMonthChange = (month: any) => {
    setSelectedDate(dayjs(month));
    if (order) {
      setFilters({
        pageSize: -1,
        fields: ["name", "deadline", "isComplete"],
        criteria: [
          {
            operator: "and",
            criteria: [
              {
                fieldName: "saleOrder.id",
                operator: "=",
                value: order.id as number,
              },
              {
                operator: "between",
                fieldName: "deadline",
                value: dayjs(month).startOf("month").toISOString(),
                value2: dayjs(month).endOf("month").toISOString(),
              },
            ],
          },
        ],
      });
    }
  };

  const toggleTaskCheckbox = async (value?: TOrderUserTaskModel) => {
    if (!value || taskLoading.has(value.id)) {
      enqueueSnackbar("Подождите, пока задача сохранится", { variant: "warning" });
      return;
    }

    setTaskLoading(taskLoading.add(value.id));

    await orderUserTaskStore.complete(value);

    setTasks(tasks.map((task) => (task.id === value.id ? { ...task, isComplete: !task.isComplete } : task)));

    taskLoading.delete(value.id);
    setTaskLoading(taskLoading);
  };

  const filterTasks = (date: Dayjs | null) => {
    const _tasks = tasks.filter((task) => dayjs(task.deadline).isSame(date, "day"));
    _tasks.sort((a, b) => (a.isComplete === b.isComplete ? 0 : a.isComplete ? 1 : -1));
    setFilteredTasks(_tasks);
  };

  const fetchTasks = () => {
    if (!order) return;
    orderUserTaskStore.fetch(filters).then((data) => data && setTasks(data));
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;

    const task = tasks.find((task) => task.id === id);

    if (!task) return;

    const result: boolean = await orderUserTaskStore.delete(task);

    if (!result) {
      enqueueSnackbar("Не удалось удалить задачу", { variant: "error" });
      return;
    }

    setTasks(tasks.filter((task) => task.id !== id));
  };

  useEffect(() => {
    filterTasks(selectedDate);
    highlightDays();
  }, [tasks]);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  useEffect(() => {
    if (orderStore.item) {
      setOrder(orderStore.item);
      setFilters({
        pageSize: -1,
        fields: ["name", "deadline", "isComplete"],
        criteria: [
          {
            operator: "and",
            criteria: [
              {
                fieldName: "saleOrder.id",
                operator: "=",
                value: orderStore.item!.id!,
              },
              {
                operator: "between",
                fieldName: "deadline",
                value: dayjs().startOf("month").toISOString(),
                value2: dayjs().endOf("month").toISOString(),
              },
            ],
          },
        ],
      });
    }
  }, [orderStore.item]);

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "flex-end" }}>
        <CheckBoxIcon sx={{ color: "primary.main", mr: 1, my: 0.5 }} />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={selectedDate}
            defaultValue={dayjs()}
            onMonthChange={handleMonthChange}
            onAccept={(date) => {
              if (date) {
                filterTasks(date);
                setSelectedDate(date);
              }
            }}
            open={calendarOpen}
            loading={orderUserTaskStore.loading}
            renderLoading={() => <DayCalendarSkeleton />}
            onClose={() => calendarSetOpen(false)}
            onOpen={() => calendarSetOpen(true)}
            slots={{ textField: TaskTextField, day: HighlightedDay }}
            slotProps={{
              day: { highlightedDays } as any,
              field: { calendarSetOpen, fetchTasks, setTasks, order, tasks, selectedDate } as any,
            }}
          />
        </LocalizationProvider>
      </Box>

      <Box>
        <List
          sx={{
            width: "100%",
            overflow: "auto",
            maxHeight: 130,
            "&::-webkit-scrollbar": { width: "0.3em" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(0,0,0,.1)" },
          }}
        >
          {filteredTasks.map((value) => {
            return (
              <ListItem
                key={`task-${value.id}`}
                disablePadding
                secondaryAction={
                  <Box display="flex" alignItems={"center"}>
                    <Typography component="span" variant="body2" color="text.primary">
                      {dayjs(value.deadline).format("DD.MM.YYYY")}
                    </Typography>

                    <IconButton size={"small"} edge="end" aria-label="delete" onClick={() => handleDelete(value.id)}>
                      <DeleteIcon fontSize={"small"} />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemButton role={undefined} onClick={() => toggleTaskCheckbox(value)} dense>
                  <ListItemIcon sx={{ minWidth: 0 }}>
                    {taskLoading.has(value.id) ? (
                      <CircularProgress size={20} sx={{ mr: 1, my: 0.1 }} />
                    ) : (
                      <Checkbox
                        edge="start"
                        sx={{ minWidth: 0, py: 0 }}
                        checked={value.isComplete}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ "aria-labelledby": `checkbox-list-label-${value.id}` }}
                      />
                    )}
                  </ListItemIcon>
                  <Box
                    sx={{ fontSize: 14, color: "#45464E", width: "100%" }}
                    justifyContent="space-between"
                    display="flex"
                    alignItems={"center"}
                  >
                    <Tooltip title={value.name} enterDelay={1000}>
                      <Typography
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          width: "250px",
                          textOverflow: "ellipsis",
                        }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {value.name}
                      </Typography>
                    </Tooltip>
                  </Box>
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {filteredTasks.length === 0 && selectedDate ? (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Нет задач на этот день
            </Typography>
          </Box>
        ) : (
          selectedDate === null && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Выберите день
              </Typography>
            </Box>
          )
        )}
      </Box>
    </>
  );
}

function TaskTextField(props: TaskTextFieldProps) {
  const { calendarSetOpen, fetchTasks, order, selectedDate, InputProps: { ref } = {} } = props;
  const [inputValue, setInputValue] = useState("");
  const orderUserTaskStore = useOrderUserTaskStore((state) => state);

  const handleAddTask = async () => {
    if (selectedDate && selectedDate.isBefore(dayjs(), "day")) {
      enqueueSnackbar("Нельзя создать задачу на прошедшую дату", { variant: "error" });
      return;
    }

    if (orderUserTaskStore.loading) {
      enqueueSnackbar("Подождите, пока задача сохранится", { variant: "warning" });
      return;
    }

    if (inputValue !== "") {
      const newTask = {
        name: inputValue.trim(),
        deadline: selectedDate.toDate(),
        isComplete: false,
      } as TOrderUserTaskModel;

      if (!order) {
        enqueueSnackbar("Необходимо создать заявку и добавлять задачи", { variant: "error" });
        return;
      }

      const task = await orderUserTaskStore.store(order.id!, newTask);

      if (task) {
        fetchTasks();
        setInputValue("");
      } else {
        enqueueSnackbar("Не удалось создать задачу", { variant: "error" });
      }
    }
  };

  return (
    <TextField
      placeholder="Создать задачу..."
      variant="standard"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
      sx={{ width: "100%" }}
      InputProps={{
        endAdornment: (
          <>
            <InputAdornment position="end">
              <>{orderUserTaskStore.loading ? <CircularProgress color="inherit" size={20} /> : null}</>
            </InputAdornment>
            <InputAdornment position="end">
              <IconButton ref={ref} aria-label="send button" onClick={() => calendarSetOpen && calendarSetOpen(true)}>
                <CalendarMonthIcon sx={{ color: "secondary.light" }} fontSize="small" />
              </IconButton>
            </InputAdornment>
            <InputAdornment position="end">
              <IconButton aria-label="send button" onClick={handleAddTask}>
                <SendIcon sx={{ color: "secondary.light" }} fontSize="small" />
              </IconButton>
            </InputAdornment>
          </>
        ),
      }}
    />
  );
}

function HighlightedDay(props: PickersDayProps<Dayjs> & { highlightedDays?: number[] }) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;

  const isSelected = highlightedDays.some((date) => dayjs(date).isSame(day, "day"));

  return (
    <Badge key={props.day.toString()} color="primary" variant="dot" invisible={!isSelected}>
      <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
    </Badge>
  );
}
