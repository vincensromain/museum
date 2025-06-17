"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "lil-gui";
import gsap from "gsap";
import "./visite_musee_test.scss";

export default function Home() {
  const canvasRef = useRef(null);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

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
        intensity: 0, // Éteindre initialement
        distance: 0,
        position: [8.94, 9.4, 9.91],
      },
      basicLight_2: {
        color: 0x07b2c5,
        intensity: 0, // Éteindre initialement
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

    const camPointDefs = {
      camPoint_1: { position: { x: -0.02, y: 6, z: 0.2 } },
      camPoint_2: { position: { x: 2, y: 6, z: -9.2 } },
      camPoint_3: { position: { x: -5.85, y: 6, z: -8.4 } },
      camPoint_4: { position: { x: 3.6, y: 6, z: -11.37 } },
      camPoint_5: { position: { x: -3.12, y: 6, z: -9.23 } },
      camPoint_6: { position: { x: 5, y: 6, z: -11.44 } },
    };

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

    const diamondPivots = {};
    const clickableDiamonds = {};
    const intermediatePointObjects = [];
    const lights = {};

    Object.entries(lightDefs).forEach(([name, def]) => {
      const light = new THREE.PointLight(
        def.color,
        def.intensity,
        def.distance
      );
      light.position.set(...def.position);
      scene.add(light);
      lights[name] = light;

      if (!["basicLight_1", "basicLight_2", "home"].includes(name)) {
        const pivot = new THREE.Object3D();
        pivot.position.set(
          def.position[0],
          def.position[1] + 1,
          def.position[2]
        );
        scene.add(pivot);
        diamondPivots[name] = pivot;

        const geometry = new THREE.OctahedronGeometry(1);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: def.color });
        const diamond = new THREE.LineSegments(edges, material);
        diamond.name = name;
        diamond.position.set(0, -1, 0);
        diamond.scale.set(0.5, 0.5, 0.5);
        pivot.add(diamond);
        clickableDiamonds[name] = diamond;
      }
    });

    Object.entries(intermediatePoints).forEach(([name, def]) => {
      const geometry = new THREE.SphereGeometry(0.2);
      const material = new THREE.MeshBasicMaterial({
        color: def.color,
        transparent: true,
        opacity: 0,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(def.position.x, def.position.y, def.position.z);
      scene.add(sphere);
      intermediatePointObjects.push({ name, object: sphere });
    });

    new GLTFLoader().load("/models/Musee/scene_nolight.gltf", (gltf) => {
      scene.add(gltf.scene);
    });

    const gui = new GUI();
    const folder = gui.addFolder("Intermediate Points");
    intermediatePointObjects.forEach(({ name, object }) => {
      const f = folder.addFolder(name);
      f.add(object.position, "x", -20, 20).name("X");
      f.add(object.position, "y", -20, 20).name("Y");
      f.add(object.position, "z", -20, 20).name("Z");
    });

    gsap.to(camera.position, {
      x: camPointDefs.camPoint_1.position.x,
      y: camPointDefs.camPoint_1.position.y,
      z: camPointDefs.camPoint_1.position.z,
      duration: 3,
      ease: "power2.inOut",
    });

    gsap.to(controls.target, {
      x: lightDefs.point_1.position[0],
      y: lightDefs.point_1.position[1],
      z: lightDefs.point_1.position[2],
      duration: 3,
      ease: "power2.inOut",
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onClick(event) {
      // Calculer la position du clic en NDC
      const bounds = canvasRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      // Lancer le raycaster et vérifier l'objet cliqué
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        Object.values(clickableDiamonds)
      );
      if (intersects.length === 0) return;
      if (intersects[0].object.name !== "point_1") return;

      const intermediatePoint1Position =
        intermediatePoints.intermediatePoint1.position;
      gsap.to(controls.target, {
        x: intermediatePoint1Position.x,
        y: intermediatePoint1Position.y,
        z: intermediatePoint1Position.z,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          controls.update();
        },
        onComplete: () => {
          const start = new THREE.Vector3(
            camPointDefs.camPoint_1.position.x,
            camPointDefs.camPoint_1.position.y,
            camPointDefs.camPoint_1.position.z
          );
          const end = new THREE.Vector3(
            camPointDefs.camPoint_2.position.x,
            camPointDefs.camPoint_2.position.y,
            camPointDefs.camPoint_2.position.z
          );
          const pathPoints = [
            start,
            ...intermediatePointObjects.map((ip) => ip.object.position.clone()),
            end,
          ];
          const curve = new THREE.CatmullRomCurve3(pathPoints);

          const tweenObj = { t: 0 };
          const totalDuration = (pathPoints.length - 1) * 2;

          gsap.to(tweenObj, {
            t: 1,
            duration: totalDuration,
            ease: "power2.inOut",
            onUpdate: () => {
              const p = curve.getPoint(tweenObj.t);
              camera.position.copy(p);

              // Allumer les lumières pile entre intermediatePoint1 et intermediatePoint2
              if (tweenObj.t > 0.1 && tweenObj.t < 0.3) {
                // Ajustez ces valeurs pour cibler précisément entre 1 et 2
                gsap.to([lights.basicLight_1, lights.basicLight_2], {
                  intensity: 30,
                  duration: 0.2,
                  stagger: 0.03,
                  ease: "power2.inOut",
                });
              }

              if (tweenObj.t >= 0.7) {
                const targetPosition = new THREE.Vector3(
                  lightDefs.point_2.position[0],
                  lightDefs.point_2.position[1],
                  lightDefs.point_2.position[2]
                );
                controls.target.copy(targetPosition);
              } else {
                const lookP = curve.getPoint(
                  Math.min(tweenObj.t + 0.02, 1 - 0.02)
                );
                controls.target.copy(lookP);
              }

              controls.update();
            },
            onComplete: () => {
              camera.position.copy(end);
              controls.update();
            },
          });
        },
      });
    }

    window.addEventListener("click", onClick);

    function animate() {
      requestAnimationFrame(animate);
      Object.values(diamondPivots).forEach((pivot) => {
        pivot.rotation.y += 0.01;
      });
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => {
      window.removeEventListener("click", onClick);
      gui.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="three_canvas" />;
}
