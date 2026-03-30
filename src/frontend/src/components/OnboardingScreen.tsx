import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Music, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { MusicPreferences } from "../backend.d";
import { useSaveMusicPreferences } from "../hooks/useQueries";
import { savePrefsToStorage } from "../utils/prefsStorage";

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

const STEPS = [
  {
    key: "artists",
    title: "What artists do you vibe with? 🎤",
    subtitle: "Search and select your favorite artists",
  },
  {
    key: "genres",
    title: "Pick your genres 🎸",
    subtitle: "Choose all that match your vibe",
  },
  {
    key: "languages",
    title: "What languages do you listen in? 🌏",
    subtitle: "We'll find songs that speak your language",
  },
];

interface OnboardingScreenProps {
  onComplete: (prefs: MusicPreferences) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [artistSearch, setArtistSearch] = useState("");
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const saveMutation = useSaveMusicPreferences();

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

  const handleComplete = async () => {
    const prefs: MusicPreferences = {
      artists: selectedArtists,
      genres: selectedGenres,
      languages: selectedLanguages,
    };
    // Save to localStorage immediately so it persists even without login
    savePrefsToStorage(prefs);
    console.log("[Melody] Onboarding complete, preferences saved:", prefs);
    try {
      await saveMutation.mutateAsync(prefs);
    } catch {
      // Backend save may fail if not logged in — localStorage save above is the fallback
    }
    onComplete(prefs);
  };

  const handleSkipAll = async () => {
    const prefs: MusicPreferences = { artists: [], genres: [], languages: [] };
    savePrefsToStorage(prefs);
    try {
      await saveMutation.mutateAsync(prefs);
    } catch {
      // ok
    }
    onComplete(prefs);
  };

  return (
    <div
      data-ocid="onboarding.modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.25 0.12 280) 0%, oklch(0.18 0.08 260) 40%, oklch(0.22 0.1 300) 100%)",
      }}
    >
      <div
        className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.55 0.25 280)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "oklch(0.6 0.22 320)" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-lg"
      >
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: "oklch(0.2 0.02 260 / 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid oklch(0.35 0.08 280 / 0.4)",
          }}
        >
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{
                background: "oklch(0.55 0.22 280 / 0.2)",
                border: "1px solid oklch(0.55 0.22 280 / 0.3)",
              }}
            >
              <Music
                className="w-7 h-7"
                style={{ color: "oklch(0.75 0.18 280)" }}
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Made for You starts here 🎵
            </h1>
            <p className="text-sm text-muted-foreground">
              Takes 30 seconds — totally worth it
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div
                key={s.key}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 24 : 8,
                  height: 8,
                  background:
                    i <= step ? "oklch(0.7 0.2 280)" : "oklch(0.35 0.02 260)",
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-lg font-semibold text-foreground mb-1">
                {STEPS[step].title}
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                {STEPS[step].subtitle}
              </p>

              {step === 0 && (
                <div className="space-y-3">
                  <Input
                    data-ocid="onboarding.search_input"
                    value={artistSearch}
                    onChange={(e) => setArtistSearch(e.target.value)}
                    placeholder="Search artists..."
                    className="bg-secondary/50 border-border/60"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && artistSearch.trim())
                        addArtist(artistSearch.trim());
                    }}
                  />
                  {artistSearch && filteredArtists.length > 0 && (
                    <div
                      className="rounded-xl overflow-hidden"
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
                  {!artistSearch && (
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_ARTISTS.filter(
                        (a) => !selectedArtists.includes(a),
                      )
                        .slice(0, 8)
                        .map((a) => (
                          <button
                            key={a}
                            type="button"
                            onClick={() => addArtist(a)}
                            className="text-xs px-3 py-1.5 rounded-full transition-colors text-muted-foreground hover:text-foreground"
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
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedArtists.map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium"
                          style={{
                            background: "oklch(0.55 0.22 280 / 0.2)",
                            border: "1px solid oklch(0.6 0.2 280 / 0.5)",
                            color: "oklch(0.82 0.15 280)",
                          }}
                        >
                          <Check className="w-3 h-3" />
                          {a}
                          <button
                            type="button"
                            onClick={() => removeArtist(a)}
                            className="opacity-70 hover:opacity-100 ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      data-ocid="onboarding.toggle"
                      onClick={() => toggleGenre(g)}
                      className={cn(
                        "text-sm px-4 py-2 rounded-full font-medium transition-all duration-200",
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
              )}

              {step === 2 && (
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l}
                      type="button"
                      data-ocid="onboarding.toggle"
                      onClick={() => toggleLanguage(l)}
                      className={cn(
                        "text-sm px-4 py-2 rounded-full font-medium transition-all duration-200",
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
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              data-ocid="onboarding.cancel_button"
              onClick={handleSkipAll}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
            <div className="flex items-center gap-3">
              {step > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button
                  data-ocid="onboarding.primary_button"
                  size="sm"
                  onClick={() => setStep((s) => s + 1)}
                  style={{ background: "oklch(0.55 0.22 280)", color: "white" }}
                  className="hover:opacity-90 transition-opacity"
                >
                  Continue →
                </Button>
              ) : (
                <Button
                  data-ocid="onboarding.submit_button"
                  size="sm"
                  onClick={handleComplete}
                  disabled={saveMutation.isPending}
                  style={{ background: "oklch(0.55 0.22 280)", color: "white" }}
                  className="hover:opacity-90 transition-opacity"
                >
                  {saveMutation.isPending ? "Saving..." : "Get Started 🎵"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
