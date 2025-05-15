"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import content from "./data/content.json";
import IconMuseum from "./components/IconsMuseum/IconsMuseum";
import AppearRef from "./components/AppearRef/AppearRef";

import "./page.scss";

gsap.registerPlugin(Draggable);

export default function Home() {
  const { ctaLink, ctaLabel } = content.home;
  const iconRef = useRef(null);
  const ctaRef = useRef(null);
  const textRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const icon = iconRef.current;
    const cta = ctaRef.current;
    const text = textRef.current;

    if (!icon || !cta || !text) return;

    // 👉 timeline de rebond assignée à une variable
    const hintTl = gsap
      .timeline({ delay: 0.5, repeat: -1, repeatDelay: 1 })
      .to(icon, { x: 10, duration: 0.4, ease: "power2.out" })
      .to(icon, { x: 0, duration: 0.4, ease: "power2.inOut" });

    const iconWidth = icon.offsetWidth;
    const ctaWidth = cta.offsetWidth;
    const rightPadding = 13.5;
    const maxX = ctaWidth - iconWidth - rightPadding;

    Draggable.create(icon, {
      type: "x",
      bounds: { minX: 0, maxX },
      inertia: true,
      onPress: function () {
        hintTl.kill();
      },
      onDrag: function () {
        const progress = this.x / maxX;
        gsap.to(text, {
          opacity: 1 - progress * 2,
          duration: 0.1,
          overwrite: "auto",
        });
      },
      onDragEnd: function () {
        const reachedEnd = this.x >= maxX - 1;
        if (reachedEnd) {
          router.push(ctaLink || "#");
        } else {
          gsap.to(icon, {
            x: 0,
            duration: 0.3,
            ease: "power2.out",
          });
          gsap.to(text, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      },
    });
  }, [ctaLink, router]);

  return (
    <main>
      <section className="home inside">
        <div className="narration">
          <div className="orb"></div>
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
