"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import "./Vestige_2.scss";
import IconMuseum from "../components/IconsMuseum/IconsMuseum";
import VestigeContent from "../components/VestigeContent/VestigeContent";
import Narrator from "../components/Narrator/Narrator";
import Skin from "../components/Skin/Skin";

export default function Vestige_2() {
  const dragRef = useRef(null);
  const canvasRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Animation GSAP de l'icône drag
    gsap.fromTo(
      dragRef.current,
      { x: -10 },
      { x: 10, duration: 1, ease: "power3.inOut", repeat: -1, yoyo: true }
    );

    const canvas = canvasRef.current;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Setup du renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Scène et caméra
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 3, 6); // vue plongeante
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // Lumières
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Controls : rotation horizontale + zoom limité
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.enableZoom = true;
    // verrouille l'inclinaison verticale
    const initialPolar = Math.acos(
      (camera.position.y - controls.target.y) /
        camera.position.distanceTo(controls.target)
    );
    controls.minPolarAngle = initialPolar;
    controls.maxPolarAngle = initialPolar;
    // verrouille le zoom arrière
    const initialDistance = camera.position.distanceTo(controls.target);
    controls.maxDistance = initialDistance;
    // masque l'icône drag au début du mouvement
    controls.addEventListener("start", () => {
      if (dragRef.current)
        gsap.to(dragRef.current, { opacity: 0, duration: 0.5 });
    });

    // Chargement GLB + halo radial via shader
    const loader = new GLTFLoader();
    let mixer;
    loader.load(
      "/models/Dinos/Pterosaure.glb",
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(5, 5, 5);

        // Halo radial en ShaderMaterial
        const radius = 0.3;
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

    // Resize
    const onWindowResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onWindowResize);

    // Boucle animation
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", onWindowResize);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  const handleReturn = () => {
    localStorage.setItem("museumProgress", "2");
    router.push("/visite_musee");
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
      <div className="naration_text">
        <Narrator />
        <VestigeContent />
      </div>
      <div className="model_canvas_container">
        <canvas ref={canvasRef} className="model_canvas" />
      </div>
    </section>
  );
}
