"use client";
import React, { useState, useEffect } from "react";
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
        const isWav = audio.src.includes("audio.wav");
        const targetVolume = nextState ? (isWav ? 0.1 : 1) : 0;

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
    <button className="audio_toggle_btn" onClick={toggleAudio}>
      <AudioAnimatedIcon isPlaying={isPlaying} />
    </button>
  );
}
