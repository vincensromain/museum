"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import "./Vestige_4.scss";
import IconMuseum from "../components/IconsMuseum/IconsMuseum";
import Skin from "../components/Skin/Skin";
import Orb from "../components/Orb/Orb";

export default function Vestige_1() {
  const dragRef = useRef(null);
  const canvasRef = useRef(null);
  const orbRef = useRef(null);
  const narrationRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioSourceRef = useRef(null);
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);

  const captions = [
    {
      time: 0,
      text: "Bienvenue dans cette expérience immersive. Chaque phrase est synchronisée avec l'audio. Regardez comment le texte défile.",
    },
    {
      time: 8,
      text: "La ligne actuelle devient rouge automatiquement. Merci d'avoir écouté cette démonstration.",
    },
  ];

  useEffect(() => {
    // Animation du drag hint
    gsap.fromTo(
      dragRef.current,
      { x: -10 },
      { x: 10, duration: 1, ease: "power3.inOut", repeat: -1, yoyo: true }
    );

    // Setup Three.js
    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = true;
    const initialPolar = Math.acos(
      (camera.position.y - controls.target.y) /
        camera.position.distanceTo(controls.target)
    );
    controls.minPolarAngle = initialPolar;
    controls.maxPolarAngle = initialPolar;
    controls.maxDistance = camera.position.distanceTo(controls.target);
    controls.addEventListener("start", () => {
      if (dragRef.current)
        gsap.to(dragRef.current, { opacity: 0, duration: 0.5 });
    });

    // Chargement du modèle
    const loader = new GLTFLoader();
    let mixer;
    loader.load(
      "/models/Dinos/Rhabdodon.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(2, 2, 2);
        model.rotation.x = Math.PI; // redresse le dino
        model.position.y = 1; // le soulève un peu

        // 1) ajout du modèle à la scène
        scene.add(model);

        // 2) création du disque au sol, ajouté à la SCÈNE
        const radius = 2;
        const discGeom = new THREE.CircleGeometry(radius, 32);
        const discMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: {
            uColor: { value: new THREE.Color(1, 1, 1) },
            uInnerRadius: { value: 0.0 },
            uOuterRadius: { value: 0.5 },
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec2 vUv;
            uniform vec3 uColor;
            uniform float uInnerRadius;
            uniform float uOuterRadius;
            void main() {
              float d = distance(vUv, vec2(0.5));
              float alpha = 1.0 - smoothstep(uInnerRadius, uOuterRadius, d);
              if (alpha < 0.01) discard;
              gl_FragColor = vec4(uColor, alpha);
            }
          `,
        });
        const disc = new THREE.Mesh(discGeom, discMat);
        disc.rotation.x = -Math.PI / 2;
        disc.position.set(0, -0.6, 0);
        scene.add(disc);

        // Anims du modèle
        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        }
      },
      undefined,
      (error) => console.error("Error loading GLTF:", error)
    );

    // Resize handler
    const onWindowResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onWindowResize);

    // Loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", onWindowResize);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  useEffect(() => {
    // … (le reste de ton orb + audio + captions identique)
  }, []);

  // … (les autres useEffect pour l’orb et les captions restent inchangés)

  const handleReturn = () => {
    localStorage.setItem("pendingAdvance", "true");
    localStorage.setItem("museumProgress", "2");
    router.push("/visite_musee_5");
  };

  return (
    <section className="vestige">
      <div className="go_back" onClick={handleReturn}>
        <IconMuseum icon="svgArrowBack" />
        <span className="go_back_text">Retour</span>
      </div>
      <Skin />
      <div ref={dragRef} className="svg_drag">
        <IconMuseum icon="svgDrag" />
      </div>
      <div className="naration_text_content">
        <div className="naration_orb" ref={orbRef}></div>
        <div className="naration_text">
          <audio
            ref={narrationRef}
            src="/Audios/narration.m4a"
            style={{ display: "none" }}
          />
          {captions.map((c, i) => (
            <div
              key={i}
              className={`line ${i === currentIndex ? "active" : ""}`}
            >
              {c.text}
            </div>
          ))}
        </div>
      </div>
      <div className="model_canvas_container">
        <canvas ref={canvasRef} className="model_canvas" />
      </div>
    </section>
  );
}
