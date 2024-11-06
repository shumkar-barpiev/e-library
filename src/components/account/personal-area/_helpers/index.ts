import { randomBytes } from "crypto";

export enum StatusColor {
  "current" = "success",
  "irrelevant" = "error",
}

export enum StatusTitle {
  "current" = "Актуально",
  "irrelevant" = "Неактуально",
}

export const NewsFormatDate = (dateString: string) => {
  const date = new Date(dateString);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };

  return date.toLocaleDateString("ru-RU", options);
};

export const FormatDateWithTime = (dateString: string) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

export const TicketsFormatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // getUTCMonth() returns month from 0-11
  const year = date.getUTCFullYear().toString();

  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
};

export const ActsFormatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // getUTCMonth() returns month from 0-11
  const year = date.getUTCFullYear().toString().slice(2);

  const formattedDate = `${day}.${month}.${year}`;

  return formattedDate;
};

export function generateUUID() {
  const bytes = randomBytes(16);

  bytes[6] = (bytes[6] & 0x0f) | 0x40;

  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const uuid = [
    bytes.toString("hex").slice(0, 8),
    bytes.toString("hex").slice(8, 12),
    bytes.toString("hex").slice(12, 16),
    bytes.toString("hex").slice(16, 20),
    bytes.toString("hex").slice(20, 32),
  ].join("-");

  return uuid;
}
