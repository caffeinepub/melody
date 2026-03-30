import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

function formatTime(t: number) {
  if (!Number.isFinite(t) || Number.isNaN(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
  } = usePlayer();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  }

  function handleProgressKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!duration) return;
    if (e.key === "ArrowRight") seek(Math.min(duration, currentTime + 5));
    if (e.key === "ArrowLeft") seek(Math.max(0, currentTime - 5));
  }

  return (
    <div
      data-ocid="player.panel"
      className="h-[90px] flex items-center px-6 gap-6 border-t border-border bg-sidebar"
      style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.4)" }}
    >
      {/* Track info */}
      <div className="flex items-center gap-3 w-[240px] min-w-0">
        {currentSong?.albumArt ? (
          <img
            src={currentSong.albumArt}
            alt={currentSong.title}
            className="w-12 h-12 rounded-md object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate text-foreground">
            {currentSong?.title ?? "No song selected"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {currentSong?.artist ?? ""}
          </p>
        </div>
      </div>

      {/* Controls + progress */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="flex items-center gap-4">
          <Button
            data-ocid="player.secondary_button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={playPrev}
            disabled={!currentSong}
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            data-ocid="player.primary_button"
            size="icon"
            variant="default"
            className="h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90 flex-shrink-0"
            onClick={togglePlay}
            disabled={!currentSong}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </Button>

          <Button
            data-ocid="player.secondary_button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={playNext}
            disabled={!currentSong}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 w-full max-w-[500px]">
          <span className="text-[11px] text-muted-foreground w-8 text-right">
            {formatTime(currentTime)}
          </span>
          <div
            role="slider"
            aria-label="Playback progress"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            tabIndex={0}
            className="flex-1 h-1 rounded-full bg-muted cursor-pointer relative"
            onClick={handleProgressClick}
            onKeyDown={handleProgressKey}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground shadow"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground w-8">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-[160px]">
        <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Slider
          data-ocid="player.toggle"
          value={[volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={([v]) => setVolume(v)}
          className="w-full"
        />
      </div>
    </div>
  );
}
