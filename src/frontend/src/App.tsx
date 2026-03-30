import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { LogIn, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { MusicPreferences, Song } from "./backend.d";
import { CreatePlaylistModal } from "./components/CreatePlaylistModal";
import { HomeView } from "./components/HomeView";
import { LikedSongsView } from "./components/LikedSongsView";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { PlayerBar } from "./components/PlayerBar";
import { PlaylistView } from "./components/PlaylistView";
import { PreferencesModal } from "./components/PreferencesModal";
import { SearchView } from "./components/SearchView";
import { Sidebar } from "./components/Sidebar";
import { PlayerProvider, usePlayer } from "./context/PlayerContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useAddSongToPlaylist,
  useCreatePlaylist,
  useDeletePlaylist,
  useLikeSong,
  useLikedSongs,
  useMusicPreferences,
  useRecordPlayEvent,
  useRemoveSongFromPlaylist,
  useUnlikeSong,
  useUserPlaylists,
} from "./hooks/useQueries";

type View = "home" | "search" | "liked" | { playlist: string };

function viewKey(v: View): string {
  if (v === "home") return "home";
  if (v === "search") return "search";
  if (v === "liked") return "liked";
  return `playlist:${v.playlist}`;
}

function AppInner() {
  const [view, setView] = useState<View>("home");
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [prefsModalOpen, setPrefsModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [preferences, setPreferences] = useState<MusicPreferences | null>(null);

  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const { data: likedSongs = [] } = useLikedSongs();
  const { data: playlists = [] } = useUserPlaylists();
  const { data: savedPrefs, isLoading: prefsLoading } = useMusicPreferences();
  const likeMutation = useLikeSong();
  const unlikeMutation = useUnlikeSong();
  const createPlaylistMutation = useCreatePlaylist();
  const deletePlaylistMutation = useDeletePlaylist();
  const addToPlaylistMutation = useAddSongToPlaylist();
  const removeFromPlaylistMutation = useRemoveSongFromPlaylist();
  const recordPlayMutation = useRecordPlayEvent();
  const { currentSong } = usePlayer();

  // Keep stable refs for best-effort play recording
  const recordPlayRef = useRef(recordPlayMutation.mutate);
  recordPlayRef.current = recordPlayMutation.mutate;
  const isLoggedInRef = useRef(isLoggedIn);
  isLoggedInRef.current = isLoggedIn;

  useEffect(() => {
    if (!isLoggedIn || prefsLoading) return;
    if (savedPrefs === null) {
      setShowOnboarding(true);
    } else {
      setPreferences(savedPrefs ?? null);
      setShowOnboarding(false);
      setView((v) => (v === "search" ? "home" : v));
    }
  }, [isLoggedIn, savedPrefs, prefsLoading]);

  useEffect(() => {
    if (!isLoggedIn) {
      setShowOnboarding(false);
      setPreferences(null);
    }
  }, [isLoggedIn]);

  // Record play events best-effort using refs to avoid stale closures
  useEffect(() => {
    if (!currentSong || !isLoggedInRef.current) return;
    recordPlayRef.current({
      songId: currentSong.id,
      title: currentSong.title,
      artist: currentSong.artist,
      playedAt: BigInt(Date.now()),
      liked: false,
      skipped: false,
    });
  }, [currentSong]);

  const likedIds = new Set(likedSongs.map((s: Song) => s.id));

  const handleLike = useCallback(
    (song: Song) => {
      if (!isLoggedIn) {
        toast.error("Please log in to like songs");
        return;
      }
      if (likedIds.has(song.id)) {
        unlikeMutation.mutate(song, {
          onSuccess: () => toast.success("Removed from liked songs"),
        });
      } else {
        likeMutation.mutate(song, {
          onSuccess: () => toast.success("Added to liked songs"),
        });
      }
    },
    [isLoggedIn, likedIds, likeMutation, unlikeMutation],
  );

  const handleAddToPlaylist = useCallback(
    (name: string, song: Song) => {
      if (!isLoggedIn) {
        toast.error("Please log in");
        return;
      }
      addToPlaylistMutation.mutate(
        { name, song },
        {
          onSuccess: () => toast.success(`Added to ${name}`),
          onError: () => toast.error("Failed to add to playlist"),
        },
      );
    },
    [isLoggedIn, addToPlaylistMutation],
  );

  const handleRemoveFromPlaylist = useCallback(
    (song: Song) => {
      if (typeof view !== "object") return;
      removeFromPlaylistMutation.mutate(
        { name: view.playlist, song },
        {
          onSuccess: () => toast.success("Removed from playlist"),
        },
      );
    },
    [view, removeFromPlaylistMutation],
  );

  const handleCreatePlaylist = useCallback(
    async (name: string) => {
      await createPlaylistMutation.mutateAsync(name);
      toast.success(`Playlist "${name}" created`);
    },
    [createPlaylistMutation],
  );

  const handleDeletePlaylist = useCallback(
    (name: string) => {
      deletePlaylistMutation.mutate(name, {
        onSuccess: () => {
          toast.success(`Playlist "${name}" deleted`);
          if (typeof view === "object" && view.playlist === name)
            setView("home");
        },
      });
    },
    [deletePlaylistMutation, view],
  );

  const handleOnboardingComplete = useCallback((prefs: MusicPreferences) => {
    setPreferences(prefs);
    setShowOnboarding(false);
    setView("home");
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {showOnboarding && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}

      <div className="flex flex-1 min-h-0">
        <Sidebar
          view={view}
          onViewChange={setView}
          playlists={playlists}
          onCreatePlaylist={() => {
            if (!isLoggedIn) {
              toast.error("Please log in to create playlists");
              return;
            }
            setCreatePlaylistOpen(true);
          }}
          onDeletePlaylist={handleDeletePlaylist}
          isLoggedIn={isLoggedIn}
          hasPreferences={!!preferences}
          onPreferencesEdit={() => setPrefsModalOpen(true)}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-background">
          <header className="flex items-center justify-end px-6 py-3 border-b border-border gap-3">
            {isLoggedIn ? (
              <>
                <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {identity?.getPrincipal().toString().slice(0, 12)}…
                </span>
                <Button
                  data-ocid="auth.secondary_button"
                  size="sm"
                  variant="ghost"
                  onClick={clear}
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </Button>
              </>
            ) : (
              <Button
                data-ocid="auth.primary_button"
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                {isLoggingIn ? "Logging in…" : "Log in"}
              </Button>
            )}
          </header>

          <div className="flex-1 min-h-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewKey(view)}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="h-full"
              >
                {view === "home" && (
                  <HomeView
                    preferences={preferences}
                    onEditPreferences={() => setPrefsModalOpen(true)}
                  />
                )}
                {view === "search" && (
                  <SearchView
                    likedIds={likedIds}
                    onLike={handleLike}
                    playlists={playlists}
                    onAddToPlaylist={handleAddToPlaylist}
                  />
                )}
                {view === "liked" && (
                  <LikedSongsView
                    onLike={handleLike}
                    playlists={playlists}
                    onAddToPlaylist={handleAddToPlaylist}
                  />
                )}
                {typeof view === "object" && (
                  <PlaylistView
                    name={view.playlist}
                    likedIds={likedIds}
                    onLike={handleLike}
                    playlists={playlists}
                    onAddToPlaylist={handleAddToPlaylist}
                    onRemoveSong={handleRemoveFromPlaylist}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <PlayerBar />

      <CreatePlaylistModal
        open={createPlaylistOpen}
        onClose={() => setCreatePlaylistOpen(false)}
        onCreate={handleCreatePlaylist}
      />
      <PreferencesModal
        open={prefsModalOpen}
        onClose={() => setPrefsModalOpen(false)}
      />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <AppInner />
    </PlayerProvider>
  );
}
