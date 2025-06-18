"use client";

import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import "./Vestige_3.scss";
import IconMuseum from "../components/IconsMuseum/IconsMuseum";
import VestigeContent from "../components/VestigeContent/VestigeContent";
import Narrator from "../components/Narrator/Narrator";
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
    gsap.fromTo(
      dragRef.current,
      { x: -10 },
      { x: 10, duration: 1, ease: "power3.inOut", repeat: -1, yoyo: true }
    );

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

    const initialDistance = camera.position.distanceTo(controls.target);
    controls.maxDistance = initialDistance;

    controls.addEventListener("start", () => {
      if (dragRef.current)
        gsap.to(dragRef.current, { opacity: 0, duration: 0.5 });
    });

    const loader = new GLTFLoader();
    let mixer;
    loader.load(
      "/models/Dinos/Titanosaur.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.2, 0.2, 0.2);

        const radius = 10;
        const discGeom = new THREE.CircleGeometry(radius, 64);
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
        model.add(disc);

        scene.add(model);
        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        }
      },
      undefined,
      (error) => console.error("Error loading GLTF:", error)
    );

    const onWindowResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
    };
  }, []);

  useEffect(() => {
    const container = orbRef.current;
    if (!container) return;

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

    const breatheTl = gsap.timeline({ repeat: -1, yoyo: true });
    breatheTl.to(orbMesh.material.uniforms.glowInternalRadius, {
      value: glowParams.glowInternalRadius + 1,
      duration: 1.1,
      ease: "sine.inOut",
    });

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    const audioElement = narrationRef.current;

    if (!audioSourceRef.current) {
      audioSourceRef.current =
        audioContext.createMediaElementSource(audioElement);
      const analyser = audioContext.createAnalyser();
      audioSourceRef.current.connect(analyser);
      analyser.connect(audioContext.destination);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const animate = () => {
        requestAnimationFrame(animate);
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        orbMesh.material.uniforms.glowInternalRadius.value =
          glowParams.glowInternalRadius + avg / 30;
        renderer.render(scene, camera);
      };
      animate();
    }

    audioElement.play().catch((e) => console.warn("Autoplay blocked:", e));

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
    // On signale qu'on revient pour activer le point suivant
    localStorage.setItem("pendingAdvance", "true");

    // (Optionnel) on peut aussi conserver museumProgress si tu l’utilises ailleurs
    localStorage.setItem("museumProgress", "2");

    // Retour vers la visite
    router.push("/visite_musee_4");
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
