import { nextcloudConfig } from "@/config/nextcloud";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Basic ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 });
    }

    let username: string;
    try {
      const base64Credentials = authorization.split(" ")[1];
      const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");
      const [user] = decoded.split(":");

      if (!user) {
        return NextResponse.json({ error: "Invalid authorization header (missing username)" }, { status: 401 });
      }

      username = user;
    } catch {
      return NextResponse.json({ error: "Invalid authorization encoding" }, { status: 401 });
    }

    console.log(`Testing WebDAV connection for user: ${username}`);

    const webdavUrl = `${nextcloudConfig.defaultServerUrl}/remote.php/dav/files/${encodeURIComponent(username)}/`;

    const propfindBody = `<?xml version="1.0"?>
      <d:propfind xmlns:d="DAV:">
        <d:prop>
          <d:displayname />
        </d:prop>
      </d:propfind>`;

    console.log(webdavUrl);

    const response = await fetch(webdavUrl, {
      method: "PROPFIND",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/xml",
        "User-Agent": nextcloudConfig.userAgent,
        Depth: "0", // Changed to "0" for just testing the root directory
      },
      body: propfindBody,
    });

    console.log(`WebDAV connection test response status: ${response.status}`);

    if (response.status === 401) {
      return NextResponse.json({ error: "Authentication failed - invalid credentials" }, { status: 401 });
    }

    if (response.status === 404) {
      return NextResponse.json({ error: "WebDAV endpoint not found" }, { status: 404 });
    }

    if (response.status === 403) {
      return NextResponse.json({ error: "Access forbidden - user may not have file access" }, { status: 403 });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WebDAV connection test error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText.slice(0, 200),
      });

      return NextResponse.json(
        { error: `WebDAV request failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "WebDAV connection successful",
    });
  } catch (error) {
    console.error("WebDAV connection test error:", error);
    return NextResponse.json({ error: "Internal server error during connection test" }, { status: 500 });
  }
}
