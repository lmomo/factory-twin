import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { buildArm } from './robotArm.js';
import { buildInspection } from './inspection.js';
import { buildPacker } from './packer.js';
import { buildAGV } from './agv.js';
import { buildCNC } from './cnc.js';
import { buildDrone } from './drone.js';
import './hud.js';

// ================= 渲染器 / 场景 =================
const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
r.setSize(innerWidth, innerHeight); r.setPixelRatio(Math.min(devicePixelRatio, 2));
r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.22; document.getElementById('view').appendChild(r.domElement);
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070a); scene.fog = new THREE.Fog(0x05070a, 38, 70);
scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.4;
const cam = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 200);
const HOME = { pos: new THREE.Vector3(-13.4, 26.5, 18.4), tgt: new THREE.Vector3(-0.2, 0, 0.2) };
cam.position.copy(HOME.pos);
const ctl = new OrbitControls(cam, r.domElement); ctl.target.copy(HOME.tgt); ctl.enableDamping = true; ctl.maxPolarAngle = 1.45;

scene.add(new THREE.HemisphereLight(0xb8c8e0, 0x0a0c10, 0.45));
const sun = new THREE.DirectionalLight(0xfff1dc, 4.4); sun.position.set(-8, 18, 10); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 1.5; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 12, bottom: -12, near: 1, far: 50 }); scene.add(sun); sun.target.position.set(0, 0, -1); scene.add(sun.target);
[[0x7a64b0,1.3,-2.4],[0x3f9692,6.1,1],[0x4e9a6c,-4.6,-4.5],[0x3f62a0,8.6,6]].forEach(([c,x,z])=>{const l=new THREE.PointLight(c,4,8,1.8);l.position.set(x,3,z);scene.add(l);});
const rim = new THREE.DirectionalLight(0x5aa8ff, 1.2); rim.position.set(10, 8, -12); scene.add(rim);

// ================= 工具 =================
const matC = {}; const mat = (c, m = 0.5, ro = 0.5, e) => { const k = [c, m, ro, e].join(); return matC[k] ??= new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: ro, ...(e ? { emissive: e, emissiveIntensity: 2 } : {}) }); };
const glow = (c, i = 2.5) => new THREE.MeshStandardMaterial({ color: 0, emissive: c, emissiveIntensity: i });
const add = (geo, m, x, y, z, parent = scene, shadow = true) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; parent.add(o); return o; };
const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
// 接触阴影：径向渐变贴片，压在设备底部
const blobTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 8, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,0.85)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });
const contact = (x, z, w, d, parent = scene) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), blobMat); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.012, z); m.renderOrder = 1; parent.add(m); return m; };

// ================= 地面 / 区域 / 标注 =================
const floorTex = canvasTex(512, 512, (g, w) => { g.fillStyle = '#101317'; g.fillRect(0, 0, w, w); g.strokeStyle = 'rgba(120,150,190,0.16)'; g.lineWidth = 2;
  for (let i = 0; i <= w; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, w); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } });
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(7, 5);
const floor = add(new THREE.PlaneGeometry(28, 20), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.22, metalness: 0.4, transparent: true, opacity: 0.58 }), 0, 0.003, 0, scene, false); floor.rotation.x = -Math.PI / 2;
// 半分辨率实时反射地面
const refl = new Reflector(new THREE.PlaneGeometry(28, 20), { textureWidth: innerWidth * 0.5, textureHeight: innerHeight * 0.5, color: 0x7a828c }); refl.rotation.x = -Math.PI / 2; scene.add(refl);
const ZONES = [ // [x0,z0,x1,z1,color,label]
  [-8.5, -6.8, -0.8, -0.6, 0x4e9a6c, ['加工站', 'Machining']],
  [-0.8, -4.2, 3.6, 0.6, 0x7a64b0, ['检测站', 'Inspection']],
  [3.6, -1.6, 8.6, 4.4, 0x3f9692, ['包装站', 'Packaging']],
  [-8.5, -0.6, 3.6, 6.4, 0x3f62a0, ['上料站', 'Loading']],
];
const labelPos = [[-7.0, -1.3], [-0.1, -1.3], [6.4, 3.75], [-2.6, 5.7]];
ZONES.forEach(([x0, z0, x1, z1, c, [cn, en]], i) => {
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const col = new THREE.Color(c);
  const tex = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 20, 128, 128, 180); gr.addColorStop(0, `rgba(${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0},0.34)`); gr.addColorStop(1, `rgba(${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0},0.16)`); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const z = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })); z.rotation.x = -Math.PI / 2; z.position.set(cx, 0.004 + i * 0.001, cz); scene.add(z);
  // 发光边线
  const em = glow(new THREE.Color(c).lerp(new THREE.Color(0x39b6ff), 0.4), 1.1); [[w, 0.06, cx, z0 + 0.03], [w, 0.06, cx, z1 - 0.03], [0.06, d, x0 + 0.03, cz], [0.06, d, x1 - 0.03, cz]].forEach(([a, b, x, zz]) => { const e = new THREE.Mesh(new THREE.PlaneGeometry(a, b), em); e.rotation.x = -Math.PI / 2; e.position.set(x, 0.02, zz); scene.add(e); });
  // 地面中英文标注
  const lt = canvasTex(512, 128, (g) => { g.fillStyle = 'rgba(6,14,28,0.55)'; g.fillRect(0, 14, 512, 100); g.fillStyle = '#' + col.getHexString(); g.fillRect(0, 14, 10, 100);
    g.font = 'bold 60px "Noto Sans CJK SC",sans-serif'; g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.fillText(cn, 30, 64); g.font = '600 40px "Noto Sans CJK SC",sans-serif'; g.fillStyle = '#' + col.getHexString(); g.fillText(en, 230, 68); });
  const l = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), new THREE.MeshBasicMaterial({ map: lt, transparent: true, depthWrite: false, depthTest: false })); l.renderOrder = 10; l.rotation.order = 'YXZ'; l.rotation.set(-Math.PI / 2, -0.66, 0); l.position.set(labelPos[i][0], 0.03, labelPos[i][1]); scene.add(l);
});
// 黄色通道标线
const lineM = new THREE.MeshBasicMaterial({ color: 0xffc629 });
[[0, 7.3, 26, 0.08], [0, -7.4, 26, 0.08]].forEach(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lineM); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.015, z); scene.add(m); });

