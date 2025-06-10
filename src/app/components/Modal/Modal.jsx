"use client";
import React, { useState, useRef, useEffect } from "react";
import useNfc from "../Hook/useNfc";
import { useRouter } from "next/navigation";
import IconMuseum from "../IconsMuseum/IconsMuseum";
import Link from "next/link";
import "./Modal.scss";

const Modal = ({ showReturn, content, lastViewedOrbRef, modalAppear }) => {
  const [scanned, setScanned] = useState(false);
  useNfc(showReturn, setScanned);
  const router = useRouter();

  const modalRef = useRef(null);
  const contentRef = useRef(null);

  // Ferme la modale si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        contentRef.current &&
        modalRef.current.contains(event.target) &&
        !contentRef.current.contains(event.target)
      ) {
        modalAppear(); // ferme la modale
      }
    };

    if (showReturn) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReturn, modalAppear]);

  return (
    <div ref={modalRef} className={`modal ${showReturn ? "active" : ""}`}>
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

            <div className="cross" onClick={modalAppear}>
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
