"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import "./visite_musee_3.scss";
import Modal from "../components/Modal/Modal";
import contentData from "../data/content.json";

const setupLights = (scene, lightDefs) => {
  const lights = {};
  const diamondPivots = {};
  const clickableDiamonds = {};

  Object.entries(lightDefs).forEach(([name, def]) => {
    // création de la lumière
    const light = new THREE.PointLight(def.color, def.intensity, def.distance);
    light.position.set(...def.position);
    scene.add(light);
    lights[name] = light;

    // éteindre celles qui ne sont pas point_1/point_2
    if (
      !["point_1", "point_2", "basicLight_1", "basicLight_2", "home"].includes(
        name
      )
    ) {
      light.intensity = 0;
    }

    // pivot + diamant (sauf "home")
    if (name !== "home") {
      const pivot = new THREE.Object3D();
      pivot.position.set(def.position[0], def.position[1] + 1, def.position[2]);
      scene.add(pivot);
      diamondPivots[name] = pivot;

      const geom = new THREE.OctahedronGeometry(1);
      const edges = new THREE.EdgesGeometry(geom);
      const mat = new THREE.LineBasicMaterial({ color: def.color });
      const diamond = new THREE.LineSegments(edges, mat);
      diamond.name = name;
      diamond.position.set(0, -1, 0);
      diamond.scale.set(0.5, 0.5, 0.5);
      pivot.add(diamond);
      clickableDiamonds[name] = diamond;

      // état initial
      if (name === "point_1" || name === "point_2") {
        pivot.visible = true;
        pivot.scale.set(1, 1, 1);
      } else {
        pivot.visible = false;
        pivot.scale.set(0, 0, 0);
      }
    }
  });

  return { lights, diamondPivots, clickableDiamonds };
};

