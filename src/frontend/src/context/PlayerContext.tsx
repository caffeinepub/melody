import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { Song } from "../backend.d";
import { YT_VIDEO_ID_PREFIX, getYouTubeApiKey } from "../utils/youtubeApi";

async function fetchYouTubeVideoId(
  query: string,
  apiKey: string,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=1&videoCategoryId=10`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      console.error("[Melody] YouTube API error", res.status);
      return null;
    }
    const data = (await res.json()) as {
      items?: { id?: { videoId?: string } }[];
    };
    return data.items?.[0]?.id?.videoId ?? null;
  } catch (e) {
    console.error("[Melody] YouTube fetch failed", e);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

interface PlayerContextValue {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  youtubeVideoId: string | null;
  isLoadingVideo: boolean;
  videoError: boolean;
  playSong: (song: Song, queue?: Song[]) => void;
  playNext: () => void;
  playPrev: () => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const loadVideoForSong = useCallback(
    async (song: Song, newQueue?: Song[]) => {
      const apiKey = getYouTubeApiKey();
      console.log("[Melody] Playing song:", song.title, "|", song.artist);

      setCurrentSong(song);
      if (newQueue) setQueue(newQueue);
      setIsPlaying(true);
      setVideoError(false);

      // If the song already has a video ID embedded (from YouTube search), use it directly
      if (song.previewUrl?.startsWith(YT_VIDEO_ID_PREFIX)) {
        const videoId = song.previewUrl.slice(YT_VIDEO_ID_PREFIX.length);
        console.log("[Melody] Using embedded video ID:", videoId);
        setIsLoadingVideo(false);
        setYoutubeVideoId(videoId);
        return;
      }

      // Fallback: search YouTube for the video ID
      const query = `${song.title} ${song.artist} official audio`;
      console.log("[Melody] Searching YouTube for:", query);
      setIsLoadingVideo(true);
      setYoutubeVideoId(null);

      const videoId = await fetchYouTubeVideoId(query, apiKey);
      setIsLoadingVideo(false);

      if (videoId) {
        console.log("[Melody] YouTube video ID found:", videoId);
        setYoutubeVideoId(videoId);
      } else {
        console.log("[Melody] No YouTube video found for:", query);
        setVideoError(true);
      }
    },
    [],
  );

  const playSong = useCallback(
    (song: Song, newQueue?: Song[]) => {
      loadVideoForSong(song, newQueue);
    },
    [loadVideoForSong],
  );

  const playNext = useCallback(() => {
    setQueue((q) => {
      setCurrentSong((cur) => {
        const idx = q.findIndex((s) => s.id === cur?.id);
        if (idx >= 0 && idx < q.length - 1) {
          const next = q[idx + 1];
          loadVideoForSong(next);
          return next;
        }
        return cur;
      });
      return q;
    });
  }, [loadVideoForSong]);

  const playPrev = useCallback(() => {
    setQueue((q) => {
      setCurrentSong((cur) => {
        const idx = q.findIndex((s) => s.id === cur?.id);
        if (idx > 0) {
          const prev = q[idx - 1];
          loadVideoForSong(prev);
          return prev;
        }
        return cur;
      });
      return q;
    });
  }, [loadVideoForSong]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        youtubeVideoId,
        isLoadingVideo,
        videoError,
        playSong,
        playNext,
        playPrev,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
