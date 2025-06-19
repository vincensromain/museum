"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import AudioToggleButton from "../components/AudioToggleButton"; // ajuste le chemin si besoin
import content from "./data/content.json";
import IconMuseum from "./components/IconsMuseum/IconsMuseum";
import AppearRef from "./components/AppearRef/AppearRef";
import Orb from "./components/Orb/Orb";
import "./page.scss";

gsap.registerPlugin(Draggable);

export default function Home() {
  const orbContainerRef = useRef(null);
  const narrationRef = useRef(null);
  const iconRef = useRef(null);
  const ctaRef = useRef(null);
  const textRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const router = useRouter();
  const { ctaLink, ctaLabel } = content.home;

  const captions = [
    { time: 1.44, text: "Bonjour et bienvenue au Muséum..." },
    { time: 11.68, text: "Tout au long de la visite..." },
    { time: 24.72, text: "Il vous suffira alors de cliquer..." },
    { time: 36.48, text: "Pour respecter le confort de tous..." },
    { time: 45.03, text: "Prenez votre temps, explorez..." },
  ];

  // Timeline du drag CTA
  useEffect(() => {
    const icon = iconRef.current;
    const cta = ctaRef.current;
    const text = textRef.current;
    if (!icon || !cta || !text) return;

    const hintTl = gsap
      .timeline({ delay: 0.5, repeat: -1, repeatDelay: 1 })
      .to(icon, { x: 10, duration: 0.4, ease: "power2.out" })
      .to(icon, { x: 0, duration: 0.4, ease: "power2.inOut" });

    const maxX = cta.offsetWidth - icon.offsetWidth - 13.5;
    Draggable.create(icon, {
      type: "x",
      bounds: { minX: 0, maxX },
      inertia: true,
      onPress() {
        hintTl.kill();
      },
      onDrag() {
        const progress = this.x / maxX;
        gsap.to(text, { opacity: 1 - progress * 2, duration: 0.1 });
      },
      onDragEnd() {
        if (this.x >= maxX - 1) router.push(ctaLink || "#");
        else {
          gsap.to(icon, { x: 0, duration: 0.3, ease: "power2.out" });
          gsap.to(text, { opacity: 1, duration: 0.3, ease: "power2.out" });
        }
      },
    });
  }, [ctaLink, router]);

  // Sous-titrage synchronisé
  useEffect(() => {
    const audio = narrationRef.current;
    if (!audio) return;
    let lastIdx = 0;

    const findIdx = (t) => {
      for (let i = captions.length - 1; i >= 0; i--) {
        if (t >= captions[i].time) return i;
      }
      return 0;
    };

    const onTimeUpdate = () => {
      const idx = findIdx(audio.currentTime);
      if (idx !== lastIdx) {
        lastIdx = idx;
        setCurrentIndex(idx);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [captions]);

  // AudioContext + GainNode + analyser
  useEffect(() => {
    const audioElement = narrationRef.current;
    if (!audioElement) return;

    const onFirstClick = () => {
      setHasInteracted(true);

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioElement);
      const gainNode = audioContext.createGain();
      const analyser = audioContext.createAnalyser();

      source.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(audioContext.destination);

      // Expose le gainNode sur l'élément pour le toggle
      audioElement._gainNode = gainNode;

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const animateOrb = () => {
        requestAnimationFrame(animateOrb);
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        // Met à jour ton orb ici, par ex. :
        // orbMesh.material.uniforms.glowInternalRadius.value = baseRadius + avg/30;
      };
      animateOrb();

      audioElement.play().catch(() => {});
      document.removeEventListener("click", onFirstClick);
    };

    document.addEventListener("click", onFirstClick, { once: true });
    return () => document.removeEventListener("click", onFirstClick);
  }, []);

  // Redémarrage automatique à la fin
  const restartNarration = () => {
    const audio = narrationRef.current;
    if (!audio || !hasInteracted) return;
    setTimeout(() => {
      setCurrentIndex(0);
      audio.currentTime = 0;
      audio
        .play()
        .catch((err) => console.warn("Erreur relance narration :", err));
    }, 2000);
  };

  return (
    <main>
      {/* Bouton de mute/unmute */}
      <AudioToggleButton />

      <section className="home inside">
        <div className="narration">
          <audio
            ref={narrationRef}
            src="/Audios/Introduction.mp3"
            style={{ display: "none" }}
            onEnded={restartNarration}
          />
          <div className="captions">
            {captions.map((c, i) => (
              <div
                key={i}
                className={`line ${i === currentIndex ? "active" : ""}`}
              >
                {c.text}
              </div>
            ))}
          </div>
          <div className="orb" ref={orbContainerRef}></div>
        </div>

        <AppearRef delay={0.4}>
          <div className="cta" ref={ctaRef}>
            <div className="cta_content">
              <span className="cta_icon" ref={iconRef}>
                <IconMuseum icon="svgArrow" width={14.52} height={15.84} />
              </span>
              <span className="cta_text" ref={textRef}>
                {ctaLabel}
              </span>
            </div>
          </div>
        </AppearRef>
      </section>
    </main>
  );
}
