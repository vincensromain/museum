// components/AudioToggle/AudioToggle.jsx
"use client";

import React from "react";
import { gsap } from "gsap";
import AudioAnimatedIcon from "../AudioAnimatedIcon/AudioAnimatedIcon";
import "./AudioToggle.scss";

export default function AudioToggleButton({ isPlaying, onToggle }) {
  const handleToggle = () => {
    const nextState = !isPlaying;
    const audios = document.querySelectorAll("audio");

    audios.forEach((audio) => {
      const src = audio.currentSrc || audio.src;
      const isWav = src.toLowerCase().endsWith(".wav");
      const targetVolume = !nextState ? 0 : isWav ? 0.1 : 1;
      const gainNode = audio._gainNode;

      if (gainNode) {
        gsap.to(gainNode.gain, {
          value: targetVolume,
          duration: 0.5,
          ease: "power1.inOut",
        });
      } else {
        gsap.to(audio, {
          volume: targetVolume,
          duration: 0.5,
          ease: "power1.inOut",
        });
      }

      if (nextState) {
        audio.play().catch((err) => console.warn("Playback error:", err));
      }
    });

    onToggle(nextState);
  };

  return (
    <button
      type="button"
      className="audio_toggle_btn"
      onClick={handleToggle}
      aria-label={isPlaying ? "Couper le son" : "Activer le son"}
    >
      <AudioAnimatedIcon isPlaying={isPlaying} />
    </button>
  );
}
