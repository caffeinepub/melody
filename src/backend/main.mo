
import Outcall "http-outcalls/outcall";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  module Song {
    public func compare(song1 : Song, song2 : Song) : Order.Order {
      Text.compare(song1.id, song2.id);
    };
  };

  module Playlist {
    public func compareByName(p1 : Playlist, p2 : Playlist) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  type Song = {
    id : Text;
    title : Text;
    artist : Text;
    albumArt : Text;
    previewUrl : Text;
    album : Text;
  };

  type Playlist = {
    name : Text;
    songs : Set.Set<Song>;
  };

  public type PlaylistDTO = {
    name : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  public type MusicPreferences = {
    artists : [Text];
    genres : [Text];
    languages : [Text];
  };

  public type PlayEvent = {
    songId : Text;
    title : Text;
    artist : Text;
    playedAt : Int;
    liked : Bool;
    skipped : Bool;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userLikedSongs = Map.empty<Principal, Set.Set<Song>>();
  let userPlaylists = Map.empty<Principal, Map.Map<Text, Playlist>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let musicPreferences = Map.empty<Principal, MusicPreferences>();
  let playHistory = Map.empty<Principal, [PlayEvent]>();

  public query ({ caller }) func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  public func searchMusic(term : Text) : async Text {
    let url = "https://itunes.apple.com/search?term=" # term # "&media=music&limit=20";
    await Outcall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func likeSong(song : Song) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like songs");
    };

    let currentLikes = switch (userLikedSongs.get(caller)) {
      case (null) { Set.empty<Song>() };
      case (?likes) { likes };
    };

    currentLikes.add(song);
    userLikedSongs.add(caller, currentLikes);
  };

  public shared ({ caller }) func unlikeSong(song : Song) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike songs");
    };

    switch (userLikedSongs.get(caller)) {
      case (null) {
        Runtime.trap("No liked songs found for user");
      };
      case (?likes) {
        likes.remove(song);
        userLikedSongs.add(caller, likes);
      };
    };
  };

  public query ({ caller }) func getUserLikedSongs() : async [Song] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view liked songs");
    };

    switch (userLikedSongs.get(caller)) {
      case (null) { [] };
      case (?likes) { likes.values().toArray().sort() };
    };
  };

  public shared ({ caller }) func createPlaylist(playlistName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create playlists");
    };

    let currentPlaylists = switch (userPlaylists.get(caller)) {
      case (null) { Map.empty<Text, Playlist>() };
      case (?pl) { pl };
    };

    let newPlaylist : Playlist = {
      name = playlistName;
      songs = Set.empty<Song>();
    };

    currentPlaylists.add(playlistName, newPlaylist);
    userPlaylists.add(caller, currentPlaylists);
  };

  public shared ({ caller }) func deletePlaylist(playlistName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete playlists");
    };

    switch (userPlaylists.get(caller)) {
      case (null) {
        Runtime.trap("No playlists found for user");
      };
      case (?playlists) {
        playlists.remove(playlistName);
        userPlaylists.add(caller, playlists);
      };
    };
  };

  public shared ({ caller }) func addSongToPlaylist(playlistName : Text, song : Song) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify playlists");
    };

    switch (userPlaylists.get(caller)) {
      case (null) {
        Runtime.trap("No playlists found for user");
      };
      case (?playlists) {
        switch (playlists.get(playlistName)) {
          case (null) {
            Runtime.trap("Playlist not found");
          };
          case (?playlist) {
            playlist.songs.add(song);
            let updatedPlaylist : Playlist = {
              name = playlist.name;
              songs = playlist.songs;
            };
            playlists.add(playlistName, updatedPlaylist);
          };
        };
      };
    };
  };

  public shared ({ caller }) func removeSongFromPlaylist(playlistName : Text, song : Song) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can modify playlists");
    };

    switch (userPlaylists.get(caller)) {
      case (null) {
        Runtime.trap("No playlists found for user");
      };
      case (?playlists) {
        switch (playlists.get(playlistName)) {
          case (null) {
            Runtime.trap("Playlist not found");
          };
          case (?playlist) {
            playlist.songs.remove(song);
            let updatedPlaylist : Playlist = {
              name = playlist.name;
              songs = playlist.songs;
            };
            playlists.add(playlistName, updatedPlaylist);
          };
        };
      };
    };
  };

  public query ({ caller }) func getUserPlaylists() : async [PlaylistDTO] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view playlists");
    };

    switch (userPlaylists.get(caller)) {
      case (null) { [] };
      case (?playlists) {
        let playlistDTOs = playlists.values().toArray().map(
          func(playlist) { { name = playlist.name } }
        );
        playlistDTOs;
      };
    };
  };

  public query ({ caller }) func getSongsInPlaylist(playlistName : Text) : async [Song] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view playlists");
    };

    switch (userPlaylists.get(caller)) {
      case (null) {
        Runtime.trap("No playlists found for user");
      };
      case (?playlists) {
        switch (playlists.get(playlistName)) {
          case (null) {
            Runtime.trap("Playlist not found");
          };
          case (?playlist) {
            playlist.songs.values().toArray().sort();
          };
        };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveMusicPreferences(prefs : MusicPreferences) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save preferences");
    };
    musicPreferences.add(caller, prefs);
  };

  public query ({ caller }) func getMusicPreferences() : async ?MusicPreferences {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view preferences");
    };
    musicPreferences.get(caller);
  };

  public shared ({ caller }) func recordPlayEvent(event : PlayEvent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record play events");
    };

    let currentHistory = switch (playHistory.get(caller)) {
      case (null) { [] };
      case (?history) { history };
    };

    let updatedHistory = [event].concat(currentHistory);

    let cappedHistory = updatedHistory.values().take(
      if (updatedHistory.size() > 100) { 100 } else { updatedHistory.size() }
    ).toArray();

    playHistory.add(caller, cappedHistory);
  };

  public query ({ caller }) func getPlayHistory() : async [PlayEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view play history");
    };

    switch (playHistory.get(caller)) {
      case (null) { [] };
      case (?history) { history };
    };
  };
};

