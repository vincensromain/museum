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

    // Scene, Camera, Renderer
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

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.target.set(0, 0, 0);

    // GUI
    const gui = new GUI();
    const camFolder = gui.addFolder("Camera");
    camFolder.add(camera.position, "x", -50, 50).name("Pos X");
    camFolder.add(camera.position, "y", -50, 50).name("Pos Y");
    camFolder.add(camera.position, "z", -50, 50).name("Pos Z");

    // Ambient Light
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

    // Light Definitions
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
    const clickableObjects = {};
    const pointLights = {};

    Object.entries(lightDefs).forEach(([name, def]) => {
      const light = new THREE.PointLight(
        def.color,
        def.intensity,
        def.distance
      );
      light.position.set(...def.position);

      const isPoint1 = name === "point_1";
      const homeLight = name === "home";
      const basicLight1 = name === "basicLight_1";
      const basicLight2 = name === "basicLight_2";
      light.visible = isPoint1 || homeLight || basicLight1 || basicLight2;
      scene.add(light);
      pointLights[name] = light;

      const folder = gui.addFolder(name);
      const settings = {
        color: def.color,
        intensity: def.intensity,
        distance: def.distance,
        lightOn: light.visible,
        animate: isPoint1,
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

      const skipWire = ["home", "basicLight_1", "basicLight_2"].includes(name);
      if (!skipWire) {
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
        pivot.add(diamond);

        gsap.fromTo(
          diamond.scale,
          { x: 0.3, y: 0.3, z: 0.3 },
          { x: 0.5, y: 0.5, z: 0.5, duration: 1.3, ease: "power3.inOut" }
        );

        animatedDiamonds.push(pivot);
        clickableObjects[name] = diamond;

        if (settings.animate) {
          const tween = gsap.to(diamond.scale, {
            x: 0.5,
            y: 0.5,
            z: 0.5,
            duration: 1.3,
            ease: "power3.inOut",
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

    // Interaction on click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    renderer.domElement.addEventListener("click", (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(
        Object.values(clickableObjects),
        true
      );
      if (hits.length > 0) {
        const clickedObject = hits[0].object;
        const name = Object.entries(clickableObjects).find(
          ([, obj]) => obj === clickedObject
        )?.[0];
        if (name === "point_1") goToPoint2();
      }
    });

    // Checkpoints and final positions for movement
    const checkpoints = [
      new THREE.Vector3(0.02, 100.7, 2.62),
      //   new THREE.Vector3(0, 4.7, 4),
      //   new THREE.Vector3(8, 4.7, 3),
      //   new THREE.Vector3(8, 4.7, -11),
    ];
    const endPos = new THREE.Vector3(...lightDefs.point_2.position).add(
      new THREE.Vector3(0, 1, 0)
    );

    function goToPoint2() {
      const startPos = camera.position.clone();
      const localCurve = new THREE.CatmullRomCurve3([
        startPos,
        ...checkpoints,
        endPos,
      ]);

      const points = localCurve.getPoints(50);
      const splineCurve = new THREE.CatmullRomCurve3(points);

      const param = { t: 0 };
      gsap.to(param, {
        t: 1,
        duration: 5,
        ease: "power3.inOut",
        onUpdate: () => {
          const p = splineCurve.getPoint(param.t);
          camera.position.copy(p);

          const tangent = splineCurve.getTangent(param.t).normalize();
          controls.target.copy(p.clone().add(tangent));
          controls.update();
        },
        onComplete: () => {
          pointLights.point_2.visible = true;
        },
      });
    }

    // Initial movement to point_1 after 2 seconds
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
      onUpdate: () => {
        controls.target.copy(point1Pos);
      },
    });
    gsap.to(controls.target, {
      x: point1Pos.x,
      y: point1Pos.y,
      z: point1Pos.z,
      duration: 2,
      delay: 2,
      ease: "power3.inOut",
    });

    // Load the glTF model and start the animation loop
    new GLTFLoader().load(
      "/models/Musee/scene_nolight.gltf",
      (gltf) => scene.add(gltf.scene),
      undefined,
      console.error
    );

    function animate() {
      requestAnimationFrame(animate);
      animatedDiamonds.forEach((pivot) => {
        pivot.rotation.y += pivot.rotationSpeed;
      });
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => gui.destroy();
  }, []);

  return <canvas ref={canvasRef} className="three_canvas" />;
}
