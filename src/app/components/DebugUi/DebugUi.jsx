import React, { useEffect } from "react";
import GUI from "lil-gui";

const GUIControls = ({
  glowParams,
  pastillesRef,
  lightsRef,
  blueLightsRef,
}) => {
  useEffect(() => {
    const gui = new GUI();
    const glowFolder = gui.addFolder("Glow Parameters");
    glowFolder.add(glowParams, "falloff", 0, 1, 0.01).onChange((v) => {
      pastillesRef.current.forEach((orb) => {
        orb.material.uniforms.falloff.value = v;
      });
    });
    glowFolder
      .add(glowParams, "glowInternalRadius", 4, 5, 0.1)
      .onChange((v) => {
        pastillesRef.current.forEach((orb) => {
          orb.material.uniforms.glowInternalRadius.value = v;
        });
      });
    glowFolder.add(glowParams, "glowSharpness", 0, 1, 0.01).onChange((v) => {
      pastillesRef.current.forEach((orb) => {
        orb.material.uniforms.glowSharpness.value = v;
      });
    });
    glowFolder.add(glowParams, "opacity", 0, 1, 0.01).onChange((v) => {
      pastillesRef.current.forEach((orb) => {
        orb.material.uniforms.opacity.value = v;
      });
    });
    glowFolder.addColor(glowParams, "glowColor").onChange((v) => {
      pastillesRef.current.forEach((orb) => {
        orb.material.uniforms.glowColor.value.set(v);
      });
    });

    const lightFolder = gui.addFolder("Light Parameters");
    lightsRef.current.forEach((light, i) => {
      lightFolder
        .add(light, "intensity", 0, 10, 0.1)
        .name(`Light ${i} Intensity`);
    });
    blueLightsRef.current.forEach((blueLight, i) => {
      lightFolder
        .add(blueLight, "intensity", 0, 10, 0.1)
        .name(`Blue Light ${i} Intensity`);
    });

    return () => {
      gui.destroy();
    };
  }, [glowParams, pastillesRef, lightsRef, blueLightsRef]);

  return null;
};

export default GUIControls;
