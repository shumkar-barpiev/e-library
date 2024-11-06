import { templateButton } from "@/models/chat/chat";
import { chatType, clientContactType } from "@/models/chat/chat";

export function getContactName(contact: any) {
  let arr = contact?.appeal?.client?.fullName?.split(" ") ?? contact.fullName.split(" ");
  if (arr.length > 1) {
    if (arr[0][0] === undefined) {
      return arr[1][0];
    }
    return `${arr[0][0]} ${arr[1][0]}`;
  }
  return arr[0][0];
}

export function getClientName(client: clientContactType) {
  let arr = (client["client.fullName"] && client["client.fullName"]) || client.name.split(" ");
  if (arr.length > 1) {
    if (arr[0][0] === undefined) {
      return arr[1][0];
    }
    return `${arr[0][0]} ${arr[1][0]}`;
  }
  return arr[0][0];
}

export function getChatClientName(chat: chatType) {
  let arr =
    (chat?.appeal?.client?.fullName && chat.appeal.client.fullName.split(" ")) || (chat?.name && chat.name.split(" "));
  if (arr) {
    if (arr.length > 1) {
      if (arr[0][0] === undefined) {
        return arr[1][0];
      }
      return `${arr[0][0]} ${arr[1][0]}`;
    }
    return arr[0][0];
  }
  return null;
}

export function getMessageAuthorName(messageAuthor: { fullName: string; id: number; $version: number }) {
  let arr = messageAuthor.fullName.split(" ");
  if (arr.length > 1) {
    if (arr[0][0] === undefined) {
      return arr[1][0];
    }
    return `${arr[0][0]} ${arr[1][0]}`;
  }
  return arr[0][0];
}

export function validateButtons(arr: templateButton[]) {
  const regexEn = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \t\n\r]*$/;
  const regexRu = /^[А-Яа-яЁё0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? \t\n\r]*$/;
  // let choiseRegex = language === "ru" ? regexRu : language === "en_US" ? regexEn : null;
  let result = false;
  arr.forEach((elem: templateButton) => {
    if (elem.type === "Call") {
      if (
        elem.text === "" ||
        (elem.phone_number && elem.phone_number.length < 12) ||
        elem.textEmpty ||
        elem.textLngError
      ) {
        result = true;
      }
    }
    if (elem.type === "URL") {
      if (
        elem.text === "" ||
        elem.url === "" ||
        (elem.url && !/^https:\/\/.*/.test(elem.url)) ||
        elem.textEmpty ||
        elem.textLngError
      ) {
        result = true;
      }
    }
    if (elem.type === "QUICK_REPLY") {
      if (elem.text === "" || elem.textEmpty || elem.textLngError) {
        result = true;
      }
    }
  });
  return result;
}

export function getStatusTemplate(status: string) {
  if (status === "PENDING") {
    return "На проверке";
  }
  if (status === "APPROVED") {
    return "Активный";
  }
  if (status === "REJECTED") {
    return "Отказано";
  }
}

export function validateTemplateButtons(
  templateButtons: templateButton[],
  showTemplateButtons: templateButton[] | null
) {
  let result = false;
  if (templateButtons.length > 0 && !showTemplateButtons) {
    return true;
  }
  if (templateButtons && showTemplateButtons) {
    if (templateButtons.length !== showTemplateButtons.length) {
      result = true;
      return result;
    }
    showTemplateButtons.forEach((showBtn, showBtnIndex) => {
      if (showBtn.type === "PHONE_NUMBER") {
        let showTemplateButton = templateButtons.find((el, elIndex) => {
          if (showBtn.type === "PHONE_NUMBER" && showBtnIndex === elIndex) {
            let phone_number = showBtn.phone_number?.slice(1, 13);
            if (showBtn.text !== el.text || phone_number !== el.phone_number) {
              return el;
            }
          }
        });
        if (showTemplateButton) {
          result = true;
        }
      }
      if (showBtn.type === "URL") {
        let showTemplateButton = templateButtons.find((el, elIndex) => {
          if (showBtn.type === "URL" && showBtnIndex === elIndex) {
            if (showBtn.text !== el.text || showBtn.url !== el.url) {
              return el;
            }
          }
        });
        if (showTemplateButton) {
          result = true;
        }
      }
      if (showBtn.type === "QUICK_REPLY") {
        let showTemplateButton = templateButtons.find((el, elIndex) => {
          if (showBtn.type === "QUICK_REPLY" && showBtnIndex === elIndex) {
            if (showBtn.text !== el.text) {
              return el;
            }
          }
        });
        if (showTemplateButton) {
          result = true;
        }
      }
    });
  }
  return result;
}
export function createTimeStamp() {
  let date = new Date();
  return date.getTime() / 1000;
}