// ================= 墙体 / 钢柱 / 护栏 / 管道 =================
const wallTex = canvasTex(256, 256, (g) => { g.fillStyle = '#1b1e23'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#262a31'; for (let i = 0; i < 256; i += 32) g.fillRect(i, 0, 3, 256); g.fillStyle = 'rgba(60,140,255,0.5)'; g.fillRect(0, 200, 256, 3); });
wallTex.wrapS = THREE.RepeatWrapping; wallTex.repeat.set(10, 1);
const wallM = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.7, metalness: 0.3 });
add(new THREE.BoxGeometry(28, 4.5, 0.25), wallM, 0, 2.25, -10, scene, false);
const lw = add(new THREE.BoxGeometry(20, 4.5, 0.25), wallM, -14, 2.25, 0, scene, false); lw.rotation.y = Math.PI / 2;
const colM = mat(0x46505e, 0.75, 0.4);
for (const x of [-13.6, -6, 2, 10]) add(new THREE.BoxGeometry(0.4, 6, 0.4), colM, x, 3, -9.6);
for (const z of [-4, 3]) add(new THREE.BoxGeometry(0.4, 6, 0.4), colM, -13.6, 3, z);
add(new THREE.BoxGeometry(28, 0.35, 0.3), colM, 0, 5.8, -9.6);
// 护栏（前沿 + 左侧）
const railM = mat(0xffc629, 0.4, 0.4); const railG = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);
const railRun = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0), n = Math.round(len / 1.2), a = Math.atan2(z1 - z0, x1 - x0);
  for (let i = 0; i <= n; i++) add(railG, railM, x0 + (x1 - x0) * i / n, 0.5, z0 + (z1 - z0) * i / n);
  for (const y of [0.55, 1]) { const b = add(new THREE.BoxGeometry(len, 0.05, 0.05), railM, (x0 + x1) / 2, y, (z0 + z1) / 2); b.rotation.y = -a; } };
railRun(-11, 7.9, 5, 7.9); railRun(-11, -8.5, -11, 7.9); railRun(10.5, -2.5, 10.5, 4);
// 彩色顶管（左后）
const pipe = (c, y, z, x0, x1, drop) => { const m = mat(c, 0.55, 0.35); const pts = [new THREE.Vector3(x0, y, -9.4 + z), new THREE.Vector3(x1, y, -9.4 + z), new THREE.Vector3(x1 + 0.3, y, -9.1 + z), new THREE.Vector3(x1 + 0.4, y, -6 + z * 2)];
  if (drop) pts.push(new THREE.Vector3(x1 + 0.4, y, -4.8 + z * 2), new THREE.Vector3(x1 + 0.4, 1.4, -4.5 + z * 2));
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05), 80, 0.11, 14), m, 0, 0, 0);
  for (let x = x0 + 1; x < x1; x += 2) add(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 14), mat(0x222831, 0.8, 0.4), x, y, -9.4 + z).rotation.z = Math.PI / 2; };
pipe(0x2fd16a, 4.4, 0.0, -13.8, -4.5, false); pipe(0xe5402e, 4.0, 0.45, -13.8, -5.2, false); pipe(0x2f7dff, 3.6, 0.9, -13.8, -5.9, false); pipe(0x2fd16a, 3.2, 1.35, -13.8, -6.6, false);
for (let x = -12; x <= -6; x += 3) { add(new THREE.BoxGeometry(0.08, 1.6, 0.08), colM, x, 4.9, -8.6); add(new THREE.BoxGeometry(0.08, 0.08, 1.8), colM, x, 4.1, -8.6); }
// 左侧储罐/设备填充
for (let i = 0; i < 3; i++) { const tx = -7.6 + i * 1.4, tz = -8.7; add(new THREE.CylinderGeometry(0.55, 0.55, 2.2, 32), mat(0x9aa6b4, 0.85, 0.25), tx, 1.1, tz); add(new THREE.SphereGeometry(0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x9aa6b4, 0.85, 0.25), tx, 2.2, tz); contact(tx, tz, 1.8, 1.8); add(new THREE.TorusGeometry(0.56, 0.03, 8, 32), glow([0x2fd16a, 0xe5402e, 0x2f7dff][i], 1.8), tx, 1.6, tz).rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(0.56, 0.02, 8, 32), mat(0x3a4250, 0.8, 0.4), tx, 0.6, tz).rotation.x = Math.PI / 2; }


