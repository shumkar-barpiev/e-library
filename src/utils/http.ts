import { getCookie } from "@/utils/cookie";

let csrfToken: string | null = null;

export const http = (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = (options.headers as Record<string, string>) ?? {};
  const contentType = headers["Content-Type"];

  if (!csrfToken) {
    csrfToken = getCookie("CSRF-TOKEN");
  }

  if (process.env.NODE_ENV === "development") {
    headers["Authorization"] =
      `Basic ${btoa(process.env.NEXT_PUBLIC_AXELOR_USER + ":" + process.env.NEXT_PUBLIC_AXELOR_PASSWORD)}`;
  }

  if (contentType == null) {
    headers["Content-Type"] = "application/json";
  } else if (contentType === "multipart/form-data") {
    delete headers["Content-Type"];
  }

  options.headers = {
    Accept: "application/json",
    "X-Csrf-Token": csrfToken || "",
    ...headers,
  };

  return fetch(`/foms${url}`, options);
};
