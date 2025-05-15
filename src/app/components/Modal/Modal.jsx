import React from "react";
import IconMuseum from "../IconsMuseum/IconsMuseum";
import Link from "next/link";

const Modal = ({ showReturn, content, lastViewedOrbRef, modalAppear }) => {
  return (
    <div className={`modal ${showReturn ? "active" : ""}`}>
      <div className="modal_content">
        {content.artworks[lastViewedOrbRef.current] && (
          <>
            <div className="icon">
              <IconMuseum
                className="svg_scan"
                icon="svgScan"
                width={56}
                height={56}
              />
              <IconMuseum
                icon={content.artworks[lastViewedOrbRef.current].icon}
                width={30}
                height={30}
              />
            </div>
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
          </>
        )}
        <button onClick={modalAppear}>Fermer</button>
      </div>
    </div>
  );
};

export default Modal;
