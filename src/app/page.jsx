"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
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
    {
      time: 1.44,
      text: "Bonjour et bienvenue au Muséum. Aujourd'hui, on vous propose une expérience un peu différente. Un voyage à travers le temps entre mer, terre et ciel.",
    },
    {
      time: 11.68,
      text: "Tout au long de la visite, vous allez pouvoir découvrir du contenu interactif directement sur votre smartphone. Pour cela, c'est très simple. A côté de certaines pièces, vous verrez de petites pastilles interactives signalées par une icône dédiée.",
    },
    {
      time: 24.72,
      text: "Il vous suffira alors de cliquer sur l'étape correspondante dans l'application, puis d'approcher votre téléphone de la puce interactive. Pas besoin d'installer quoi que ce soit, tout se lance automatiquement dans votre navigateur.",
    },
    {
      time: 36.48,
      text: "Pour respecter le confort de tous les visiteurs, si vous avez des écouteurs, pensez à les utiliser. Certains contenus sont sonores pour une immersion plus riche.",
    },
    {
      time: 45.03,
      text: "Prenez votre temps, explorez à votre rythme et ouvrez l'œil. Ce que des fossiles ne disent pas au premier regard pourrait bien vous surprendre.",
    },
  ];

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

  useEffect(() => {
    const audio = narrationRef.current;
    if (!audio || !hasInteracted) return;

    const playAudio = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error attempting to play audio:", error);
        });
      }
    };

    playAudio();
  }, [hasInteracted]);

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

  useEffect(() => {
    const container = orbContainerRef.current;
    if (!container) return;

    const glowParams = {
      falloff: 0.1,
      glowInternalRadius: 6,
      glowSharpness: 0.5,
      opacity: 1,
      glowColor: "#ccfbff",
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 2.5);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const orbMesh = Orb({
      position: new THREE.Vector3(0, 0, 0),
      glowParams,
      scene,
    });
    orbMesh.scale.multiplyScalar(6);

    const breatheTl = gsap.timeline({ repeat: -1, yoyo: true });
    breatheTl.to(orbMesh.material.uniforms.glowInternalRadius, {
      value: glowParams.glowInternalRadius + 1,
      duration: 1.1,
      ease: "sine.inOut",
    });

    const startAudioContext = () => {
      const audioElement = narrationRef.current;
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audioElement);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const animate = () => {
        requestAnimationFrame(animate);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        orbMesh.material.uniforms.glowInternalRadius.value =
          glowParams.glowInternalRadius + average / 30;
        renderer.render(scene, camera);
      };
      animate();
    };

    const handleUserInteraction = () => {
      setHasInteracted(true);
      startAudioContext();
      document.removeEventListener("click", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction, { once: true });

    const onResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      container.removeChild(renderer.domElement);
      orbMesh.geometry.dispose();
      orbMesh.material.dispose();
      renderer.dispose();
    };
  }, []);

  // 🔁 Redémarrage de la narration
  const restartNarration = () => {
    const audio = narrationRef.current;
    if (!audio) return;

    setTimeout(() => {
      if (hasInteracted) {
        setCurrentIndex(0);
        audio.currentTime = 0;
        audio
          .play()
          .then(() => {
            console.log("🔁 Narration redémarrée");
          })
          .catch((err) => {
            console.warn("Erreur relance narration :", err);
          });
      }
    }, 2000);
  };

  return (
    <main>
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
