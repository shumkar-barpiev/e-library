"use client";
import * as React from "react";
import {
  Card,
  FormControl,
  Typography,
  Box,
  Chip,
  TextField,
  styled,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useOrderStore } from "@/stores/orders/orders";
import { useUserStore } from "@/stores/users/users";
import { useEffect, useState } from "react";
import { TUserModel } from "@/models/user/user";
import { useAppealsStore } from "@/stores/appeals/appeals";
import { useChatStore } from "@/stores/chat/chat";
import { usePathname, useSearchParams } from "next/navigation";
import { IMaskInput } from "react-imask";
import CountrySelect from "@/components/chat/elements/CountrySelect";
import { useRouter } from "next/navigation";
import { isProduction } from "@/utils/utils";
import { enqueueSnackbar } from "notistack";
import { useCardStore } from "@/stores/cards/cards";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useOrderDetailsStore } from "@/stores/orders/order-details";
import { TAppealModel } from "@/models/appeals/appeal";

const StyledTextField = styled(TextField)({
  "& .MuiInputBase-input": {
    fontSize: "0.6964285714285714rem",
    lineHeight: "1.5",
    maxWidth: "200px",
    fontWeight: "bold",
  },
  "& .MuiInput-underline:before": {
    borderBottomColor: "transparent",
  },
});

