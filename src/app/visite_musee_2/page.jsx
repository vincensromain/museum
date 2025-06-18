"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import "./visite_musee_2.scss";
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

    if (name !== "home") light.intensity = 0;

    if (!["basicLight_1", "basicLight_2", "home"].includes(name)) {
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
      diamond.scale.set(
        name === "point_1" ? 0.5 : 0,
        name === "point_1" ? 0.5 : 0,
        name === "point_1" ? 0.5 : 0
      );
      pivot.add(diamond);
      clickableDiamonds[name] = diamond;
    }
  });

  diamondPivots.point_1.visible = true;

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
        intensity: 0,
        distance: 0,
        position: [8.94, 9.4, 9.91],
      },
      basicLight_2: {
        color: 0x07b2c5,
        intensity: 0,
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

    const { lights, diamondPivots, clickableDiamonds } = setupLights(
      scene,
      lightDefs
    );

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

    const intermediatePointObjects = setupIntermediatePoints(
      scene,
      intermediatePoints
    );

    const loader = new GLTFLoader();
    loader.load(
      "/models/Musee/scene_nolight.gltf",
      (gltf) => {
        scene.add(gltf.scene);
      },
      undefined,
      (error) => {
        console.error("An error happened while loading the GLTF model:", error);
      }
    );

    const camPointDefs = {
      camPoint_1: { x: -0.02, y: 6, z: 0.2 },
      camPoint_2: { x: 3.6, y: 6, z: -11.37 },
    };

    camera.position.set(
      camPointDefs.camPoint_1.x,
      camPointDefs.camPoint_1.y,
      camPointDefs.camPoint_1.z
    );
    controls.target.set(
      lightDefs.point_1.position[0],
      lightDefs.point_1.position[1],
      lightDefs.point_1.position[2]
    );
    lights.point_1.intensity = lightDefs.point_1.intensity;

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

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        if (
          clickedObject.name === "point_1" ||
          clickedObject.name === "point_2"
        ) {
          setShowModal(true);
          lastViewedOrbRef.current =
            parseInt(clickedObject.name.split("_")[1]) - 1;
        }
      }
    };

    window.addEventListener("click", onClick);

    // Initialiser les opacités des niveaux
    gsap.set(
      lvlRefs.current.filter((ref) => ref !== null),
      { opacity: 0.27 }
    );
    if (lvlRefs.current[1]) {
      gsap.set(lvlRefs.current[1], { opacity: 1 }); // lvl2 a une opacité de 1
    }

    // Ajouter des écouteurs d'événements pour chaque niveau cliquable
    const clickHandlers = [];
    lvlRefs.current.forEach((lvl, index) => {
      if (index < 2 && lvl) {
        const handleClick = () => {
          gsap.to(
            lvlRefs.current.filter((ref) => ref !== null),
            { opacity: 0.27, duration: 0.3 }
          );
          gsap.to(lvl, { opacity: 1, duration: 0.3 });

          // Animate camera based on level clicked
          const targetCamPoint =
            index === 0 ? camPointDefs.camPoint_1 : camPointDefs.camPoint_2;
          gsap.to(camera.position, {
            x: targetCamPoint.x,
            y: targetCamPoint.y,
            z: targetCamPoint.z,
            duration: 2,
            ease: "power2.inOut",
            onUpdate: () => {
              camera.lookAt(controls.target);
              controls.update();
            },
          });
        };
        lvl.addEventListener("click", handleClick);
        clickHandlers[index] = handleClick;
      }
    });

    const animateCamera = () => {
      const ip1 = intermediatePoints.intermediatePoint1.position;
      gsap.to(controls.target, {
        x: ip1.x,
        y: ip1.y,
        z: ip1.z,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => controls.update(),
        onComplete: () => {
          const start = new THREE.Vector3(
            camPointDefs.camPoint_1.x,
            camPointDefs.camPoint_1.y,
            camPointDefs.camPoint_1.z
          );
          const end = new THREE.Vector3(
            camPointDefs.camPoint_2.x,
            camPointDefs.camPoint_2.y,
            camPointDefs.camPoint_2.z
          );
          const pathPoints = [
            start,
            ...intermediatePointObjects.map((ip) => ip.object.position.clone()),
            end,
          ];
          const curve = new THREE.CatmullRomCurve3(pathPoints);
          const tweenObj = { t: 0 };
          const totalD = (pathPoints.length - 1) * 1.5;

          gsap.to(tweenObj, {
            t: 1,
            duration: totalD,
            ease: "power2.inOut",
            onUpdate: () => {
              const p = curve.getPoint(tweenObj.t);
              camera.position.copy(p);

              if (tweenObj.t > 0.1 && tweenObj.t < 0.3) {
                gsap.to([lights.basicLight_1, lights.basicLight_2], {
                  intensity: 30,
                  duration: 0.2,
                  stagger: 0.03,
                  ease: "power2.inOut",
                });
              }

              if (tweenObj.t >= 0.7) {
                controls.target.copy(
                  new THREE.Vector3(...lightDefs.point_2.position)
                );
              } else {
                controls.target.copy(
                  curve.getPoint(Math.min(tweenObj.t + 0.02, 0.98))
                );
              }
              controls.update();
            },
            onComplete: () => {
              camera.position.copy(end);
              controls.update();
            },
          });

          gsap.to(lights.point_2, {
            intensity: lightDefs.point_2.intensity,
            duration: 1,
            delay: totalD - 1.5,
            ease: "power2.inOut",
          });

          diamondPivots.point_2.visible = true;
          gsap.to(clickableDiamonds.point_2.scale, {
            x: 0.5,
            y: 0.5,
            z: 0.5,
            duration: 1,
            delay: totalD - 1.5,
            ease: "power2.inOut",
            onComplete: () => {
              gsap.to(clickableDiamonds.point_2.scale, {
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
    };

    setTimeout(animateCamera, 300);

    const animate = () => {
      requestAnimationFrame(animate);
      Object.values(diamondPivots).forEach((pivot) => {
        if (pivot.visible) {
          pivot.rotation.y += 0.01;
        }
      });
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", onClick);
      lvlRefs.current.forEach((lvl, index) => {
        if (index < 2 && lvl && clickHandlers[index]) {
          lvl.removeEventListener("click", clickHandlers[index]);
        }
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
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <div
            key={level}
            className={`lvl lvl${level}`}
            ref={(el) => (lvlRefs.current[level - 1] = el)}
          >
            <span className="lvl_ball"></span>
            {level < 6 && <span className="lvl_line"></span>}
          </div>
        ))}
      </div>
    </>
  );
}
