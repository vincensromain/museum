"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import "./Vestige_1.scss";
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
    // hint drag
    gsap.fromTo(
      dragRef.current,
      { x: -10 },
      { x: 10, duration: 1, ease: "power3.inOut", repeat: -1, yoyo: true }
    );

    // three.js setup
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
    // on peut ré-activer les clamps une fois le debug terminé
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

    // DRACO loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/"); // place draco_decoder files in public/draco/

    // GLTF loader with DRACO
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    let mixer;
    loader.load(
      "/models/Dinos/Ammonite-draco.glb", // utilise ta version compressée Draco
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(10, 10, 10);
        model.position.y = 0.5;
        model.rotation.x = Math.PI;

        // disque au sol
        const radius = 0.2;
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
        disc.position.y = 0.01;
        scene.add(disc);

        scene.add(model);

        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        }
      },
      undefined,
      (error) => console.error("Error loading DRACO GLTF:", error)
    );

    const onWindowResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener("resize", onWindowResize);

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
      dracoLoader.dispose();
    };
  }, []);

  useEffect(() => {
    // … orb + audio analyser (inchangé) …
  }, []);

  useEffect(() => {
    const audio = narrationRef.current;
    if (!audio) return;
    let lastIdx = 0;
    const findIdx = (t) => {
      for (let i = captions.length - 1; i >= 0; i--) {
        if (t >= captions[i].time) return i;
      }
      return 0;
    };
    const update = () => {
      const idx = findIdx(audio.currentTime);
      if (idx !== lastIdx) {
        lastIdx = idx;
        setCurrentIndex(idx);
      }
    };
    audio.addEventListener("timeupdate", update);
    return () => audio.removeEventListener("timeupdate", update);
  }, [captions]);

  const handleReturn = () => {
    localStorage.setItem("pendingAdvance", "true");
    localStorage.setItem("museumProgress", "2");
    router.push("/visite_musee_2");
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
