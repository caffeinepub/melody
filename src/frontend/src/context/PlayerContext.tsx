import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { Song } from "../backend.d";

interface PlayerContextValue {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  youtubeQuery: string;
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  setVolume: (vol: number) => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

function buildQuery(song: Song) {
  return `${song.title} ${song.artist} official audio`;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [youtubeQuery, setYoutubeQuery] = useState("");

  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    setCurrentSong(song);
    if (newQueue) setQueue(newQueue);
    setYoutubeQuery(buildQuery(song));
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const playNext = useCallback(() => {
    setQueue((q) => {
      setCurrentSong((cur) => {
        const idx = q.findIndex((s) => s.id === cur?.id);
        if (idx >= 0 && idx < q.length - 1) {
          const next = q[idx + 1];
          setYoutubeQuery(buildQuery(next));
          setIsPlaying(true);
          return next;
        }
        return cur;
      });
      return q;
    });
  }, []);

  const playPrev = useCallback(() => {
    setQueue((q) => {
      setCurrentSong((cur) => {
        const idx = q.findIndex((s) => s.id === cur?.id);
        if (idx > 0) {
          const prev = q[idx - 1];
          setYoutubeQuery(buildQuery(prev));
          setIsPlaying(true);
          return prev;
        }
        return cur;
      });
      return q;
    });
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        volume,
        youtubeQuery,
        playSong,
        togglePlay,
        playNext,
        playPrev,
        setVolume,
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
