"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GUI } from "lil-gui";
import gsap from "gsap";
import Modal from "../components/Modal/Modal";
import content from "../data/content.json"; // doit contenir artworks[]
import "./visite_musee_test.scss";

export default function Home() {
  const canvasRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const lastViewedOrbRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(-6, 8, 14);

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
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.target.set(0, 0, 0);

    const gui = new GUI();
    const camFolder = gui.addFolder("Camera");
    camFolder.add(camera.position, "x", -50, 50).name("Pos X");
    camFolder.add(camera.position, "y", -50, 50).name("Pos Y");
    camFolder.add(camera.position, "z", -50, 50).name("Pos Z");

    const ambient = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambient);
    const ambFolder = gui.addFolder("Ambient");
    const ambSettings = {
      color: ambient.color.getHex(),
      intensity: ambient.intensity,
    };
    ambFolder
      .addColor(ambSettings, "color")
      .name("Color")
      .onChange((v) => ambient.color.set(v));
    ambFolder
      .add(ambSettings, "intensity", 0, 1)
      .name("Intensity")
      .onChange((v) => (ambient.intensity = v));

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

    const animatedDiamonds = [];
    const pointLights = {};
    const clickableDiamonds = [];

    Object.entries(lightDefs).forEach(([name, def]) => {
      const light = new THREE.PointLight(
        def.color,
        def.intensity,
        def.distance
      );
      light.position.set(...def.position);
      light.visible = [
        "point_1",
        "home",
        "basicLight_1",
        "basicLight_2",
      ].includes(name);
      scene.add(light);
      pointLights[name] = light;

      const folder = gui.addFolder(name);
      const settings = {
        color: def.color,
        intensity: def.intensity,
        distance: def.distance,
        lightOn: light.visible,
        animate: name === "point_1",
      };
      folder
        .addColor(settings, "color")
        .name("Color")
        .onChange((v) => light.color.set(v));
      folder
        .add(settings, "intensity", 0, 50)
        .name("Intensity")
        .onChange((v) => (light.intensity = v));
      folder
        .add(settings, "distance", 0, 100)
        .name("Distance")
        .onChange((v) => (light.distance = v));
      folder
        .add(settings, "lightOn")
        .name("Light On/Off")
        .onChange((v) => (light.visible = v));

      if (!["home", "basicLight_1", "basicLight_2"].includes(name)) {
        const size = 1;
        const pivot = new THREE.Object3D();
        pivot.position.set(
          def.position[0],
          def.position[1] + size,
          def.position[2]
        );
        pivot.rotationSpeed = 0.01;
        scene.add(pivot);

        const octGeo = new THREE.OctahedronGeometry(size);
        const edgeGeo = new THREE.EdgesGeometry(octGeo);
        const lineMat = new THREE.LineBasicMaterial({ color: def.color });
        const diamond = new THREE.LineSegments(edgeGeo, lineMat);
        diamond.position.set(0, -size, 0);
        diamond.name = name;
        pivot.add(diamond);

        gsap.fromTo(
          diamond.scale,
          { x: 0.3, y: 0.3, z: 0.3 },
          { x: 0.5, y: 0.5, z: 0.5, duration: 1.3, ease: "power3.inOut" }
        );

        animatedDiamonds.push(pivot);
        clickableDiamonds.push(diamond);

        if (settings.animate) {
          const tween = gsap.to(diamond.scale, {
            x: 0.5,
            y: 0.5,
            z: 0.5,
            duration: 0.8,
            ease: "power3",
            repeat: -1,
            yoyo: true,
          });
          folder
            .add(settings, "animate")
            .name("Animate Diamond")
            .onChange((v) => {
              v ? tween.play() : tween.pause();
            });
        }
      }
    });

    const point1Pos = new THREE.Vector3(...lightDefs.point_1.position);
    const camTargetPos = {
      x: point1Pos.x,
      y: point1Pos.y + 2,
      z: point1Pos.z + 4,
    };
    gsap.to(camera.position, {
      x: camTargetPos.x,
      y: camTargetPos.y,
      z: camTargetPos.z,
      duration: 2,
      delay: 2,
      ease: "power3.inOut",
      onUpdate: () => controls.target.copy(point1Pos),
    });
    gsap.to(controls.target, {
      x: point1Pos.x,
      y: point1Pos.y,
      z: point1Pos.z,
      duration: 2,
      delay: 2,
      ease: "power3.inOut",
    });

    new GLTFLoader().load(
      "/models/Musee/scene_nolight.gltf",
      (gltf) => scene.add(gltf.scene),
      undefined,
      console.error
    );

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
        console.log("Click sur :", name);

        if (name === "point_1") {
          const targetPos = new THREE.Vector3(...lightDefs.point_2.position);
          const cameraTarget = {
            x: targetPos.x,
            y: targetPos.y + 2,
            z: targetPos.z + 4,
          };

          gsap.to(camera.position, {
            x: cameraTarget.x,
            y: cameraTarget.y,
            z: cameraTarget.z,
            duration: 2,
            ease: "power3.inOut",
            onUpdate: () => controls.target.copy(targetPos),
          });

          gsap.to(controls.target, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 2,
            ease: "power3.inOut",
          });
        }

        const index = Object.keys(lightDefs).indexOf(name);
        lastViewedOrbRef.current = index;
        setShowModal(true);
      }
    }

    window.addEventListener("click", onClick);

    function animate() {
      requestAnimationFrame(animate);
      animatedDiamonds.forEach((pivot) => {
        pivot.rotation.y += pivot.rotationSpeed;
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
      gui.destroy();
      window.removeEventListener("click", onClick);
    };
  }, []);

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
