"use client";
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect } from "react";

const Player = ({
  activeSong,
  isPlaying,
  volume,
  seekTime,
  onEnded,
  onTimeUpdate,
  onLoadedData,
  repeat,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  setSeekTime,
  appTime,
}) => {
  const ref = useRef(null);
  // eslint-disable-next-line no-unused-expressions
  if (ref.current) {
    if (isPlaying) {
      ref.current.play();
    } else {
      ref.current.pause();
    }
  }

  // media session metadata — use optional chaining to avoid crashes
  const mediaMetaData = activeSong?.name
    ? {
        title: activeSong?.name,
        artist: activeSong?.primaryArtists ?? "",
        album: activeSong?.album?.name ?? "",
        artwork: [
          {
            src: activeSong?.image?.[2]?.url ?? "",
            sizes: "500x500",
            type: "image/jpg",
          },
        ],
      }
    : {};

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new window.MediaMetadata(mediaMetaData);
      navigator.mediaSession.setActionHandler("play", onPlay);
      navigator.mediaSession.setActionHandler("pause", onPause);
      navigator.mediaSession.setActionHandler("previoustrack", onPreviousTrack);
      navigator.mediaSession.setActionHandler("nexttrack", onNextTrack);
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        setSeekTime(appTime - 5);
      });
      navigator.mediaSession.setActionHandler("seekforward", () => {
        setSeekTime(appTime + 5);
      });
    }
  }, [mediaMetaData]);

  const onPlay = () => { handlePlayPause(); };
  const onPause = () => { handlePlayPause(); };
  const onPreviousTrack = () => { handlePrevSong(); };
  const onNextTrack = () => { handleNextSong(); };

  useEffect(() => {
    ref.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    ref.current.currentTime = seekTime;
  }, [seekTime]);

  // Pick first available download URL (index 0 since Lavalink returns one URL)
  const audioSrc =
    activeSong?.downloadUrl?.[0]?.url ||
    activeSong?.downloadUrl?.[4]?.url ||
    "";

  return (
    <>
      <audio
        src={audioSrc}
        ref={ref}
        loop={repeat}
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
        onLoadedData={onLoadedData}
      />
    </>
  );
};

export default Player;
