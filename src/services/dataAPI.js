// helper: load tracks via the Vercel proxy (avoids HTTP/HTTPS mixed content)
async function loadTracks(identifier) {
  const path = `/v4/loadtracks?identifier=${encodeURIComponent(identifier)}`;
  const res = await fetch(
    `/api/lavalink?path=${encodeURIComponent(path)}`
  );
  return res.json();
}

// home page data — top trending via YouTube Music search
export async function homePageData(language) {
  try {
    // language can be a string or array — normalise to a single string
    const lang = Array.isArray(language) ? language[0] : language;
    const data = await loadTracks(`ytmsearch:top hits ${lang}`);
    const tracks = data?.data ?? data?.tracks ?? [];

    // Map tracks into a JioSaavn-compatible shape with a charts array
    const charts = tracks.map((t) => ({
      id: t.encoded ?? t.info?.identifier ?? "",
      name: t.info?.title ?? "Unknown",
      image: [
        { url: t.info?.artworkUrl ?? "" },
        { url: t.info?.artworkUrl ?? "" },
        { url: t.info?.artworkUrl ?? "" },
      ],
      songs: [],
      description: t.info?.author ?? "",
    }));

    return { charts, trending: { songs: tracks, albums: [] } };
  } catch (error) {
    console.log(error);
  }
}

// get song data — accepts a single ID string or an array of IDs
export async function getSongData(id) {
  try {
    // Array of IDs: fetch all in parallel and flatten results
    if (Array.isArray(id)) {
      const results = await Promise.all(
        id.map(async (songId) => {
          const data = await loadTracks(
            `https://www.youtube.com/watch?v=${songId}`
          );
          const tracks = data?.data ?? data?.tracks ?? [];
          return Array.isArray(tracks) ? tracks : [tracks];
        })
      );
      const flat = results.flat().filter(Boolean);
      console.log("song data (batch)", flat);
      return flat;
    }

    // Single ID
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
    const tracks = data?.data ?? data?.tracks ?? [];

    // Map Lavalink track fields to JioSaavn-compatible shape
    const songs = tracks.map((t) => ({
      id: t.encoded ?? t.info?.identifier,
      name: t.info?.title ?? "Unknown",
      duration: t.info?.length ? Math.floor(t.info.length / 1000) : 0,
      playCount: null,
      image: [
        { url: t.info?.artworkUrl ?? "" },
        { url: t.info?.artworkUrl ?? "" },
        { url: t.info?.artworkUrl ?? "" },
      ],
      downloadUrl: [{ url: t.info?.uri ?? "" }],
      primaryArtists: t.info?.author ?? "",
      primaryArtistsId: "",
    }));

    const first = tracks[0];
    return {
      id,
      name: first?.info?.title ?? id,
      subtitle: first?.info?.author ?? "",
      year: null,
      songCount: songs.length,
      primaryArtists: first?.info?.author ?? "",
      primaryArtistsId: "",
      image: [
        { url: first?.info?.artworkUrl ?? "" },
        { url: first?.info?.artworkUrl ?? "" },
        { url: first?.info?.artworkUrl ?? "" },
      ],
      songs,
    };
  } catch (error) {
    console.log(error);
  }
}

// get playlist data — load a YouTube playlist
export async function getplaylistData(id) {
  try {
    const data = await loadTracks(`https://www.youtube.com/playlist?list=${id}`);
    const tracks = data?.data ?? data?.tracks ?? [];

    const songs = tracks.map((t) => ({
      id: t.encoded ?? t.info?.identifier ?? "",
      name: t.info?.title ?? "Unknown",
      duration: t.info?.length ? Math.floor(t.info.length / 1000) : 0,
      playCount: null,
      image: [
        { url: t.info?.artworkUrl ?? "" },
        { url: t.info?.artworkUrl ?? "" },
        { url: t.info?.artworkUrl ?? "" },
      ],
      downloadUrl: [{ url: t.info?.uri ?? "" }],
      primaryArtists: t.info?.author ?? "",
      primaryArtistsId: "",
    }));

    const playlistInfo = data?.playlistInfo ?? {};
    return {
      id,
      name: playlistInfo?.name ?? id,
      description: playlistInfo?.description ?? "",
      image: [
        { url: playlistInfo?.artworkUrl ?? songs[0]?.image?.[0]?.url ?? "" },
        { url: playlistInfo?.artworkUrl ?? songs[0]?.image?.[1]?.url ?? "" },
        { url: playlistInfo?.artworkUrl ?? songs[0]?.image?.[2]?.url ?? "" },
      ],
      songs,
    };
  } catch (error) {
    console.log(error);
  }
}

// get lyrics — Lavalink v4 lyrics endpoint
export async function getlyricsData(trackEncoded, sessionId, guildId) {
  try {
    const path = `/v4/sessions/${sessionId}/players/${guildId}/track/lyrics?encoded=${encodeURIComponent(trackEncoded)}`;
    const res = await fetch(`/api/lavalink?path=${encodeURIComponent(path)}`);
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