export function ClientCard() {
  const userStore = useUserStore();
  const orderStore = useOrderStore();
  const appealStore = useAppealsStore();
  const orderDetailsStore = useOrderDetailsStore();
  const [user, setUser] = useState<TUserModel | null>(null);
  const [appeal, setAppeal] = useState<TAppealModel | null>(null);
  const [soStatus, setSoStatus] = useState<string | undefined>();
  const [saleOrderSeq, setSaleOrderSeq] = useState<string | null>();
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>();
  const { getCurrentUserId, currentUserId } = useChatStore();
  const { loading, setLoading } = useCardStore();
  const { createAppeal, existenceCheckAppeal, createChatAppeal } = useAppealsStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    mail: "",
    dateOfBirth: "",
    length: 12,
  });

  const [prev, setPrev] = useState<boolean>(false);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/orders") {
      setCurrentUrl("orders");
    }
  }, []);

  useEffect(() => {
    if (!searchParams.get("appeal") && prev) {
      location.reload();
    }
    if (!searchParams.get("id") && prev) {
      location.reload();
    }
  }, [searchParams.get("appeal"), searchParams.get("id")]);

  useEffect(() => {
    if (orderStore.item) {
      setSoStatus(orderStore.item?.soStatus);
      setSaleOrderSeq(orderStore.item?.saleOrderSeq);
    }

    if (appealStore.item?.client) {
      userStore.fetchItem(appealStore.item?.client!.id!).then((res) => {
        setUser(res);
      });
    } else {
      setAppeal(appealStore.item);
    }
  }, [orderStore.item, appealStore.item]);

  useEffect(() => {
    if (orderDetailsStore.items != undefined && orderDetailsStore.items?.length > 0 && orderStore.item?.id) {
      orderStore.fetchInvoiceNumber(orderStore.item?.id).then((resp) => {
        if (!!resp) setInvoiceNumber(resp?.numberInvoice);
      });
    } else {
      setSaleOrderSeq(null);
      setInvoiceNumber(null);
    }
  }, [orderDetailsStore.items]);

  useEffect(() => {
    if (!searchParams.get("appeal")) {
      getCurrentUserId();
    }
  }, []);

  const handleChange = () => {
    if (appealStore.item?.client) {
      userStore.updateItem(user!).then((res) => {
        if (res) {
          setUser(res);
        }
      });
    } else if (appeal) {
      appealStore.updateItem(appeal);
    }
  };

  const onChangeForm = (e: any, key: string) => {
    setForm((prev) => {
      if (e.target.length) {
        return { ...prev, [key]: e.target.value, length: e.target.length };
      }
      return { ...prev, [key]: e.target.value };
    });
  };

  const onClickCreateAppeal = async () => {
    let data = {
      ...form,
      phoneNumber: form.phoneNumber.replace(/[^0-9]/g, ""),
    };
    if (data.phoneNumber.length == data.length) {
      setLoading(true);
      let responseExistenseAppeal = await existenceCheckAppeal({ phoneNumber: data.phoneNumber });
      if (responseExistenseAppeal && responseExistenseAppeal.saleOrder) {
        setLoading(false);
        if (isProduction) {
          router.push(
            `/foms/front/orders.html?appeal=${responseExistenseAppeal.id}&chat=${responseExistenseAppeal.chat.id}&id=${responseExistenseAppeal.saleOrder.id}&prev=${currentUrl}`
          );
        } else {
          router.push(
            `/orders?appeal=${responseExistenseAppeal.id}&chat=${responseExistenseAppeal.chat.id}&id=${responseExistenseAppeal.saleOrder.id}&prev=${currentUrl}`
          );
        }
      } else if (responseExistenseAppeal && !responseExistenseAppeal.saleOrder) {
        setLoading(false);
        if (isProduction) {
          router.push(
            `/foms/front/orders.html?appeal=${responseExistenseAppeal.id}&chat=${responseExistenseAppeal.chat.id}&prev=${currentUrl}`
          );
        } else {
          router.push(
            `/orders?appeal=${responseExistenseAppeal.id}&chat=${responseExistenseAppeal.chat.id}&prev=${currentUrl}`
          );
        }
      } else {
        let responseAppeal = await createAppeal({ name: data.firstName, phoneNumber: data.phoneNumber, status: "2" });
        if (responseAppeal && currentUserId) {
          let responseChatAppeal = await createChatAppeal({
            fromNumber: data.phoneNumber,
            appealId: responseAppeal.id,
            currentUserId,
          });
          if (responseChatAppeal) {
            setLoading(false);
            if (isProduction) {
              router.push(
                `/foms/front/orders.html?appeal=${responseChatAppeal.appeal.id}&chat=${responseChatAppeal.id}&prev=${currentUrl}`
              );
            } else {
              router.push(
                `/orders?appeal=${responseChatAppeal.appeal.id}&chat=${responseChatAppeal.id}&prev=${currentUrl}`
              );
            }
          } else {
            setLoading(false);
            enqueueSnackbar("Чат не создан! Повторите попытку!", { variant: "error" });
          }
        } else {
          setLoading(false);
          enqueueSnackbar("Клиент не создан! Повторите попытку!", { variant: "error" });
        }
      }
    } else {
      enqueueSnackbar("Заполняйте номер!", { variant: "error" });
    }
  };

  const onPrev = () => {
    setPrev(true);
    let prevAddress = searchParams.get("prev");
    if (prevAddress) {
      if (isProduction) {
        router.push(`/foms/front/${prevAddress}.html`);
      } else {
        router.push(`/${prevAddress}`);
      }
    } else {
      if (isProduction) {
        window.parent.location.href = `${process.env.NEXT_PUBLIC_API_URL}/foms/#/ds/foms.order.smart.talk/list/1`;
      } else {
        router.push(`/${prevAddress}`);
      }
    }
  };

  return (
    <FormControl>
      {searchParams.get("appeal") && (
        <Card sx={{ padding: 1 }}>
          <Stack direction="row" justifyContent="space-between">
            <Box display={"flex"} gap={1}>
              <Typography sx={{ color: "secondary", fontWeight: "bold" }}>
                {saleOrderSeq ? `№${saleOrderSeq}` : invoiceNumber}
              </Typography>
              {soStatus && <Chip label={soStatus} sx={{ height: 23 }} color="primary" />}
            </Box>
            <Button variant="outlined" onClick={onPrev}>
              <ArrowBackIcon sx={{ width: "18px", height: "18px", marginRight: "4px" }} />
              <Typography fontSize={9.5} fontWeight={500}>
                Назад
              </Typography>
            </Button>
          </Stack>
          <Box display={"flex"} gap={1}>
            <StyledTextField
              size="small"
              variant="standard"
              placeholder="Имя"
              defaultValue={user?.firstName ?? appeal?.firstName}
              onBlur={handleChange}
              // inputProps={{
              //   style: {
              //     fontSize: "1.3928571428571428rem",
              //   },
              // }}
              onChange={(e) => {
                if (user) {
                  user.firstName = e.target.value;
                }
                if (appeal) {
                  appeal.firstName = e.target.value;
                  setAppeal({ ...appeal, firstName: e.target.value });
                }
              }}
            />
            <StyledTextField
              size="small"
              variant="standard"
              placeholder="Фамилия"
              defaultValue={user?.lastName ?? appeal?.name}
              onBlur={handleChange}
              // inputProps={{
              //   style: {
              //     fontSize: "1.3928571428571428rem",
              //   },
              // }}
              onChange={(e) => {
                if (user) {
                  user.lastName = e.target.value;
                }
                if (appeal) {
                  setAppeal({ ...appeal, name: e.target.value });
                }
              }}
            />
          </Box>
          <Box display={"flex"} gap={1}>
            <StyledTextField
              size="small"
              variant="standard"
              placeholder="Номер телефона"
              defaultValue={user?.mobilePhone ?? appeal?.phoneNumber}
              onBlur={handleChange}
              onChange={(e) => {
                if (user) {
                  user.mobilePhone = e.target.value;
                }
                if (appeal) {
                  setAppeal({ ...appeal, phoneNumber: e.target.value });
                }
              }}
            />

            <StyledTextField
              size="small"
              variant="standard"
              placeholder="E-mail"
              defaultValue={user?.email ?? appeal?.importOrigin}
              onBlur={handleChange}
              onChange={(e) => {
                if (user) {
                  user.email = e.target.value;
                }
                if (appeal) {
                  setAppeal({ ...appeal, importOrigin: e.target.value });
                }
              }}
            />

            <StyledTextField
              size="small"
              variant="standard"
              placeholder="Дата рождения"
              defaultValue={user?.dateOfBirth ?? appeal?.processInstanceId}
              onBlur={handleChange}
              onChange={(e) => {
                if (user) {
                  user.dateOfBirth = e.target.value;
                }
                if (appeal) {
                  setAppeal({ ...appeal, processInstanceId: e.target.value });
                }
              }}
            />
          </Box>
        </Card>
      )}

      {!searchParams.get("appeal") && (
        <Card sx={{ padding: 1 }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ marginBottom: "10px" }} fontSize={16} fontWeight={600}>
              Создать клиента
            </Typography>
            <Button variant="outlined" onClick={onPrev}>
              <ArrowBackIcon sx={{ width: "18px", height: "18px", marginRight: "4px" }} />
              <Typography fontSize={9.5} fontWeight={500}>
                Назад
              </Typography>
            </Button>
          </Stack>

          <Box display={"flex"} gap={1}>
            <StyledTextField
              size="small"
              variant="standard"
              placeholder="Имя"
              value={form.firstName}
              disabled={loading}
              inputProps={{
                style: {
                  fontSize: 14,
                },
              }}
              onChange={(e) => {
                onChangeForm(e, "firstName");
              }}
            />
          </Box>
          <Box display={"flex"} gap={1}>
            <SelectNumberPhone disabled={loading} value={form.phoneNumber} onChangeForm={onChangeForm} />
          </Box>
          <Stack direction="row" justifyContent="flex-end">
            <Box sx={{ m: 1, position: "relative" }}>
              <Button disabled={loading} onClick={onClickCreateAppeal}>
                Создать
              </Button>
              {loading && (
                <CircularProgress
                  size={18}
                  sx={{
                    color: "#5570F1",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                  }}
                />
              )}
            </Box>
          </Stack>
        </Card>
      )}
    </FormControl>
  );
}

