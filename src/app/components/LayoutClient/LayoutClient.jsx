"use client";

import { useRef, useEffect } from "react";
import LogoHeader from "../LogoHeader/LogoHeader";
import Noise from "../NoiseCanvas/NoiseCanvas";
import AppearRef from "../AppearRef/AppearRef";
import AudioToggleButton from "../AudioToggle/AudioToggle";

export default function LayoutClient({ children }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // 1) Démarrer muet pour que autoplay soit autorisé
    audio.muted = true;

    // 2) Reprendre la position si déjà sauvegardée
    const savedTime = localStorage.getItem("audio-current-time");
    if (savedTime) {
      audio.currentTime = parseFloat(savedTime);
    }

    // 3) Lancer la lecture dès que possible (muet pour l’instant)
    const playAudio = () => {
      audio
        .play()
        .then(() => {
          // Si la lecture démarre avec succès, on peut essayer de retirer le muet
          audio.muted = false;
        })
        .catch((err) => {
          console.warn("Lecture muette (autoplay) :", err.name);
        });
    };

    playAudio();

    // 4) Sur le premier clic utilisateur, on enlève le muet et on joue
    const unmuteAndPlay = () => {
      audio.muted = false;
      audio.play().catch((err) => {
        console.warn("Relance après clic bloquée :", err.name);
      });
      document.removeEventListener("click", unmuteAndPlay);
    };
    document.addEventListener("click", unmuteAndPlay, { once: true });

    // 5) Sauvegarde de la position en continu
    const onTimeUpdate = () => {
      localStorage.setItem("audio-current-time", audio.currentTime);
    };
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      document.removeEventListener("click", unmuteAndPlay);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      localStorage.setItem("audio-current-time", audio.currentTime);
    };
  }, []);

  return (
    <>
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

      <AudioToggleButton audioRef={audioRef} />
    </>
  );
}
