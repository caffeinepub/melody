import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MusicPreferences, PlayEvent, Song } from "../backend.d";
import { useActor } from "./useActor";

export interface iTunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
  collectionName: string;
}

export function parseSearchResults(raw: string): Song[] {
  try {
    const parsed = JSON.parse(raw) as { results: iTunesTrack[] };
    return (parsed.results || []).map((t) => ({
      id: String(t.trackId),
      title: t.trackName,
      artist: t.artistName,
      albumArt: t.artworkUrl100,
      previewUrl: t.previewUrl || "",
      album: t.collectionName || "",
    }));
  } catch {
    return [];
  }
}

export function useSearchMusic(term: string, options?: { enabled?: boolean }) {
  const { actor, isFetching } = useActor();
  const extraEnabled = options?.enabled !== undefined ? options.enabled : true;
  return useQuery<Song[]>({
    queryKey: ["search", term],
    queryFn: async () => {
      if (!actor || !term.trim()) return [];
      const raw = await actor.searchMusic(term);
      return parseSearchResults(raw);
    },
    enabled: !!actor && !isFetching && !!term.trim() && extraEnabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLikedSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["likedSongs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserLikedSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserPlaylists() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["playlists"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserPlaylists();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaylistSongs(name: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["playlist", name],
    queryFn: async () => {
      if (!actor || !name) return [];
      return actor.getSongsInPlaylist(name);
    },
    enabled: !!actor && !isFetching && !!name,
  });
}

export function useLikeSong() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (song: Song) => actor!.likeSong(song),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["likedSongs"] }),
  });
}

export function useUnlikeSong() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (song: Song) => actor!.unlikeSong(song),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["likedSongs"] }),
  });
}

export function useCreatePlaylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => actor!.createPlaylist(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

export function useDeletePlaylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => actor!.deletePlaylist(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
}

export function useAddSongToPlaylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, song }: { name: string; song: Song }) =>
      actor!.addSongToPlaylist(name, song),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["playlist", vars.name] }),
  });
}

export function useRemoveSongFromPlaylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, song }: { name: string; song: Song }) =>
      actor!.removeSongFromPlaylist(name, song),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["playlist", vars.name] }),
  });
}

export function useMusicPreferences() {
  const { actor, isFetching } = useActor();
  return useQuery<MusicPreferences | null>({
    queryKey: ["musicPreferences"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMusicPreferences();
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSaveMusicPreferences() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs: MusicPreferences) => actor!.saveMusicPreferences(prefs),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["musicPreferences"] }),
  });
}

export function useRecordPlayEvent() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: (event: PlayEvent) => actor!.recordPlayEvent(event),
  });
}
