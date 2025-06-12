"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import content from "./data/content.json";
import IconMuseum from "./components/IconsMuseum/IconsMuseum";
import AppearRef from "./components/AppearRef/AppearRef";
import Orb from "./components/Orb/Orb"; // ajuste le chemin si besoin

import "./page.scss";

gsap.registerPlugin(Draggable);

export default function Home() {
  const { ctaLink, ctaLabel } = content.home;
  const iconRef = useRef(null);
  const ctaRef = useRef(null);
  const textRef = useRef(null);

  // ref pour le container de l'orb
  const orbContainerRef = useRef(null);

  const router = useRouter();

  useEffect(() => {
    // === Animation du CTA (inchangée) ===
    const icon = iconRef.current;
    const cta = ctaRef.current;
    const text = textRef.current;
    if (icon && cta && text) {
      const hintTl = gsap
        .timeline({ delay: 0.5, repeat: -1, repeatDelay: 1 })
        .to(icon, { x: 10, duration: 0.4, ease: "power2.out" })
        .to(icon, { x: 0, duration: 0.4, ease: "power2.inOut" });

      const iconWidth = icon.offsetWidth;
      const ctaWidth = cta.offsetWidth;
      const maxX = ctaWidth - iconWidth - 13.5;

      Draggable.create(icon, {
        type: "x",
        bounds: { minX: 0, maxX },
        inertia: true,
        onPress() {
          hintTl.kill();
        },
        onDrag() {
          const progress = this.x / maxX;
          gsap.to(text, {
            opacity: 1 - progress * 2,
            duration: 0.1,
            overwrite: "auto",
          });
        },
        onDragEnd() {
          if (this.x >= maxX - 1) router.push(ctaLink || "#");
          else {
            gsap.to(icon, { x: 0, duration: 0.3, ease: "power2.out" });
            gsap.to(text, { opacity: 1, duration: 0.3, ease: "power2.out" });
          }
        },
      });
    }

    // === Rendu Three.js de l'orb ===
    const container = orbContainerRef.current;
    if (!container) return;

    // paramètres de glow identiques
    const glowParams = {
      falloff: 0.1,
      glowInternalRadius: 6.0,
      glowSharpness: 0.5,
      opacity: 1.0,
      glowColor: "#ccfbff",
    };

    // scène, caméra, renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(0, 0, 2.5);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // création de l'orb au centre
    const orbMesh = Orb({
      position: new THREE.Vector3(0, 0, 0),
      glowParams,
      scene,
    });

    orbMesh.scale.multiplyScalar(6);

    // animation "breathe"
    const breatheTl = gsap.timeline({ repeat: -1, yoyo: true });
    breatheTl.to(orbMesh.material.uniforms.glowInternalRadius, {
      value: glowParams.glowInternalRadius + 1,
      duration: 1.1,
      ease: "sine.inOut",
    });

    // boucle de rendu
    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // redimensionnement
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // cleanup
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
      container.removeChild(renderer.domElement);
      orbMesh.geometry.dispose();
      orbMesh.material.dispose();
      renderer.dispose();
    };
  }, [ctaLink, router]);

  return (
    <main>
      <section className="home inside">
        <div className="narration">
          {/* on garde la div pour le positionnement CSS */}
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
