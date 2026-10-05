import { useState } from "react";
import { ExternalLink } from "lucide-react";
import "./SpotifyNowPlaying.css";

const PLAYLIST_ID = "1L2WqUrCNTPee0GsmjWQ9V";

// theme=0 -> tema gelap bawaan Spotify
const SPOTIFY_EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;
const SPOTIFY_PLAYLIST_URL = `https://open.spotify.com/playlist/${PLAYLIST_ID}`;

// Tinggi 352 menampilkan daftar lagu vertikal penuh di desktop & mobile.
const HEIGHT = 352;

function SpotifyLogo({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 1.8A10.2 10.2 0 1 0 12 22.2 10.2 10.2 0 0 0 12 1.8Zm4.68 14.7c-.18.27-.55.36-.82.18-2.25-1.38-5.08-1.69-8.42-.92a.6.6 0 1 1-.27-1.17c3.65-.84 6.77-.5 9.3 1.05.27.17.36.54.21.86Zm1.1-2.46a.75.75 0 0 1-1.03.24c-2.58-1.59-6.51-2.05-9.56-1.12a.75.75 0 1 1-.43-1.44c3.48-1.05 7.81-.54 10.76 1.27.35.2.47.67.26 1.05Zm.1-2.57C14.8 9.55 9.35 9.37 6.1 10.35a.9.9 0 1 1-.52-1.72c3.73-1.13 9.96-.91 13.73 1.32a.9.9 0 0 1-.43 1.52Z" />
    </svg>
  );
}

export default function SpotifyNowPlaying() {
  const [loaded, setLoaded] = useState(false);

  return (
    <section className="spotify-widget" aria-labelledby="spotify-widget-title">
      <header className="spotify-header">
        <div className="spotify-header-main">
          <span className="spotify-logo-badge">
            <SpotifyLogo className="spotify-logo-badge-icon" />
          </span>
          <div className="spotify-header-text">
            <h2 id="spotify-widget-title" className="spotify-title">
              Daily Rotation
            </h2>
            <p className="spotify-subtitle">My Spotify playlist</p>
          </div>
        </div>
        <span className="spotify-status">
          <span className="spotify-status-dot" aria-hidden="true" />
          Now Playing
        </span>
      </header>

      <div className="spotify-player">
        <div className="spotify-iframe-wrap" data-loaded={loaded}>
          <iframe
            className="spotify-iframe"
            data-testid="embed-iframe"
            src={SPOTIFY_EMBED_URL}
            width="100%"
            height={HEIGHT}
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Daily Rotation Spotify Playlist"
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>

      <footer className="spotify-footer">
        <a
          href={SPOTIFY_PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="spotify-open-link"
        >
          <span>Open in Spotify</span>
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </footer>
    </section>
  );
}