// ================= 环形输送线 =================
const beltTex = canvasTex(64, 64, (g) => { g.fillStyle = '#16191d'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#2d333b'; for (let i = 0; i < 64; i += 8) g.fillRect(0, i, 64, 3); });
beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping;
const conveyors = [];
function loopLine(cx, cz, w, d, rad, nBox, speed, boxCol) {
  const s = new THREE.Shape(), x0 = -w / 2, z0 = -d / 2;
  s.moveTo(x0 + rad, z0); s.lineTo(-x0 - rad, z0); s.absarc(-x0 - rad, z0 + rad, rad, -Math.PI / 2, 0); s.lineTo(-x0, -z0 - rad); s.absarc(-x0 - rad, -z0 - rad, rad, 0, Math.PI / 2);
  s.lineTo(x0 + rad, -z0); s.absarc(x0 + rad, -z0 - rad, rad, Math.PI / 2, Math.PI); s.lineTo(x0, z0 + rad); s.absarc(x0 + rad, z0 + rad, rad, Math.PI, Math.PI * 1.5);
  const N = 240, P = s.getSpacedPoints(N).slice(0, N).map(p => new THREE.Vector3(cx + p.x, 0, cz + p.y));
  const len = s.getLength(); const nrm = P.map((p, i) => { const t = P[(i + 1) % N].clone().sub(P[(i - 1 + N) % N]).normalize(); return new THREE.Vector3(-t.z, 0, t.x); });
  const ribbon = (oA, yA, oB, yB, m, rep) => { const pos = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) { const p = P[i % N], n = nrm[i % N]; pos.push(p.x + n.x * oA, yA, p.z + n.z * oA, p.x + n.x * oB, yB, p.z + n.z * oB); uv.push(0, i / N * rep, 1, i / N * rep); if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const o = new THREE.Mesh(g, m); o.receiveShadow = true; o.castShadow = true; scene.add(o); return o; };
  const bm = new THREE.MeshStandardMaterial({ map: beltTex.clone(), roughness: 0.85 }); bm.map.repeat.set(1, 1); bm.map.wrapS = bm.map.wrapT = THREE.RepeatWrapping;
  ribbon(-0.36, 0.78, 0.36, 0.78, bm, len / 0.5); bm.side = THREE.DoubleSide;
  const skin = mat(0x4a5058, 0.85, 0.3); skin.side = THREE.DoubleSide;
  ribbon(0.42, 0.84, 0.42, 0.5, skin, 1); ribbon(-0.42, 0.5, -0.42, 0.84, skin, 1);
  ribbon(0.36, 0.84, 0.44, 0.84, mat(0x6c7684, 0.9, 0.35), 1); ribbon(-0.44, 0.84, -0.36, 0.84, mat(0x6c7684, 0.9, 0.35), 1);
  ribbon(0.43, 0.6, 0.43, 0.56, glow(0x39b6ff, 1.3), 1); ribbon(-0.43, 0.56, -0.43, 0.6, glow(0x39b6ff, 1.3), 1);
  // 支腿
  const nLeg = Math.floor(len / 1.1), legs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), mat(0x8a96a4, 0.85, 0.3), nLeg * 2); const m4 = new THREE.Matrix4();
  for (let i = 0; i < nLeg; i++) { const k = Math.floor(i / nLeg * N), p = P[k], n = nrm[k]; for (const s2 of [-1, 1]) { m4.makeTranslation(p.x + n.x * 0.32 * s2, 0.25, p.z + n.z * 0.32 * s2); legs.setMatrixAt(i * 2 + (s2 > 0), m4); } }
  legs.castShadow = true; scene.add(legs);
  const nR = Math.floor(len / 0.28), rol = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 10), mat(0xaab4c0, 0.95, 0.22), nR); const q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < nR; i++) { const k = Math.floor(i / nR * N), p = P[k]; q.setFromUnitVectors(up, nrm[k]); m4.compose(new THREE.Vector3(p.x, 0.815, p.z), q, new THREE.Vector3(1, 1, 1)); rol.setMatrixAt(i, m4); }
  rol.receiveShadow = true; scene.add(rol);
  // 接触阴影沿线
  for (let i = 0; i < N; i += 12) contact(P[i].x, P[i].z, 1.3, 1.3);
  const boxes = []; const bg = new RoundedBoxGeometry(0.36, 0.26, 0.36, 2, 0.03);
  for (let i = 0; i < nBox; i++) boxes.push(add(bg, mat(boxCol[i % boxCol.length], 0.1, 0.6), 0, 0.92, 0));
  conveyors.push({ P, N, len, boxes, speed, tex: bm.map });
}
loopLine(-4.6, -3.7, 6.4, 3.2, 1.1, 9, 0.5, [0xc8925a, 0x2f7dff]);
loopLine(-1.5, 3.2, 8.4, 2.6, 1.0, 11, 0.55, [0xc8925a, 0xe5a02e]);
loopLine(6.1, 0.6, 3.8, 2.8, 1.0, 6, 0.4, [0xe08a2a, 0xc8925a]);

