# Melody

## Current State
Playback uses audio element with song.previewUrl (Spotify 30s preview). PlayerContext manages HTMLAudioElement with audioRef, currentTime, duration, seek. HomeView builds sections from preferences via actor.searchMusic(term). Preferences stored in localStorage via prefsStorage.ts.

## Requested Changes (Diff)

### Add
- YouTube iframe embedded player. When song clicked, search YouTube using "title artist official audio". Embed src: https://www.youtube.com/embed?listType=search&list=QUERY&autoplay=1
- youtubeQuery string state in PlayerContext

### Modify
- PlayerContext: remove audioRef, audio element, currentTime, duration, seek. Add youtubeQuery state. playSong sets currentSong, queue, isPlaying=true, youtubeQuery.
- PlayerBar: replace audio progress bar with YouTube iframe panel shown when currentSong is set. Keep song info, prev/next buttons.
- HomeView: no structural changes needed, verify sections load for personalized terms.

### Remove
- audio element from PlayerContext
- Spotify previewUrl playback
- Progress bar showing 0:30 duration
- seek, currentTime, duration from context interface

## Implementation Plan
1. Refactor PlayerContext.tsx: remove audio, add youtubeQuery
2. Update PlayerBar.tsx: show YouTube iframe when currentSong is set
3. Validate and build
