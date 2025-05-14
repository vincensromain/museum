"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import content from "./data/content.json";
import IconMuseum from "./components/IconsMuseum/IconsMuseum";

import "./page.scss";
import * as THREE from "three";
import GUI from "lil-gui";

export default function Home() {
  const canvasRef = useRef(null);
  const { narration, ctaLink, ctaLabel } = content.home;

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ratio = window.devicePixelRatio || 1;
    const size = 200;

    // scène / caméra / renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 3;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(ratio);
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);

    // géométrie
    const geometry = new THREE.IcosahedronGeometry(1, 128);

    // uniforms (sans annotation TS)
    const uniforms = {
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_resolution: { value: new THREE.Vector2(size * ratio, size * ratio) },
      u_edgeSoftness: { value: 0.05 },
    };

    // souris
    canvas.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      uniforms.u_mouse.value.x = (e.clientX - r.left) / r.width;
      uniforms.u_mouse.value.y = 1 - (e.clientY - r.top) / r.height;
    });

    // GUI
    const gui = new GUI();
    const params = { edgeSoftness: uniforms.u_edgeSoftness.value };
    gui
      .add(params, "edgeSoftness", 0.0, 0.2, 0.001)
      .name("Edge Softness")
      .onChange((v) => (uniforms.u_edgeSoftness.value = v));

    // material + mesh + animation
    let material, mesh, raf;
    let t = 0;

    Promise.all([
      fetch("/shaders/vertex.glsl").then((r) => r.text()),
      fetch("/shaders/fragment.glsl").then((r) => r.text()),
    ]).then(([vs, fs]) => {
      material = new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        uniforms,
        transparent: true,
        depthWrite: false,
      });
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const animate = () => {
        t += 0.01;
        uniforms.u_time.value = t;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      animate();
    });

    return () => {
      cancelAnimationFrame(raf);
      gui.destroy();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <main>
      <section className="home inside">
        <div className="narration">
          <div className="orb"></div>
        </div>
        <Link href={ctaLink || "#"} className="cta">
          <span className="cta_content">
            <span className="cta_text">{ctaLabel}</span>
            <span className="cta_icon">
              <IconMuseum icon="svgArrow" width={14.52} height={15.84} />
            </span>
          </span>
        </Link>
      </section>
    </main>
  );
}
