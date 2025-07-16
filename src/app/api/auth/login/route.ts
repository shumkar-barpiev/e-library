import { NextRequest, NextResponse } from "next/server";

interface LoginRequest {
  username: string;
  password: string;
}

interface NextcloudUserInfo {
  id: string;
  userid: string;
  displayname: string;
  email: string;
  emailAddress: string;
  groups: string[];
  avatar: string;
}

const NEXTCLOUD_SERVER_URL = process.env.NEXT_PUBLIC_NEXTCLOUD_SERVER_URL || "https://jk.sanarip.org";

export async function POST(request: NextRequest) {
  try {
    const { username, password }: LoginRequest = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Step 1: Try to authenticate with Nextcloud
    const credentials = await authenticateWithNextcloud(username, password);

    // Step 2: Get user information
    const userInfo = await getUserInfo(credentials.loginName, credentials.appPassword);

    // Step 3: Return the combined result
    return NextResponse.json({
      success: true,
      credentials,
      userInfo,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
}

async function authenticateWithNextcloud(username: string, password: string) {
  // First, try to convert to app password if this is a regular password
  const appPassword = await convertToAppPassword(username, password);

  const credentials = {
    server: NEXTCLOUD_SERVER_URL,
    loginName: username,
    appPassword: appPassword || password,
  };

  // Validate the credentials work
  const isValid = await validateCredentials(credentials);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  return credentials;
}

async function convertToAppPassword(username: string, password: string): Promise<string | null> {
  try {
    const response = await fetch(`${NEXTCLOUD_SERVER_URL}/ocs/v2.php/core/getapppassword`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
        "OCS-APIRequest": "true",
        Accept: "application/json",
        "User-Agent": "E-Library-DMS/1.0",
      },
    });

    if (response.status === 403) {
      // Already using app password
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to get app password: ${response.status}`);
    }

    const data = await response.json();
    return data.ocs?.data?.apppassword || null;
  } catch (error) {
    console.error("Error converting to app password:", error);
    // Return null to indicate we should use the original password
    return null;
  }
}

async function validateCredentials(credentials: {
  server: string;
  loginName: string;
  appPassword: string;
}): Promise<boolean> {
  try {
    const response = await fetch(`${credentials.server}/ocs/v1.php/cloud/user`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${credentials.loginName}:${credentials.appPassword}`).toString("base64")}`,
        "OCS-APIRequest": "true",
        Accept: "application/json",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error validating credentials:", error);
    return false;
  }
}

async function getUserInfo(username: string, appPassword: string): Promise<NextcloudUserInfo> {
  try {
    const response = await fetch(`${NEXTCLOUD_SERVER_URL}/ocs/v2.php/cloud/user`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${appPassword}`).toString("base64")}`,
        "OCS-APIRequest": "true",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    const data = await response.json();
    console.log(data);
    return data.ocs.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}
