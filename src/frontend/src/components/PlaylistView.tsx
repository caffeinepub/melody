import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ListMusic, Trash2 } from "lucide-react";
import type { PlaylistDTO, Song } from "../backend.d";
import { usePlayer } from "../context/PlayerContext";
import { usePlaylistSongs } from "../hooks/useQueries";
import { SongCard } from "./SongCard";

interface PlaylistViewProps {
  name: string;
  likedIds: Set<string>;
  onLike: (song: Song) => void;
  playlists: PlaylistDTO[];
  onAddToPlaylist: (pname: string, song: Song) => void;
  onRemoveSong: (song: Song) => void;
}

export function PlaylistView({
  name,
  likedIds,
  onLike,
  playlists,
  onAddToPlaylist,
  onRemoveSong,
}: PlaylistViewProps) {
  const { data: songs, isLoading } = usePlaylistSongs(name);
  const { playSong, currentSong } = usePlayer();

  return (
    <div className="flex flex-col h-full" data-ocid="playlist.panel">
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
            <ListMusic className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Playlist
            </p>
            <h1 className="text-2xl font-bold text-foreground">{name}</h1>
            <p className="text-sm text-muted-foreground">
              {songs?.length ?? 0} songs
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
        {isLoading && (
          <div
            data-ocid="playlist.loading_state"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg bg-muted" />
                <Skeleton className="h-3 w-3/4 bg-muted" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && songs?.length === 0 && (
          <div
            className="flex flex-col items-center justify-center h-full gap-3"
            data-ocid="playlist.empty_state"
          >
            <ListMusic className="w-12 h-12 text-muted-foreground/50" />
            <p className="text-lg font-semibold text-foreground">
              Playlist is empty
            </p>
            <p className="text-sm text-muted-foreground">
              Search for songs and add them here
            </p>
          </div>
        )}

        {!isLoading && songs && songs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {songs.map((song, i) => (
              <div key={song.id} className="relative group/wrapper">
                <SongCard
                  song={song}
                  isLiked={likedIds.has(song.id)}
                  isPlaying={currentSong?.id === song.id}
                  onPlay={(s) => playSong(s, songs)}
                  onLike={onLike}
                  playlists={playlists}
                  onAddToPlaylist={onAddToPlaylist}
                  index={i}
                />
                <Button
                  data-ocid={`playlist.delete_button.${i + 1}`}
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover/wrapper:opacity-100 transition-opacity hover:text-destructive z-10"
                  onClick={() => onRemoveSong(song)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
