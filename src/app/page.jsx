"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import content from "@/app/data/content.json";
import "./page.scss";
import * as THREE from "three";

export default function Home() {
  const canvasRef = useRef(null);
  const { narration, ctaLink, ctaLabel } = content.home;

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      1, // Ratio 1:1 pour 200x200 pixels
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true, // Active la transparence
    });
    renderer.setSize(200, 200); // Taille du canvas
    renderer.setClearColor(0x000000, 0); // Fond transparent

    const dirLight = new THREE.DirectionalLight("#ffffff", 0.75);
    dirLight.position.set(5, 5, 5);

    const ambientLight = new THREE.AmbientLight("#ffffff", 0.2);
    scene.add(dirLight, ambientLight);

    const geometry = new THREE.IcosahedronGeometry(1, 150);

    fetch("/shaders/fragment.glsl")
      .then((res) => res.text())
      .then((fragmentShader) => {
        fetch("/shaders/vertex.glsl")
          .then((res) => res.text())
          .then((vertexShader) => {
            const material = new THREE.ShaderMaterial({
              vertexShader: vertexShader,
              fragmentShader: fragmentShader,
            });

            material.uniforms.uTime = { value: 0 };

            const shape = new THREE.Mesh(geometry, material);
            scene.add(shape);

            camera.position.z = 3;

            let time = 0;
            function animate() {
              material.uniforms.uTime.value = time;

              time += 0.003;

              requestAnimationFrame(animate);
              renderer.render(scene, camera);
            }

            animate();
          });
      });

    return () => {
      // Cleanup code if necessary
    };
  }, []);

  return (
    <main>
      <section className="home inside">
        <div className="narration">
          <p className="narration_text">{narration}</p>
          <div className="orb">
            <canvas ref={canvasRef} className="webgl_orb" id="myCanvas" />
          </div>
        </div>
        <Link href={ctaLink || "#"} className="cta">
          {ctaLabel}
        </Link>
      </section>
    </main>
  );
}
