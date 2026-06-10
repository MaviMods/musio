const LAVALINK_BASE = "http://in6.quvera.cloud:1984";
const LAVALINK_PASSWORD = "AeroX";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return Response.json({ error: "Missing path" }, { status: 400 });
  }

  const lavalinkUrl = `${LAVALINK_BASE}${path}`;

  const response = await fetch(lavalinkUrl, {
    headers: {
      Authorization: LAVALINK_PASSWORD,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  return Response.json(data);
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const body = await request.json().catch(() => null);

  if (!path) {
    return Response.json({ error: "Missing path" }, { status: 400 });
  }

  const lavalinkUrl = `${LAVALINK_BASE}${path}`;

  const response = await fetch(lavalinkUrl, {
    method: "POST",
    headers: {
      Authorization: LAVALINK_PASSWORD,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();
  return Response.json(data);
}