// ================= 工位设备 =================
const stripeTex = canvasTex(128, 32, (g) => { g.fillStyle = '#111'; g.fillRect(0, 0, 128, 32); g.fillStyle = '#ffc629'; for (let i = -32; i < 160; i += 24) { g.beginPath(); g.moveTo(i, 32); g.lineTo(i + 12, 32); g.lineTo(i + 44, 0); g.lineTo(i + 32, 0); g.fill(); } }); stripeTex.wrapS = THREE.RepeatWrapping;
const seamM = mat(0x0b0e13, 0.5, 0.6), handleM = mat(0xc8d0d8, 1, 0.2), ventG = new THREE.BoxGeometry(0.02, 0.02, 1);
const vents = (g, x, y, z, n, ry = 0) => { for (let i = 0; i < n; i++) { const v = add(new THREE.BoxGeometry(0.4, 0.025, 0.02), seamM, x, y + i * 0.06, z, g, false); v.rotation.y = ry; } };
const cncs = [[-6.7, -6.6], [-2.6, -6.6]].map(([x, z]) => { const c = buildCNC(); c.root.position.set(x, 0, z); scene.add(c.root); contact(x, z, 3.8, 2.6); return c; });
const insp = buildInspection(); insp.root.position.set(1.65, 0, -2.4); scene.add(insp.root); contact(1.65, -2.4, 3.2, 2.2);
const pack = buildPacker(); pack.root.position.set(6.1, 0, 0.72); scene.add(pack.root); contact(6.1, 0.72, 2.6, 1.8);
// 上料台
for (let i = 0; i < 3; i++) { const p = add(new RoundedBoxGeometry(1.0, 0.15, 1.0, 2, 0.02), mat(0x8a5a2a, 0.1, 0.8), -7.6 + i * 1.3, 0.08, 5.7); contact(-7.6 + i * 1.3, 5.7, 1.5, 1.5);
  for (let k = 0; k < 2 + i % 2; k++) add(new RoundedBoxGeometry(0.85, 0.32, 0.85, 2, 0.03), mat([0x2f7dff, 0xe5a02e, 0x2fbf62][(i + k) % 3], 0.05, 0.55), -7.6 + i * 1.3, 0.33 + k * 0.33, 5.7); }

// 前区：码垛工位（托盘 + 直线输送尾段 + 灯带）
{ const g = new THREE.Group(); g.position.set(1.2, 0, 6.0); scene.add(g);
  add(new RoundedBoxGeometry(3.2, 0.7, 0.8, 3, 0.06), mat(0x2a3140, 0.85, 0.28), 0, 0.42, 0, g); add(new THREE.BoxGeometry(3.0, 0.02, 0.62), new THREE.MeshStandardMaterial({ map: beltTex, roughness: 0.85 }), 0, 0.78, 0, g);
  add(new THREE.BoxGeometry(3.22, 0.03, 0.02), glow(0x39b6ff, 1.2), 0, 0.6, 0.41, g, false);
  for (let i = 0; i < 4; i++) add(new RoundedBoxGeometry(0.36, 0.26, 0.36, 2, 0.03), mat(i % 2 ? 0xc8925a : 0x2f7dff, 0.1, 0.6), -1.2 + i * 0.8, 0.92, 0, g);
  contact(0, 0, 4, 1.6, g);
  for (let i = 0; i < 3; i++) { const x = -3.4 + i * 1.25 + 6; add(new RoundedBoxGeometry(1.0, 0.15, 1.0, 2, 0.02), mat(0x7a5228, 0.1, 0.8), x - 4.6, 0.08, 1.15, g);
    for (let k = 0; k < 2; k++) add(new RoundedBoxGeometry(0.85, 0.3, 0.85, 2, 0.03), mat([0x2f7dff, 0xff8a1e, 0xf2c230][(i + k) % 3], 0.1, 0.45), x - 4.6, 0.3 + k * 0.31, 1.15, g); contact(x - 4.6, 1.15, 1.5, 1.5, g); } }