function SelectNumberPhone({
  onChangeForm,
  value,
  disabled,
}: {
  onChangeForm: (e: any, key: string) => void;
  value: string;
  disabled: boolean;
}) {
  const [numberCode, setNumberCode] = useState<string>("+996");
  const [length, setLength] = useState<number>(9);

  const setImask = (country: any) => {
    setNumberCode(country.numberCode);
    setLength(country.length);
  };

  return (
    <Box sx={{ marginTop: "10px" }}>
      <Stack direction="row" alignItems="center">
        <CountrySelect setImask={setImask} />
        <GetImaskInput
          disabled={disabled}
          numberCode={numberCode}
          length={length}
          value={value}
          onChangeForm={onChangeForm}
        />
      </Stack>
    </Box>
  );
}

let imaskStyle = {
  border: "none",
  outline: "none",
  padding: "4px",
  fontSize: 14,
  paddingLeft: "10px",
};

function GetImaskInput({
  onChangeForm,
  value,
  numberCode,
  length,
  disabled,
}: {
  onChangeForm: (e: any, key: string) => void;
  value: string;
  numberCode: string;
  length: number;
  disabled: boolean;
}) {
  const [mask, setMask] = useState<string>(`{${numberCode} ${"0".repeat(length)}}`);

  useEffect(() => {
    setMask(`{${numberCode} ${"0".repeat(length)}}`);
    let e = {
      target: {
        value: "",
      },
    };
    onChangeForm(e, "phoneNumber");
  }, [numberCode]);

  return (
    <IMaskInput
      key={mask}
      style={imaskStyle}
      mask={mask}
      lazy={false}
      value={value}
      disabled={disabled}
      onAccept={(value: string) => {
        let e = {
          target: {
            value: value.replace(/[^a-zA-Z0-9 ]/g, ""),
            length: length + numberCode.replace(/[^0-9]/g, "").length,
          },
        };
        onChangeForm(e, "phoneNumber");
      }}
    />
  );
}
