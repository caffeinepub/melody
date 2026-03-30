import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MusicPreferences } from "../backend.d";
import {
  useMusicPreferences,
  useSaveMusicPreferences,
} from "../hooks/useQueries";
import {
  loadPrefsFromStorage,
  savePrefsToStorage,
} from "../utils/prefsStorage";

const POPULAR_ARTISTS = [
  "Arijit Singh",
  "Taylor Swift",
  "Drake",
  "The Weeknd",
  "Dua Lipa",
  "Ed Sheeran",
  "Shreya Ghoshal",
  "Badshah",
  "AP Dhillon",
  "Billie Eilish",
  "Coldplay",
  "BTS",
];
const GENRES = [
  "Pop",
  "Hip-Hop",
  "Lo-fi",
  "Bollywood",
  "Rock",
  "R&B",
  "Electronic",
  "Classical",
  "Jazz",
  "Punjabi",
  "Soul",
  "Indie",
];
const LANGUAGES = [
  "English",
  "Hindi",
  "Punjabi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Spanish",
  "Korean",
  "French",
];

interface PreferencesModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: (prefs: MusicPreferences) => void;
}

export function PreferencesModal({
  open,
  onClose,
  onSaved,
}: PreferencesModalProps) {
  const { data: savedPrefs } = useMusicPreferences();
  const saveMutation = useSaveMusicPreferences();

  const [artistSearch, setArtistSearch] = useState("");
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      // Load from backend prefs if available, otherwise fall back to localStorage
      const source = savedPrefs ?? loadPrefsFromStorage();
      if (source) {
        setSelectedArtists(source.artists);
        setSelectedGenres(source.genres);
        setSelectedLanguages(source.languages);
      }
    }
  }, [open, savedPrefs]);

  const filteredArtists = POPULAR_ARTISTS.filter(
    (a) =>
      a.toLowerCase().includes(artistSearch.toLowerCase()) &&
      !selectedArtists.includes(a),
  );

  const addArtist = (artist: string) => {
    if (!selectedArtists.includes(artist))
      setSelectedArtists((prev) => [...prev, artist]);
    setArtistSearch("");
  };
  const removeArtist = (artist: string) =>
    setSelectedArtists((prev) => prev.filter((a) => a !== artist));
  const toggleGenre = (g: string) =>
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  const toggleLanguage = (l: string) =>
    setSelectedLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l],
    );

  const handleSave = async () => {
    const prefs: MusicPreferences = {
      artists: selectedArtists,
      genres: selectedGenres,
      languages: selectedLanguages,
    };
    // Always save to localStorage first (works for guests too)
    savePrefsToStorage(prefs);
    // Notify parent immediately for instant home screen update
    onSaved?.(prefs);
    try {
      await saveMutation.mutateAsync(prefs);
    } catch {
      // Backend save may fail for guests — localStorage save is the fallback
    }
    toast.success("Preferences saved!");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="preferences.dialog"
        className="max-w-lg max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Edit Your Music Taste 🎵</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Favorite Artists
            </h3>
            <Input
              data-ocid="preferences.search_input"
              value={artistSearch}
              onChange={(e) => setArtistSearch(e.target.value)}
              placeholder="Search artists..."
              className="mb-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && artistSearch.trim())
                  addArtist(artistSearch.trim());
              }}
            />
            {artistSearch && filteredArtists.length > 0 && (
              <div
                className="rounded-xl overflow-hidden mb-2"
                style={{
                  background: "oklch(0.25 0.02 260)",
                  border: "1px solid oklch(0.32 0.04 280)",
                }}
              >
                {filteredArtists.slice(0, 5).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => addArtist(a)}
                    className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary/60 transition-colors"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
            {!artistSearch &&
              selectedArtists.length < POPULAR_ARTISTS.length && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {POPULAR_ARTISTS.filter((a) => !selectedArtists.includes(a))
                    .slice(0, 6)
                    .map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => addArtist(a)}
                        className="text-xs px-2.5 py-1 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        style={{
                          background: "oklch(0.28 0.04 280)",
                          border: "1px solid oklch(0.35 0.06 280)",
                        }}
                      >
                        + {a}
                      </button>
                    ))}
                </div>
              )}
            {selectedArtists.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedArtists.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                    style={{
                      background: "oklch(0.55 0.22 280 / 0.15)",
                      border: "1px solid oklch(0.6 0.2 280 / 0.4)",
                      color: "oklch(0.82 0.15 280)",
                    }}
                  >
                    <Check className="w-3 h-3" />
                    {a}
                    <button
                      type="button"
                      onClick={() => removeArtist(a)}
                      className="opacity-70 hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Preferred Genres
            </h3>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  data-ocid="preferences.toggle"
                  onClick={() => toggleGenre(g)}
                  className={cn(
                    "text-sm px-3 py-1.5 rounded-full font-medium transition-all",
                    selectedGenres.includes(g)
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                  style={{
                    background: selectedGenres.includes(g)
                      ? "oklch(0.55 0.22 280 / 0.25)"
                      : "oklch(0.26 0.02 260)",
                    border: selectedGenres.includes(g)
                      ? "1px solid oklch(0.65 0.2 280 / 0.6)"
                      : "1px solid oklch(0.32 0.02 260)",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Preferred Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  type="button"
                  data-ocid="preferences.toggle"
                  onClick={() => toggleLanguage(l)}
                  className={cn(
                    "text-sm px-3 py-1.5 rounded-full font-medium transition-all",
                    selectedLanguages.includes(l)
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                  style={{
                    background: selectedLanguages.includes(l)
                      ? "oklch(0.55 0.22 280 / 0.25)"
                      : "oklch(0.26 0.02 260)",
                    border: selectedLanguages.includes(l)
                      ? "1px solid oklch(0.65 0.2 280 / 0.6)"
                      : "1px solid oklch(0.32 0.02 260)",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            data-ocid="preferences.cancel_button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            data-ocid="preferences.save_button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            style={{ background: "oklch(0.55 0.22 280)", color: "white" }}
            className="hover:opacity-90 transition-opacity"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
