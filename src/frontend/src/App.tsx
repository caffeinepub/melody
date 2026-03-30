import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Download, LogIn, LogOut, Menu } from "lucide-react";
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
import { usePwaInstall } from "./hooks/usePwaInstall";
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
import { loadPrefsFromStorage, savePrefsToStorage } from "./utils/prefsStorage";

type View = "home" | "search" | "liked" | { playlist: string };

function viewKey(v: View): string {
  if (v === "home") return "home";
  if (v === "search") return "search";
  if (v === "liked") return "liked";
  return `playlist:${v.playlist}`;
}

function AppInner() {
  const [view, setView] = useState<View>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [prefsModalOpen, setPrefsModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  // Initialize preferences from localStorage immediately
  const [preferences, setPreferences] = useState<MusicPreferences | null>(
    () => {
      const loaded = loadPrefsFromStorage();
      console.log(
        "[Melody] Loaded musicPreferences from localStorage:",
        localStorage.getItem("musicPreferences"),
      );
      console.log("[Melody] Parsed preferences on mount:", loaded);
      return loaded;
    },
  );

  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { canInstall, triggerInstall } = usePwaInstall();

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

  const recordPlayRef = useRef(recordPlayMutation.mutate);
  recordPlayRef.current = recordPlayMutation.mutate;
  const isLoggedInRef = useRef(isLoggedIn);
  isLoggedInRef.current = isLoggedIn;

  // On mount: if no preferences in localStorage, show onboarding
  useEffect(() => {
    const stored = loadPrefsFromStorage();
    if (!stored) {
      setShowOnboarding(true);
    }
  }, []);

  // When logged-in user's backend prefs load, sync to localStorage and state
  useEffect(() => {
    if (!isLoggedIn || prefsLoading) return;
    if (savedPrefs === null) {
      // Logged in but no backend prefs — show onboarding only if no local prefs
      const local = loadPrefsFromStorage();
      if (!local) setShowOnboarding(true);
    } else if (savedPrefs) {
      // Backend has prefs — sync them
      setPreferences(savedPrefs);
      savePrefsToStorage(savedPrefs);
      setShowOnboarding(false);
      setView((v) => (v === "search" ? "home" : v));
    }
  }, [isLoggedIn, savedPrefs, prefsLoading]);

  // Log preferences whenever they change
  useEffect(() => {
    console.log("[Melody] Current preferences:", preferences);
  }, [preferences]);

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
    savePrefsToStorage(prefs);
    setShowOnboarding(false);
    setView("home");
    console.log("[Melody] Preferences saved from onboarding:", prefs);
    const stored = localStorage.getItem("musicPreferences");
    console.log("[Melody] Verified localStorage musicPreferences:", stored);
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
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-background">
          <header className="flex items-center px-4 py-3 border-b border-border gap-3">
            {/* Hamburger — mobile only */}
            <Button
              data-ocid="nav.toggle"
              size="icon"
              variant="ghost"
              className="md:hidden flex-shrink-0"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Spacer to push auth to right */}
            <div className="flex-1" />

            {/* PWA Install button */}
            {canInstall && (
              <Button
                size="sm"
                variant="outline"
                onClick={triggerInstall}
                className="gap-1.5 text-xs border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </Button>
            )}

            {isLoggedIn ? (
              <>
                <span className="text-xs text-muted-foreground truncate max-w-[140px] hidden sm:inline">
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
        onSaved={(prefs) => {
          setPreferences(prefs);
          savePrefsToStorage(prefs);
          console.log("[Melody] Preferences updated:", prefs);
          const stored = localStorage.getItem("musicPreferences");
          console.log(
            "[Melody] Verified localStorage musicPreferences after edit:",
            stored,
          );
        }}
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
