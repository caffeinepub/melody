import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Heart, MoreHorizontal, Music, Play } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Song } from "../backend.d";
import type { PlaylistDTO } from "../backend.d";

interface SongCardProps {
  song: Song;
  isLiked: boolean;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  onLike: (song: Song) => void;
  playlists: PlaylistDTO[];
  onAddToPlaylist: (playlistName: string, song: Song) => void;
  index: number;
}

export function SongCard({
  song,
  isLiked,
  isPlaying,
  onPlay,
  onLike,
  playlists,
  onAddToPlaylist,
  index,
}: SongCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasPreview = !!song.previewUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      data-ocid={`song.item.${index + 1}`}
      className="group relative bg-card hover:bg-secondary rounded-lg p-3 cursor-pointer transition-colors duration-150"
      onClick={() => hasPreview && onPlay(song)}
    >
      {/* Album art */}
      <div className="relative aspect-square rounded-md overflow-hidden mb-3 bg-muted">
        {!imgError && song.albumArt ? (
          <img
            src={song.albumArt}
            alt={song.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-8 h-8 text-muted-foreground" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/40">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-ocid={`song.primary_button.${index + 1}`}
                  size="icon"
                  variant="default"
                  disabled={!hasPreview}
                  className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90 shadow-lg scale-95 hover:scale-100 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasPreview) onPlay(song);
                  }}
                >
                  <Play className="w-4 h-4 fill-primary-foreground text-primary-foreground" />
                </Button>
              </TooltipTrigger>
              {!hasPreview && (
                <TooltipContent>No preview available</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Currently playing indicator */}
        {isPlaying && (
          <div className="absolute top-1 left-1 bg-primary rounded px-1 py-0.5">
            <span className="text-[10px] font-semibold text-primary-foreground">
              ▶ Playing
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-foreground">
            {song.title}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {song.artist}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            data-ocid={`song.toggle.${index + 1}`}
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onLike(song);
            }}
          >
            <Heart
              className={`w-3.5 h-3.5 ${isLiked ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </Button>

          {playlists.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  data-ocid={`song.dropdown_menu.${index + 1}`}
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 rounded-full"
                >
                  <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border"
              >
                {playlists.map((pl) => (
                  <DropdownMenuItem
                    key={pl.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToPlaylist(pl.name, song);
                    }}
                  >
                    Add to {pl.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.div>
  );
}
