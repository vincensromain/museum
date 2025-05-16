"use client";
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import "./Vestige_1.scss";
import IconMuseum from "../components/IconsMuseum/IconsMuseum";
import VestigeContent from "../components/VestigeContent/VestigeContent";
import Narrator from "../components/Narrator/Narrator";
import Skin from "../components/Skin/Skin";

export default function Vestige_1() {
  const dragRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      dragRef.current,
      { x: -10 },
      {
        x: 10,
        duration: 1,
        ease: "power3.inOut",
        repeat: -1,
        yoyo: true,
      }
    );
  }, []);

  return (
    <section className="vestige">
      <div className="go_back">
        <IconMuseum icon="svgArrowBack" />
        <span className="go_back_text">Retour</span>
      </div>
      <Skin />

      <div ref={dragRef} className="svg_drag">
        <IconMuseum icon="svgDrag" />
      </div>

      <div className="naration_text">
        <Narrator />
        <VestigeContent />
      </div>
    </section>
  );
}