// ================= 墙边杂物：机柜/桶/托盘/货箱/推车/墙面管架/网格护栏 =================
{ const cabM = mat(0x3a4048, 0.75, 0.4), cabD = mat(0x23272d, 0.7, 0.45), palM = mat(0x6a4a2a, 0.1, 0.8), barM = [mat(0x2f6fd8, 0.4, 0.4), mat(0x4a5058, 0.8, 0.35), mat(0xe07a20, 0.3, 0.45)];
  const cab = (x, z, ry, h = 1.6) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); add(new RoundedBoxGeometry(0.7, h, 0.5, 2, 0.02), cabM, 0, h / 2, 0, g); add(new THREE.BoxGeometry(0.012, h - 0.1, 0.01), seamM, 0, h / 2, 0.255, g, false);
    add(new THREE.PlaneGeometry(0.18, 0.12), glow([0x39b6ff, 0x3ddc84][(x * 7 | 0) & 1], 1.6), 0.15, h * 0.72, 0.256, g, false); vents(g, -0.15, 0.25, 0.256, 4); add(new THREE.BoxGeometry(0.02, 0.2, 0.03), handleM, 0.28, h * 0.5, 0.26, g); contact(0, 0, 1, 0.8, g); };
  const barrel = (x, z, m) => { add(new THREE.CylinderGeometry(0.26, 0.26, 0.8, 18), m, x, 0.4, z); for (const y of [0.2, 0.6]) add(new THREE.TorusGeometry(0.262, 0.015, 6, 18), cabD, x, y, z).rotation.x = Math.PI / 2; contact(x, z, 0.8, 0.8); };
  const pallet = (x, z, n, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); add(new THREE.BoxGeometry(1.0, 0.12, 0.8), palM, 0, 0.06, 0, g);
    for (let k = 0; k < n; k++) add(new RoundedBoxGeometry(0.44, 0.34, 0.36, 2, 0.02), mat([0xc8925a, 0x2f7dff, 0xe08a2a, 0xf2c230][(k + (x * 3 | 0)) & 3], 0.05, 0.6), -0.24 + (k & 1) * 0.48, 0.3 + (k >> 2) * 0.35, -0.18 + ((k >> 1) & 1) * 0.36, g); contact(0, 0, 1.3, 1.1, g); };
  const cart = (x, z, ry) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g); for (const y of [0.3, 0.75]) add(new THREE.BoxGeometry(0.9, 0.04, 0.55), cabM, 0, y, 0, g); for (const a of [-0.42, 0.42]) for (const b of [-0.25, 0.25]) add(new THREE.BoxGeometry(0.03, 0.8, 0.03), handleM, a, 0.45, b, g);
    add(new RoundedBoxGeometry(0.35, 0.25, 0.3, 2, 0.02), mat(0x2f7dff, 0.05, 0.6), -0.18, 0.45, 0, g); add(new RoundedBoxGeometry(0.35, 0.25, 0.3, 2, 0.02), mat(0xe08a2a, 0.05, 0.6), 0.2, 0.9, 0, g); contact(0, 0, 1.1, 0.8, g); };
  // 后墙左段
  for (let i = 0; i < 4; i++) cab(-12.8 + i * 0.75, -9.55, 0, i % 2 ? 1.9 : 1.6);
  barrel(-9.2, -9.3, barM[0]); barrel(-8.65, -9.35, barM[0]); barrel(-8.9, -8.85, barM[2]); pallet(-0.6, -9.2, 6); pallet(0.7, -9.2, 4); cart(-4.4, -9.2, 0.1);
  // 左墙
  for (let i = 0; i < 3; i++) cab(-13.55, -6.5 + i * 0.75, Math.PI / 2, 1.8);
  pallet(-13.0, -2.6, 8, Math.PI / 2); pallet(-13.0, -1.4, 5, Math.PI / 2); barrel(-13.3, 0.0, barM[1]); barrel(-13.3, 0.6, barM[1]); barrel(-12.75, 0.3, barM[2]); cart(-12.9, 1.9, Math.PI / 2);
  pallet(-13.0, 3.6, 7, Math.PI / 2); cab(-13.55, 5.0, Math.PI / 2, 1.4); cab(-13.55, 5.75, Math.PI / 2, 1.4); pallet(-10.4, 7.0, 4); barrel(9.0, -9.3, barM[0]); barrel(9.6, -9.3, barM[2]);
  // 左墙管架
  for (const [y, c] of [[2.6, 0x4a5058], [2.85, 0x2f6fd8], [3.1, 0x4a5058]]) { const t = add(new THREE.CylinderGeometry(0.07, 0.07, 18, 12), mat(c, 0.7, 0.35), -13.75, y, -0.5); t.rotation.x = Math.PI / 2; }
  for (let z = -8.5; z <= 7.5; z += 2) add(new THREE.BoxGeometry(0.3, 0.7, 0.05), colM, -13.75, 2.85, z);
  // 网格护栏面板
  const meshTex = canvasTex(64, 64, (g) => { g.strokeStyle = 'rgba(190,200,210,0.75)'; g.lineWidth = 2; g.strokeRect(0, 0, 64, 64); g.beginPath(); g.moveTo(32, 0); g.lineTo(32, 64); g.moveTo(0, 32); g.lineTo(64, 32); g.stroke(); });
  meshTex.wrapS = meshTex.wrapT = THREE.RepeatWrapping;
  const fence = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0); const t = meshTex.clone(); t.repeat.set(len * 4, 4); t.needsUpdate = true; const f = add(new THREE.PlaneGeometry(len, 0.95), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0.55 }), (x0 + x1) / 2, 0.52, (z0 + z1) / 2, scene, false); f.rotation.y = -Math.atan2(z1 - z0, x1 - x0); };
  fence(-11, 7.9, 5, 7.9); fence(-11, -8.5, -11, 7.9); fence(10.5, -2.5, 10.5, 4); }

// ================= 机械臂 ×4 =================
const ARMPOS = [[-1.8, -0.3, 0.2, 0.0], [-4.4, -1.7, Math.PI / 2, 1.5], [1.6, -0.2, -Math.PI / 2, 3.0], [6.1, -1.5, Math.PI, 4.5]];
const arms = ARMPOS.map(([x, z, ry, ph]) => { const A = buildArm(); A.root.position.set(x, 0, z); A.root.rotation.y = ry; A.root.scale.setScalar(1.45); scene.add(A.root); contact(x, z, 2.9, 2.9); A.phase = ph; return A; });
// 黄黑警示圈
for (const [x, z] of ARMPOS) for (let i = 0; i < 32; i++) { const seg = new THREE.Mesh(new THREE.RingGeometry(1.38, 1.5, 2, 1, i / 32 * Math.PI * 2, Math.PI * 2 / 32), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x111111 : 0xffc629 })); seg.rotation.x = -Math.PI / 2; seg.position.set(x, 0.018, z); scene.add(seg); }
const hero = arms[0]; const nodes = hero.parts; const EXP = nodes.map(n => new THREE.Vector3(...n.exp));
const labelsEl = document.getElementById('labels');
const labels = nodes.map(n => { const e = document.createElement('div'); e.className = 'lbl'; e.innerHTML = `<b>${n.name}</b><br>${n.desc}`; labelsEl.appendChild(e); return e; });

