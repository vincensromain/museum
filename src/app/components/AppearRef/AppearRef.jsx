"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import "./AppearRef.scss";

export default function AppearRef({
  children,
  delay = 0,
  duration = 1,
  className = "appear",
}) {
  const elRef = useRef(null);

  useEffect(() => {
    if (elRef.current) {
      gsap.fromTo(
        elRef.current,
        { opacity: 0 },
        { opacity: 1, duration, delay, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <div ref={elRef} className={className}>
      {children}
    </div>
  );
}
