import { Button } from "@/components/ui/button";
import { Music, SkipBack, SkipForward } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

export function PlayerBar() {
  const {
    currentSong,
    isLoadingVideo,
    playNext,
    playPrev,
    isMiniPlayer,
    expandPlayer,
  } = usePlayer();

  return (
    <div
      data-ocid="player.panel"
      className="border-t border-border"
      style={{
        background: "oklch(0.15 0.02 260)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* Control bar */}
      <div className="h-[72px] flex items-center px-4 gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {currentSong?.albumArt ? (
            <img
              src={currentSong.albumArt}
              alt={currentSong.title}
              className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <button
            type="button"
            className="min-w-0 text-left bg-transparent border-none p-0"
            onClick={isMiniPlayer && currentSong ? expandPlayer : undefined}
            onKeyDown={
              isMiniPlayer && currentSong
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") expandPlayer();
                  }
                : undefined
            }
            style={{
              cursor: isMiniPlayer && currentSong ? "pointer" : "default",
            }}
          >
            <p className="text-sm font-semibold truncate text-foreground">
              {currentSong?.title ?? "No song selected"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {isLoadingVideo
                ? "Searching YouTube\u2026"
                : (currentSong?.artist ?? "Tap any song to play")}
            </p>
          </button>
        </div>

        <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}
