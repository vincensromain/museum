"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./AudioAnimatedIcon.scss";

export default function AudioAnimatedIcon({ isPlaying }) {
  const barsRef = useRef([]);

  useEffect(() => {
    if (!barsRef.current) return;

    if (isPlaying) {
      barsRef.current.forEach((bar, i) => {
        gsap.to(bar, {
          height: "16px",
          duration: 0.4,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          delay: i * 0.1,
        });
      });
    } else {
      gsap.killTweensOf(barsRef.current);
      barsRef.current.forEach((bar) => {
        gsap.to(bar, {
          height: "10px",
          duration: 0.3,
          ease: "power1.out",
        });
      });
    }
  }, [isPlaying]);

  return (
    <div className="audio_bars_wrapper">
      {[0, 1, 2, 3, 4].map((_, i) => (
        <span
          key={i}
          ref={(el) => (barsRef.current[i] = el)}
          className="audio_bar"
        />
      ))}
    </div>
  );
}
