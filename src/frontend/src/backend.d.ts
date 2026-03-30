import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Song {
    id: string;
    albumArt: string;
    title: string;
    album: string;
    previewUrl: string;
    artist: string;
}
export interface PlaylistDTO {
    name: string;
}
export interface PlayEvent {
    title: string;
    songId: string;
    skipped: boolean;
    playedAt: bigint;
    liked: boolean;
    artist: string;
}
export interface MusicPreferences {
    languages: Array<string>;
    artists: Array<string>;
    genres: Array<string>;
}
export interface UserProfile {
    name: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSongToPlaylist(playlistName: string, song: Song): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPlaylist(playlistName: string): Promise<void>;
    deletePlaylist(playlistName: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMusicPreferences(): Promise<MusicPreferences | null>;
    getPlayHistory(): Promise<Array<PlayEvent>>;
    getSongsInPlaylist(playlistName: string): Promise<Array<Song>>;
    getUserLikedSongs(): Promise<Array<Song>>;
    getUserPlaylists(): Promise<Array<PlaylistDTO>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeSong(song: Song): Promise<void>;
    recordPlayEvent(event: PlayEvent): Promise<void>;
    removeSongFromPlaylist(playlistName: string, song: Song): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveMusicPreferences(prefs: MusicPreferences): Promise<void>;
    searchMusic(term: string): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unlikeSong(song: Song): Promise<void>;
}
