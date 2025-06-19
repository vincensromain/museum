import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./AudioAnimatedIcon.scss";

export default function AudioAnimatedIcon({ isPlaying: externalPlaying }) {
  const barsRef = useRef([]);
  // Local play state toggled on click, initialized from prop
  const [isPlaying, setIsPlaying] = useState(externalPlaying);

  // Sync local state when external prop changes
  useEffect(() => {
    setIsPlaying(externalPlaying);
  }, [externalPlaying]);

  useEffect(() => {
    if (!barsRef.current) return;

    if (isPlaying) {
      // Start or resume animation
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
      // Kill ongoing tweens and reset bars to default height
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

  // Toggle play state on wrapper click
  const handleToggle = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className="audio_bars_wrapper" onClick={handleToggle}>
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
