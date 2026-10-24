// 立式加工中心 VMC-850：全代码建模（底座/防护罩/滑门/主轴/工作台/刀库/操作面板/电气柜/排屑机/拖链/三色灯）
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
const P = o => new THREE.MeshPhysicalMaterial(o), S = o => new THREE.MeshStandardMaterial(o);
const ctex = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
const M = {
  gun: P({ color: 0x4c535c, metalness: 0.7, roughness: 0.36, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
  gunD: P({ color: 0x30353c, metalness: 0.7, roughness: 0.42, clearcoat: 0.2 }),
  green: P({ color: 0x2a9a55, metalness: 0.25, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
  cast: S({ color: 0x5b6168, metalness: 0.55, roughness: 0.55 }),
  base: S({ color: 0x24282d, metalness: 0.6, roughness: 0.5 }),
  steel: S({ color: 0xc4ccd4, metalness: 1, roughness: 0.22 }),
  rail: S({ color: 0xdfe4ea, metalness: 1, roughness: 0.15 }),
  alu: S({ color: 0xd8dde2, metalness: 0.9, roughness: 0.32 }),
  black: S({ color: 0x111317, metalness: 0.4, roughness: 0.6 }),
  rubber: S({ color: 0x0b0c0e, metalness: 0, roughness: 0.85 }),
  seam: S({ color: 0x0a0c0f, metalness: 0.3, roughness: 0.7 }),
  orange: S({ color: 0xe8862a, metalness: 0.1, roughness: 0.5 }),
  blueHose: S({ color: 0x2f7dff, metalness: 0.1, roughness: 0.45 }),
  bin: S({ color: 0x2f6fd8, metalness: 0.3, roughness: 0.5 }),
  glass: P({ color: 0x6a8aa0, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.14, envMapIntensity: 0.5, depthWrite: false }),
  lamp: S({ color: 0, emissive: 0xeaf4ff, emissiveIntensity: 1.1 }),
};
const stripeT = ctex(128, 16, (g) => { g.fillStyle = '#111'; g.fillRect(0, 0, 128, 16); g.fillStyle = '#f2c230'; for (let i = -16; i < 128; i += 16) { g.beginPath(); g.moveTo(i, 16); g.lineTo(i + 8, 0); g.lineTo(i + 16, 0); g.lineTo(i + 8, 16); g.fill(); } }); stripeT.wrapS = THREE.RepeatWrapping;
const plateT = ctex(512, 128, (g) => { g.fillStyle = '#1a1d22'; g.fillRect(0, 0, 512, 128); g.strokeStyle = '#9aa4ae'; g.lineWidth = 4; g.strokeRect(4, 4, 504, 120); g.fillStyle = '#eef2f6'; g.font = 'bold 56px sans-serif'; g.fillText('VMC-850', 24, 72); g.fillStyle = '#3ddc84'; g.font = '600 30px "Noto Sans CJK SC",sans-serif'; g.fillText('立式加工中心', 268, 58); g.fillStyle = '#8a96a4'; g.font = '20px sans-serif'; g.fillText('VERTICAL MACHINING CENTER', 268, 96); });
const scrT = ctex(256, 192, (g) => { g.fillStyle = '#04121f'; g.fillRect(0, 0, 256, 192); g.fillStyle = '#0d3a66'; g.fillRect(0, 0, 256, 24); g.fillStyle = '#9fd8ff'; g.font = 'bold 15px monospace'; g.fillText('AUTO  O1024  N0350', 8, 17);
  g.font = '15px monospace'; [['X', '-124.350'], ['Y', '  36.020'], ['Z', ' -12.800']].forEach(([a, v], i) => { g.fillStyle = '#5fd0ff'; g.fillText(a, 10, 50 + i * 24); g.fillStyle = '#e8f6ff'; g.fillText(v, 34, 50 + i * 24); });
  g.fillStyle = '#3ddc84'; g.fillText('S 8000  F 1200', 10, 130); g.fillStyle = '#123'; g.fillRect(140, 36, 106, 80); g.strokeStyle = '#3ddc84'; g.beginPath(); for (let x = 0; x < 100; x++) g.lineTo(143 + x, 100 - Math.abs(Math.sin(x / 9)) * 50); g.stroke();
  ['程序', '偏置', '诊断', '报警'].forEach((s, i) => { g.fillStyle = '#163d63'; g.fillRect(6 + i * 62, 160, 56, 26); g.fillStyle = '#cfe8ff'; g.font = '14px "Noto Sans CJK SC",sans-serif'; g.fillText(s, 14 + i * 62, 178); }); });
const warnT = ctex(128, 128, (g) => { g.fillStyle = '#f2c230'; g.beginPath(); g.moveTo(64, 6); g.lineTo(122, 116); g.lineTo(6, 116); g.closePath(); g.fill(); g.lineWidth = 6; g.strokeStyle = '#111'; g.stroke(); g.fillStyle = '#111'; g.font = 'bold 64px sans-serif'; g.fillText('⚡', 34, 100); });
const lblT = ctex(256, 96, (g) => { g.fillStyle = '#9aa2aa'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#111'; g.font = 'bold 30px "Noto Sans CJK SC",sans-serif'; g.fillText('电气柜 EC-01', 14, 40); g.font = '22px sans-serif'; g.fillText('AC 380V  50Hz  32A', 14, 76); });
const chipT = ctex(64, 64, (g) => { g.fillStyle = '#2a2e33'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#4a5058'; for (let i = 0; i < 64; i += 8) g.fillRect(0, i, 64, 5); }); chipT.wrapS = chipT.wrapT = THREE.RepeatWrapping;

export function buildCNC() {
  const root = new THREE.Group();
  const add = (geo, m, x, y, z, p = root, sh = true) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; p.add(o); return o; };
  const rb = (w, h, d, m, x, y, z, p = root, r = 0.012, sh = true) => add(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.1, h / 2.1, d / 2.1)), m, x, y, z, p, sh);
  const bx = (w, h, d, m, x, y, z, p = root, sh = false) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, p, sh);
  const tube = (pts, r, m, p = root) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(a => new THREE.Vector3(...a))), 40, r, 8), m, 0, 0, 0, p);
  const bolts = []; const bolt = (x, y, z, ax = 'z') => bolts.push([x, y, z, ax]);
  const boltRect = (x0, x1, y0, y1, z, ax = 'z') => { for (const x of [x0, x1]) for (const y of [y0, y1]) ax === 'z' ? bolt(x, y, z) : bolt(z, y, x, 'x'); };
  // ---- 底座铸件 + 调平脚 ----
  const F = 0.06; rb(2.6, 0.24, 1.7, M.base, -0.12, F + 0.12, 0, root, 0.03); bx(2.62, 0.02, 1.72, M.seam, -0.12, F + 0.2, 0);
  const feet = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.09, F, 12), M.steel, 6), m4 = new THREE.Matrix4(); let k = 0;
  for (const x of [-1.3, -0.12, 1.06]) for (const z of [-0.72, 0.72]) feet.setMatrixAt(k++, m4.makeTranslation(x, F / 2, z)); root.add(feet);
  const Y0 = F + 0.24, Y1 = 2.15, H = Y1 - Y0, yc = (Y0 + Y1) / 2;
  // ---- 防护罩：背板/侧板/顶板 ----
  rb(2.25, H, 0.05, M.gun, -0.125, yc, -0.78); rb(0.05, H, 1.6, M.gun, -1.23, yc, 0); rb(0.05, H, 1.6, M.gun, 0.98, yc, 0);
  rb(2.3, 0.06, 1.64, M.gunD, -0.125, Y1 + 0.03, 0, root, 0.015);
  for (const x of [-1.26, 1.01]) { for (const z of [-0.27, 0.27]) bx(0.012, H - 0.04, 0.01, M.seam, x, yc, z).rotation.y = Math.PI / 2;
    rb(0.012, 0.7, 0.45, M.green, x + Math.sign(x) * 0.002, 1.35, -0.53, root, 0.006, false);
    for (const z of [-0.78, -0.29, 0.25, 0.78]) for (const y of [Y0 + 0.05, Y1 - 0.05]) bolt(x + Math.sign(x) * 0.006, y, z, x > 0 ? 'x' : '-x'); }
  // 侧面散热百叶（右侧）
  const louv = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 0.018, 0.4), M.seam, 10); for (let i = 0; i < 10; i++) louv.setMatrixAt(i, m4.makeTranslation(1.012, 0.55 + i * 0.045, 0.45)); root.add(louv);
  // 前脸：上横梁 / 下裙板 / 右立柱（绿）/ 左立柱
  rb(2.25, 0.3, 0.06, M.gun, -0.125, 2.0, 0.8); rb(2.25, 0.32, 0.06, M.gunD, -0.125, Y0 + 0.16, 0.8);
  const st = bx(2.25, 0.06, 0.01, S({ map: stripeT, roughness: 0.6 }), -0.125, Y0 + 0.27, 0.836); stripeT.repeat.set(14, 1);
  rb(0.55, 1.23, 0.07, M.green, 0.725, 1.235, 0.805, root, 0.015); rb(0.1, 1.23, 0.06, M.gun, -1.2, 1.235, 0.8);
  bx(1.9, 0.012, 0.01, S({ color: 0, emissive: 0x3ddc84, emissiveIntensity: 0.9 }), -0.4, 1.86, 0.835); // 横梁灯带
  const plate = bx(0.66, 0.165, 0.008, S({ map: plateT, roughness: 0.4, metalness: 0.4 }), -0.6, 2.0, 0.835); boltRect(-0.92, -0.28, 1.93, 2.07, 0.84);
  boltRect(-1.2, 0.95, Y0 + 0.05, Y0 + 0.27, 0.835); boltRect(0.49, 0.96, 0.66, 1.81, 0.842); boltRect(-1.2, 0.95, 1.89, 2.11, 0.835);
  // 右立柱：主电源开关 + 小指示
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 24), M.black, 0.73, 1.0, 0.85).rotation.x = Math.PI / 2; bx(0.1, 0.022, 0.03, S({ color: 0xd8312b, roughness: 0.4 }), 0.73, 1.0, 0.87);
  add(new THREE.PlaneGeometry(0.14, 0.14), S({ map: warnT, transparent: true }), 0.73, 1.45, 0.842, root, false);
  // ---- 内部：防水底盘 / 床鞍 / 工作台 / T 型槽 / 虎钳 / 工件 ----
  bx(2.1, 0.04, 1.45, M.gunD, -0.12, Y0 + 0.32, 0); const iy = Y0 + 0.34;
  for (const x of [-0.75, 0.25]) bx(0.05, 0.04, 0.9, M.rail, x, iy + 0.02, 0.05);
  const saddle = rb(1.2, 0.12, 0.65, M.cast, -0.25, iy + 0.1, 0.05, root, 0.02);
  const tbl = new THREE.Group(); tbl.position.set(-0.25, iy + 0.16, 0.05); root.add(tbl);
  for (const z of [-0.2, 0.2]) bx(1.1, 0.03, 0.05, M.rail, 0, 0.015, z, tbl);
  rb(1.4, 0.1, 0.52, M.cast, 0, 0.08, 0, tbl, 0.01);
  const slots = new THREE.InstancedMesh(new THREE.BoxGeometry(1.4, 0.012, 0.035), M.seam, 4); for (let i = 0; i < 4; i++) slots.setMatrixAt(i, m4.makeTranslation(0, 0.127, -0.18 + i * 0.12)); tbl.add(slots);
  rb(0.42, 0.1, 0.2, M.steel, 0.05, 0.18, 0, tbl, 0.008); for (const x of [-0.14, 0.24]) rb(0.05, 0.08, 0.2, M.steel, x, 0.26, 0, tbl, 0.006);
  rb(0.32, 0.12, 0.18, M.alu, 0.05, 0.29, 0, tbl, 0.004); bx(0.16, 0.02, 0.1, S({ color: 0x8a929a, metalness: 1, roughness: 0.4 }), 0.05, 0.345, 0, tbl);
  // 波纹护罩
  const bell = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 0.1, 0.6), M.black, 14); for (let i = 0; i < 14; i++) bell.setMatrixAt(i, m4.makeTranslation(-1.15 + i * 0.03 + (i > 6 ? 1.7 : 0), iy + 0.1, 0.05)); root.add(bell);
  // ---- Z 立柱 + 线轨 + 丝杠 + 主轴箱 ----
  const cx = -0.25; rb(0.56, 1.35, 0.42, M.cast, cx, iy + 0.67, -0.52, root, 0.03);
  for (const s of [-1, 1]) { bx(0.045, 1.25, 0.03, M.rail, cx + s * 0.18, iy + 0.7, -0.295); }
  add(new THREE.CylinderGeometry(0.018, 0.018, 1.2, 10), M.steel, cx, iy + 0.7, -0.29);
  const head = new THREE.Group(); head.position.set(cx, iy + 0.95, -0.2); root.add(head);
  for (const s of [-1, 1]) for (const y of [-0.12, 0.12]) rb(0.08, 0.07, 0.05, M.black, s * 0.18, y, -0.07, head, 0.008);
  rb(0.4, 0.45, 0.4, M.green, 0, 0, 0.1, head, 0.03); bx(0.405, 0.01, 0.405, M.seam, 0, 0.1, 0.1, head);
  add(new THREE.CylinderGeometry(0.11, 0.11, 0.32, 20), M.black, 0, 0.38, 0.05, head); const fins = new THREE.InstancedMesh(new THREE.TorusGeometry(0.112, 0.008, 4, 20), M.gunD, 6); for (let i = 0; i < 6; i++) fins.setMatrixAt(i, new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(0, 0.26 + i * 0.045, 0.05)); head.add(fins);
  add(new THREE.CylinderGeometry(0.09, 0.1, 0.12, 24), M.steel, 0, -0.28, 0.14, head);
  const spin = new THREE.Group(); spin.position.set(0, -0.34, 0.14); head.add(spin);
  add(new THREE.CylinderGeometry(0.06, 0.035, 0.08, 20), M.steel, 0, -0.04, 0, spin); add(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 16), M.orange, 0, -0.1, 0, spin); add(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 6), M.alu, 0, -0.18, 0, spin);
  // 冷却液喷嘴软管（分节）
  for (const s of [-1, 1]) { const pts = [[s * 0.15, -0.2, 0.25], [s * 0.16, -0.3, 0.27], [s * 0.1, -0.42, 0.22], [s * 0.04, -0.48, 0.16]]; const c = new THREE.CatmullRomCurve3(pts.map(a => new THREE.Vector3(...a)));
    const seg = new THREE.InstancedMesh(new THREE.SphereGeometry(0.016, 8, 6), M.orange, 12); for (let i = 0; i < 12; i++) seg.setMatrixAt(i, m4.makeTranslation(...c.getPoint(i / 11).toArray())); head.add(seg); }
  // 内部照明
  bx(0.9, 0.02, 0.06, M.lamp, -0.25, Y1 - 0.05, 0.45); const pl = new THREE.PointLight(0xdceeff, 2.2, 2.4, 1.6); pl.position.set(-0.25, 1.7, 0.3); root.add(pl);
  // ---- 推拉门：框 + 玻璃 + 把手 ----
  const door = (x, z) => { const d = new THREE.Group(); d.position.set(x, Y0 + 0.32, z); root.add(d); const W = 0.84, Hd = 1.22;
    rb(W, 0.3, 0.03, M.gun, 0, 0.15, 0, d, 0.01); rb(W, 0.12, 0.03, M.gun, 0, Hd - 0.06, 0, d, 0.01); for (const s of [-1, 1]) rb(0.08, Hd, 0.03, M.gun, s * (W / 2 - 0.04), Hd / 2, 0, d, 0.01);
    const gw = W - 0.16, gh = Hd - 0.42; for (const [w, h, xx, yy] of [[gw + 0.03, 0.018, 0, 0.3], [gw + 0.03, 0.018, 0, Hd - 0.12], [0.018, gh, -gw / 2, 0.3 + gh / 2], [0.018, gh, gw / 2, 0.3 + gh / 2]]) bx(w, h, 0.035, M.rubber, xx, yy, 0, d);
    add(new THREE.PlaneGeometry(gw, gh), M.glass, 0, 0.3 + gh / 2, 0.005, d, false);
    bx(0.6, 0.02, 0.005, M.seam, 0, 0.22, 0.017, d); for (const xx of [-0.36, 0.36]) for (const yy of [0.04, Hd - 0.04]) bolts.push([x + xx, Y0 + 0.32 + yy, z + 0.017, 'zd', d, xx, yy]);
    return d; };
  const dL = door(-0.74, 0.845), dR = door(0.06, 0.885);
  for (const [d, s] of [[dL, 1], [dR, -1]]) { const hx = s * 0.33; for (const y of [0.55, 0.95]) bx(0.02, 0.02, 0.05, M.steel, hx, y, 0.035, d); add(new THREE.CylinderGeometry(0.014, 0.014, 0.46, 10), M.steel, hx, 0.75, 0.06, d); }
  bx(1.7, 0.03, 0.06, M.steel, -0.33, Y0 + 0.33, 0.87); bx(1.7, 0.03, 0.06, M.steel, -0.33, Y1 - 0.18, 0.87); // 导轨
  // ---- 刀库（伞形/圆盘）----
  const mag = new THREE.Group(); mag.position.set(-1.36, 1.55, -0.25); root.add(mag);
  rb(0.18, 0.5, 0.5, M.gun, 0.07, 0, 0, mag, 0.02); const disk = new THREE.Group(); disk.position.x = -0.05; mag.add(disk);
  add(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 40), M.green, 0, 0, 0, disk).rotation.z = Math.PI / 2; add(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 20), M.steel, -0.02, 0, 0, disk).rotation.z = Math.PI / 2;
  const NT = 20, hA = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.045, 0.07, 10), M.cast, NT), hB = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 6), M.black, NT), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
  for (let i = 0; i < NT; i++) { const a = i / NT * Math.PI * 2, y = Math.cos(a) * 0.35, z = Math.sin(a) * 0.35; hA.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(-0.06, y, z), q, new THREE.Vector3(1, 1, 1))); hB.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(-0.13, y, z), q, new THREE.Vector3(1, 1, 1))); }
  disk.add(hA, hB); hA.castShadow = true;
  rb(0.06, 0.5, 0.92, M.gunD, 0.0, 0.25, 0, mag, 0.02); // 上半罩
  rb(0.25, 0.1, 0.2, M.gunD, 0.1, -0.52, 0, mag, 0.01); add(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 16), M.black, 0.07, -0.2, 0.32, mag).rotation.z = Math.PI / 2;
  // ---- 操作面板 + 悬臂 ----
  const pv = new THREE.Group(); pv.position.set(0.95, 2.0, 0.83); root.add(pv);
  rb(0.12, 0.1, 0.1, M.gunD, 0, 0, 0, pv, 0.02); tube([[0, 0, 0.03], [0, 0, 0.2], [-0.02, 0, 0.35]], 0.03, M.gunD, pv); add(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 12), M.gunD, -0.02, -0.22, 0.36, pv);
  const pan = new THREE.Group(); pan.position.set(-0.02, -0.72, 0.4); pan.rotation.set(-0.15, -0.35, 0); pv.add(pan);
  rb(0.5, 0.62, 0.08, M.gun, 0, 0, 0, pan, 0.025); rb(0.42, 0.3, 0.01, M.black, 0, 0.12, 0.041, pan, 0.004);
  add(new THREE.PlaneGeometry(0.38, 0.27), S({ color: 0, emissive: 0xffffff, emissiveMap: scrT, emissiveIntensity: 1.3 }), 0, 0.12, 0.047, pan, false);
  const btn = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 10), S({ roughness: 0.4 }), 18), bc = [0x3ddc84, 0xe8ecef, 0xe8ecef, 0x2f7dff, 0xf2c230, 0xe8ecef];
  for (let i = 0; i < 18; i++) { btn.setMatrixAt(i, new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(-0.19 + (i % 6) * 0.045, -0.08 - (i / 6 | 0) * 0.045, 0.044)); btn.setColorAt(i, new THREE.Color(bc[(i + (i / 6 | 0)) % 6])); } pan.add(btn);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 20), S({ color: 0xf2c230 }), 0.18, -0.19, 0.042, pan).rotation.x = Math.PI / 2; add(new THREE.SphereGeometry(0.026, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), S({ color: 0xd8312b, roughness: 0.3 }), 0.18, -0.19, 0.048, pan).rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 20), M.black, 0.18, -0.08, 0.05, pan).rotation.x = Math.PI / 2; // 手轮
  // ---- 电气柜 ----
  rb(0.6, 1.9, 1.3, M.gunD, 1.36, Y0 + 0.95, -0.1, root, 0.02); bx(0.01, 1.8, 0.012, M.seam, 1.36, Y0 + 0.95, 0.553).rotation.y = Math.PI / 2;
  bx(0.012, 1.8, 0.01, M.seam, 1.36, Y0 + 0.95, 0.553); add(new THREE.PlaneGeometry(0.4, 0.15), S({ map: lblT }), 1.36, 1.6, 0.556, root, false); add(new THREE.PlaneGeometry(0.12, 0.12), S({ map: warnT, transparent: true }), 1.36, 1.35, 0.556, root, false);
  bx(0.03, 0.18, 0.04, M.steel, 1.58, 1.1, 0.57); boltRect(1.1, 1.62, Y0 + 0.05, Y0 + 1.85, 0.553);
  const cv = new THREE.InstancedMesh(new THREE.BoxGeometry(0.01, 0.016, 0.5), M.seam, 24); for (let i = 0; i < 24; i++) cv.setMatrixAt(i, m4.makeTranslation(1.662, 0.5 + (i % 12) * 0.04 + (i >= 12 ? 0.85 : 0), -0.1)); root.add(cv);
  add(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 24), M.black, 1.665, 1.15, -0.1).rotation.z = Math.PI / 2;
  rb(0.2, 0.05, 0.2, M.gun, 1.36, Y0 + 1.93, -0.4, root, 0.01); // 顶部空调
  // 气动三联件 + 气管
  for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12), i === 1 ? M.steel : P({ color: 0xcfe8ff, transparent: true, opacity: 0.6, roughness: 0.1 }), 1.67, 0.95, -0.55 + i * 0.08).rotation.z = 0;
  tube([[1.36, Y1 + 0.02, -0.55], [1.2, Y1 + 0.18, -0.55], [0.7, Y1 + 0.12, -0.5], [0.3, Y1 + 0.08, -0.45]], 0.014, M.blueHose); tube([[1.36, Y1 + 0.02, -0.65], [1.15, Y1 + 0.22, -0.65], [0.5, Y1 + 0.12, -0.62], [-0.1, Y1 + 0.08, -0.6]], 0.014, M.blueHose);
  // ---- 顶部：主轴电机罩 / 拖链 / 散热格栅 / 三色灯 ----
  rb(0.62, 0.38, 0.5, M.green, cx, Y1 + 0.22, -0.48, root, 0.04); const rv = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.012, 0.02), M.seam, 6); for (let i = 0; i < 6; i++) rv.setMatrixAt(i, m4.makeTranslation(cx, Y1 + 0.1 + i * 0.045, -0.225)); root.add(rv);
  const chainPts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; let x, y; if (u < 0.45) { x = -1.0 + u / 0.45 * 0.6; y = 0; } else if (u < 0.55) { const a = (u - 0.45) / 0.1 * Math.PI; x = -0.4 + Math.sin(a) * 0.09; y = 0.09 - Math.cos(a) * 0.09; } else { x = -0.4 - (u - 0.55) / 0.45 * 0.55; y = 0.18; } chainPts.push([x, y]); }
  const chain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.035, 0.03, 0.09), M.black, chainPts.length); chainPts.forEach(([x, y], i) => chain.setMatrixAt(i, m4.makeTranslation(x, Y1 + 0.08 + y, 0.25))); chain.castShadow = true; root.add(chain);
  bx(0.9, 0.012, 0.11, M.gunD, -0.6, Y1 + 0.065, 0.25);
  const grill = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.01, 0.015), M.seam, 8); for (let i = 0; i < 8; i++) grill.setMatrixAt(i, m4.makeTranslation(0.55, Y1 + 0.065, -0.2 + i * 0.04)); root.add(grill);
  for (const x of [-1.2, 0.95]) for (const z of [-0.78, 0.78]) bolts.push([x, Y1 + 0.065, z, 'y']);
  const sl = new THREE.Group(); sl.position.set(0.8, Y1 + 0.06, 0.62); root.add(sl);
  add(new THREE.CylinderGeometry(0.05, 0.06, 0.04, 16), M.black, 0, 0.02, 0, sl); add(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8), M.steel, 0, 0.12, 0, sl);
  const lit = [S({ color: 0, emissive: 0x3ddc84, emissiveIntensity: 3.5 }), S({ color: 0x3a2a08, emissive: 0xff9a2e, emissiveIntensity: 0.15 }), S({ color: 0x3a0a0a, emissive: 0xff3b3b, emissiveIntensity: 0.15 })];
  lit.forEach((m, i) => { add(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 20), m, 0, 0.26 + i * 0.085, 0, sl, false); bx(0.092, 0.006, 0.092, M.black, 0, 0.3 + i * 0.085, 0, sl).geometry = new THREE.CylinderGeometry(0.047, 0.047, 0.006, 20); });
  add(new THREE.CylinderGeometry(0.04, 0.047, 0.03, 20), M.black, 0, 0.53, 0, sl);
  // ---- 排屑机（后）+ 铁屑车 ----
  const chip = S({ map: chipT, roughness: 0.6, metalness: 0.6 }); chipT.repeat.set(8, 1);
  rb(1.8, 0.22, 0.42, M.gunD, -0.3, 0.17, -1.02, root, 0.02); bx(1.75, 0.01, 0.34, chip, -0.3, 0.285, -1.02);
  const inc = rb(0.9, 0.2, 0.42, M.gunD, 0.92, 0.55, -1.02, root, 0.02); inc.rotation.z = 0.75; add(new THREE.CylinderGeometry(0.09, 0.09, 0.2, 16), M.black, 1.25, 0.88, -0.88).rotation.x = Math.PI / 2;
  rb(0.5, 0.35, 0.42, M.bin, 1.5, 0.3, -1.02, root, 0.02); for (const x of [1.32, 1.68]) add(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 10), M.black, x, 0.05, -0.8).rotation.x = Math.PI / 2;
  // ---- 螺丝（实例化）----
  const BG = new THREE.CylinderGeometry(0.011, 0.011, 0.008, 6), bI = new THREE.InstancedMesh(BG, M.steel, bolts.filter(b => b[3] !== 'zd').length); let bi = 0;
  const rX = new THREE.Matrix4().makeRotationX(Math.PI / 2), rZ = new THREE.Matrix4().makeRotationZ(Math.PI / 2);
  bolts.forEach(b => { if (b[3] === 'zd') { const [, , , , d, xx, yy] = b; add(BG, M.steel, xx, yy, 0.017, d, false).rotation.x = Math.PI / 2; return; }
    const mm = (b[3] === 'z' ? rX.clone() : b[3] === 'y' ? new THREE.Matrix4() : rZ.clone()).setPosition(b[0], b[1], b[2]); bI.setMatrixAt(bi++, mm); }); root.add(bI);
  root.traverse(o => { if (o.isInstancedMesh) o.receiveShadow = true; });
  const ease = t => t * t * (3 - 2 * t);
  const update = (t, ph = 0) => { const c = ((t + ph) % 18) / 18; const open = ease(Math.min(1, Math.max(0, (c - 0.05) / 0.12))) - ease(Math.min(1, Math.max(0, (c - 0.55) / 0.12)));
    dR.position.x = 0.06 - open * 0.74; const cut = 1 - open; tbl.position.x = -0.25 + Math.sin(t * 0.7 + ph) * 0.22 * cut; head.position.y = iy + 0.95 - (0.12 + Math.sin(t * 1.3 + ph) * 0.04) * cut;
    spin.rotation.y += 0.6 * cut; disk.rotation.x = t * 0.15; lit[0].emissiveIntensity = 3 + Math.sin(t * 3) * 0.5; };
  return { root, update };
}
