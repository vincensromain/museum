"use client";
import React, { useState, useEffect } from "react";
import { gsap } from "gsap";
import AudioAnimatedIcon from "../AudioAnimatedIcon/AudioAnimatedIcon";
import "./AudioToggle.scss";

export default function AudioToggleButton() {
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleAudio = () => {
    const event = new CustomEvent("toggleAudio", { detail: !isPlaying });
    window.dispatchEvent(event);
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const handleToggleAudio = (event) => {
      const audios = document.querySelectorAll("audio");
      audios.forEach((audio) => {
        if (event.detail) {
          if (audio.src.includes("audio.wav")) {
            // Si c'est le fichier audio.wav, on met le volume à 0.1
            gsap.to(audio, {
              volume: 0.1,
              duration: 0.5,
              ease: "power1.out",
              onStart: () => {
                audio
                  .play()
                  .catch((err) => console.warn("Error playing audio:", err));
              },
            });
          } else {
            // Pour les autres fichiers audio, on met le volume à 1
            gsap.to(audio, {
              volume: 1,
              duration: 0.5,
              ease: "power1.out",
              onStart: () => {
                audio
                  .play()
                  .catch((err) => console.warn("Error playing audio:", err));
              },
            });
          }
        } else {
          gsap.to(audio, {
            volume: 0,
            duration: 0.5,
            ease: "power1.in",
            onComplete: () => {
              audio.pause();
            },
          });
        }
      });
    };

    window.addEventListener("toggleAudio", handleToggleAudio);

    return () => {
      window.removeEventListener("toggleAudio", handleToggleAudio);
    };
  }, []);

  return (
    <button className="audio_toggle_btn" onClick={toggleAudio}>
      <AudioAnimatedIcon isPlaying={isPlaying} />
    </button>
  );
}