const setupIntermediatePoints = (scene, intermediatePoints) => {
  const intermediatePointObjects = [];
  Object.entries(intermediatePoints).forEach(([name, def]) => {
    const sphereGeo = new THREE.SphereGeometry(0.2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: def.color,
      transparent: true,
      opacity: 0,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(def.position.x, def.position.y, def.position.z);
    scene.add(sphere);
    intermediatePointObjects.push({ name, object: sphere });
  });
  return intermediatePointObjects;
};

export default function Home() {
  const canvasRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const lastViewedOrbRef = useRef(0);
  const lvlRefs = useRef([]);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // === Scène, caméra, renderer ===
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // === OrbitControls ===
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // === Lights & Diamonds ===
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
        position: [1.08, 4.7, -10.17],
      },
      point_3: {
        color: 0x07b2c5,
        intensity: 10,
        distance: 10,
        position: [-0.005, 4.7, -7.3],
      },
      point_4: {
        color: 0x07b2c5,
        intensity: 10,
        distance: 10,
        position: [-7.6, 4.7, -7.3],
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
        intensity: 5,
        distance: 10,
        position: [8.94, 9.4, 9.91],
      },
      basicLight_2: {
        color: 0x07b2c5,
        intensity: 5,
        distance: 10,
        position: [8.94, 9.4, -2.86],
      },
      home: {
        color: 0x07b2c5,
        intensity: 10,
        distance: 0,
        position: [-5.99, 6.46, 7.41],
      },
    };
    const { lights, diamondPivots, clickableDiamonds } = setupLights(
      scene,
      lightDefs
    );

    // === Points intermédiaires invisibles ===
    const intermediatePoints = {
      intermediatePoint1: { position: { x: 1, y: 6, z: 3 }, color: 0x00ff00 },
      intermediatePoint2: {
        position: { x: 8.12, y: 6, z: 3 },
        color: 0x00ff00,
      },
      intermediatePoint3: {
        position: { x: 8.12, y: 6, z: -10.92 },
        color: 0x00ff00,
      },
      intermediatePoint4: {
        position: { x: 2.6, y: 6, z: -10.92 },
        color: 0x00ff00,
      },
    };
    setupIntermediatePoints(scene, intermediatePoints);

    // === Chargement GLTF ===
    new GLTFLoader().load(
      "/models/Musee/scene_nolight.gltf",
      (gltf) => scene.add(gltf.scene),
      undefined,
      (err) => console.error("GLTF load error:", err)
    );

    // === Définitions des camPoints ===
    const camPointDefs = {
      camPoint_1: { x: -0.02, y: 6, z: 0.2 },
      camPoint_2: { x: 3.6, y: 6, z: -11.37 },
      camPoint_3: { x: 2, y: 6, z: -9.2 },
    };

    // === Position & orientation initiales ===
    camera.position.set(
      camPointDefs.camPoint_2.x,
      camPointDefs.camPoint_2.y,
      camPointDefs.camPoint_2.z
    );
    controls.target.set(...lightDefs.point_2.position);
    controls.update();

    // === Timeline GSAP pour point_3 ===
    const point3Vec = new THREE.Vector3(...lightDefs.point_3.position);
    const tl = gsap.timeline({
      onComplete: () => {
        // allumer la lumière
        gsap.to(lights.point_3, {
          intensity: lightDefs.point_3.intensity,
          duration: 1,
          ease: "power2.inOut",
        });
        // pop-in du diamant point_3 + yoyo
        const pivot = diamondPivots.point_3;
        pivot.visible = true;
        gsap.to(pivot.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.to(clickableDiamonds.point_3.scale, {
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
      },
    });
    tl.to(
      camera.position,
      {
        x: camPointDefs.camPoint_3.x,
        y: camPointDefs.camPoint_3.y,
        z: camPointDefs.camPoint_3.z,
        duration: 2,
        ease: "power2.inOut",
      },
      0
    ).to(
      controls.target,
      {
        x: point3Vec.x,
        y: point3Vec.y,
        z: point3Vec.z,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => controls.update(),
      },
      0
    );

    // === Raycaster pour le clic sur diamants ===
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const onClick = (e) => {
      const b = canvasRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - b.left) / b.width) * 2 - 1;
      mouse.y = -((e.clientY - b.top) / b.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(Object.values(clickableDiamonds));
      if (hits.length) {
        const nm = hits[0].object.name;
        if (nm === "point_1" || nm === "point_2" || nm === "point_3") {
          setShowModal(true);
          lastViewedOrbRef.current = parseInt(nm.split("_")[1], 10) - 1;
        }
      }
    };
    window.addEventListener("click", onClick);

    // === Navigation verticale niveaux ===
    // 1. Opacité à 0.27 pour tous + surligner lvl3
    gsap.set(
      lvlRefs.current.filter((r) => r),
      { opacity: 0.27 }
    );
    if (lvlRefs.current[2]) gsap.set(lvlRefs.current[2], { opacity: 1 });

    // 2. Handlers pour lvl1 (i=0), lvl2 (i=1) et lvl3 (i=2)
    const handlers = [];
    [0, 1, 2].forEach((i) => {
      const lvl = lvlRefs.current[i];
      if (!lvl) return;
      const fn = () => {
        // visuel
        gsap.to(
          lvlRefs.current.filter((r) => r),
          { opacity: 0.27, duration: 0.3 }
        );
        gsap.to(lvl, { opacity: 1, duration: 0.3 });
        // caméra
        const cp = camPointDefs[`camPoint_${i + 1}`];
        gsap.to(camera.position, {
          x: cp.x,
          y: cp.y,
          z: cp.z,
          duration: 2,
          ease: "power2.inOut",
        });
        // regard
        const pointName = `point_${i + 1}`;
        const pos = lightDefs[pointName].position;
        gsap.to(controls.target, {
          x: pos[0],
          y: pos[1],
          z: pos[2],
          duration: 2,
          ease: "power2.inOut",
          onUpdate: () => controls.update(),
        });
      };
      lvl.addEventListener("click", fn);
      handlers[i] = fn;
    });

    // === Loop & resize ===
    const animate = () => {
      requestAnimationFrame(animate);
      Object.values(diamondPivots).forEach(
        (p) => p.visible && (p.rotation.y += 0.01)
      );
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      [0, 1, 2].forEach((i) => {
        const lvl = lvlRefs.current[i];
        if (lvl && handlers[i]) lvl.removeEventListener("click", handlers[i]);
      });
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
      <div className="travel">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className={`lvl lvl${n}`}
            ref={(el) => (lvlRefs.current[n - 1] = el)}
          >
            <span className="lvl_ball" />
            {n < 6 && <span className="lvl_line" />}
          </div>
        ))}
      </div>
    </>
  );
}
