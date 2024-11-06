export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  } as T;
}

export function throttle<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let lastTime: number = 0;
  return function (this: any, ...args: any[]) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      return func.apply(this, args);
    }
  } as T;
}

export function sleep(duration: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}

export function formatNumber(value: string): string {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export const isDebug = process.env.NODE_ENV === "development";

export const isProduction = process.env.NODE_ENV === "production";
