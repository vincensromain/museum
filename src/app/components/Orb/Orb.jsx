import * as THREE from "three";

// Matériau de glow personnalisé sans warnings de setValues
class FakeGlowMaterial extends THREE.ShaderMaterial {
  constructor(parameters = {}) {
    // Définit les uniforms de façon explicite
    const uniforms = {
      opacity: {
        value: parameters.opacity !== undefined ? parameters.opacity : 0.0,
      },
      glowInternalRadius: {
        value:
          parameters.glowInternalRadius !== undefined
            ? parameters.glowInternalRadius
            : 6.0,
      },
      glowSharpness: {
        value:
          parameters.glowSharpness !== undefined
            ? parameters.glowSharpness
            : 0.5,
      },
      falloff: {
        value: parameters.falloff !== undefined ? parameters.falloff : 0.1,
      },
      glowColor: {
        value: new THREE.Color(
          parameters.glowColor !== undefined ? parameters.glowColor : "#EFFBF6"
        ),
      },
    };

    super({
      uniforms,
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewMatrix * modelPosition;
          vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
          vPosition = modelPosition.xyz;
          vNormal = modelNormal.xyz;
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float falloff;
        uniform float glowSharpness;
        uniform float glowInternalRadius;
        uniform float opacity;

        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          vec3 normal = normalize(vNormal);
          if (!gl_FrontFacing) normal *= -1.0;
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = dot(viewDirection, normal);
          fresnel = pow(fresnel, glowInternalRadius + 0.1);
          float falloffFactor = smoothstep(0.0, falloff, fresnel);
          float fakeGlow = fresnel + fresnel * glowSharpness;
          fakeGlow *= falloffFactor;
          gl_FragColor = vec4(clamp(glowColor * fresnel, 0.0, 1.0), clamp(fakeGlow, 0.0, opacity));
        }
      `,
      transparent: true,
      blending:
        parameters.blendMode !== undefined
          ? parameters.blendMode
          : THREE.AdditiveBlending,
      depthTest:
        parameters.depthTest !== undefined ? parameters.depthTest : false,
      side: parameters.side !== undefined ? parameters.side : THREE.DoubleSide,
    });
  }
}

// Composant Orb : une sphère avec glow + deux lumières internes
const Orb = ({ position, glowParams, scene }) => {
  const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);

  const material = new FakeGlowMaterial({
    falloff: glowParams.falloff,
    glowInternalRadius: glowParams.glowInternalRadius,
    glowSharpness: glowParams.glowSharpness,
    opacity: glowParams.opacity !== undefined ? glowParams.opacity : 0.0,
    glowColor: glowParams.glowColor,
  });

  const orb = new THREE.Mesh(sphereGeometry, material);
  orb.position.copy(position);
  scene.add(orb);

  // Lumière principale tonée
  const light = new THREE.PointLight(glowParams.glowColor, 0, 5 * 0.8, 4);
  orb.add(light);

  // Lumière secondaire bleue
  const blueLight = new THREE.PointLight(0x07b2c5, 0, 5 * 1.1, 1);
  orb.add(blueLight);

  return orb;
};

export default Orb;
