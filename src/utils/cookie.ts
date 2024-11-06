export function getCookie(name: string): string | null {
  let cookieName = encodeURIComponent(name) + "=",
    cookieStart = document.cookie.indexOf(cookieName),
    cookieValue = null,
    cookieEnd;

  if (cookieStart > -1) {
    cookieEnd = document.cookie.indexOf(";", cookieStart);
    if (cookieEnd === -1) {
      cookieEnd = document.cookie.length;
    }
    cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
  }

  return cookieValue;
}

export function setCookie(
  name: string | number | boolean,
  value: string | number | boolean,
  expires?: Date,
  path?: string,
  domain?: string,
  secure: boolean = false
): string {
  let cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  if (expires instanceof Date) {
    cookieText += "; expires=" + expires.toLocaleDateString();
  }

  if (path) {
    cookieText += "; path=" + path;
  }

  if (domain) {
    cookieText += "; domain=" + domain;
  }

  if (secure) {
    cookieText += "; secure";
  }

  document.cookie = cookieText;

  return cookieText;
}
