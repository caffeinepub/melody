import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Song } from "../backend.d";

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

interface PlayerContextValue extends PlayerState {
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      const idx = queue.findIndex((s) => s.id === currentSong?.id);
      if (idx >= 0 && idx < queue.length - 1) {
        const next = queue[idx + 1];
        setCurrentSong(next);
        audio.src = next.previewUrl;
        audio.play().catch(() => {});
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentSong, queue]);

  const playSong = useCallback(
    (song: Song, newQueue?: Song[]) => {
      const audio = audioRef.current;
      if (!audio || !song.previewUrl) return;
      setCurrentSong(song);
      if (newQueue) setQueue(newQueue);
      audio.src = song.previewUrl;
      audio.volume = volume;
      audio.play().catch(() => {});
      setIsPlaying(true);
    },
    [volume],
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying, currentSong]);

  const playNext = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const idx = queue.findIndex((s) => s.id === currentSong?.id);
    if (idx >= 0 && idx < queue.length - 1) {
      const next = queue[idx + 1];
      setCurrentSong(next);
      audio.src = next.previewUrl;
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [queue, currentSong]);

  const playPrev = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const idx = queue.findIndex((s) => s.id === currentSong?.id);
    if (idx > 0) {
      const prev = queue[idx - 1];
      setCurrentSong(prev);
      audio.src = prev.previewUrl;
      audio.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audio.currentTime = 0;
    }
  }, [queue, currentSong]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    setVolumeState(vol);
    if (audio) audio.volume = vol;
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        playSong,
        togglePlay,
        playNext,
        playPrev,
        seek,
        setVolume,
        audioRef,
      }}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: music player audio, captions not applicable */}
      <audio ref={audioRef} />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
