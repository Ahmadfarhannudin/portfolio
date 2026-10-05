const TOKEN_URL = "https://accounts.spotify.com/api/token";
const PLAYLIST_ID = "1L2WqUrCNTPee0GsmjWQ9V";
const PLAYLIST_URL = `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}?fields=name,description,images,external_urls,owner(display_name),tracks.items(track(name,artists(name),duration_ms,external_urls))&limit=10`;

// Hardcoded credentials — aman karena repo ini private dan file ini
// hanya jalan di server (Netlify Function), tidak pernah dikirim ke browser.
const SPOTIFY_CLIENT_ID = "83f2123c4bd84d36a9352793aa79b5b2";
const SPOTIFY_CLIENT_SECRET = "6913524fb45247beb4ddba434a47c791";

async function getAppAccessToken() {
  const basic = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
  });

  const rawText = await response.text();

  if (!response.ok) {
    console.error("[TOKEN] error:", rawText.slice(0, 500));
    throw new Error(`Failed to get app token: ${response.status}`);
  }

  const data = JSON.parse(rawText);
  return data.access_token;
}

export async function handler() {
  try {
    const accessToken = await getAppAccessToken();

    const playlistRes = await fetch(PLAYLIST_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const rawText = await playlistRes.text();

    if (!playlistRes.ok) {
      console.error("[PLAYLIST] error:", rawText.slice(0, 500));
      throw new Error(`Failed to fetch playlist: ${playlistRes.status}`);
    }

    const data = JSON.parse(rawText);

    const tracks = (data.tracks?.items || [])
      .filter((item) => item.track)
      .map((item) => ({
        title: item.track.name,
        artist: item.track.artists.map((a) => a.name).join(", "),
        duration: formatDuration(item.track.duration_ms),
        url: item.track.external_urls?.spotify,
      }));

    return {
      statusCode: 200,
      headers: { "Cache-Control": "no-store" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        owner: data.owner?.display_name,
        coverImage: data.images?.[0]?.url,
        playlistUrl: data.external_urls?.spotify,
        tracks,
      }),
    };
  } catch (error) {
    console.error("Spotify function error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}