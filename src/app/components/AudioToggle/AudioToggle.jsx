// AudioToggleButton.jsx
"use client";

import React, { useState } from "react";
import { gsap } from "gsap";
import AudioAnimatedIcon from "../AudioAnimatedIcon/AudioAnimatedIcon";
import "./AudioToggle.scss";

export default function AudioToggleButton() {
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleAudio = () => {
    setIsPlaying((prev) => {
      const nextState = !prev;
      const audios = document.querySelectorAll("audio");

      audios.forEach((audio) => {
        // Détection du type de fichier
        const src = audio.currentSrc || audio.src;
        const isWav = src.toLowerCase().endsWith(".wav");
        const isMp3 = src.toLowerCase().endsWith(".mp3");

        // Volume cible :
        // - si on remet le son : 0.1 pour WAV, 1 pour MP3, 0.5 pour les autres
        // - si on mute : 0 pour tous
        let targetVolume;
        if (!nextState) {
          targetVolume = 0;
        } else if (isWav) {
          targetVolume = 0.1;
        } else if (isMp3) {
          targetVolume = 1;
        } else {
          targetVolume = 0.5; // fallback pour autres formats
        }

        gsap.to(audio, {
          volume: targetVolume,
          duration: 0.5,
          ease: "power1.inOut",
          onStart: () => {
            if (nextState) {
              audio.play().catch((err) => console.warn("Playback error:", err));
            }
          },
        });
      });

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
      <AudioAnimatedIcon isPlaying={isPlaying} />
    </button>
  );
}
