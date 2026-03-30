import type { Song } from "../backend.d";

export const YT_VIDEO_ID_PREFIX = "ytid:";

// Internal API key — users do not need to provide this
const YOUTUBE_API_KEY = "AIzaSyBZi2_MOtrL2zE1CS2fgj4UTvBD9yR8m9U";

export function getYouTubeApiKey(): string {
  return YOUTUBE_API_KEY;
}

export function getVideoIdFromSong(song: Song): string | null {
  if (song.previewUrl?.startsWith(YT_VIDEO_ID_PREFIX)) {
    return song.previewUrl.slice(YT_VIDEO_ID_PREFIX.length);
  }
  return null;
}

export async function searchYouTube(
  query: string,
  maxResults = 10,
): Promise<Song[]> {
  const apiKey = getYouTubeApiKey();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { signal: controller.signal });
    if (!res.ok) {
      console.error("[Melody] YouTube search API error", res.status);
      return [];
    }

    const data = (await res.json()) as {
      items?: {
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          channelTitle?: string;
          thumbnails?: { medium?: { url?: string } };
        };
      }[];
    };

    const items = data.items ?? [];
    return items
      .filter((item) => item.id?.videoId && item.snippet?.title)
      .map((item) => ({
        id: item.id!.videoId!,
        title: item.snippet!.title!,
        artist: item.snippet!.channelTitle ?? "",
        albumArt:
          item.snippet!.thumbnails?.medium?.url ??
          `https://i.ytimg.com/vi/${item.id!.videoId}/mqdefault.jpg`,
        previewUrl: YT_VIDEO_ID_PREFIX + item.id!.videoId!,
        album: "",
      }));
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      console.error("[Melody] YouTube search timed out for:", query);
    } else {
      console.error("[Melody] YouTube search failed:", e);
    }
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
