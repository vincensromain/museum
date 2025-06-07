"use client";

import { useState } from "react";
import AudioAnimatedIcon from "../AudioAnimatedIcon/AudioAnimatedIcon";
import "./AudioToggle.scss";
import { gsap } from "gsap";

export default function AudioToggleButton({ audioRef }) {
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      // Smooth fade-in
      audio.volume = 0;
      audio.play().then(() => {
        gsap.to(audio, {
          volume: 1,
          duration: 0.5,
          ease: "power1.out",
        });
        setIsPlaying(true);
      });
    } else {
      gsap.to(audio, {
        volume: 0,
        duration: 0.5,
        ease: "power1.in",
        onComplete: () => {
          audio.pause();
          setIsPlaying(false);
        },
      });
    }
  };

  return (
    <button className="audio_toggle_btn" onClick={toggleAudio}>
      <AudioAnimatedIcon isPlaying={isPlaying} />
    </button>
  );
}
