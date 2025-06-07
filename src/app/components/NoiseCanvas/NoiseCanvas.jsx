"use client";

import { useRef, useEffect } from "react";

export default function NoiseCanvas() {
  const canvasRef = useRef(null);
  const pixelsRef = useRef([]);

  const density = 0.009;
  const fadeSpeed = 0.028;
  const pixelSizes = [3.5, 2.5, 1.5];
  const frameDelay = 60;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    class Pixel {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = pixelSizes[Math.floor(Math.random() * pixelSizes.length)];
        this.alpha = 0;
        this.phase = "fade-in";
      }

      update() {
        if (this.phase === "fade-in") {
          this.alpha += fadeSpeed;
          if (this.alpha >= 0.4) {
            this.alpha = 0.4;
            this.phase = "fade-out";
          }
        } else {
          this.alpha -= fadeSpeed;
          if (this.alpha <= 0) {
            this.alpha = 0;
          }
        }
      }

      isDead() {
        return this.alpha <= 0 && this.phase === "fade-out";
      }

      draw(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fillRect(this.x, this.y, this.size, this.size);
      }
    }

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const count = canvas.width * canvas.height * density * 0.001;
      for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * canvas.width);
        const y = Math.floor(Math.random() * canvas.height);
        pixelsRef.current.push(new Pixel(x, y));
      }

      for (let i = pixelsRef.current.length - 1; i >= 0; i--) {
        const p = pixelsRef.current[i];
        p.update();
        p.draw(ctx);
        if (p.isDead()) {
          pixelsRef.current.splice(i, 1);
        }
      }

      setTimeout(() => requestAnimationFrame(loop), frameDelay);
    };

    resize();
    window.addEventListener("resize", resize);
    loop();

    return () => {
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      className="noise_canvas"
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 2,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
      }}
    />
  );
}
