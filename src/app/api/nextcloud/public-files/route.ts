import { NextResponse } from "next/server";
import { createClient } from "webdav";

// Accepts POST with JSON body: { shareToken: string }
export async function POST(req: Request) {
  const URL = process.env.NEXT_PUBLIC_NEXTCLOUD_SERVER_URL || "https://jk.sanarip.org";
  try {
    const { shareToken } = await req.json();

    if (!shareToken) {
      return NextResponse.json({ error: "Missing Nextcloud public share token." }, { status: 400 });
    }

    const client = createClient(`${URL}/public.php/webdav/`, {
      username: shareToken, // The share token is used as the username
      password: "", // Password is empty for public shares
    });

    const files = await client.getDirectoryContents("/");

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error fetching public share files:", error);
    return NextResponse.json({ error: "Failed to fetch public files." }, { status: 500 });
  }
}
