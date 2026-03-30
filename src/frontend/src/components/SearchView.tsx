import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { PlaylistDTO, Song } from "../backend.d";
import { usePlayer } from "../context/PlayerContext";
import { useSearchMusic } from "../hooks/useQueries";
import { SongCard } from "./SongCard";

interface SearchViewProps {
  likedIds: Set<string>;
  onLike: (song: Song) => void;
  playlists: PlaylistDTO[];
  onAddToPlaylist: (name: string, song: Song) => void;
}

const SAMPLE_QUERIES = [
  "The Beatles",
  "Taylor Swift",
  "Daft Punk",
  "Billie Eilish",
];

export function SearchView({
  likedIds,
  onLike,
  playlists,
  onAddToPlaylist,
}: SearchViewProps) {
  const [input, setInput] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const { data: songs, isFetching } = useSearchMusic(debouncedTerm);
  const { playSong, currentSong } = usePlayer();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedTerm(input), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const handlePlay = useCallback(
    (song: Song) => {
      playSong(song, songs ?? []);
    },
    [playSong, songs],
  );

  return (
    <div className="flex flex-col h-full" data-ocid="search.panel">
      {/* Search bar */}
      <div className="px-6 py-4 border-b border-border">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="search.search_input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search for artists, songs, albums…"
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground rounded-xl h-10"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
        {!debouncedTerm && !isFetching && (
          <div
            className="flex flex-col items-center justify-center h-full gap-4 text-center"
            data-ocid="search.empty_state"
          >
            <Search className="w-12 h-12 text-muted-foreground/50" />
            <div>
              <p className="text-lg font-semibold text-foreground">
                Search for music
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try searching for {SAMPLE_QUERIES.join(", ")}
              </p>
            </div>
          </div>
        )}

        {isFetching && (
          <div
            data-ocid="search.loading_state"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {Array.from({ length: 10 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg bg-muted" />
                <Skeleton className="h-3 w-3/4 bg-muted" />
                <Skeleton className="h-3 w-1/2 bg-muted" />
              </div>
            ))}
          </div>
        )}

        {!isFetching && debouncedTerm && songs && songs.length === 0 && (
          <div
            className="flex flex-col items-center justify-center h-full"
            data-ocid="search.empty_state"
          >
            <p className="text-lg font-semibold text-foreground">
              No results for "{debouncedTerm}"
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search term
            </p>
          </div>
        )}

        {!isFetching && songs && songs.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Results for "{debouncedTerm}"
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {songs.map((song, i) => (
                <SongCard
                  key={song.id}
                  song={song}
                  isLiked={likedIds.has(song.id)}
                  isPlaying={currentSong?.id === song.id}
                  onPlay={handlePlay}
                  onLike={onLike}
                  playlists={playlists}
                  onAddToPlaylist={onAddToPlaylist}
                  index={i}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
