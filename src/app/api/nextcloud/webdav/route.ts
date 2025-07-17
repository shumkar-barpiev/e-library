import { NextRequest, NextResponse } from "next/server";
import { nextcloudConfig } from "@/config/nextcloud";

export async function POST(request: NextRequest) {
  try {
    // Get authorization header from the request
    const authorization = request.headers.get("authorization");
    if (!authorization) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 });
    }

    // Extract username from Basic auth
    const authParts = authorization.split(" ");
    if (authParts.length !== 2 || authParts[0] !== "Basic") {
      return NextResponse.json({ error: "Invalid authorization format" }, { status: 401 });
    }

    let username: string;
    try {
      const decoded = atob(authParts[1]);
      username = decoded.split(":")[0];
    } catch (error) {
      return NextResponse.json({ error: "Invalid authorization encoding" }, { status: 401 });
    }

    // Get request body and parameters
    const body = await request.text();
    const { searchParams } = new URL(request.url);
    const depth = searchParams.get("depth") || "0";
    const method = searchParams.get("method") || "PROPFIND";

    console.log(`Making WebDAV ${method} request for user: ${username}, depth: ${depth}`);

    // Construct WebDAV URL
    const webdavUrl = `${nextcloudConfig.defaultServerUrl}/remote.php/dav/files/${username}/`;

    // Make the WebDAV request server-side
    const response = await fetch(webdavUrl, {
      method: method,
      headers: {
        Authorization: authorization,
        "Content-Type": "application/xml",
        "User-Agent": nextcloudConfig.userAgent,
        Depth: depth,
      },
      body: body || undefined,
    });

    console.log(`WebDAV ${method} response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WebDAV error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText.slice(0, 200),
      });
      return NextResponse.json(
        { error: `WebDAV request failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Return the XML response
    const xmlText = await response.text();
    return new NextResponse(xmlText, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("WebDAV proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
