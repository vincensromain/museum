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

    // Position initiale de la caméra
    camera.position.set(-10, 10, 10);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Ajouter une lumière ambiante
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Définition des lumières et des points
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

    // Définition des camPoints avec des positions numériques directes
    const camPointDefs = {
      camPoint_1: { position: { x: -0.02, y: 6, z: 0.2 } },
      camPoint_2: { position: { x: 2, y: 6, z: -9.2 } },
      camPoint_3: { position: { x: -5.85, y: 6, z: -8.4 } },
      camPoint_4: { position: { x: 3.6, y: 6, z: -11.37 } },
      camPoint_5: { position: { x: -3.12, y: 6, z: -9.23 } },
      camPoint_6: { position: { x: 5, y: 6, z: -11.44 } },
    };

    // Définition des points intermédiaires avec des positions initiales
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
    const clickableDiamonds = [];
    const intermediatePointObjects = [];

    // Ajouter des lumières et des diamants pour chaque point
    Object.entries(lightDefs).forEach(([name, def]) => {
      const light = new THREE.PointLight(
        def.color,
        def.intensity,
        def.distance
      );
      light.position.set(...def.position);
      scene.add(light);

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
        clickableDiamonds.push(diamond);
      }
    });

    // Ajouter des points intermédiaires à la scène
    Object.entries(intermediatePoints).forEach(([name, def]) => {
      const geometry = new THREE.SphereGeometry(0.2);
      const material = new THREE.MeshBasicMaterial({ color: def.color });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(def.position.x, def.position.y, def.position.z);
      scene.add(sphere);
      intermediatePointObjects.push({ name, object: sphere });
    });

    // Charger le modèle 3D
    new GLTFLoader().load("/models/Musee/scene_nolight.gltf", (gltf) => {
      scene.add(gltf.scene);
    });

    // Configuration de lil-gui pour ajuster les positions des points intermédiaires
    const gui = new GUI();
    const intermediatePointsFolder = gui.addFolder("Intermediate Points");
    intermediatePointObjects.forEach(({ name, object }) => {
      const folder = intermediatePointsFolder.addFolder(name);
      folder.add(object.position, "x", -20, 20).name("X Position");
      folder.add(object.position, "y", -20, 20).name("Y Position");
      folder.add(object.position, "z", -20, 20).name("Z Position");
    });

    // Créer une courbe Catmull-Rom à travers les points intermédiaires
    const curvePoints = Object.values(intermediatePoints).map(
      (def) => new THREE.Vector3(def.position.x, def.position.y, def.position.z)
    );
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const curvePathPoints = curve.getPoints(50);

    // Animer la caméra le long de la courbe
    let currentPointIndex = 0;

    function animateCameraAlongCurve() {
      if (currentPointIndex < curvePathPoints.length) {
        const point = curvePathPoints[currentPointIndex];
        gsap.to(camera.position, {
          x: point.x,
          y: point.y,
          z: point.z,
          duration: 0.1,
          ease: "power2.inOut",
          onComplete: () => {
            currentPointIndex++;
            animateCameraAlongCurve();
          },
        });
      } else {
        // Une fois l'animation le long de la courbe terminée, ajuster la position et la cible de la caméra
        gsap.to(camera.position, {
          x: camPointDefs.camPoint_2.position.x,
          y: camPointDefs.camPoint_2.position.y,
          z: camPointDefs.camPoint_2.position.z,
          duration: 1,
          ease: "power2.inOut",
        });

        gsap.to(controls.target, {
          x: lightDefs.point_2.position[0],
          y: lightDefs.point_2.position[1],
          z: lightDefs.point_2.position[2],
          duration: 1,
          ease: "power2.inOut",
        });
      }
    }

    // Animation de la caméra vers camPoint_1
    gsap.to(camera.position, {
      x: camPointDefs.camPoint_1.position.x,
      y: camPointDefs.camPoint_1.position.y,
      z: camPointDefs.camPoint_1.position.z,
      duration: 3,
      ease: "power2.inOut",
      onComplete: animateCameraAlongCurve,
    });

    gsap.to(controls.target, {
      x: lightDefs.point_1.position[0],
      y: lightDefs.point_1.position[1],
      z: lightDefs.point_1.position[2],
      duration: 3,
      ease: "power2.inOut",
    });

    // Raycaster pour les clics sur les points
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onClick(event) {
      const bounds = canvasRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableDiamonds);

      if (intersects.length > 0) {
        const clickedPoint = intersects[0].object.name;
        const pointIndex = parseInt(clickedPoint.split("_")[1], 10);
        const nextPointIndex = pointIndex < 6 ? pointIndex + 1 : 1;
        const nextCamPoint = camPointDefs[`camPoint_${nextPointIndex}`];
        const nextPoint = lightDefs[`point_${nextPointIndex}`];

        gsap.to(camera.position, {
          x: nextCamPoint.position.x,
          y: nextCamPoint.position.y,
          z: nextCamPoint.position.z,
          duration: 3,
          ease: "power2.inOut",
        });

        gsap.to(controls.target, {
          x: nextPoint.position[0],
          y: nextPoint.position[1],
          z: nextPoint.position[2],
          duration: 3,
          ease: "power2.inOut",
        });
      }
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
      window.removeEventListener("resize", () => {});
      window.removeEventListener("click", onClick);
      gui.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="three_canvas" />;
}
