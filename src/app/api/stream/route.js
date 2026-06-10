const LAVALINK_BASE = "http://in6.quvera.cloud:1984";
const LAVALINK_PASSWORD = "AeroX";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const encoded = searchParams.get("encoded");

  if (!encoded) {
    return new Response("Missing encoded track", { status: 400 });
  }

  try {
    // Decode track to get the signed stream URI from Lavalink
    const decodeRes = await fetch(
      `${LAVALINK_BASE}/v4/decodetrack?encodedTrack=${encodeURIComponent(encoded)}`,
      { headers: { Authorization: LAVALINK_PASSWORD } }
    );

    const trackInfo = await decodeRes.json();
    const uri = trackInfo?.info?.uri;

    console.log("[stream] decoded URI:", uri?.substring(0, 100));

    if (!uri) {
      return new Response("No URI from Lavalink", { status: 404 });
    }

    // Redirect browser directly to the signed YouTube stream URL
    // YouTube signed URLs work when accessed directly by the browser
    return Response.redirect(uri, 302);

  } catch (error) {
    console.error("[stream] error:", error);
    return new Response(`Stream error: ${error.message}`, { status: 500 });
  }
}
