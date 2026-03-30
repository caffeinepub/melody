import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Heart,
  Home,
  ListMusic,
  Plus,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { PlaylistDTO } from "../backend.d";

type View = "home" | "search" | "liked" | { playlist: string };

interface SidebarProps {
  view: View;
  onViewChange: (v: View) => void;
  playlists: PlaylistDTO[];
  onCreatePlaylist: () => void;
  onDeletePlaylist: (name: string) => void;
  isLoggedIn: boolean;
  hasPreferences: boolean;
  onPreferencesEdit: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function isPlaylistView(v: View): v is { playlist: string } {
  return typeof v === "object";
}

export function Sidebar({
  view,
  onViewChange,
  playlists,
  onCreatePlaylist,
  onDeletePlaylist,
  isLoggedIn,
  hasPreferences: _hasPreferences,
  onPreferencesEdit,
  isOpen,
  onClose,
}: SidebarProps) {
  function navigate(v: View) {
    onViewChange(v);
    onClose();
  }

  const sidebarContent = (
    <aside className="w-[240px] flex-shrink-0 flex flex-col bg-sidebar border-r border-border h-full">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
          <img
            src="/assets/uploads/whatsapp_image_2026-03-30_at_11.26.39_am-019d3d51-49a9-707e-a42c-711cc896643d-1.jpeg"
            alt="Melody logo"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-xl font-bold text-foreground tracking-tight">
          Melody
        </span>
      </div>

      <div className="px-3 mb-4">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Navigation
        </p>
        <nav className="space-y-1">
          <button
            type="button"
            data-ocid="nav.link"
            onClick={() => navigate("home")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              view === "home"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            )}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <button
            type="button"
            data-ocid="nav.link"
            onClick={() => navigate("search")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              view === "search"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            )}
          >
            <Search className="w-4 h-4" />
            Search
          </button>
          <button
            type="button"
            data-ocid="nav.link"
            onClick={() => isLoggedIn && navigate("liked")}
            disabled={!isLoggedIn}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              view === "liked"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              !isLoggedIn && "opacity-50 cursor-not-allowed",
            )}
          >
            <Heart className="w-4 h-4" />
            Liked Songs
          </button>
        </nav>
      </div>

      <div className="px-3 flex-1 min-h-0 flex flex-col">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Your Playlists
        </p>
        <ScrollArea className="flex-1 scrollbar-thin">
          <div className="space-y-1 pr-1">
            {playlists.map((pl) => (
              <div key={pl.name} className="group flex items-center gap-1">
                <button
                  type="button"
                  data-ocid="playlist.item.1"
                  disabled={!isLoggedIn}
                  onClick={() => navigate({ playlist: pl.name })}
                  className={cn(
                    "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer text-left",
                    isPlaylistView(view) && view.playlist === pl.name
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                    !isLoggedIn && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <ListMusic className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium truncate flex-1">
                    {pl.name}
                  </span>
                </button>
                <Button
                  data-ocid="playlist.delete_button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive flex-shrink-0"
                  onClick={() => onDeletePlaylist(pl.name)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            {playlists.length === 0 && isLoggedIn && (
              <p className="text-xs text-muted-foreground px-3 py-2">
                No playlists yet
              </p>
            )}
            {!isLoggedIn && (
              <p className="text-xs text-muted-foreground px-3 py-2">
                Log in to see playlists
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="p-3 border-t border-border space-y-1">
        {/* Always visible — for both guests and logged-in users */}
        <Button
          data-ocid="preferences.open_modal_button"
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={onPreferencesEdit}
        >
          <Settings2 className="w-4 h-4" />
          Edit Your Music Taste
        </Button>
        <Button
          data-ocid="playlist.open_modal_button"
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={onCreatePlaylist}
          disabled={!isLoggedIn}
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden md:flex h-full">{sidebarContent}</div>

      {/* Mobile: overlay drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative z-10 h-full"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
