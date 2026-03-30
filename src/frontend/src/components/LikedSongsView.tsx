import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import type { PlaylistDTO, Song } from "../backend.d";
import { usePlayer } from "../context/PlayerContext";
import { useLikedSongs } from "../hooks/useQueries";
import { SongCard } from "./SongCard";

interface LikedSongsViewProps {
  onLike: (song: Song) => void;
  playlists: PlaylistDTO[];
  onAddToPlaylist: (name: string, song: Song) => void;
}

export function LikedSongsView({
  onLike,
  playlists,
  onAddToPlaylist,
}: LikedSongsViewProps) {
  const { data: songs, isLoading } = useLikedSongs();
  const { playSong, currentSong } = usePlayer();

  const likedIds = new Set((songs ?? []).map((s) => s.id));

  return (
    <div className="flex flex-col h-full" data-ocid="liked.panel">
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
            <Heart className="w-7 h-7 text-primary fill-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Collection
            </p>
            <h1 className="text-2xl font-bold text-foreground">Liked Songs</h1>
            <p className="text-sm text-muted-foreground">
              {songs?.length ?? 0} songs
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
        {isLoading && (
          <div
            data-ocid="liked.loading_state"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {Array.from({ length: 6 }).map((_, i) => (
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
            data-ocid="liked.empty_state"
          >
            <Heart className="w-12 h-12 text-muted-foreground/50" />
            <p className="text-lg font-semibold text-foreground">
              No liked songs yet
            </p>
            <p className="text-sm text-muted-foreground">
              Search for songs and hit the heart to save them here
            </p>
          </div>
        )}

        {!isLoading && songs && songs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {songs.map((song, i) => (
              <SongCard
                key={song.id}
                song={song}
                isLiked={likedIds.has(song.id)}
                isPlaying={currentSong?.id === song.id}
                onPlay={(s) => playSong(s, songs)}
                onLike={onLike}
                playlists={playlists}
                onAddToPlaylist={onAddToPlaylist}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