// ================= 立体货架 =================
const binG = new RoundedBoxGeometry(0.62, 0.42, 0.62, 2, 0.05);
const binCols = [0x2f7dff, 0xff8a1e, 0x2f7dff, 0xf2c230].map(c => new THREE.Color(c));
function rackRow(x, z, ry, bays, levels) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  const W = bays * 0.85, H = levels * 0.75; const up = mat(0x2a64d8, 0.6, 0.4), beamM = mat(0xf07a1e, 0.5, 0.45);
  const uprG = new THREE.BoxGeometry(0.07, H + 0.2, 0.07); for (let i = 0; i <= bays; i++) for (const zz of [-0.4, 0.4]) add(uprG, up, -W / 2 + i * 0.85, (H + 0.2) / 2, zz, g);
  for (let l = 0; l <= levels; l++) for (const zz of [-0.4, 0.4]) add(new THREE.BoxGeometry(W, 0.07, 0.06), beamM, 0, 0.1 + l * 0.75, zz, g);
  const inst = new THREE.InstancedMesh(binG, new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.05 }), bays * levels); const m4 = new THREE.Matrix4(); let k = 0;
  for (let l = 0; l < levels; l++) for (let b = 0; b < bays; b++) { if ((l * 5 + b * 3) % 11 === 0) { m4.makeScale(0, 0, 0); } else m4.makeTranslation(-W / 2 + 0.425 + b * 0.85, 0.35 + l * 0.75, 0); inst.setMatrixAt(k, m4); inst.setColorAt(k, binCols[(l + (b >> 1)) % binCols.length]); k++; }
  inst.castShadow = inst.receiveShadow = true; g.add(inst); contact(0, 0, W + 0.8, 1.6, g); return g; }
rackRow(5.6, -8.4, 0, 8, 4); rackRow(5.6, -6.7, 0, 8, 4); rackRow(11.6, -4.2, Math.PI / 2, 6, 4);
// 货架顶灯带
for (const z of [-8.4, -6.7]) add(new THREE.BoxGeometry(6.8, 0.04, 0.04), glow(0x39b6ff, 1.0), 5.6, 3.12, z + 0.42, scene, false);
// 堆垛机轨道
add(new THREE.BoxGeometry(7.8, 0.06, 0.12), mat(0x9aa6b4, 0.9, 0.3), 5.2, 0.03, -7.55);
const stacker = add(new THREE.BoxGeometry(0.25, 4.0, 0.25), mat(0xf2c230, 0.4, 0.4), 3, 2, -7.55);

// ================= 无人机 ×2 =================
const drones = [0, 1].map(() => { const d = buildDrone(); scene.add(d.root); return d; });
const dronePath = [new THREE.CatmullRomCurve3([[2, 4.4, -5.4], [7, 4.8, -5.6], [10.2, 4.4, -3], [9.8, 4.0, 1.4], [7, 3.6, -1.8], [4, 4.0, -3.8]].map(p => new THREE.Vector3(...p)), true),
  new THREE.CatmullRomCurve3([[8.6, 4.6, -5.6], [10.4, 4.2, -5.2], [10.6, 4.4, -0.8], [5.4, 3.6, -1], [3.4, 4.4, -5.2]].map(p => new THREE.Vector3(...p)), true)];

// ================= AGV ×3 =================
const agvs = [['AGV-03', false, 0x2f7dff], ['AGV-07', true, 0xff8a1e], ['AGV-12', false, 0x2fbf62]].map(([id, fault, bin]) => { const a = buildAGV({ id, fault, bin }); scene.add(a.g); contact(0, 0, 1.6, 1.3, a.g); return a; });
const agvRoutes = [[[-9.5, 0.4], [-9.5, 6.6], [2.6, 6.6], [2.6, 5.2], [-9.5, 5.2]].map(p => new THREE.Vector3(p[0], 0, p[1])),
  [[3.2, 1.5], [3.2, 4.8], [9.2, 4.8], [9.2, -2.5], [3.2, -2.5]].map(p => new THREE.Vector3(p[0], 0, p[1])),
  [[-0.2, -5.6], [3.2, -5.6], [9.2, -5.6], [9.2, -3.4], [-0.2, -3.4]].map(p => new THREE.Vector3(p[0], 0, p[1]))];
const agvCurves = agvRoutes.map(p => new THREE.CatmullRomCurve3(p, true, 'catmullrom', 0.1));
// 路径地标线
agvCurves.forEach(c => { const g = new THREE.BufferGeometry().setFromPoints(c.getSpacedPoints(200)); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x39d0ff, transparent: true, opacity: 0.7 })); l.position.y = 0.025; scene.add(l); });

