import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}${request.nextUrl.pathname}${request.nextUrl?.search}`;

  return NextResponse.rewrite(new URL(apiUrl, request.url), {
    request: { headers: request.headers },
  });
}

export const config = {
  matcher: ["/foms/ws/:path*"],
};
