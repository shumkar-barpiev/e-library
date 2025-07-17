import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "API route is working",
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
  });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: "POST method is also working",
    timestamp: new Date().toISOString(),
  });
}
