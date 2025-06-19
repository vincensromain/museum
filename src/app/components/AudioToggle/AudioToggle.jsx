"use client";

import React, { useState } from "react";
import { gsap } from "gsap";
import AudioAnimatedIcon from "../AudioAnimatedIcon/AudioAnimatedIcon";
import "./AudioToggle.scss";

export default function AudioToggleButton() {
  const [isPlaying, setIsPlaying] = useState(() =>
    JSON.parse(localStorage.getItem("isAudioOn") ?? "true")
  );

  const toggleAudio = () => {
    setIsPlaying((prev) => {
      const nextState = !prev;
      const audios = document.querySelectorAll("audio");

      audios.forEach((audio) => {
        const gainNode = audio._gainNode;
        const targetVolume = nextState ? 1 : 0;

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
      });

      // 1) Dispatch de l'événement global
      window.dispatchEvent(
        new CustomEvent("toggleAudio", { detail: nextState })
      );
      // 2) Persistance
      localStorage.setItem("isAudioOn", JSON.stringify(nextState));
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
