"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import "./visite_musee_6.scss";

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // === Scène, caméra, renderer, controls ===
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

    // === Définitions des lumières ===
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

      // Éteint toutes les lumières sauf "home"
      if (name !== "home") light.intensity = 0;

      // Crée pivots/diamants pour chaque point (sauf basicLights et home)
      if (!["basicLight_1", "basicLight_2", "home"].includes(name)) {
        const pivot = new THREE.Object3D();
        pivot.position.set(
          def.position[0],
          def.position[1] + 1,
          def.position[2]
        );
        pivot.visible = false;
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
      }
    });

    // === Points intermédiaires ===
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

    // === Chargement du modèle GLTF ===
    new GLTFLoader().load("/models/Musee/scene_nolight.gltf", (gltf) => {
      scene.add(gltf.scene);
    });

    // === Définitions des positions caméra ===
    const camPointDefs = {
      camPoint_1: { x: -0.02, y: 6, z: 0.2 },
      camPoint_2: { x: 2, y: 6, z: -9.2 },
    };

    // === Tween initial vers camPoint_1 + allumage progressif (point_1) ===
    const initialDuration = 3;
    gsap.to(camera.position, {
      x: camPointDefs.camPoint_1.x,
      y: camPointDefs.camPoint_1.y,
      z: camPointDefs.camPoint_1.z,
      duration: initialDuration,
      ease: "power2.inOut",
      onStart: () => {
        diamondPivots.point_1.visible = true;
      },
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

    // === Raycaster et navigation au clic sur diamond point_1 ===
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    function onClick(event) {
      const bounds = canvasRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        Object.values(clickableDiamonds)
      );
      if (!intersects.length) return;
      const clicked = intersects[0].object.name;
      if (clicked !== "point_1") return;

      // 1) déplace le target vers intermediatePoint1
      const ip1 = intermediatePoints.intermediatePoint1.position;
      gsap.to(controls.target, {
        x: ip1.x,
        y: ip1.y,
        z: ip1.z,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => controls.update(),
        onComplete: () => {
          // 2) crée et parcours la courbe
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

              // allume basicLight_1 & basicLight_2 entre IP1 et IP2
              if (tweenObj.t > 0.1 && tweenObj.t < 0.3) {
                gsap.to([lights.basicLight_1, lights.basicLight_2], {
                  intensity: 30,
                  duration: 0.2,
                  stagger: 0.03,
                  ease: "power2.inOut",
                });
              }

              // update target selon avancement
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
        },
      });
    }
    window.addEventListener("click", onClick);

    // === Boucle d'animation ===
    function animate() {
      requestAnimationFrame(animate);
      Object.values(diamondPivots).forEach(
        (pivot) => (pivot.rotation.y += 0.01)
      );
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // === Handler resize ===
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // === Cleanup ===
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, []);

  return <canvas ref={canvasRef} className="three_canvas" />;
}
