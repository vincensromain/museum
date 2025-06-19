"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import IconMuseum from "../IconsMuseum/IconsMuseum";
import Link from "next/link";
import "./Modal.scss";

const Modal = ({ showReturn, content, lastViewedOrbRef, modalAppear }) => {
  const [scanned, setScanned] = useState(false);
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const router = useRouter();

  const currentIndex = lastViewedOrbRef.current ?? 0;
  const currentArtwork = content.artworks[currentIndex];

  // ✅ Déclencheur de progression
  const triggerNextPoint = () => {
    window.dispatchEvent(new CustomEvent("next-point"));
  };

  // Activation du lecteur NFC
  useEffect(() => {
    const startNfcReader = async () => {
      if (showReturn && "NDEFReader" in window) {
        try {
          const ndef = new NDEFReader();
          await ndef.scan();
          console.log("Scan started successfully.");
          ndef.onreading = (event) => {
            console.log("NFC tag scanned:", event);
            setScanned(true);
            // Traitez les données de l'étiquette NFC ici
          };
        } catch (error) {
          console.error("Error starting NFC scan:", error);
        }
      }
    };

    startNfcReader();

    return () => {
      // Nettoyage éventuel
    };
  }, [showReturn]);

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
        canvas.style.pointerEvents = "none";
      }
    }, 10);

    return () => {
      const canvas = document.querySelector(".three_canvas");
      if (canvas) {
        canvas.style.pointerEvents = "auto";
      }
      clearTimeout(timeout);
    };
  }, [showReturn]);

  // 🔁 Fermeture animée
  const closeModalAnimation = () => {
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
        modalAppear();
      },
    });
  };

  // 🔙 Fermer si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
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
        {currentArtwork && (
          <>
            <div className="icon">
              <IconMuseum icon="svgScan" width={56} height={56} />
              <IconMuseum icon={currentArtwork.icon} width={30} height={30} />
            </div>

            <div className="cross" onClick={closeModalAnimation}>
              <IconMuseum icon="svgCross" width={56} height={56} />
            </div>

            <div className="artwork_content">
              <h2 className="artwork_name">{currentArtwork.title}</h2>
              <p className="artwork_description">
                {currentArtwork.description}
              </p>
              <div className="hypertext">
                <Link
                  href={currentArtwork.link}
                  className="hypertext_link"
                  onClick={triggerNextPoint}
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
