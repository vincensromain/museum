"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";

import "./visite_musee.scss";

export default function Visite_musee() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // —————————————————————————————
    //   Taille & scène
    // —————————————————————————————
    const scene = new THREE.Scene();
    const sizes = { width: window.innerWidth, height: window.innerHeight };

    const onResize = () => {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener("resize", onResize);

    // —————————————————————————————
    //   Caméra
    // —————————————————————————————
    const camera = new THREE.PerspectiveCamera(
      75,
      sizes.width / sizes.height,
      0.1,
      100
    );
    camera.position.set(0, 4, 15);
    camera.rotation.x = -THREE.MathUtils.degToRad(30);
    scene.add(camera);
    const initialCamPos = camera.position.clone();
    const initialCamQuat = camera.quaternion.clone();

    // —————————————————————————————
    //   Renderer
    // —————————————————————————————
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // —————————————————————————————
    //   Chargement du modèle GLTF centré
    // —————————————————————————————
    const gltfLoader = new GLTFLoader();
    gltfLoader.load("/models/Musee/musee.glb", (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      scene.add(model);
      model.traverse((child) => {
        if (child.isLight) scene.add(child);
      });
    });

    // —————————————————————————————
    //   Pastilles + lumières
    // —————————————————————————————
    const pastilles = [];
    const lights = [];
    const positions = [
      new THREE.Vector3(1.7, -1, 10.5),
      new THREE.Vector3(0.3, -1.1, 8),
      new THREE.Vector3(-3.7, 0.5, 5),
      new THREE.Vector3(4, -1, 4),
      new THREE.Vector3(-2, 0.5, 1),
    ];
    positions.forEach((pos) => {
      const color = new THREE.Color(0xffffff);
      const geom = new THREE.SphereGeometry(0.3, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0,
        roughness: 0.3,
        metalness: 0.1,
      });
      const orb = new THREE.Mesh(geom, mat);
      orb.position.copy(pos);
      scene.add(orb);
      pastilles.push(orb);

      const light = new THREE.PointLight(color, 0, 5, 2);
      light.position.copy(pos);
      scene.add(light);
      lights.push(light);
    });

    // —————————————————————————————
    //   GUI pour régler les lumières
    // —————————————————————————————
    const gui = new GUI();
    const params = {
      intensity: 2,
      emissiveIntensity: 1.5,
      distance: 5,
      decay: 2,
      color: "#ffffff",
    };
    const folder = gui.addFolder("Lights");
    folder
      .add(params, "intensity", 0, 10, 0.1)
      .onChange((v) => lights.forEach((l) => (l.intensity = v)));
    folder
      .add(params, "emissiveIntensity", 0, 5, 0.1)
      .onChange((v) =>
        pastilles.forEach((o) => (o.material.emissiveIntensity = v))
      );
    folder
      .add(params, "distance", 0, 50, 1)
      .onChange((v) => lights.forEach((l) => (l.distance = v)));
    folder
      .add(params, "decay", 0, 5, 0.1)
      .onChange((v) => lights.forEach((l) => (l.decay = v)));
    folder.addColor(params, "color").onChange((hex) => {
      lights.forEach((l) => l.color.set(hex));
      pastilles.forEach((o) => {
        o.material.color.set(hex);
        o.material.emissive.set(hex);
      });
    });
    folder.open();

    // —————————————————————————————
    //   Activation des orbes
    // —————————————————————————————
    let currentIndex = 0;
    let isMoving = false;
    const activateOrb = (i) => {
      const orb = pastilles[i];
      const light = lights[i];
      orb.material.emissiveIntensity = params.emissiveIntensity;
      light.intensity = 0;
      gsap.to(orb.material, {
        emissiveIntensity: params.emissiveIntensity + 0.5,
        duration: 2,
        ease: "sine.inOut",
      });
      gsap.to(light, {
        intensity: params.intensity,
        duration: 2,
        ease: "sine.inOut",
      });
    };
    activateOrb(0);

    // —————————————————————————————
    //   Raycaster & navigation
    // —————————————————————————————
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    canvas.addEventListener("click", (e) => {
      if (isMoving) return;
      mouse.x = (e.clientX / sizes.width) * 2 - 1;
      mouse.y = -(e.clientY / sizes.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects([pastilles[currentIndex]]);
      if (!hits.length) return;
      isMoving = true;
      const sel = hits[0].object;
      const dir = new THREE.Vector3()
        .subVectors(camera.position, sel.position)
        .normalize();
      const target = sel.position.clone().add(dir.multiplyScalar(1));
      const startQuat = camera.quaternion.clone();
      camera.lookAt(sel.position);
      const endQuat = camera.quaternion.clone();
      camera.quaternion.copy(startQuat);

      gsap.to(camera.position, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 1.5,
        ease: "power2.inOut",
      });
      gsap.to(camera.quaternion, {
        x: endQuat.x,
        y: endQuat.y,
        z: endQuat.z,
        w: endQuat.w,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => (returnBtn.style.display = "block"),
      });
    });

    // Bouton Retour
    const returnBtn = document.createElement("button");
    returnBtn.textContent = "Retour";
    Object.assign(returnBtn.style, {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      padding: "1em 2em",
      fontSize: "1.2em",
      display: "none",
      zIndex: 10,
    });
    document.body.appendChild(returnBtn);
    returnBtn.addEventListener("click", () => {
      returnBtn.style.display = "none";
      gsap.to(camera.position, {
        x: initialCamPos.x,
        y: initialCamPos.y,
        z: initialCamPos.z,
        duration: 1.5,
        ease: "power2.inOut",
      });
      gsap.to(camera.quaternion, {
        x: initialCamQuat.x,
        y: initialCamQuat.y,
        z: initialCamQuat.z,
        w: initialCamQuat.w,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          currentIndex++;
          if (currentIndex < pastilles.length) activateOrb(currentIndex);
          isMoving = false;
        },
      });
    });

    // —————————————————————————————
    //   Boucle d’animation
    // —————————————————————————————
    const tick = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    };
    tick();

    // Cleanup
    return () => {
      renderer.dispose();
      gui.destroy();
      window.removeEventListener("resize", onResize);
      document.body.removeChild(returnBtn);
    };
  }, []);

  return (
    <div className="visite_musee">
      <canvas ref={canvasRef} className="webgl" />
    </div>
  );
}
