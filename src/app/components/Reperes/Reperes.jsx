"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useState, useEffect } from "react";
import "./Reperes.scss";

const Reperes = () => {
  const [isFirstAnimation, setIsFirstAnimation] = useState(true);

  useGSAP(() => {
    gsap.set(".col", {
      clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey && event.key.toLowerCase() === "m") {
        event.preventDefault();

        if (isFirstAnimation) {
          gsap.set(".col", {
            clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
          });

          gsap.to(".col", {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            stagger: 0.03,
            duration: 0.5,
          });
        } else {
          gsap.to(".col", {
            clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
            duration: 0.5,
            stagger: 0.03,
          });
        }

        setIsFirstAnimation(!isFirstAnimation);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFirstAnimation]);

  return (
    <div id="reperes" className="inside">
      <div className="col"></div>
      <div className="col"></div>
      <div className="col"></div>
      <div className="col"></div>
      <div className="col"></div>
      <div className="col"></div>
      <div className="col"></div>
      <div className="col"></div>
      <div className="col"></div>
      <div className="col"></div>
      <div className="col"></div>
      <div className="col"></div>
    </div>
  );
};

export default Reperes;
