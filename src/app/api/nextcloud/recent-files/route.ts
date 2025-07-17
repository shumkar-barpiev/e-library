import { NextRequest, NextResponse } from "next/server";
import { nextcloudConfig } from "@/config/nextcloud";

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const hoursBack = parseInt(searchParams.get("hours") || "72");

    console.log(`Fetching recent files for user: ${username}, last ${hoursBack} hours, limit: ${limit}`);

    // Construct WebDAV URL with actual username
    const webdavUrl = `${nextcloudConfig.defaultServerUrl}/remote.php/dav/files/${encodeURIComponent(username)}/`;

    // PROPFIND request body to get comprehensive file properties
    const propfindBody = `<?xml version="1.0"?>
      <d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
        <d:prop>
          <d:displayname />
          <d:getcontentlength />
          <d:getcontenttype />
          <d:getlastmodified />
          <d:resourcetype />
          <d:getetag />
          <oc:fileid />
        </d:prop>
      </d:propfind>`;

    console.log(`Making WebDAV request to: ${webdavUrl}`);

    // Make the WebDAV request server-side
    const response = await fetch(webdavUrl, {
      method: "PROPFIND",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/xml",
        "User-Agent": nextcloudConfig.userAgent,
        Depth: "infinity", // Get all files recursively
      },
      body: propfindBody,
    });

    console.log(`WebDAV recent files response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WebDAV recent files error:", {
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
        "X-Limit": limit.toString(),
        "X-Hours-Back": hoursBack.toString(),
      },
    });
  } catch (error) {
    console.error("WebDAV recent files error:", error);
    return NextResponse.json({ error: "Internal server error while fetching recent files" }, { status: 500 });
  }
}
