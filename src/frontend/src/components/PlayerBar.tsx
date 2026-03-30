import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Music,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";

export function PlayerBar() {
  const {
    currentSong,
    youtubeVideoId,
    isLoadingVideo,
    videoError,
    playNext,
    playPrev,
  } = usePlayer();

  const [expanded, setExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (youtubeVideoId) {
      setExpanded(true);
    }
  }, [youtubeVideoId]);

  useEffect(() => {
    if (currentSong?.id) {
      setExpanded(true);
    }
  }, [currentSong?.id]);

  const embedSrc = youtubeVideoId
    ? `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`
    : "";

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
          className="w-full flex flex-col items-center py-3 px-4 gap-2"
          style={{ background: "oklch(0.12 0.02 260)" }}
        >
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">
              {currentSong.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentSong.artist}
            </p>
          </div>

          {isLoadingVideo && (
            <div
              className="w-full max-w-lg h-[270px] rounded-xl flex flex-col items-center justify-center gap-3"
              style={{ background: "oklch(0.18 0.02 260)" }}
            >
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground">
                Finding song on YouTube…
              </p>
            </div>
          )}

          {videoError && !isLoadingVideo && (
            <div
              className="w-full max-w-lg h-[100px] rounded-xl flex items-center justify-center text-muted-foreground text-sm"
              style={{ background: "oklch(0.18 0.02 260)" }}
            >
              Song not available on YouTube, try another
            </div>
          )}

          {!isLoadingVideo && !videoError && youtubeVideoId && (
            <iframe
              ref={iframeRef}
              key={youtubeVideoId}
              width="480"
              height="270"
              src={embedSrc}
              title={`${currentSong.title} - ${currentSong.artist}`}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              className="rounded-xl max-w-full"
              style={{ border: "none" }}
            />
          )}
        </div>
      )}

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
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">
              {currentSong?.title ?? "No song selected"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {isLoadingVideo
                ? "Searching YouTube…"
                : (currentSong?.artist ?? "Tap any song to play")}
            </p>
          </div>
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
