/* ==========================================================================
   KNIGHT SDF — guerrier du désert, sculpté par champs de distance (raymarching)
   turban + bijou, regard dans la maille, mantelet, lamelles, spalières,
   mains sur le pommeau, épée plantée, ceinture, jupe à lamelles,
   robe, cape et pans du turban animés par le vent.
   ========================================================================== */
const KNIGHT_SDF = /* glsl */`
uniform vec2 uRes; uniform float uTime; uniform float uRotY; uniform float uRotX; uniform float uScale;
uniform float uDist; uniform float uYc; uniform float uTan; uniform float uWind; uniform float uTail;
varying vec2 vUv;
#define M_CLOTH 1.0
#define M_METAL 2.0
#define M_MAIL 3.0
#define M_DARK 4.0
#define M_EYE 5.0
#define M_GLOVE 6.0
#define M_LEATHER 7.0
#define M_ROBE 8.0
#define M_GOLD 9.0
#define M_CAPE 10.0

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, s, -s, c); }
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float smax(float a, float b, float k){ return -smin(-a, -b, k); }
float sdEllipsoid(vec3 p, vec3 r){ float k0 = length(p / r); float k1 = length(p / (r * r)); return k0 * (k0 - 1.0) / k1; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r){ vec3 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h) - r; }
float sdRoundBox(vec3 p, vec3 b, float r){ vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float sdTorus(vec3 p, vec2 t){ vec2 q = vec2(length(p.xz) - t.x, p.y); return length(q) - t.y; }
float sdCylZ(vec3 p, float r, float h){ vec2 d = abs(vec2(length(p.xy), p.z)) - vec2(r, h); return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)); }
float sdRoundCone(vec3 p, vec3 a, vec3 b, float r1, float r2){
  vec3 ba = b - a; float l2 = dot(ba, ba); float rr = r1 - r2; float a2 = l2 - rr * rr; float il2 = 1.0 / l2;
  vec3 pa = p - a; float y = dot(pa, ba); float z = y - l2;
  vec3 xv = pa * l2 - ba * y; float x2 = dot(xv, xv);
  float y2 = y * y * l2; float z2 = z * z * l2;
  float k = sign(rr) * rr * rr * x2;
  if (sign(z) * a2 * z2 > k) return sqrt(x2 + z2) * il2 - r2;
  if (sign(y) * a2 * y2 < k) return sqrt(x2 + y2) * il2 - r1;
  return (sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}
vec2 opU(vec2 a, vec2 b){ return a.x < b.x ? a : b; }

// motif de lamelles (cellules décalées), renvoie la distance au bord de la plaque (0 = joint)
float lamella(vec2 q, vec2 size){
  vec2 u = q / size;
  u.x += 0.5 * mod(floor(u.y), 2.0);
  vec2 c = abs(fract(u) - 0.5);
  return 0.5 - max(c.x * 1.0, c.y * 1.0);
}

vec2 map(vec3 p){
  float t = uTime;
  float W = uWind;
  vec3 q = vec3(abs(p.x), p.y, p.z);
  // ---------- tête, turban ----------
  vec3 ph = p - vec3(0.0, 0.5, 0.0);
  float head = sdEllipsoid(ph, vec3(0.1, 0.125, 0.11));
  vec3 pt = p - vec3(0.0, 0.6, -0.012);
  float ang = atan(pt.x, pt.z);
  float turb = sdEllipsoid(pt, vec3(0.13, 0.095, 0.136));
  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    vec3 pw = pt - vec3(0.0, -0.045 + 0.033 * fk, 0.0);
    pw.yz = rot((mod(fk, 2.0) * 2.0 - 1.0) * 0.22) * pw.yz;
    pw.xy = rot((mod(fk + 1.0, 2.0) * 2.0 - 1.0) * 0.12) * pw.xy;
    turb = smin(turb, sdTorus(pw, vec2(0.122 - 0.014 * fk, 0.028 - 0.002 * fk)), 0.012);
  }
  turb = smin(turb, sdEllipsoid(p - vec3(0.0, 0.675, -0.02), vec3(0.085, 0.06, 0.09)), 0.04);
  turb += 0.0028 * sin(pt.y * 140.0 + ang * 3.0);
  turb = smax(turb, -(p.y - 0.548), 0.01);
  vec2 res = vec2(turb, M_CLOTH);
  // bijou frontal (losange) + monture
  vec3 pj = p - vec3(0.0, 0.6, 0.142);
  float jewel = dot(abs(pj), normalize(vec3(1.0, 0.65, 1.8))) - 0.0165;
  res = opU(res, vec2(jewel, M_GOLD));
  // visage (bande des yeux, sombre) + yeux
  res = opU(res, vec2(head + 0.004, M_DARK));
  vec3 pe = vec3(abs(p.x), p.y, p.z) - vec3(0.038, 0.51, 0.097);
  res = opU(res, vec2(length(pe * vec3(1.0, 1.9, 1.0)) - 0.0125, M_EYE));
  // voile / camail en maille
  float veil = sdRoundCone(p, vec3(0.0, 0.455, 0.012), vec3(0.0, 0.35, -0.004), 0.112, 0.152);
  veil = smax(veil, p.y - 0.472, 0.01);
  float coif = sdEllipsoid(ph - vec3(0.0, -0.02, -0.012), vec3(0.12, 0.142, 0.127));
  float eyeBand = max(abs(p.y - 0.51) - 0.038, -(p.z - 0.03));
  coif = smax(coif, -eyeBand, 0.006);
  coif = smax(coif, p.y - 0.56, 0.01);
  float mail = smin(veil, coif, 0.03);
  mail += 0.0014 * sin(p.x * 240.0 + p.y * 120.0) * sin(p.y * 240.0 - p.x * 80.0);
  res = opU(res, vec2(mail, M_MAIL));
  // ---------- mantelet roulé autour du cou ----------
  vec3 pm = p - vec3(0.0, 0.315, -0.012);
  float man = sdTorus(pm * vec3(1.0, 1.7, 1.18), vec2(0.168, 0.052)) / 1.7;
  man += 0.007 * sin(atan(pm.x, pm.z) * 10.0 + pm.y * 30.0);
  res = opU(res, vec2(man, M_CLOTH));
  // ---------- buste en lamelles ----------
  float torso = sdEllipsoid(p - vec3(0.0, 0.07, 0.0), vec3(0.225, 0.25, 0.15));
  torso = smin(torso, sdEllipsoid(p - vec3(0.0, 0.16, 0.025), vec3(0.205, 0.13, 0.145)), 0.06);
  float lt = lamella(vec2(atan(p.x, p.z) * 0.2, p.y), vec2(0.046, 0.04));
  torso -= 0.0055 * smoothstep(0.0, 0.08, lt);
  res = opU(res, vec2(torso, M_METAL));
  // ---------- spalières (3 lames par épaule) ----------
  float pa = 1e9;
  for (int k = 0; k < 3; k++) {
    float fk = float(k);
    vec3 pp = q - vec3(0.25 + 0.028 * fk, 0.255 - 0.056 * fk, 0.0);
    pp.xy = rot(0.55 + 0.16 * fk) * pp.xy;
    pa = min(pa, sdEllipsoid(pp, vec3(0.122, 0.036, 0.128)));
  }
  pa += 0.0025 * sin(q.x * 160.0) * sin(q.z * 160.0);
  res = opU(res, vec2(pa, M_METAL));
  // ---------- bras : manche en maille + canon ----------
  float up = sdCapsule(q, vec3(0.29, 0.2, 0.0), vec3(0.315, -0.03, 0.07), 0.063);
  up += 0.0016 * sin(q.y * 230.0) * sin(atan(q.x - 0.3, q.z) * 30.0);
  res = opU(res, vec2(up, M_MAIL));
  float fo = sdRoundCone(q, vec3(0.305, -0.03, 0.09), vec3(0.08, 0.085, 0.205), 0.06, 0.049);
  vec3 axis = normalize(vec3(0.08, 0.085, 0.205) - vec3(0.305, -0.03, 0.09));
  float along = dot(q - vec3(0.305, -0.03, 0.09), axis);
  fo -= 0.004 * smoothstep(0.35, 0.5, abs(fract(along * 14.0) - 0.5));
  res = opU(res, vec2(fo, M_METAL));
  // ---------- mains gantées sur le pommeau ----------
  vec3 h1 = p - vec3(0.0, 0.138, 0.224);
  vec3 h2 = p - vec3(0.0, 0.052, 0.226);
  float fist = min(sdRoundBox(h1, vec3(0.062, 0.04, 0.046), 0.03), sdRoundBox(h2, vec3(0.064, 0.042, 0.048), 0.03));
  fist += 0.0045 * smoothstep(0.25, 0.5, abs(fract(p.x * 52.0) - 0.5)) * smoothstep(0.24, 0.27, p.z);
  res = opU(res, vec2(fist, M_GLOVE));
  // ---------- épée plantée ----------
  vec3 ps = p - vec3(0.0, 0.0, 0.226);
  vec3 pp0 = ps - vec3(0.0, 0.226, 0.0);
  float pom = sdCylZ(pp0, 0.043, 0.014) - 0.006;
  float pang = atan(pp0.y, pp0.x);
  pom -= 0.004 * smoothstep(0.0, 0.6, cos(pang * 8.0)) * step(length(pp0.xy), 0.034) * step(0.0, pp0.z);
  float grip = sdCapsule(ps, vec3(0.0, 0.205, 0.0), vec3(0.0, -0.02, 0.0), 0.019);
  vec3 pg = ps - vec3(0.0, -0.036, 0.0);
  float guard = sdRoundBox(pg, vec3(0.17, 0.011, 0.014), 0.006);
  vec3 pge = vec3(abs(pg.x), pg.y, pg.z) - vec3(0.172, -0.014, 0.0);
  guard = smin(guard, length(pge) - 0.021, 0.02);
  guard = smin(guard, sdRoundBox(pg - vec3(0.0, -0.032, 0.0), vec3(0.024, 0.032, 0.012), 0.008), 0.012);
  guard += 0.0025 * sin(pg.x * 130.0) * step(abs(pg.y), 0.02);
  vec3 pb = ps - vec3(0.0, -0.06, 0.0);
  float bw = mix(0.037, 0.022, clamp(-pb.y / 1.6, 0.0, 1.0));
  float blade = sdRoundBox(pb - vec3(0.0, -0.8, 0.0), vec3(bw, 0.8, 0.0065), 0.002);
  blade += 0.0022 * smoothstep(0.009, 0.0, abs(pb.x)) * step(pb.y, -0.02);
  float sword = min(min(pom, grip), min(guard, blade));
  res = opU(res, vec2(sword, M_METAL));
  // ---------- ceinture + boucle ----------
  vec3 pbt = p - vec3(0.0, -0.19, 0.0);
  float belt = sdTorus(pbt * vec3(1.0, 1.0, 1.42), vec2(0.198, 0.024)) / 1.42;
  belt = min(belt, sdRoundBox(pbt - vec3(0.0, 0.0, 0.15), vec3(0.03, 0.026, 0.01), 0.006));
  res = opU(res, vec2(belt, M_LEATHER));
  // ---------- jupe à lamelles ----------
  float sk = sdRoundCone(p * vec3(1.0, 1.0, 1.3), vec3(0.0, -0.2, 0.0), vec3(0.0, -0.86, 0.0), 0.19, 0.275) / 1.3;
  float ls = lamella(vec2(atan(p.x, p.z) * 0.24, p.y), vec2(0.05, 0.06));
  sk -= 0.006 * smoothstep(0.0, 0.08, ls);
  res = opU(res, vec2(sk, M_METAL));
  // ---------- robe ----------
  float rb = sdRoundCone(p * vec3(1.0, 1.0, 1.22), vec3(0.0, -0.82, 0.0), vec3(0.0, -1.75, 0.02), 0.268, 0.37) / 1.22;
  rb += 0.013 * sin(atan(p.x, p.z) * 12.0 + p.y * 2.5 + sin(t * 0.9 + p.y) * 0.6 * W);
  res = opU(res, vec2(rb, M_ROBE));
  // ---------- cape (animée) ----------
  float sway = clamp(0.32 - p.y, 0.0, 2.2);
  vec3 pk = p;
  pk.x -= sin(t * 1.05 + p.y * 2.2) * 0.045 * sway * W;
  pk.z += sin(t * 1.6 + p.y * 3.1 + p.x * 4.0) * 0.022 * sway * W;
  float co = sdRoundCone(pk * vec3(1.0, 1.0, 1.22), vec3(0.0, 0.285, -0.03), vec3(0.0, -1.7, -0.16), 0.272, 0.62) / 1.22;
  float ca = atan(pk.x, pk.z);
  co += 0.022 * sin(ca * 8.0 + p.y * 1.4 + t * 0.8 * W) * clamp(sway, 0.0, 1.6);
  float cape = abs(co) - 0.011;
  float keepZ = mix(-0.03, 0.11, smoothstep(0.08, 0.3, p.y));
  cape = smax(cape, pk.z - keepZ, 0.03);
  cape = smax(cape, p.y - 0.335, 0.03);
  res = opU(res, vec2(cape, M_CAPE));
  // ---------- pans du turban dans le vent ----------
  float tail = 1e9;
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    vec3 a = vec3(0.07, 0.6 - 0.055 * fi, -0.125);
    vec3 prev = a;
    for (int j = 1; j <= 8; j++) {
      float s = float(j) / 8.0;
      vec3 cur = a + uTail * vec3(s * (0.78 - fi * 0.12),
                          -s * (0.32 + fi * 0.12) + sin(s * 5.5 - t * 3.2 * W + fi * 1.7) * 0.065 * s,
                          -s * 0.34 + cos(s * 4.2 - t * 2.5 * W + fi) * 0.055 * s);
      tail = smin(tail, sdCapsule(p, prev, cur, mix(0.034, 0.007, s)), 0.025);
      prev = cur;
    }
  }
  res = opU(res, vec2(tail, M_CLOTH));
  return res;
}

vec3 calcNormal(vec3 p){
  const vec2 e = vec2(1.0, -1.0) * 0.0012;
  return normalize(e.xyy * map(p + e.xyy).x + e.yyx * map(p + e.yyx).x + e.yxy * map(p + e.yxy).x + e.xxx * map(p + e.xxx).x);
}
float calcAO(vec3 p, vec3 n){
  float o = 0.0, sc = 1.0;
  for (int i = 0; i < 3; i++) { float h = 0.012 + 0.05 * float(i); o += (h - map(p + h * n).x) * sc; sc *= 0.7; }
  return clamp(1.0 - 2.6 * o, 0.0, 1.0);
}
vec2 boxHit(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax){
  vec3 inv = 1.0 / rd; vec3 t0 = (bmin - ro) * inv, t1 = (bmax - ro) * inv;
  vec3 tn = min(t0, t1), tf = max(t0, t1);
  return vec2(max(max(tn.x, tn.y), tn.z), min(min(tf.x, tf.y), tf.z));
}

void main(){
  vec2 uv = vUv * 2.0 - 1.0;
  float aspect = uRes.x / uRes.y;
  vec3 ro = vec3(0.0, uYc, uDist);
  vec3 rd = normalize(vec3(uv.x * aspect * uTan, uv.y * uTan, -1.0));
  // objet tourné : on tourne le rayon à l'inverse
  ro.yz = rot(-uRotX) * ro.yz; rd.yz = rot(-uRotX) * rd.yz;
  ro.xz = rot(uRotY) * ro.xz; rd.xz = rot(uRotY) * rd.xz;
  ro /= uScale;
  vec2 bh = boxHit(ro, rd, vec3(-0.62, -1.95, -0.95), vec3(1.05, 0.82, 0.5));
  if (bh.x > bh.y || bh.y < 0.0) { gl_FragColor = vec4(0.0); return; }
  float t = max(bh.x, 0.0);
  float m = -1.0; bool hit = false;
  for (int i = 0; i < 96; i++) {
    vec3 p = ro + rd * t;
    vec2 h = map(p);
    if (h.x < 0.0009 * t) { hit = true; m = h.y; break; }
    t += h.x * 0.82;
    if (t > bh.y) break;
  }
  if (!hit) { gl_FragColor = vec4(0.0); return; }
  vec3 p = ro + rd * t;
  vec3 n = calcNormal(p);
  // éclairage de studio lié à la caméra : même modelé quel que soit l'angle du chevalier
  vec3 L = normalize(vec3(-0.55, 0.7, 0.62));
  vec3 R = normalize(vec3(0.75, 0.25, -0.7));
  L.yz = rot(-uRotX) * L.yz; L.xz = rot(uRotY) * L.xz;
  R.yz = rot(-uRotX) * R.yz; R.xz = rot(uRotY) * R.xz;
  float dif = max(dot(n, L), 0.0);
  float wrap = clamp((dot(n, L) + 0.35) / 1.35, 0.0, 1.0);
  float fre = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
  float rim = fre * clamp(dot(n, R) + 0.4, 0.0, 1.0);
  float ao = calcAO(p, n);
  vec3 rf = reflect(rd, n);
  float alb = 0.6, spec = 0.0, lum;
  // valeurs bien séparées par matériau : tissu clair, métal moyen + reflets, cuir / cape sombres
  float key = clamp((dot(n, L) + 0.15) / 1.15, 0.0, 1.0);
  key = key * key * (3.0 - 2.0 * key);
  if (m == M_CLOTH) { alb = 1.0; lum = alb * (0.17 + 0.83 * key); }
  else if (m == M_ROBE) { alb = 0.6; lum = alb * (0.14 + 0.86 * key); }
  else if (m == M_CAPE) { alb = 0.44; lum = alb * (0.12 + 0.88 * key); }
  else if (m == M_METAL || m == M_GOLD) {
    alb = m == M_GOLD ? 0.95 : 0.6;
    spec = pow(max(dot(rf, L), 0.0), 24.0) * 1.3 + pow(max(dot(rf, R), 0.0), 12.0) * 0.4;
    lum = alb * (0.14 + 0.86 * dif) + spec;
    if (p.y < 0.24 && p.y > -0.9 && abs(p.x) < 0.3 && p.z > -0.2 && p.z < 0.2 && m == M_METAL) {
      vec2 sz = p.y > -0.2 ? vec2(0.046, 0.04) : vec2(0.05, 0.06);
      float sc = p.y > -0.2 ? 0.2 : 0.24;
      float lv = lamella(vec2(atan(p.x, p.z) * sc, p.y), sz);
      lum *= mix(0.18, 1.0, smoothstep(0.0, 0.05, lv));
    }
  }
  else if (m == M_MAIL) {
    alb = 0.5; spec = pow(max(dot(rf, L), 0.0), 12.0) * 0.35;
    float rows = smoothstep(-0.4, 0.4, sin(p.y * 80.0 + sin(p.x * 40.0) * 0.6));
    lum = alb * (0.13 + 0.87 * dif) * (0.55 + 0.45 * rows) + spec * rows;
  }
  else if (m == M_DARK) { lum = 0.0; }
  else if (m == M_EYE) { lum = 1.0; }
  else if (m == M_GLOVE) { alb = 0.36; spec = pow(max(dot(rf, L), 0.0), 18.0) * 0.55; lum = alb * (0.12 + 0.88 * dif) + spec; }
  else { alb = 0.34; lum = alb * (0.12 + 0.88 * dif); }
  lum = lum * mix(0.38, 1.0, ao) + rim * 0.42;
  if (m != M_DARK && m != M_EYE) lum = pow(clamp(lum, 0.0, 1.0), 0.92);
  // r = luminance, g = matériau, b = profondeur (pour les contours de la passe ASCII)
  float depth = clamp((t * uScale - uDist + 1.3) / 2.6, 0.0, 1.0);
  gl_FragColor = vec4(clamp(lum, 0.0, 1.0), m / 16.0, depth, 1.0);
}`;
