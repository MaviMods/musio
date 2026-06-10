const LAVALINK_BASE = "http://in6.quvera.cloud:1984";
const LAVALINK_PASSWORD = "AeroX";

const lavalinkHeaders = {
  Authorization: LAVALINK_PASSWORD,
  "Content-Type": "application/json",
};

// helper: load tracks from Lavalink v4
async function loadTracks(identifier) {
  const res = await fetch(
    `${LAVALINK_BASE}/v4/loadtracks?identifier=${encodeURIComponent(identifier)}`,
    { headers: lavalinkHeaders }
  );
  return res.json();
}

// home page data — top trending via YouTube Music search
export async function homePageData(language) {
  try {
    const data = await loadTracks(`ytmsearch:top hits ${language}`);
    return data?.data ?? data?.tracks ?? [];
  } catch (error) {
    console.log(error);
  }
}

// get song data by ID (YouTube video ID or direct URL)
export async function getSongData(id) {
  try {
    const data = await loadTracks(`https://www.youtube.com/watch?v=${id}`);
    console.log("song data", data);
    return data?.data ?? data?.tracks ?? [];
  } catch (error) {
    console.log(error);
  }
}

// get album data — search by album id/name on YouTube Music
export async function getAlbumData(id) {
  try {
    const data = await loadTracks(`ytmsearch:${id}`);
    return data?.data ?? data?.tracks ?? [];
  } catch (error) {
    console.log(error);
  }
}

// get playlist data — load a YouTube playlist
export async function getplaylistData(id) {
  try {
    // id should be a YouTube playlist ID e.g. PLxxxxxx
    const data = await loadTracks(`https://www.youtube.com/playlist?list=${id}`);
    return data?.data ?? data?.tracks ?? [];
  } catch (error) {
    console.log(error);
  }
}

// get lyrics — Lavalink v4 lyrics endpoint
export async function getlyricsData(trackEncoded) {
  try {
    const res = await fetch(
      `${LAVALINK_BASE}/v4/sessions/{sessionId}/players/{guildId}/track/lyrics?encoded=${encodeURIComponent(trackEncoded)}`,
      { headers: lavalinkHeaders }
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.log(error);
  }
}

// get artist data — search artist on YouTube Music
export async function getArtistData(id) {
  try {
    const data = await loadTracks(`ytmsearch:${id}`);
    return data?.data ?? data?.tracks ?? [];
  } catch (error) {
    console.log(error);
  }
}

// get artist songs — search artist songs
export async function getArtistSongs(id, page = 0) {
  try {
    const data = await loadTracks(`ytmsearch:${id} songs`);
    const tracks = data?.data ?? data?.tracks ?? [];
    // basic pagination: 10 results per page
    return tracks.slice(page * 10, page * 10 + 10);
  } catch (error) {
    console.log(error);
  }
}

// get artist albums — search artist albums
export async function getArtistAlbums(id, page = 0) {
  try {
    const data = await loadTracks(`ytmsearch:${id} albums`);
    const tracks = data?.data ?? data?.tracks ?? [];
    return tracks.slice(page * 10, page * 10 + 10);
  } catch (error) {
    console.log("album error", error);
  }
}

// get search data
export async function getSearchedData(query) {
  try {
    const data = await loadTracks(`ytmsearch:${query}`);
    return data?.data ?? data?.tracks ?? [];
  } catch (error) {
    console.log(error);
  }
}

// get recommended songs — search related tracks
export async function getRecommendedSongs(artistId, songId) {
  try {
    const data = await loadTracks(`ytmsearch:${artistId} recommended`);
    return data?.data ?? data?.tracks ?? [];
  } catch (error) {
    console.log(error);
  }
}

// ── These remain as internal Next.js API routes (unchanged) ──────────────────

// add and remove from favourite
export async function addFavourite(id) {
  try {
    const response = await fetch("/api/favourite", {
      method: "POST",
      body: JSON.stringify(id),
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (error) {
    console.log("Add favourite API error", error);
  }
}

// get favourite
export async function getFavourite() {
  try {
    const response = await fetch("/api/favourite");
    const data = await response.json();
    return data?.data?.favourites;
  } catch (error) {
    console.log("Get favourite API error", error);
  }
}

// user info
export async function getUserInfo() {
  try {
    const response = await fetch("/api/userInfo");
    const data = await response.json();
    return data?.data;
  } catch (error) {
    console.log("Get user info API error", error);
  }
}

// reset password
export async function resetPassword(password, confirmPassword, token) {
  try {
    const response = await fetch("/api/forgotPassword", {
      method: "PUT",
      body: JSON.stringify({ password, confirmPassword, token }),
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (error) {
    console.log("Reset password API error", error);
  }
}

// send reset password link
export async function sendResetPasswordLink(email) {
  try {
    const response = await fetch("/api/forgotPassword", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (error) {
    console.log("Send reset password link API error", error);
  }
}
