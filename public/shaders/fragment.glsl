precision mediump float;

uniform float  u_time;
uniform vec2   u_mouse;
uniform vec2   u_resolution;
uniform float  u_edgeSoftness;    // ← largeur de la transition

varying vec2   v_uv;

#define PI  3.14159265359
#define TAU 6.28318530718

// hash / noise / fbm comme avant…
float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
}
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f*f*(3.0 - 2.0*f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0,0.0));
    float c = hash21(i + vec2(0.0,1.0));
    float d = hash21(i + vec2(1.0,1.0));
    return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
float fbm(vec2 p) {
    float sum=0., amp=0.5, freq=1.;
    for(int i=0;i<6;i++){
        sum += noise(p*freq)*amp;
        amp  *= 0.5;
        freq *= 2.0;
    }
    return sum;
}

void main(){
    // coords centrées / aspect
    vec2 uv     = (v_uv - 0.5) * vec2(u_resolution.x/u_resolution.y, 1.);
    vec2 mUV    = (u_mouse - 0.5) * vec2(u_resolution.x/u_resolution.y, 1.);
    float d     = length(uv);
    float md    = length(uv - mUV);

    // ORB principal
    float radius = 0.3 + sin(u_time*0.5)*0.02;
    // smoothstep élargi grâce à u_edgeSoftness
    float orb    = smoothstep(
        radius + u_edgeSoftness,
        radius - u_edgeSoftness,
        d
    );

    // (reste de ton shading identique…  
    //   vagues, fbm, gradients, particules, glow, souris)

    // pour l’exemple, on colorie juste en bleu fade
    vec3 col = orb * vec3(0.2, 0.6, 1.0);
    float alpha = orb;
    gl_FragColor = vec4(col, alpha);

    #include <colorspace_fragment>
}
