const LAVALINK_BASE = "http://in6.quvera.cloud:1984";
const LAVALINK_PASSWORD = "AeroX";

const headers = {
  Authorization: LAVALINK_PASSWORD,
  "Content-Type": "application/json",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const encoded = searchParams.get("encoded");

  if (!encoded) {
    return new Response("Missing encoded track", { status: 400 });
  }

  try {
    // Decode to get track info including URI
    const decodeRes = await fetch(
      `${LAVALINK_BASE}/v4/decodetrack?encodedTrack=${encodeURIComponent(encoded)}`,
      { headers }
    );
    const trackInfo = await decodeRes.json();
    const uri = trackInfo?.uri;

    console.log("[stream] decoded URI:", uri);

    if (!uri) {
      return new Response("No URI from Lavalink", { status: 404 });
    }

    // Try to stream the URI server-side (Vercel → source, not browser → source)
    const rangeHeader = request.headers.get("range");
    const audioRes = await fetch(uri, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
        ...(rangeHeader ? { Range: rangeHeader } : {}),
      },
    });

    console.log("[stream] audio response status:", audioRes.status, "content-type:", audioRes.headers.get("content-type"));

    if (!audioRes.ok && audioRes.status !== 206) {
      // Fallback: redirect browser directly to URI and let it try
      return Response.redirect(uri, 302);
    }

    return new Response(audioRes.body, {
      status: audioRes.status,
      headers: {
        "Content-Type": audioRes.headers.get("Content-Type") || "audio/webm",
        "Content-Length": audioRes.headers.get("Content-Length") || "",
        "Content-Range": audioRes.headers.get("Content-Range") || "",
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[stream] error:", error);
    return new Response(`Stream error: ${error.message}`, { status: 500 });
  }
}
