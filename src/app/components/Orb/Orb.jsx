import * as THREE from "three";
import gsap from "gsap";

// Définissez la classe FakeGlowMaterial ici ou importez-la depuis un autre fichier
class FakeGlowMaterial extends THREE.ShaderMaterial {
  constructor(parameters = {}) {
    super();

    this.vertexShader = `
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewMatrix * modelPosition;
        vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
        vPosition = modelPosition.xyz;
        vNormal = modelNormal.xyz;
      }
    `;

    this.fragmentShader = `
      uniform vec3 glowColor;
      uniform float falloff;
      uniform float glowSharpness;
      uniform float glowInternalRadius;
      uniform float opacity;

      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vec3 normal = normalize(vNormal);
        if(!gl_FrontFacing)
            normal *= -1.0;
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = dot(viewDirection, normal);
        fresnel = pow(fresnel, glowInternalRadius + 0.1);
        float falloffFactor = smoothstep(0., falloff, fresnel);
        float fakeGlow = fresnel;
        fakeGlow += fresnel * glowSharpness;
        fakeGlow *= falloffFactor;
        gl_FragColor = vec4(clamp(glowColor * fresnel, 0., 1.0), clamp(fakeGlow, 0., opacity));
      }
    `;

    this.uniforms = {
      opacity: new THREE.Uniform(
        parameters.opacity !== undefined ? parameters.opacity : 0.0
      ),
      glowInternalRadius: new THREE.Uniform(
        parameters.glowInternalRadius !== undefined
          ? parameters.glowInternalRadius
          : 6.0
      ),
      glowSharpness: new THREE.Uniform(
        parameters.glowSharpness !== undefined ? parameters.glowSharpness : 0.5
      ),
      falloff: new THREE.Uniform(
        parameters.falloff !== undefined ? parameters.falloff : 0.1
      ),
      glowColor: new THREE.Uniform(
        parameters.glowColor !== undefined
          ? new THREE.Color(parameters.glowColor)
          : new THREE.Color("#EFFBF6")
      ),
    };

    this.setValues(parameters);
    this.depthTest =
      parameters.depthTest !== undefined ? parameters.depthTest : false;
    this.blending =
      parameters.blendMode !== undefined
        ? parameters.blendMode
        : THREE.AdditiveBlending;
    this.transparent = true;
    this.side =
      parameters.side !== undefined ? parameters.side : THREE.DoubleSide;
  }
}

const Orb = ({ position, glowParams, scene }) => {
  const orbGeom = new THREE.SphereGeometry(0.3, 32, 32);
  const glowMaterial = new FakeGlowMaterial({
    falloff: glowParams.falloff,
    glowInternalRadius: glowParams.glowInternalRadius,
    glowSharpness: glowParams.glowSharpness,
    opacity: 0.0,
    glowColor: glowParams.glowColor,
  });

  const orb = new THREE.Mesh(orbGeom, glowMaterial);
  orb.position.copy(position);
  scene.add(orb);

  const light = new THREE.PointLight(glowParams.glowColor, 0, 5 * 0.8, 2 * 2);
  light.position.set(0, 0, 0);
  orb.add(light);

  const blueLight = new THREE.PointLight(0x07b2c5, 0, 5 * 1.1, 2 / 2);
  blueLight.position.set(0, 0, 0);
  orb.add(blueLight);

  return orb;
};

export default Orb;
