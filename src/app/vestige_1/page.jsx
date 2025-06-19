"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
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
    { time: 0, text: "Bienvenue dans cette expérience immersive…" },
    { time: 8, text: "La ligne actuelle devient rouge automatiquement…" },
  ];

  useEffect(() => {
    // Hint drag
    gsap.fromTo(
      dragRef.current,
      { x: -10 },
      { x: 10, duration: 1, ease: "power3.inOut", repeat: -1, yoyo: true }
    );

    // Renderer + Scene + Camera
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 0, 0);
    scene.add(camera);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Lumières
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Helpers de debug : sol et grille
    const grid = new THREE.GridHelper(20, 20);
    scene.add(grid);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshBasicMaterial({ color: 0x444444, wireframe: true })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Controls (libérés pour debug)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = true;
    // → on commente les clamps pour pouvoir bouger librement :
    // controls.minPolarAngle = initialPolar;
    // controls.maxPolarAngle = initialPolar;
    // controls.maxDistance = initialDistance;

    controls.addEventListener("start", () => {
      if (dragRef.current)
        gsap.to(dragRef.current, { opacity: 0, duration: 0.5 });
    });

    // Chargement GLTF
    const loader = new GLTFLoader();
    let mixer;
    loader.load(
      "/models/Dinos/Ammonite.glb",
      (gltf) => {
        console.log("GLTF chargé :", gltf);
        const model = gltf.scene;

        // Debug : visualiser la boîte englobante
        const box = new THREE.BoxHelper(model, 0xff0000);
        scene.add(box);

        // Ajustements
        model.scale.set(1.5, 1.5, 1.5);
        model.position.set(0, 0.5, 0);
        model.rotation.x = Math.PI; // si besoin de redresser

        scene.add(model);

        // Anims
        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        }
      },
      undefined,
      (err) => console.error("Erreur GLTF:", err)
    );

    // Resize
    const onWindowResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener("resize", onWindowResize);

    // Boucle
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

  // … (le reste de ton code pour l’orb, l’audio, les captions et le retour) …

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
      {/* … naration + orb + canvas … */}
      <div className="model_canvas_container">
        <canvas ref={canvasRef} className="model_canvas" />
      </div>
    </section>
  );
}
