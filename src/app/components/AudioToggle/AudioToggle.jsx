"use client";

import React, { useState } from "react";
import { gsap } from "gsap";
import AudioAnimatedIcon from "../AudioAnimatedIcon/AudioAnimatedIcon";
import "./AudioToggle.scss";

export default function AudioToggleButton() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioActuallyPlaying, setIsAudioActuallyPlaying] = useState(true);

  const toggleAudio = () => {
    setIsPlaying((prev) => {
      const nextState = !prev;
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
      window.dispatchEvent(
        new CustomEvent("toggleAudio", { detail: nextState })
      );
      setIsAudioActuallyPlaying(nextState);
      return nextState;
    });
  };

  return (
    <button
      type="button"
      className="audio_toggle_btn"
      onClick={toggleAudio}
      aria-label={isPlaying ? "Couper le son" : "Activer le son"}
    >
      <AudioAnimatedIcon isPlaying={isAudioActuallyPlaying} />
    </button>
  );
}
