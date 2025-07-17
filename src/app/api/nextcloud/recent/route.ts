import { NextRequest, NextResponse } from "next/server";
import { nextcloudConfig } from "@/config/nextcloud";

export async function GET(request: NextRequest) {
  try {
    // Get authentication from request headers
    const authorization = request.headers.get("authorization");

    if (!authorization) {
      return NextResponse.json({ error: "Authorization required" }, { status: 401 });
    }

    // Extract username from Basic auth for WebDAV path
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
    const hoursBack = parseInt(searchParams.get("hours") || "24");

    console.log(`Fetching recent files for user: ${username}, last ${hoursBack} hours`);

    // Use WebDAV PROPFIND to get file metadata recursively
    const webdavUrl = `${nextcloudConfig.defaultServerUrl}/remote.php/dav/files/${username}/`;

    // PROPFIND request body to get comprehensive file properties
    const propfindBody = `<?xml version="1.0" encoding="UTF-8"?>
      <d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.org/ns">
        <d:prop>
          <d:displayname />
          <d:getcontentlength />
          <d:getcontenttype />
          <d:getlastmodified />
          <d:creationdate />
          <d:getetag />
          <d:resourcetype />
          <oc:permissions />
          <oc:size />
          <oc:id />
          <oc:fileid />
          <nc:has-preview />
          <oc:share-types />
        </d:prop>
      </d:propfind>`;

    console.log("Making WebDAV PROPFIND request to:", webdavUrl);
    console.log("Authorization header length:", authorization.length);
    console.log("Request headers:", {
      "Content-Type": "application/xml; charset=utf-8",
      "User-Agent": nextcloudConfig.userAgent,
      Depth: "infinity",
    });

    const response = await fetch(webdavUrl, {
      method: "PROPFIND",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/xml; charset=utf-8",
        "User-Agent": nextcloudConfig.userAgent,
        Depth: "infinity", // Get all files recursively
      },
      body: propfindBody,
    });

    console.log("WebDAV response status:", response.status);
    console.log("WebDAV response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WebDAV error response:", errorText);
      console.error("WebDAV request details:", {
        url: webdavUrl,
        method: "PROPFIND",
        authHeaderExists: !!authorization,
        userAgent: nextcloudConfig.userAgent,
      });
      return NextResponse.json(
        {
          error: `WebDAV API error: ${response.status} ${response.statusText}`,
          details: errorText,
          requestInfo: {
            url: webdavUrl,
            username: username,
            status: response.status,
          },
        },
        { status: response.status }
      );
    }

    const xmlText = await response.text();
    console.log("WebDAV XML response length:", xmlText.length);

    // Parse XML and extract recent files
    const recentFiles = parseWebDAVResponse(xmlText, hoursBack, limit);

    console.log(`Found ${recentFiles.length} recent files modified in last ${hoursBack} hours`);

    return NextResponse.json({
      files: recentFiles,
      total: recentFiles.length,
      source: "webdav_propfind",
      timeframe: `${hoursBack} hours`,
      username: username,
    });
  } catch (error) {
    console.error("Error in WebDAV PROPFIND request:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Parse WebDAV XML response and filter recent files
function parseWebDAVResponse(xmlText: string, hoursBack: number, limit: number): any[] {
  const recentFiles: any[] = [];

  try {
    // Simple XML parsing using regex (in production, use a proper XML parser)
    const responseMatches = xmlText.match(/<d:response[^>]*>[\s\S]*?<\/d:response>/g);

    if (!responseMatches) {
      console.log("No response elements found in XML");
      return [];
    }

    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    console.log("Looking for files modified after:", cutoffTime.toISOString());

    for (const responseXml of responseMatches) {
      try {
        // Extract href (file path)
        const hrefMatch = responseXml.match(/<d:href[^>]*>(.*?)<\/d:href>/);
        const href = hrefMatch ? decodeURIComponent(hrefMatch[1]) : "";

        // Skip if no href or if it's the root directory
        if (!href || href.endsWith("/files/")) continue;

        // Extract resource type to determine if it's a file or folder
        const resourceTypeMatch = responseXml.match(/<d:resourcetype[^>]*>[\s\S]*?<\/d:resourcetype>/);
        const isCollection = resourceTypeMatch && resourceTypeMatch[1].includes("<d:collection");

        // Skip collections (folders)
        if (isCollection) continue;

        // Extract last modified date
        const lastModifiedMatch = responseXml.match(/<d:getlastmodified[^>]*>(.*?)<\/d:getlastmodified>/);
        if (!lastModifiedMatch) continue;

        const lastModifiedStr = lastModifiedMatch[1];
        const lastModified = new Date(lastModifiedStr);

        // Skip if not within timeframe
        if (lastModified < cutoffTime) continue;

        // Extract other properties
        const displayNameMatch = responseXml.match(/<d:displayname[^>]*>(.*?)<\/d:displayname>/);
        const contentLengthMatch = responseXml.match(/<d:getcontentlength[^>]*>(.*?)<\/d:getcontentlength>/);
        const contentTypeMatch = responseXml.match(/<d:getcontenttype[^>]*>(.*?)<\/d:getcontenttype>/);
        const etagMatch = responseXml.match(/<d:getetag[^>]*>(.*?)<\/d:getetag>/);
        const fileIdMatch = responseXml.match(/<oc:fileid[^>]*>(.*?)<\/oc:fileid>/);
        const permissionsMatch = responseXml.match(/<oc:permissions[^>]*>(.*?)<\/oc:permissions>/);
        const shareTypesMatch = responseXml.match(/<oc:share-types[^>]*>[\s\S]*?<\/oc:share-types>/);

        // Extract filename and path
        const pathParts = href.split("/");
        const filename = pathParts[pathParts.length - 1] || displayNameMatch?.[1] || "unknown";
        const dirname =
          pathParts
            .slice(0, -1)
            .join("/")
            .replace(/.*\/files/, "") || "/";

        const fileInfo = {
          id: fileIdMatch?.[1] || Math.random().toString(),
          name: filename,
          basename: displayNameMatch?.[1] || filename,
          dirname: dirname,
          type: "file",
          mime: contentTypeMatch?.[1] || "application/octet-stream",
          size: parseInt(contentLengthMatch?.[1] || "0"),
          mtime: Math.floor(lastModified.getTime() / 1000),
          permissions: permissionsMatch?.[1] || "R",
          etag: etagMatch?.[1]?.replace(/"/g, "") || "",
          href: href,
          lastModified: lastModified.toISOString(),
          isPublic: shareTypesMatch && shareTypesMatch[1].includes("<oc:share-type>3</oc:share-type>"),
        };

        recentFiles.push(fileInfo);
      } catch (parseError) {
        console.warn("Error parsing individual response:", parseError);
        continue;
      }
    }

    // Sort by modification date (newest first) and limit results
    recentFiles.sort((a, b) => b.mtime - a.mtime);
    return recentFiles.slice(0, limit);
  } catch (error) {
    console.error("Error parsing WebDAV XML:", error);
    return [];
  }
}