// ================= 玻璃控制室（右前） =================
const ctrl = new THREE.Group(); ctrl.position.set(8.6, 0, 6.0); scene.add(ctrl);
{ const glass = new THREE.MeshPhysicalMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.1, side: THREE.DoubleSide, depthWrite: false });
  const frame = mat(0x5a6676, 0.8, 0.3); const W = 4.6, D = 3.2, H = 2.2;
  add(new THREE.BoxGeometry(W, 0.12, D), mat(0x26303e, 0.4, 0.6), 0, 0.06, 0, ctrl);
  [[0, -D / 2, W, 0], [0, D / 2, W, 0], [-W / 2, 0, D, 1], [W / 2, 0, D, 1]].forEach(([x, z, l, rot]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(l, H), glass); p.position.set(x, H / 2 + 0.12, z); if (rot) p.rotation.y = Math.PI / 2; ctrl.add(p); });
  for (const x of [-W / 2, W / 2]) for (const z of [-D / 2, D / 2]) add(new THREE.BoxGeometry(0.08, H, 0.08), frame, x, H / 2 + 0.12, z, ctrl);
  for (const z of [-D / 2, D / 2]) add(new THREE.BoxGeometry(W, 0.06, 0.06), frame, 0, H + 0.12, z, ctrl);
  for (const x of [-W / 2, W / 2]) add(new THREE.BoxGeometry(0.06, 0.06, D), frame, x, H + 0.12, 0, ctrl);
  const scr = canvasTex(256, 160, (g) => { g.fillStyle = '#04122a'; g.fillRect(0, 0, 256, 160); g.fillStyle = '#39b6ff'; for (let i = 0; i < 10; i++) g.fillRect(14 + i * 23, 140 - (30 + (i * 37) % 90), 14, 30 + (i * 37) % 90); g.strokeStyle = '#3ddc84'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 12; i++) g.lineTo(i * 23, 50 + Math.sin(i) * 25); g.stroke(); });
  const scrM = new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffffff, emissiveMap: scr, emissiveIntensity: 1.4 });
  // 后墙大屏
  for (let i = 0; i < 4; i++) add(new THREE.PlaneGeometry(1.0, 0.62), scrM, -1.6 + i * 1.07, 1.75, -D / 2 + 0.03, ctrl, false);
  for (let i = 0; i < 4; i++) add(new THREE.PlaneGeometry(1.0, 0.62), scrM, -1.6 + i * 1.07, 1.08, -D / 2 + 0.03, ctrl, false);
  // 控制台
  add(new RoundedBoxGeometry(3.4, 0.75, 0.7, 2, 0.04), mat(0x2b333f, 0.5, 0.4), 0, 0.5, 0.2, ctrl);
  for (let i = 0; i < 4; i++) { const m = add(new THREE.BoxGeometry(0.62, 0.4, 0.04), mat(0x111418, 0.6, 0.4), -1.2 + i * 0.8, 1.15, 0.1, ctrl); const s = add(new THREE.PlaneGeometry(0.56, 0.34), scrM, -1.2 + i * 0.8, 1.15, 0.125, ctrl, false); m.rotation.x = s.rotation.x = -0.15; }
  for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 16), mat(0x1a1d22, 0.3, 0.7), -1 + i, 0.37, 1.0, ctrl);
  contact(0, 0, 5.4, 4, ctrl); }
// 右前配电柜
for (let i = 0; i < 3; i++) { add(new RoundedBoxGeometry(0.7, 1.8, 0.5, 2, 0.03), mat(0xcfd6de, 0.3, 0.45), 11.6, 0.9, 1.2 + i * 0.8).rotation.y = -Math.PI / 2; add(new THREE.PlaneGeometry(0.3, 0.4), glow(0x39b6ff, 1.5), 11.34, 1.2, 1.2 + i * 0.8).rotation.y = -Math.PI / 2; contact(11.6, 1.2 + i * 0.8, 1, 1); }

// ================= 后期 =================
const comp = new EffectComposer(r); comp.addPass(new RenderPass(scene, cam));
comp.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.3, 0.35, 1.05)); comp.addPass(new OutputPass());

