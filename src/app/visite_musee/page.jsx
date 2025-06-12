"use client";
import React, { useRef, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import GUI from "lil-gui";
import content from "../data/content.json";

import Orb from "../components/Orb/Orb";
import Modal from "../components/Modal/Modal";

import "./visite_musee.scss";

export default function Visite_musee() {
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const initialCamPosRef = useRef(null);
  const initialCamQuatRef = useRef(null);
  const currentIndexRef = useRef(0);
  const isMovingRef = useRef(false);
  const pastillesRef = useRef([]);
  const lightsRef = useRef([]);
  const blueLightsRef = useRef([]);
  const activateOrbRef = useRef(null);
  const lastViewedOrbRef = useRef(0);

  const [showReturn, setShowReturn] = useState(false);

  const glowParams = {
    falloff: 0.1,
    glowInternalRadius: 6.0,
    glowSharpness: 0.5,
    opacity: 1.0,
    glowColor: "#EFFBF6",
  };

  const breatheOrb = (orb) => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(orb.material.uniforms.glowInternalRadius, {
      value: 4 + Math.random(),
      duration: 1.1,
      ease: "sine.inOut",
    });
  };

  const activateOrb = (i) => {
    const orb = pastillesRef.current[i];
    const light = lightsRef.current[i];
    const blueLight = blueLightsRef.current[i];

    gsap.to(orb.material.uniforms.opacity, {
      value: glowParams.opacity,
      duration: 2,
      ease: "sine.inOut",
    });
    gsap.to(light, {
      intensity: 2,
      duration: 2,
      ease: "sine.inOut",
    });
    gsap.to(blueLight, {
      intensity: 2,
      duration: 2,
      ease: "sine.inOut",
    });
    breatheOrb(orb);
  };

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const sizes = { width: window.innerWidth, height: window.innerHeight };
    const onResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      cameraRef.current.aspect = sizes.width / sizes.height;
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", onResize);

    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(0, 4, 15);
    camera.rotation.x = -THREE.MathUtils.degToRad(30);
    scene.add(camera);
    cameraRef.current = camera;
    initialCamPosRef.current = camera.position.clone();
    initialCamQuatRef.current = camera.quaternion.clone();

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const gltfLoader = new GLTFLoader();
    gltfLoader.load("/models/Musee/musee_old.glb", (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      scene.add(model);
      model.traverse((child) => {
        if (child.isLight) scene.add(child);
      });
    });

    const positions = [
      new THREE.Vector3(1.7, 0.3, 11),
      new THREE.Vector3(0.3, -1.1, 8),
      new THREE.Vector3(-3.7, 0.5, 5),
      new THREE.Vector3(4, -1, 4),
      new THREE.Vector3(-2, 0.5, 1),
    ];

    positions.forEach((pos, i) => {
      const orb = Orb({ position: pos, glowParams, scene });
      pastillesRef.current.push(orb);

      const light = new THREE.PointLight(
        glowParams.glowColor,
        0,
        5 * 0.8,
        2 * 2
      );
      light.position.set(0, 0, 0);
      orb.add(light);
      lightsRef.current.push(light);

      const blueLight = new THREE.PointLight(0x07b2c5, 0, 5 * 1.1, 2 / 2);
      blueLight.position.set(0, 0, 0);
      orb.add(blueLight);
      blueLightsRef.current.push(blueLight);
    });

    // 🔁 Progression sauvegardée (par défaut : 1 orbe)
    let savedProgress = parseInt(localStorage.getItem("museumProgress") || "1");
    savedProgress = Math.max(1, Math.min(savedProgress, positions.length));
    currentIndexRef.current = savedProgress - 1;
    for (let i = 0; i < savedProgress; i++) {
      activateOrb(i);
    }

    const gui = new GUI();
    const glowFolder = gui.addFolder("Glow Parameters");
    glowFolder.add(glowParams, "falloff", 0, 1, 0.01).onChange((v) => {
      pastillesRef.current.forEach((orb) => {
        orb.material.uniforms.falloff.value = v;
      });
    });
    glowFolder
      .add(glowParams, "glowInternalRadius", 4, 5, 0.1)
      .onChange((v) => {
        pastillesRef.current.forEach((orb) => {
          orb.material.uniforms.glowInternalRadius.value = v;
        });
      });
    glowFolder.add(glowParams, "glowSharpness", 0, 1, 0.01).onChange((v) => {
      pastillesRef.current.forEach((orb) => {
        orb.material.uniforms.glowSharpness.value = v;
      });
    });
    glowFolder.add(glowParams, "opacity", 0, 1, 0.01).onChange((v) => {
      pastillesRef.current.forEach((orb) => {
        orb.material.uniforms.opacity.value = v;
      });
    });
    glowFolder.addColor(glowParams, "glowColor").onChange((v) => {
      pastillesRef.current.forEach((orb) => {
        orb.material.uniforms.glowColor.value.set(v);
      });
    });

    const lightFolder = gui.addFolder("Light Parameters");
    lightsRef.current.forEach((light, i) => {
      lightFolder
        .add(light, "intensity", 0, 10, 0.1)
        .name(`Light ${i} Intensity`);
    });
    blueLightsRef.current.forEach((blueLight, i) => {
      lightFolder
        .add(blueLight, "intensity", 0, 10, 0.1)
        .name(`Blue Light ${i} Intensity`);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClickCanvas = (e) => {
      if (isMovingRef.current) return;
      mouse.x = (e.clientX / sizes.width) * 2 - 1;
      mouse.y = -(e.clientY / sizes.height) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);
      const hits = raycaster.intersectObjects(pastillesRef.current);
      if (!hits.length) return;

      const clickedOrbIndex = pastillesRef.current.indexOf(hits[0].object);
      if (clickedOrbIndex <= currentIndexRef.current) {
        isMovingRef.current = true;
        const sel = hits[0].object;
        const dir = new THREE.Vector3()
          .subVectors(cameraRef.current.position, sel.position)
          .normalize();
        const target = sel.position.clone().add(dir.multiplyScalar(1));
        const startQuat = cameraRef.current.quaternion.clone();
        cameraRef.current.lookAt(sel.position);
        const endQuat = cameraRef.current.quaternion.clone();
        cameraRef.current.quaternion.copy(startQuat);

        gsap.to(cameraRef.current.position, {
          x: target.x,
          y: target.y,
          z: target.z,
          duration: 1.5,
          ease: "power2.inOut",
        });
        gsap.to(cameraRef.current.quaternion, {
          x: endQuat.x,
          y: endQuat.y,
          z: endQuat.z,
          w: endQuat.w,
          duration: 1.5,
          ease: "power2.inOut",
          onComplete: () => {
            setShowReturn(true);
            lastViewedOrbRef.current = clickedOrbIndex;
          },
        });
      }
    };
    canvas.addEventListener("click", onClickCanvas);

    const tick = () => {
      renderer.render(scene, cameraRef.current);
      requestAnimationFrame(tick);
    };
    tick();

    activateOrbRef.current = activateOrb;

    return () => {
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("click", onClickCanvas);
      renderer.dispose();
      gui.destroy();
    };
  }, []);

  const modalAppear = () => {
    const cam = cameraRef.current;
    const initPos = initialCamPosRef.current;
    const initQuat = initialCamQuatRef.current;

    setShowReturn(false);
    gsap.to(cam.position, {
      x: initPos.x,
      y: initPos.y,
      z: initPos.z,
      duration: 1.5,
      ease: "power2.inOut",
    });
    gsap.to(cam.quaternion, {
      x: initQuat.x,
      y: initQuat.y,
      z: initQuat.z,
      w: initQuat.w,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => {
        isMovingRef.current = false;
      },
    });
  };

  return (
    <div className="visite_musee">
      <canvas ref={canvasRef} className="webgl" />
      <Modal
        showReturn={showReturn}
        content={content}
        lastViewedOrbRef={lastViewedOrbRef}
        modalAppear={modalAppear}
      />
    </div>
  );
}
