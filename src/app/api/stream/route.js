const LAVALINK_BASE = "http://in6.quvera.cloud:1984";
const LAVALINK_PASSWORD = "AeroX";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const encoded = searchParams.get("encoded");

  if (!encoded) {
    return new Response("Missing encoded track", { status: 400 });
  }

  try {
    // Use Lavalink's /v4/decodetrack to get the track URI
    const decodeRes = await fetch(
      `${LAVALINK_BASE}/v4/decodetrack?encodedTrack=${encodeURIComponent(encoded)}`,
      {
        headers: {
          Authorization: LAVALINK_PASSWORD,
        },
      }
    );

    const trackInfo = await decodeRes.json();
    const uri = trackInfo?.uri;

    if (!uri) {
      return new Response("No stream URL found", { status: 404 });
    }

    // Fetch the actual audio stream and pipe it through
    const audioRes = await fetch(uri, {
      headers: {
        // Pass through range headers for seeking support
        ...(request.headers.get("range")
          ? { Range: request.headers.get("range") }
          : {}),
      },
    });

    // Stream the audio back to the browser
    return new Response(audioRes.body, {
      status: audioRes.status,
      headers: {
        "Content-Type": audioRes.headers.get("Content-Type") || "audio/mpeg",
        "Content-Length": audioRes.headers.get("Content-Length") || "",
        "Content-Range": audioRes.headers.get("Content-Range") || "",
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Stream proxy error:", error);
    return new Response("Stream fetch failed", { status: 500 });
  }
}
