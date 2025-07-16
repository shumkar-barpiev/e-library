import { NextRequest, NextResponse } from "next/server";

interface LogoutRequest {
  username: string;
  appPassword: string;
}

const NEXTCLOUD_SERVER_URL = process.env.NEXT_PUBLIC_NEXTCLOUD_SERVER_URL || "https://jk.sanarip.org";

export async function POST(request: NextRequest) {
  try {
    const { username, appPassword }: LogoutRequest = await request.json();

    if (!username || !appPassword) {
      return NextResponse.json({ error: "Username and app password are required" }, { status: 400 });
    }

    // Delete the app password from Nextcloud
    const success = await deleteAppPassword(username, appPassword);

    return NextResponse.json({
      success,
      message: success ? "Logged out successfully" : "Logout completed (cleanup may have failed)",
    });
  } catch (error) {
    console.error("Logout error:", error);
    // Even if cleanup fails, we consider logout successful
    return NextResponse.json({
      success: true,
      message: "Logout completed (cleanup may have failed)",
    });
  }
}

async function deleteAppPassword(username: string, appPassword: string): Promise<boolean> {
  try {
    const response = await fetch(`${NEXTCLOUD_SERVER_URL}/ocs/v2.php/core/apppassword`, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${appPassword}`).toString("base64")}`,
        "OCS-APIRequest": "true",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting app password:", error);
    return false;
  }
}
