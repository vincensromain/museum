"use client";

import { useRef, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";
import content from "../data/content.json";

import IconMuseum from "../components/IconsMuseum/IconsMuseum";
import Link from "next/link";
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
  const activateOrbRef = useRef(null);
  const lastViewedOrbRef = useRef(0);

  const [showReturn, setShowReturn] = useState(false);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // —————————————————————————————
    //   Scène et taille
    // —————————————————————————————
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

    // —————————————————————————————
    //   Caméra
    // —————————————————————————————
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

    // —————————————————————————————
    //   Renderer
    // —————————————————————————————
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // —————————————————————————————
    //   Chargement du modèle
    // —————————————————————————————
    const gltfLoader = new GLTFLoader();
    gltfLoader.load("/models/Musee/musee.glb", (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      scene.add(model);
      model.traverse((child) => {
        if (child.isLight) scene.add(child);
      });
    });

    // —————————————————————————————
    //   Pastilles + lumières
    // —————————————————————————————
    const positions = [
      new THREE.Vector3(1.7, -1, 10.5),
      new THREE.Vector3(0.3, -1.1, 8),
      new THREE.Vector3(-3.7, 0.5, 5),
      new THREE.Vector3(4, -1, 4),
      new THREE.Vector3(-2, 0.5, 1),
    ];
    const params = {
      intensity: 2,
      emissiveIntensity: 1.5,
      distance: 5,
      decay: 2,
      color: "#ffffff",
    };

    positions.forEach((pos) => {
      const color = new THREE.Color(0xffffff);
      const geom = new THREE.SphereGeometry(0.3, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0,
        roughness: 0.3,
        metalness: 0.1,
      });
      const orb = new THREE.Mesh(geom, mat);
      orb.position.copy(pos);
      scene.add(orb);
      pastillesRef.current.push(orb);

      // light
      const light = new THREE.PointLight(
        color,
        0,
        params.distance,
        params.decay
      );

      light.position.copy(pos);
      scene.add(light);
      lightsRef.current.push(light);
    });

    // —————————————————————————————
    //   GUI
    // —————————————————————————————
    const gui = new GUI();
    const folder = gui.addFolder("Lights");
    folder
      .add(params, "intensity", 0, 10, 0.1)
      .onChange((v) => lightsRef.current.forEach((l) => (l.intensity = v)));
    folder
      .add(params, "emissiveIntensity", 0, 5, 0.1)
      .onChange((v) =>
        pastillesRef.current.forEach((o) => (o.material.emissiveIntensity = v))
      );
    folder
      .add(params, "distance", 0, 50, 1)
      .onChange((v) => lightsRef.current.forEach((l) => (l.distance = v)));
    folder
      .add(params, "decay", 0, 5, 0.1)
      .onChange((v) => lightsRef.current.forEach((l) => (l.decay = v)));
    folder.addColor(params, "color").onChange((hex) => {
      lightsRef.current.forEach((l) => l.color.set(hex));
      pastillesRef.current.forEach((o) => {
        o.material.color.set(hex);
        o.material.emissive.set(hex);
      });
    });
    folder.open();

    const activateOrb = (i) => {
      const orb = pastillesRef.current[i];
      const light = lightsRef.current[i];
      orb.material.emissiveIntensity = params.emissiveIntensity;
      gsap.to(orb.material, {
        emissiveIntensity: params.emissiveIntensity + 0.5,
        duration: 2,
        ease: "sine.inOut",
      });
      gsap.to(light, {
        intensity: params.intensity,
        duration: 2,
        ease: "sine.inOut",
      });
    };
    activateOrbRef.current = activateOrb;
    activateOrbRef.current(0);

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
            lastViewedOrbRef.current = clickedOrbIndex; // Update the last viewed orb
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

    // Cleanup
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
        if (lastViewedOrbRef.current === currentIndexRef.current) {
          currentIndexRef.current += 1;
          if (currentIndexRef.current < pastillesRef.current.length) {
            activateOrbRef.current(currentIndexRef.current);
          }
        }
        isMovingRef.current = false;
      },
    });
  };

  return (
    <div className="visite_musee">
      <canvas ref={canvasRef} className="webgl" />
      <div className={`modal ${showReturn ? "active" : ""}`}>
        <div className="modal_content">
          {content.artworks[lastViewedOrbRef.current] && (
            <>
              <div className="icon">
                <IconMuseum icon="svgScan" width={56} height={56} />
                <IconMuseum
                  icon={content.artworks[lastViewedOrbRef.current].icon}
                  width={30}
                  height={30}
                />
              </div>
              <h2 className="artwork_name">
                {content.artworks[lastViewedOrbRef.current].title}
              </h2>
              <p className="artwork_description">
                {content.artworks[lastViewedOrbRef.current].description}
              </p>
              <div className="hypertext">
                <Link
                  href={content.artworks[lastViewedOrbRef.current].link}
                  className="hypertext_link"
                >
                  Je n'ai pas accès à la puce NFC
                </Link>
              </div>
            </>
          )}
          <button onClick={modalAppear}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
