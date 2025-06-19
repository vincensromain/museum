// components/AudioToggle/AudioToggle.jsx
"use client";

import React from "react";
import AudioAnimatedIcon from "../AudioAnimatedIcon/AudioAnimatedIcon";
import "./AudioToggle.scss";

export default function AudioToggleButton({ isPlaying, onToggle }) {
  return (
    <button
      type="button"
      className="audio_toggle_btn"
      onClick={() => onToggle(!isPlaying)}
      aria-label={isPlaying ? "Couper le son" : "Activer le son"}
    >
      <AudioAnimatedIcon isPlaying={isPlaying} />
    </button>
  );
}
