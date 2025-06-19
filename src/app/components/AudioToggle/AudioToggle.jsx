"use client";

import React, { useState } from "react";
import { gsap } from "gsap";
import AudioAnimatedIcon from "../AudioAnimatedIcon/AudioAnimatedIcon"; // ajuste le chemin si besoin
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

        // Volume cible : 0 si on mute, sinon 0.1 pour WAV et 1 pour les autres
        const targetVolume = !nextState ? 0 : isWav ? 0.1 : 1;

        // Si on a un GainNode attaché, anime sa valeur, sinon anime audio.volume
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

        // Relance la lecture si on réactive le son
        if (nextState) {
          audio.play().catch((err) => console.warn("Playback error:", err));
        }
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
