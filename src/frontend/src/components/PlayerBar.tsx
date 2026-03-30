import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Music,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";

export function PlayerBar() {
  const { currentSong, isPlaying, youtubeQuery, playNext, playPrev } =
    usePlayer();

  const [expanded, setExpanded] = useState(false);

  return (
    <div
      data-ocid="player.panel"
      className="border-t border-border"
      style={{
        background: "oklch(0.15 0.02 260)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {/* YouTube iframe panel (expandable) */}
      {expanded && currentSong && (
        <div
          className="w-full flex justify-center py-3 px-4"
          style={{ background: "oklch(0.12 0.02 260)" }}
        >
          <iframe
            key={youtubeQuery}
            width="480"
            height="270"
            src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(youtubeQuery)}&autoplay=${isPlaying ? 1 : 0}`}
            title={`${currentSong.title} - ${currentSong.artist}`}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            className="rounded-xl max-w-full"
            style={{ border: "none" }}
          />
        </div>
      )}

      {/* Control bar */}
      <div className="h-[72px] flex items-center px-4 gap-4">
        {/* Track info */}
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
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">
              {currentSong?.title ?? "No song selected"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong?.artist ?? "Select a song to play"}
            </p>
          </div>
        </div>

        {/* Playback controls */}
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

        {/* Expand toggle */}
        <Button
          data-ocid="player.toggle"
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded((e) => !e)}
          disabled={!currentSong}
          title={expanded ? "Hide player" : "Open YouTube player"}
        >
          {expanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
