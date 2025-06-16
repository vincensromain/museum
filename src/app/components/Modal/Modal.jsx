"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import useNfc from "../Hook/useNfc";
import { useRouter } from "next/navigation";
import IconMuseum from "../IconsMuseum/IconsMuseum";
import Link from "next/link";
import "./Modal.scss";

const Modal = ({ showReturn, content, lastViewedOrbRef, modalAppear }) => {
  const [scanned, setScanned] = useState(false);
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const router = useRouter();

  // 🛰️ Activation NFC automatique quand la modale est ouverte
  useNfc(showReturn, setScanned);

  // ▶️ Animation d'ouverture
  useEffect(() => {
    if (showReturn && modalRef.current && contentRef.current) {
      const tl = gsap.timeline();

      tl.fromTo(
        modalRef.current,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out",
          zIndex: 1000,
        }
      );

      tl.fromTo(
        contentRef.current,
        { autoAlpha: 0, scale: 0.9 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          zIndex: 1000,
        },
        "+=0.05"
      );
    }
  }, [showReturn]);

  // 🛑 Désactiver les clics sur le canvas
  useEffect(() => {
    const timeout = setTimeout(() => {
      const canvas = document.querySelector(".three_canvas");
      if (showReturn && canvas) {
        console.log("Canvas désactivé");
        canvas.style.pointerEvents = "none";
      }
    }, 10);

    return () => {
      const canvas = document.querySelector(".three_canvas");
      if (canvas) {
        console.log("Canvas réactivé");
        canvas.style.pointerEvents = "auto";
      }
      clearTimeout(timeout);
    };
  }, [showReturn]);

  // 🔁 Animation de fermeture
  const closeModalAnimation = () => {
    console.log("Fermeture animée déclenchée");

    if (!modalRef.current || !contentRef.current) return;

    gsap.to(contentRef.current, {
      autoAlpha: 0,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.inOut",
    });

    gsap.to(modalRef.current, {
      autoAlpha: 0,
      duration: 0.25,
      ease: "power2.inOut",
      delay: 0.1,
      onComplete: () => {
        console.log("Animation terminée → on ferme");
        modalAppear();
      },
    });
  };

  // 🔙 Clic en dehors du contenu → fermeture
  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log("Click détecté", event.target);

      if (
        modalRef.current &&
        contentRef.current &&
        modalRef.current.contains(event.target) &&
        !contentRef.current.contains(event.target)
      ) {
        closeModalAnimation();
      }
    };

    if (showReturn) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReturn]);

  return (
    <div ref={modalRef} className="modal">
      <div ref={contentRef} className="modal_content">
        {content.artworks[lastViewedOrbRef.current] && (
          <>
            <div className="icon">
              <IconMuseum icon="svgScan" width={56} height={56} />
              <IconMuseum
                icon={content.artworks[lastViewedOrbRef.current].icon}
                width={30}
                height={30}
              />
            </div>

            <div
              className="cross"
              onClick={() => {
                console.log("Click sur la croix");
                closeModalAnimation();
              }}
            >
              <IconMuseum icon="svgCross" width={56} height={56} />
            </div>

            <div className="artwork_content">
              <h2 className="artwork_name">
                {content.artworks[lastViewedOrbRef.current].title}
              </h2>
              <p className="artwork_description">
                {content.artworks[lastViewedOrbRef.current].description}
              </p>
              <div className="hypertext">
                <Link
                  href={content.artworks[lastViewedOrbRef.current].link}
                  className="hypertext_link"
                >
                  Je n'ai pas accès à la puce NFC
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
