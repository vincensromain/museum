"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import "./Vestige_4.scss";
import IconMuseum from "../components/IconsMuseum/IconsMuseum";
import Orb from "../components/Orb/Orb";

export default function Vestige_4() {
  const router = useRouter();

  // URL du modèle actif
  const [modelUrl, setModelUrl] = useState("/models/Dinos/Rhabdodon.glb");
  // Index du sous-titre actif
  const [currentIndex, setCurrentIndex] = useState(0);

  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const orbRef = useRef(null);
  const narrationRef = useRef(null);

  // Réfs Three.js
  const sceneRef = useRef();
  const mixerRef = useRef();
  const currentModelRef = useRef();

  // Données des sous-titres
  const captions = [
    {
      time: 0.36,
      text: "A l'ombre des géants comme le Titanosaure. Une autre espèce, plus discrète, vivait dans les plaines du sud de la France le Rhabdodon. Ce dinosaure bipède long de 4 à 6 mètres, broutait les plantes basses en petit troupeau.",
    },
    {
      time: 12.8,
      text: "Sans cornes ni armure, il misait sur l'agilité et la fuite pour échapper aux prédateurs. Ce qui le rend particulièrement intéressant, c'est qu'il s'agit d'une espèce locale.",
    },
    {
      time: 22.52,
      text: "Plusieurs fossiles ont été découverts ici en Provence, apportant des indices précieux sur la faune de la région. À la fin du Crétacé.",
    },
    {
      time: 30.52,
      text: "Certains spécimens montrent même des signes de nanisme insulaire. Isolé dans un environnement restreint. Certains individus auraient évolué vers une taille plus petite sans pour autant perdre leur robustesse.",
    },
  ];

  // 1) Audio : volume initial puis lecture
  useEffect(() => {
    const audio = narrationRef.current;
    if (!audio) return;
    const isOn = JSON.parse(localStorage.getItem("isAudioOn") ?? "true");
    audio.volume = isOn ? 1 : 0;
    audio.play().catch(() => {});
  }, []);

  // 2) Écoute du toggleAudio pour mute/unmute en fondu
  useEffect(() => {
    const audio = narrationRef.current;
    if (!audio) return;
    const handleToggle = (e) => {
      const isOn = e.detail;
      gsap.to(audio, {
        volume: isOn ? 1 : 0,
        duration: 0.5,
        ease: "power1.inOut",
      });
    };
    window.addEventListener("toggleAudio", handleToggle);
    return () => window.removeEventListener("toggleAudio", handleToggle);
  }, []);

  // 3) Hint drag
  useEffect(() => {
    if (dragRef.current) {
      gsap.fromTo(
        dragRef.current,
        { x: -10 },
        { x: 10, duration: 1, ease: "power3.inOut", repeat: -1, yoyo: true }
      );
    }
  }, []);

  // 4) Initialisation Three.js (scene, caméra, renderer, controls)
  useEffect(() => {
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
    sceneRef.current = scene;

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
    controls.minPolarAngle = controls.maxPolarAngle = initialPolar;
    controls.maxDistance = camera.position.distanceTo(controls.target);
    controls.addEventListener("start", () => {
      if (dragRef.current)
        gsap.to(dragRef.current, { opacity: 0, duration: 0.5 });
    });

    const onResize = () => {
      const w = canvas.clientWidth,
        h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixerRef.current) mixerRef.current.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // 5) Chargement dynamique du modèle (normal OU éclaté)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Purge de l’ancien modèle
    if (currentModelRef.current) {
      scene.remove(currentModelRef.current);
      currentModelRef.current.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      currentModelRef.current = null;
    }

    // Chargement du nouveau
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.2, 1.2, 1.2);
        scene.add(model);
        if (modelUrl.endsWith("Rhabdodon.glb")) {
          // 180° autour de l'axe X (ou Y/Z si besoin)
          model.rotation.x = Math.PI;
          model.position.set(0, 0.9, 0);
        }
        currentModelRef.current = model;

        // Disque shader
        const radius = 3;
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

        // Ajoutez le disque directement à la scène, pas au modèle
        scene.add(disc);

        // Animations
        if (gltf.animations?.length) {
          mixerRef.current = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) =>
            mixerRef.current.clipAction(clip).play()
          );
        }
      },
      undefined,
      (err) => console.error("Erreur chargement GLTF :", err)
    );
  }, [modelUrl]);

  // 6) Orb audio-réactive
  useEffect(() => {
    const container = orbRef.current;
    const audioEl = narrationRef.current;
    if (!container || !audioEl) return;

    const glowParams = {
      falloff: 0.1,
      glowInternalRadius: 6,
      glowSharpness: 0.5,
      opacity: 1,
      glowColor: "#ccfbff",
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 2.5);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const orbMesh = Orb({
      position: new THREE.Vector3(0, 0, 0),
      glowParams,
      scene,
    });
    orbMesh.scale.multiplyScalar(6);

    gsap
      .timeline({ repeat: -1, yoyo: true })
      .to(orbMesh.material.uniforms.glowInternalRadius, {
        value: glowParams.glowInternalRadius + 1,
        duration: 1.1,
        ease: "sine.inOut",
      });

    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioEl);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const animateOrb = () => {
      requestAnimationFrame(animateOrb);
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      orbMesh.material.uniforms.glowInternalRadius.value =
        glowParams.glowInternalRadius + avg / 30;
      renderer.render(scene, camera);
    };
    animateOrb();

    audioEl.play().catch(() => {});

    const onResize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      container.removeChild(renderer.domElement);
      orbMesh.geometry.dispose();
      orbMesh.material.dispose();
      renderer.dispose();
    };
  }, []);

  // 7) Synchronisation des sous-titres
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
  }, []);

  // 8) Retour
  const handleReturn = () => {
    localStorage.setItem("pendingAdvance", "true");
    localStorage.setItem("museumProgress", "5");
    router.push("/visite_musee_5");
  };

  // 9) Vues normal / éclatée
  const handleNormal = () => setModelUrl("/models/Dinos/Rhabdodon.glb");
  const handleEclate = () => setModelUrl("/models/Dinos/Rhabdodon.glb");

  return (
    <section className="vestige">
      <div className="go_back" onClick={handleReturn}>
        <IconMuseum icon="svgArrowBack" />
        <span className="go_back_text">Retour</span>
      </div>

      <div className="naration_orb" ref={orbRef}></div>

      <div ref={dragRef} className="svg_drag">
        <IconMuseum icon="svgDrag" />
      </div>

      <div className="naration_text_content">
        <div className="naration_text">
          <audio
            ref={narrationRef}
            src="/Audios/Rhabdodon.mp3"
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
