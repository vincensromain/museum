"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import "./visite_musee_1.scss";
import Modal from "../components/Modal/Modal";
import contentData from "../data/content.json";

export default function Home() {
  const canvasRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const lastViewedOrbRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(-10, 10, 10);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const lightDefs = {
      point_1: {
        color: 0x07b2c5,
        intensity: 10,
        distance: 10,
        position: [-0.02, 4.7, -2.62],
      },
      home: {
        color: 0x07b2c5,
        intensity: 10,
        distance: 0,
        position: [-5.99, 6.46, 7.41],
      },
    };

    const initialDuration = 3;
    const lights = {};
    const diamondPivots = {};
    const clickableDiamonds = {};

    Object.entries(lightDefs).forEach(([name, def]) => {
      const light = new THREE.PointLight(
        def.color,
        def.intensity,
        def.distance
      );
      light.position.set(...def.position);
      scene.add(light);
      lights[name] = light;

      if (name !== "home") light.intensity = 0;

      if (!["basicLight_1", "basicLight_2", "home"].includes(name)) {
        const pivot = new THREE.Object3D();
        pivot.position.set(
          def.position[0],
          def.position[1] + 1,
          def.position[2]
        );
        pivot.visible = true;
        scene.add(pivot);
        diamondPivots[name] = pivot;

        const geom = new THREE.OctahedronGeometry(1);
        const edges = new THREE.EdgesGeometry(geom);
        const mat = new THREE.LineBasicMaterial({ color: def.color });
        const diamond = new THREE.LineSegments(edges, mat);
        diamond.name = name;
        diamond.position.set(0, -1, 0);
        diamond.scale.set(0, 0, 0);
        pivot.add(diamond);
        clickableDiamonds[name] = diamond;

        gsap.to(diamond.scale, {
          x: 0.5,
          y: 0.5,
          z: 0.5,
          duration: initialDuration,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.to(diamond.scale, {
              x: 0.3,
              y: 0.3,
              z: 0.3,
              duration: 1,
              ease: "power2.inOut",
              yoyo: true,
              repeat: -1,
            });
          },
        });
      }
    });

    new GLTFLoader().load("/models/Musee/scene_nolight.gltf", (gltf) => {
      scene.add(gltf.scene);
    });

    const camPointDefs = {
      camPoint_1: { x: -0.02, y: 6, z: 0.2 },
    };

    gsap.to(camera.position, {
      x: camPointDefs.camPoint_1.x,
      y: camPointDefs.camPoint_1.y,
      z: camPointDefs.camPoint_1.z,
      duration: initialDuration,
      ease: "power2.inOut",
    });
    gsap.to(lights.point_1, {
      intensity: lightDefs.point_1.intensity,
      duration: initialDuration,
      ease: "power2.inOut",
    });
    gsap.to(controls.target, {
      x: lightDefs.point_1.position[0],
      y: lightDefs.point_1.position[1],
      z: lightDefs.point_1.position[2],
      duration: initialDuration,
      ease: "power2.inOut",
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (event) => {
      const bounds = canvasRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        Object.values(clickableDiamonds)
      );

      if (intersects.length > 0 && intersects[0].object.name === "point_1") {
        setShowModal(true);
      }
    };

    window.addEventListener("click", onClick);

    function animate() {
      requestAnimationFrame(animate);
      Object.values(diamondPivots).forEach(
        (pivot) => (pivot.rotation.y += 0.01)
      );
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="three_canvas" />
      <Modal
        showReturn={showModal}
        content={contentData}
        lastViewedOrbRef={lastViewedOrbRef}
        modalAppear={() => setShowModal(false)}
      />
    </>
  );
}
