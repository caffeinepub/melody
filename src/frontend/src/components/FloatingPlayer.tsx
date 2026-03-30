import { Button } from "@/components/ui/button";
import {
  Loader2,
  Maximize2,
  Minimize2,
  Music,
  Pause,
  Play,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { usePlayer } from "../context/PlayerContext";

export function FloatingPlayer() {
  const {
    currentSong,
    youtubeVideoId,
    isLoadingVideo,
    videoError,
    isMiniPlayer,
    isPlayerVisible,
    minimizePlayer,
    expandPlayer,
    closePlayer,
  } = usePlayer();

  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const embedSrc = youtubeVideoId
    ? `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`
    : "";

  const togglePlayPause = () => {
    if (!iframeRef.current?.contentWindow) return;
    if (isPlaying) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo" }),
        "*",
      );
    } else {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "playVideo" }),
        "*",
      );
    }
    setIsPlaying((p) => !p);
  };

  if (!isPlayerVisible || !currentSong) return null;

  // Mini player mode — floating card bottom-right
  if (isMiniPlayer) {
    return (
      <div
        className="fixed z-50 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          bottom: "88px",
          right: "16px",
          width: "280px",
          background: "oklch(0.15 0.03 260)",
          border: "1px solid oklch(0.25 0.03 260)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        {/* Small video or thumbnail */}
        <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
          {isLoadingVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
          {videoError && !isLoadingVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <Music className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          {youtubeVideoId && (
            <iframe
              ref={iframeRef}
              key={youtubeVideoId}
              src={embedSrc}
              title={`${currentSong.title} - ${currentSong.artist}`}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              style={{ border: "none", display: "block" }}
            />
          )}
          {!youtubeVideoId && currentSong.albumArt && (
            <img
              src={currentSong.albumArt}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          )}
          {!youtubeVideoId && !currentSong.albumArt && (
            <div className="w-full h-full flex items-center justify-center bg-black/40">
              <Music className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-white leading-tight">
              {currentSong.title}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {currentSong.artist}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-white hover:bg-white/10 flex-shrink-0"
            onClick={togglePlayPause}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-white hover:bg-white/10 flex-shrink-0"
            onClick={expandPlayer}
            title="Expand player"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-white hover:bg-white/10 flex-shrink-0"
            onClick={closePlayer}
            title="Close player"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  // Full player mode — expanded panel above PlayerBar
  return (
    <div
      className="w-full flex flex-col items-center py-3 px-4 gap-2"
      style={{
        background: "oklch(0.12 0.02 260)",
        borderTop: "1px solid oklch(0.2 0.02 260)",
      }}
    >
      <div className="w-full max-w-lg flex items-center justify-between">
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground">
            {currentSong.title}
          </p>
          <p className="text-xs text-muted-foreground">{currentSong.artist}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={minimizePlayer}
            title="Minimize to mini player"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={closePlayer}
            title="Close player"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
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
  );
}
