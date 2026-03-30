import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Play, Settings2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MusicPreferences, Song } from "../backend.d";
import { usePlayer } from "../context/PlayerContext";
import { useActor } from "../hooks/useActor";
import { parseSearchResults } from "../hooks/useQueries";

interface HomeViewProps {
  preferences: MusicPreferences | null;
  onEditPreferences: () => void;
}

interface Section {
  id: string;
  title: string;
  subLabel?: string;
  badge?: string;
  searchTerm: string;
}

function buildSections(prefs: MusicPreferences | null): Section[] {
  if (
    !prefs ||
    (prefs.artists.length === 0 &&
      prefs.genres.length === 0 &&
      prefs.languages.length === 0)
  ) {
    return [
      {
        id: "trending",
        title: "Trending Now",
        subLabel: "What everyone's listening to",
        searchTerm: "top hits 2024",
      },
      {
        id: "chill",
        title: "Chill Vibes",
        subLabel: "Perfect for any mood",
        searchTerm: "chill vibes",
      },
      {
        id: "indie",
        title: "Indie Discoveries",
        subLabel: "Hidden gems awaiting",
        searchTerm: "indie pop",
      },
      {
        id: "bollywood",
        title: "Bollywood Beats",
        subLabel: "Desi hits",
        searchTerm: "bollywood hits",
      },
    ];
  }
  const sections: Section[] = [];
  if (prefs.artists.length > 0) {
    const artist = prefs.artists[0];
    sections.push({
      id: "artists",
      title: "Based on Your Favorite Artists",
      subLabel: `Because you like ${artist}`,
      searchTerm: artist,
    });
  }
  if (prefs.genres.length > 0) {
    const genre = prefs.genres[0];
    sections.push({
      id: "genres",
      title: "Your Genres",
      subLabel: `Your ${genre} picks`,
      searchTerm: `${genre} music`,
    });
  }
  const recommendedTerm =
    prefs.artists.length > 0
      ? prefs.artists[
          Math.floor(Math.random() * Math.min(prefs.artists.length, 3))
        ]
      : prefs.genres[0] || "top hits";
  sections.push({
    id: "recommended",
    title: "Recommended for You",
    subLabel: "Made for You ✨",
    badge: "Made for You",
    searchTerm: recommendedTerm,
  });
  if (prefs.languages.length > 0) {
    sections.push({
      id: "language",
      title: "Language-Based Picks",
      subLabel: `Songs in ${prefs.languages.slice(0, 2).join(" & ")}`,
      searchTerm: `${prefs.languages[0]} songs`,
    });
  }
  if (prefs.artists.length > 1) {
    const artist2 = prefs.artists[1];
    sections.push({
      id: "artist2",
      title: `More from ${artist2}`,
      subLabel: `Because you like ${artist2}`,
      searchTerm: artist2,
    });
  }
  return sections;
}

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"];

function SongMiniCard({
  song,
  onPlay,
  isPlaying,
}: { song: Song; onPlay: () => void; isPlaying: boolean }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className={cn(
        "group relative flex-shrink-0 w-40 rounded-xl overflow-hidden transition-all duration-200 text-left hover:scale-105 hover:shadow-lg",
        isPlaying && "ring-2 ring-primary",
      )}
      style={{ background: "oklch(0.22 0.02 260)" }}
    >
      <div className="relative">
        <img
          src={song.albumArt}
          alt={song.title}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div
            className="opacity-0 group-hover:opacity-100 transition-opacity w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "oklch(0.55 0.22 280)" }}
          >
            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
          </div>
        </div>
        {isPlaying && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: "oklch(0.55 0.22 280)", color: "white" }}
          >
            ▶ Playing
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-foreground truncate">
          {song.title}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {song.artist}
        </p>
      </div>
    </button>
  );
}

function SkeletonCards() {
  return (
    <>
      {SKELETON_KEYS.map((k) => (
        <div key={k} className="flex-shrink-0 w-40">
          <Skeleton className="w-40 h-40 rounded-xl" />
          <Skeleton className="w-28 h-3 rounded mt-2" />
          <Skeleton className="w-20 h-2.5 rounded mt-1.5" />
        </div>
      ))}
    </>
  );
}

function SectionRow({
  section,
  currentSong,
  onPlay,
}: {
  section: Section;
  currentSong: Song | null;
  onPlay: (song: Song, queue: Song[]) => void;
}) {
  const { actor, isFetching } = useActor();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!actor || isFetching || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    actor
      .searchMusic(section.searchTerm)
      .then((raw) => {
        setSongs(parseSearchResults(raw).slice(0, 15));
      })
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, [actor, isFetching, section.searchTerm]);

  if (!loading && songs.length === 0) return null;

  return (
    <div data-ocid="home.section">
      <div className="flex items-baseline gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            {section.badge && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  background: "oklch(0.55 0.22 280 / 0.2)",
                  color: "oklch(0.75 0.18 280)",
                  border: "1px solid oklch(0.6 0.2 280 / 0.3)",
                }}
              >
                {section.badge}
              </span>
            )}
            <h2 className="text-lg font-bold text-foreground">
              {section.title}
            </h2>
          </div>
          {section.subLabel && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {section.subLabel}
            </p>
          )}
        </div>
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {loading ? (
          <SkeletonCards />
        ) : (
          songs.map((song) => (
            <SongMiniCard
              key={song.id}
              song={song}
              isPlaying={currentSong?.id === song.id}
              onPlay={() => onPlay(song, songs)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function HomeView({ preferences, onEditPreferences }: HomeViewProps) {
  const { playSong, currentSong } = usePlayer();
  const sections = buildSections(preferences);
  const hasPrefs =
    preferences &&
    (preferences.artists.length > 0 ||
      preferences.genres.length > 0 ||
      preferences.languages.length > 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div
      className="h-full overflow-y-auto scrollbar-thin"
      data-ocid="home.page"
    >
      <div className="px-6 py-6 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {greeting()} 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {hasPrefs
              ? "Here's what's queued up for you today"
              : "Discover music you'll love"}
          </p>
        </div>
        {!hasPrefs && (
          <div
            data-ocid="home.card"
            className="rounded-2xl p-5 mb-8 flex items-center justify-between"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.3 0.1 280 / 0.4), oklch(0.28 0.08 320 / 0.3))",
              border: "1px solid oklch(0.45 0.1 280 / 0.3)",
            }}
          >
            <div>
              <p className="font-semibold text-foreground">
                ✨ Personalize your experience
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tell us what you like — we'll tailor every section
              </p>
            </div>
            <button
              type="button"
              data-ocid="home.primary_button"
              onClick={onEditPreferences}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: "oklch(0.55 0.22 280)", color: "white" }}
            >
              <Settings2 className="w-4 h-4" />
              Edit Preferences
            </button>
          </div>
        )}
        <div className="space-y-10">
          {sections.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              currentSong={currentSong}
              onPlay={playSong}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
