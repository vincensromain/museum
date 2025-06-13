"use client";
import { useRef, useEffect } from "react";
import LogoHeader from "../LogoHeader/LogoHeader";
import Noise from "../NoiseCanvas/NoiseCanvas";
import AppearRef from "../AppearRef/AppearRef";
import AudioToggleButton from "../AudioToggle/AudioToggle";
import Loader from "../Loader/Loader";

export default function LayoutClient({ children }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.1;
    audio.muted = true;
    const savedTime = localStorage.getItem("audio-current-time");
    if (savedTime) {
      audio.currentTime = parseFloat(savedTime);
    }

    const playAudio = () => {
      audio
        .play()
        .then(() => {
          audio.muted = false;
        })
        .catch((err) => {
          console.warn("Lecture muette (autoplay) :", err.name);
        });
    };

    playAudio();

    const unmuteAndPlay = () => {
      audio.muted = false;
      audio.play().catch((err) => {
        console.warn("Relance après clic bloquée :", err.name);
      });
      document.removeEventListener("click", unmuteAndPlay);
    };
    document.addEventListener("click", unmuteAndPlay, { once: true });

    const onTimeUpdate = () => {
      localStorage.setItem("audio-current-time", audio.currentTime);
    };
    audio.addEventListener("timeupdate", onTimeUpdate);

    const handleToggleAudio = (event) => {
      if (event.detail) {
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
    };

    window.addEventListener("toggleAudio", handleToggleAudio);

    return () => {
      document.removeEventListener("click", unmuteAndPlay);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      window.removeEventListener("toggleAudio", handleToggleAudio);
      localStorage.setItem("audio-current-time", audio.currentTime);
    };
  }, []);

  return (
    <>
      <Loader />
      <audio
        ref={audioRef}
        src="/Audios/audio.wav"
        loop
        autoPlay
        preload="auto"
        muted
        style={{ display: "none" }}
      />

      <Noise />

      <AppearRef delay={0.2}>
        <LogoHeader />
      </AppearRef>

      {children}

      <AudioToggleButton />
    </>
  );
}
