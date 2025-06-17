"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import Modal from "../components/Modal/Modal";
import content from "../data/content.json";
import "./visite_musee_test.scss";

export default function Home() {
  const canvasRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const lastViewedOrbRef = useRef(null);
  const [activePoints, setActivePoints] = useState([]);
  const [mainPoint, setMainPoint] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("activePoints");
    const last = localStorage.getItem("lastMainPoint");
    const parsedPoints = saved ? JSON.parse(saved) : ["point_1"];
    const resolvedMain = last || "point_1";
    console.log(
      "⏳ Chargement init — activePoints:",
      parsedPoints,
      "mainPoint:",
      resolvedMain
    );
    setActivePoints(parsedPoints);
    setMainPoint(resolvedMain);
  }, []);

  useEffect(() => {
    if (!mainPoint) return;
    const pendingAdvance = localStorage.getItem("pendingAdvance") === "true";
    console.log(
      "🔁 mainPoint changed:",
      mainPoint,
      "| pendingAdvance =",
      pendingAdvance
    );
    if (pendingAdvance) {
      console.log("➡️ Dispatching 'next-point' event");
      localStorage.removeItem("pendingAdvance");
      window.dispatchEvent(new CustomEvent("next-point"));
    }
  }, [mainPoint]);

  useEffect(() => {
    if (!canvasRef.current || !mainPoint || activePoints.length === 0) return;

    const lightDefs = {
      point_1: {
        color: 0x07b2c5,
        intensity: 10,
        distance: 10,
        position: [-0.02, 4.7, -2.62],
      },
      point_2: {
        color: 0x07b2c5,
        intensity: 10,
        distance: 10,
        position: [-0.005, 4.7, -7.3],
      },
      point_3: {
        color: 0x07b2c5,
        intensity: 10,
        distance: 10,
        position: [-7.6, 4.7, -7.3],
      },
      point_4: {
        color: 0x07b2c5,
        intensity: 10,
        distance: 10,
        position: [1.08, 4.7, -10.17],
      },
      point_5: {
        color: 0x07b2c5,
        intensity: 10,
        distance: 10,
        position: [-4.29, 4.7, -7.3],
      },
      point_6: {
        color: 0x07b2c5,
        intensity: 10,
        distance: 10,
        position: [0.46, 7, -13.37],
      },
      basicLight_1: {
        color: 0x07b2c5,
        intensity: 30,
        distance: 0,
        position: [8.94, 9.4, 9.91],
      },
      basicLight_2: {
        color: 0x07b2c5,
        intensity: 30,
        distance: 0,
        position: [8.94, 9.4, -2.86],
      },
      home: {
        color: 0x07b2c5,
        intensity: 10,
        distance: 0,
        position: [-5.99, 6.46, 7.41],
      },
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.enablePan = false;

    const cameraFromKey = localStorage.getItem("cameraFrom");
    if (cameraFromKey && lightDefs[cameraFromKey]) {
      const pos = lightDefs[cameraFromKey].position;
      camera.position.set(pos[0], pos[1] + 2, pos[2] + 4);
    }

    const mainPos = new THREE.Vector3(...lightDefs[mainPoint].position);
    const cameraTarget = {
      x: mainPos.x,
      y: mainPos.y + 2,
      z: mainPos.z + 4,
    };

    gsap.to(camera.position, {
      ...cameraTarget,
      duration: 2,
      ease: "power3.inOut",
      onUpdate: () => controls.target.copy(mainPos),
    });
    gsap.to(controls.target, {
      x: mainPos.x,
      y: mainPos.y,
      z: mainPos.z,
      duration: 2,
      ease: "power3.inOut",
    });

    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambient);

    const pointLights = {};
    const diamondPivots = {};
    const diamondTweens = {};
    const clickableDiamonds = [];

    Object.entries(lightDefs).forEach(([name, def]) => {
      const isUtilityLight = ["home", "basicLight_1", "basicLight_2"].includes(
        name
      );
      const light = new THREE.PointLight(
        def.color,
        def.intensity,
        def.distance
      );
      light.position.set(...def.position);
      light.visible = isUtilityLight || activePoints.includes(name);
      scene.add(light);
      pointLights[name] = light;

      if (isUtilityLight) return;

      const size = 1;
      const pivot = new THREE.Object3D();
      pivot.position.set(
        def.position[0],
        def.position[1] + size,
        def.position[2]
      );
      pivot.rotationSpeed = 0.01;
      scene.add(pivot);

      const geometry = new THREE.OctahedronGeometry(size);
      const edges = new THREE.EdgesGeometry(geometry);
      const material = new THREE.LineBasicMaterial({ color: def.color });
      const diamond = new THREE.LineSegments(edges, material);
      diamond.name = name;
      diamond.position.set(0, -size, 0);
      pivot.add(diamond);
      diamond.scale.set(0.2, 0.2, 0.2);

      const isActive = activePoints.includes(name);
      diamond.visible = isActive;
      clickableDiamonds.push(diamond);

      if (isActive && name === mainPoint) {
        diamondTweens[name] = gsap.to(diamond.scale, {
          x: 0.5,
          y: 0.5,
          z: 0.5,
          duration: 0.8,
          ease: "power3.inOut",
          yoyo: true,
          repeat: -1,
        });
      } else {
        gsap.set(diamond.scale, { x: 0.5, y: 0.5, z: 0.5 });
      }

      diamondPivots[name] = pivot;
    });

    new GLTFLoader().load("/models/Musee/scene_nolight.gltf", (gltf) => {
      scene.add(gltf.scene);
    });

    function animate() {
      requestAnimationFrame(animate);
      Object.values(diamondPivots).forEach((pivot) => {
        pivot.rotation.y += pivot.rotationSpeed;
      });
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onClick(event) {
      const bounds = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableDiamonds, true);

      if (intersects.length > 0) {
        const name = intersects[0].object.name;
        console.log("💎 Point cliqué :", name);
        lastViewedOrbRef.current = Object.keys(lightDefs).indexOf(name);
        localStorage.setItem("cameraFrom", mainPoint);
        setMainPoint(name);
        localStorage.setItem("lastMainPoint", name);
        setShowModal(true);
      }
    }

    window.addEventListener("click", onClick);

    function activateNextPoint() {
      const keys = Object.keys(lightDefs).filter(
        (key) => !["home", "basicLight_1", "basicLight_2"].includes(key)
      );
      const currentIndex = keys.indexOf(mainPoint);
      const nextPoint = keys[currentIndex + 1];
      console.log(
        "🟢 activateNextPoint — main =",
        mainPoint,
        "→ next =",
        nextPoint
      );

      if (!nextPoint) return;

      const updated = [...new Set([...activePoints, nextPoint])];
      setActivePoints(updated);
      setMainPoint(nextPoint);
      localStorage.setItem("activePoints", JSON.stringify(updated));
      localStorage.setItem("lastMainPoint", nextPoint);
    }

    window.addEventListener("next-point", activateNextPoint);

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("next-point", activateNextPoint);
    };
  }, [mainPoint, activePoints]);

  return (
    <>
      <canvas ref={canvasRef} className="three_canvas" />
      {showModal && (
        <Modal
          showReturn={showModal}
          content={content}
          lastViewedOrbRef={lastViewedOrbRef}
          modalAppear={() => setShowModal(false)}
        />
      )}
    </>
  );
}
