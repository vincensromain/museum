"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import "./visite_musee_4.scss";
import Modal from "../components/Modal/Modal";
import contentData from "../data/content.json";

const setupLights = (scene, lightDefs) => {
  const lights = {};
  const diamondPivots = {};
  const clickableDiamonds = {};

  Object.entries(lightDefs).forEach(([name, def]) => {
    const light = new THREE.PointLight(def.color, def.intensity, def.distance);
    light.position.set(...def.position);
    scene.add(light);
    lights[name] = light;

    if (
      !["point_1", "point_2", "basicLight_1", "basicLight_2", "home"].includes(
        name
      )
    ) {
      light.intensity = 0;
    }

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

    // === Scene setup ===
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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // === Lights & diamonds ===
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

    // === Invisible intermediate points ===
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

    // === Load GLTF model ===
    new GLTFLoader().load(
      "/models/Musee/scene_nolight.gltf",
      (gltf) => scene.add(gltf.scene),
      undefined,
      (err) => console.error("GLTF load error:", err)
    );

    // === Camera points definitions ===
    const camPointDefs = {
      camPoint_1: { x: -0.02, y: 6, z: 0.2 },
      camPoint_2: { x: 3.6, y: 6, z: -11.37 },
      camPoint_3: { x: 2, y: 6, z: -9.2 },
      camPoint_4: { x: -5.85, y: 6, z: -9.2 },
    };

    // === Initial position on camPoint3 looking at point_3 ===
    camera.position.set(
      camPointDefs.camPoint_3.x,
      camPointDefs.camPoint_3.y,
      camPointDefs.camPoint_3.z
    );
    controls.target.set(...lightDefs.point_3.position);
    controls.update();

    // === Light up point_3 (static) ===
    const pivot3 = diamondPivots.point_3;
    pivot3.visible = true;
    pivot3.scale.set(1, 1, 1);
    gsap.to(lights.point_3, {
      intensity: lightDefs.point_3.intensity,
      duration: 1,
      ease: "power2.inOut",
    });

    // === Animate to camPoint4 / point_4 after 0.3s ===
    gsap.to(camera.position, {
      x: camPointDefs.camPoint_4.x,
      y: camPointDefs.camPoint_4.y,
      z: camPointDefs.camPoint_4.z,
      delay: 0.3,
      duration: 1,
      ease: "power2.inOut",
    });
    gsap.to(controls.target, {
      x: lightDefs.point_4.position[0],
      y: lightDefs.point_4.position[1],
      z: lightDefs.point_4.position[2],
      delay: 0.3,
      duration: 1,
      ease: "power2.inOut",
      onUpdate: () => controls.update(),
      onComplete: () => {
        const pivot4 = diamondPivots.point_4;
        pivot4.visible = true;
        gsap.to(lights.point_4, {
          intensity: lightDefs.point_4.intensity,
          duration: 1,
          ease: "power2.inOut",
        });
        gsap.to(pivot4.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.to(clickableDiamonds.point_4.scale, {
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

    // === Raycaster for diamond clicks ===
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
        if (["point_1", "point_2", "point_3", "point_4"].includes(nm)) {
          setShowModal(true);
          lastViewedOrbRef.current = parseInt(nm.split("_")[1], 10) - 1;
        }
      }
    };
    window.addEventListener("click", onClick);

    // === Level indicators & handlers ===
    gsap.set(
      lvlRefs.current.filter((r) => r),
      { opacity: 0.27 }
    );
    if (lvlRefs.current[3]) gsap.set(lvlRefs.current[3], { opacity: 1 });
    const handlers = [];
    [0, 1, 2, 3].forEach((i) => {
      const lvl = lvlRefs.current[i];
      if (!lvl) return;
      const fn = () => {
        gsap.to(
          lvlRefs.current.filter((r) => r),
          { opacity: 0.27, duration: 0.3 }
        );
        gsap.to(lvl, { opacity: 1, duration: 0.3 });
        const cp = camPointDefs[`camPoint_${i + 1}`];
        gsap.to(camera.position, {
          x: cp.x,
          y: cp.y,
          z: cp.z,
          duration: 2,
          ease: "power2.inOut",
        });
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

    // === Animation loop & resize ===
    const animate = () => {
      requestAnimationFrame(animate);
      Object.values(diamondPivots).forEach((p) => {
        if (p.visible) p.rotation.y += 0.01;
      });
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

    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      [0, 1, 2, 3].forEach((i) => {
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