// ================= 交互 / 动画 =================
let target = 0, ex = 0; const btn = document.getElementById('btn');
const camGoal = { pos: HOME.pos.clone(), tgt: HOME.tgt.clone() }; let camFly = 0;
const heroView = () => { const p = hero.root.position; camGoal.tgt.set(p.x + 1.6, 1.6, p.z + 0.4); camGoal.pos.set(p.x - 3.2, 6.8, p.z + 13); camFly = 1; };
const homeView = () => { camGoal.pos.copy(HOME.pos); camGoal.tgt.copy(HOME.tgt); camFly = 1; };
btn.onclick = () => { target = target ? 0 : 1; btn.textContent = target ? '重组' : '拆解 R-01'; target ? heroView() : homeView(); };
window.setExplode = v => { target = ex = v; btn.textContent = v ? '重组' : '拆解 R-01'; v ? heroView() : homeView(); cam.position.copy(camGoal.pos); ctl.target.copy(camGoal.tgt); camFly = 0; };
window.focusAGV = (i, dx = -2.0, dy = 1.5, dz = 2.0) => { const p = agvs[i].g.position; window.setCam([p.x + dx, dy, p.z + dz], [p.x, 0.35, p.z]); };
window.setCam = (a, b) => { cam.position.set(...a); ctl.target.set(...b); camFly = 0; target = ex = 0; };
let fixedT = null; window.setTime = v => { fixedT = v; };
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const smooth = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };
const clock = new THREE.Clock(); const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
const fpsEl = document.getElementById('fps'); let fc = 0, ft = performance.now(); const loadMs = Math.round(performance.now());
function animArm(A, time, frozen) {
  const n = A.parts, c = frozen ? 0.3 : ((time + A.phase) % 6) / 6;
  const swing = smooth(0.15, 0.45, c) - smooth(0.6, 0.9, c);
  const dip = Math.sin(smooth(0, 0.15, c) * Math.PI) + Math.sin(smooth(0.45, 0.6, c) * Math.PI);
  n[1].joint.rotation.y = -0.7 + swing * 1.4; n[2].joint.rotation.z = -0.35 - dip * 0.25; n[3].joint.rotation.z = 0.2 - dip * 0.35; n[4].joint.rotation.z = -0.9 + dip * 0.3;
  const open = 1 - (smooth(0.12, 0.18, c) - smooth(0.5, 0.56, c)); A.fingers.forEach(({ f, s }) => f.position.y = s * (0.03 + open * 0.03));
}
function loop() {
  fc++; const nw = performance.now(); if (nw - ft > 1000) { fpsEl.textContent = `FPS ${Math.round(fc * 1000 / (nw - ft))} · 首屏 ${(loadMs / 1000).toFixed(1)}s`; fc = 0; ft = nw; }
  const dt = Math.min(clock.getDelta(), 0.1); const time = fixedT ?? clock.elapsedTime;
  ex += Math.sign(target - ex) * Math.min(Math.abs(target - ex), dt * 0.8);
  arms.forEach((A, i) => animArm(A, time, i === 0 && ex > 0));
  nodes[5].joint.rotation.x = ex > 0 ? time * 0.8 : 0;
  const e = ease(ex);
  nodes.forEach((n, i) => { n.off.position.copy(EXP[i]).multiplyScalar(e * 1.5); n.off.getWorldPosition(tmp); tmp.project(cam);
    const l = labels[i]; const lx = Math.min(innerWidth - 250 - 215, Math.max(250, (tmp.x + 1) / 2 * innerWidth + 30)), ly = Math.min(innerHeight - 110, Math.max(64, (1 - tmp.y) / 2 * innerHeight - 20) + (lx !== (tmp.x + 1) / 2 * innerWidth + 30 ? i * 4 : 0)); l.style.left = lx + 'px'; l.style.top = (ly + [0, 0, 0, -46, 6, 58][i]) + 'px'; l.style.opacity = e > 0.9 ? 1 : 0; });
  // 输送线
  conveyors.forEach(C => { C.tex.offset.y = -(time * C.speed / 0.5) % 1; C.boxes.forEach((b, i) => { const u = ((i / C.boxes.length) + time * C.speed / C.len) % 1, k = u * C.N, i0 = Math.floor(k) % C.N, i1 = (i0 + 1) % C.N;
    b.position.lerpVectors(C.P[i0], C.P[i1], k - Math.floor(k)); b.position.y = 0.98; b.rotation.y = Math.atan2(C.P[i1].x - C.P[i0].x, C.P[i1].z - C.P[i0].z); }); });
  // 无人机
  drones.forEach((d, i) => { const u = ((time / (22 + i * 4)) + i * 0.4) % 1; dronePath[i].getPointAt(u, tmp); dronePath[i].getTangentAt(u, tmp2);
    d.root.position.copy(tmp); d.root.position.y += Math.sin(time * 2 + i) * 0.06; d.root.rotation.set(0, Math.atan2(-tmp2.z, tmp2.x), 0); d.root.rotateZ(-0.12); d.props.forEach(p => p.p.rotation.y += p.dir * 0.9); });
  // AGV
  agvs.forEach((a, i) => { const u = a.fault ? 0.62 : ((time / (26 + i * 5)) + i * 0.3) % 1; agvCurves[i].getPointAt(u, tmp); agvCurves[i].getTangentAt(u, tmp2);
    a.g.position.copy(tmp); a.g.rotation.y = Math.atan2(-tmp2.z, tmp2.x); a.update(time); });
  // 检测光束 / 灯
  insp.update(time); pack.update(time);
  cncs.forEach((c, i) => c.update(time, i * 7));
  stacker.position.x = 1.8 + (Math.sin(time * 0.3) * 0.5 + 0.5) * 6.8;
  if (camFly) { cam.position.lerp(camGoal.pos, 0.05); ctl.target.lerp(camGoal.tgt, 0.05); if (cam.position.distanceTo(camGoal.pos) < 0.02) camFly = 0; }
  ctl.update(); comp.render(); requestAnimationFrame(loop);
}
window.ready = 1; loop();
addEventListener('resize', () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); r.setSize(innerWidth, innerHeight); comp.setSize(innerWidth, innerHeight); });

// ===== 碰撞自检（QA 用）=====
window.collisionCheck = (steps = 60) => {
  const boxes = []; const lb = (name, root, x0, y0, z0, x1, y1, z1) => { root.updateMatrixWorld(true); const b = new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1)).applyMatrix4(root.matrixWorld); boxes.push([name, b]); };
  lb('inspection', insp.root, -1.32, 0, -0.84, 1.32, 2.42, 0.84);
  lb('packer', pack.root, -0.92, 0, -0.6, 0.92, 1.8, 0.6); lb('packer-infeed', pack.root, -1.42, 0, -0.3, 1.42, 0.75, 0.3); lb('packer-mag', pack.root, -0.78, 0.6, -1.0, -0.02, 1.45, -0.55);
  cncs.forEach((c, i) => { c.root.updateMatrixWorld(true); boxes.push(['cnc' + i, new THREE.Box3().setFromObject(c.root)]); });
  const res = [], tb = new THREE.Box3(), worst = {};
  arms.forEach((A, ai) => { for (let s = 0; s < steps; s++) { const t = s / steps * 6 - A.phase + 600; animArm(A, t, false); A.root.updateMatrixWorld(true);
    A.root.traverse(o => { if (!o.isMesh || o.position.y < 0.05 && o.parent === A.root) return; tb.setFromObject(o, true); if (tb.max.y < 0.15) return;
      for (const [n, b] of boxes) if (tb.intersectsBox(b)) { const ov = Math.min(tb.max.x, b.max.x) - Math.max(tb.min.x, b.min.x), oz = Math.min(tb.max.z, b.max.z) - Math.max(tb.min.z, b.min.z), oy = Math.min(tb.max.y, b.max.y) - Math.max(tb.min.y, b.min.y); const d = Math.min(ov, oz, oy);
        res.push({ arm: ai, step: s, eq: n, part: o.name || o.geometry.type, depth: +d.toFixed(3), y: +tb.max.y.toFixed(2) }); const k = ai + n; if (!worst[k] || worst[k].depth < d) worst[k] = { arm: ai, step: s, eq: n, depth: +d.toFixed(3) }; } }); } });
  return { count: res.length, worst: Object.values(worst), boxes: boxes.map(([n, b]) => [n, b.min.toArray().map(v => +v.toFixed(2)), b.max.toArray().map(v => +v.toFixed(2))]), arms: arms.map(A => A.root.position.toArray()) };
};
