"use client";
import { useRef, useEffect } from "react";
import LogoHeader from "../LogoHeader/LogoHeader";
import Noise from "../NoiseCanvas/NoiseCanvas";
import AppearRef from "../AppearRef/AppearRef";
import AudioToggleButton from "../AudioToggle/AudioToggle";
import Loader from "../Loader/Loader";
import { gsap } from "gsap";

export default function LayoutClient({ children }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Initialiser le volume
    audio.volume = 0.1;
    audio.muted = true;

    // Charger le temps sauvegardé
    const savedTime = localStorage.getItem("audio-current-time");
    if (savedTime) {
      audio.currentTime = parseFloat(savedTime);
    }

    // Fonction pour jouer l'audio
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

    // Fonction pour activer le son après un clic
    const unmuteAndPlay = () => {
      audio.muted = false;
      audio
        .play()
        .catch((err) => console.warn("Relance après clic bloquée :", err.name));
      document.removeEventListener("click", unmuteAndPlay);
    };
    document.addEventListener("click", unmuteAndPlay, { once: true });

    // Mettre à jour le temps dans le localStorage
    const onTimeUpdate = () => {
      localStorage.setItem("audio-current-time", audio.currentTime);
    };
    audio.addEventListener("timeupdate", onTimeUpdate);

    // Gérer l'événement de toggle audio
    const handleToggleAudio = (event) => {
      const isOn = event.detail;
      gsap.to(audio, {
        volume: isOn ? 0.1 : 0,
        duration: 0.5,
        ease: "power1.inOut",
        onComplete: () => {
          if (!isOn) {
            audio.pause();
          } else {
            audio
              .play()
              .catch((err) => console.warn("Error playing audio:", err));
          }
        },
      });
    };

    window.addEventListener("toggleAudio", handleToggleAudio);

    // Nettoyer les écouteurs d'événements
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
        src="/Audios/Audio.mp3"
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
