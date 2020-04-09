# DEPRECATED
Don't really need this now that smart speakers/voice assistants are ubiquitous. 

## Shoke
(shower + karaoke = Shoke)

Shoke allows you to control your [Google Play](https://play.google.com/music/listen) music using your voice. The project makes use of [TalAter](https://github.com/TalAter)'s [annyang](https://github.com/TalAter/annyang), an easy to use, multi-browser supported voice recognition library. The idea for Shoke came from [athyuttamre](https://github.com/athyuttamre)'s [ShowerBuddy](https://github.com/athyuttamre/playshowerbuddy.com) project. Originally, Shoke was named Showerify, as it was meant to use the Spotify Web API. However, due to the 30 second song clip limitation of the Spotify Web API, the project was converted to use [jamon](https://github.com/jamon)'s [playmusic](https://github.com/jamon/playmusic) Node.js library, an unofficial API for Google Play Music.

## Supported Commands

**Play**: Plays the current song if paused.
**Pause**: Pauses the current song if playing.
**Previous**: Plays the previous song in the playlist.
**Next**: Plays the next song in the playlist.
**Play [playlistname]**: Plays a random song from the specified playlist.
**Decrease Volume**: Decreases the volume.
**Increase Volume**: Increases the volume.
**Mute**: Mutes the volume.
**Unmute**: Unmutes the volume.
**Set volume to [volume] percent**: Sets the volume to the specified volume.
**Logout**: Logs out the current user.
