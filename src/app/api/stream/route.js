const LAVALINK_BASE = "http://in6.quvera.cloud:1984";
const LAVALINK_PASSWORD = "AeroX";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const encoded = searchParams.get("encoded");

  if (!encoded) {
    return new Response("Missing encoded track", { status: 400 });
  }

  try {
    // Lavalink v4 stream endpoint — streams audio directly
    const streamUrl = `${LAVALINK_BASE}/v4/tracks/${encodeURIComponent(encoded)}/stream`;

    const audioRes = await fetch(streamUrl, {
      headers: {
        Authorization: LAVALINK_PASSWORD,
        ...(request.headers.get("range")
          ? { Range: request.headers.get("range") }
          : {}),
      },
    });

    if (!audioRes.ok) {
      return new Response(`Lavalink stream error: ${audioRes.status}`, {
        status: audioRes.status,
      });
    }

    return new Response(audioRes.body, {
      status: audioRes.status,
      headers: {
        "Content-Type": audioRes.headers.get("Content-Type") || "audio/mpeg",
        "Content-Length": audioRes.headers.get("Content-Length") || "",
        "Content-Range": audioRes.headers.get("Content-Range") || "",
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Stream proxy error:", error);
    return new Response("Stream fetch failed", { status: 500 });
  }
}
