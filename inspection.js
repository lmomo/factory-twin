// 视觉检测站 VIS-200：型材框架 + 紫色饰板 + PC 防护 + 内部输送 + 龙门相机/环形光 + 蓝色扫描光幕 + 剔除气缸/废料箱 + HMI
import * as THREE from 'three';
import { M, S, ctex, glow, kit, stripeMat, warnT, plateTex } from './kit.js';
export function buildInspection() {
  const root = new THREE.Group(); const { add, rb, bx, tube, cyl, bolt, boltRect, inst, flush, stack, plane } = kit(root);
  const fx = 1.25, fz = 0.78, H = 2.3;
  rb(2.7, 0.12, 1.7, M.base, 0, 0.06, 0, root, 0.03);
  // 型材立柱 + 横梁（带槽线）
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { rb(0.09, H - 0.12, 0.09, M.gun, sx * fx, 0.12 + (H - 0.12) / 2, sz * fz, root, 0.012); bx(0.095, H - 0.2, 0.012, M.seam, sx * fx, H / 2 + 0.06, sz * (fz + 0.042)); bx(0.012, H - 0.2, 0.095, M.seam, sx * (fx + 0.042), H / 2 + 0.06, sz * fz); }
  for (const y of [0.9, H]) { for (const sz of [-1, 1]) rb(2.59, 0.07, 0.07, M.gun, 0, y, sz * fz, root, 0.01); for (const sx of [-1, 1]) rb(0.07, 0.07, 1.65, M.gun, sx * fx, y, 0, root, 0.01); }
  // 下部紫色饰板 + 警示条 + 缝
  for (const sz of [-1, 1]) { rb(2.4, 0.7, 0.03, M.purple, 0, 0.5, sz * (fz - 0.005), root, 0.01); for (const x of [-0.4, 0.4]) bx(0.012, 0.7, 0.035, M.seam, x, 0.5, sz * (fz - 0.005)); }
  bx(2.4, 0.05, 0.01, stripeMat(14), 0, 0.82, fz + 0.012); boltRect(-1.16, 1.16, 0.2, 0.78, fz + 0.012); boltRect(-0.36, 0.36, 0.2, 0.78, fz + 0.012);
  for (const sx of [-1, 1]) { rb(0.03, 0.7, 1.5, M.gunD, sx * (fx - 0.005), 0.5, 0, root, 0.01); inst(new THREE.BoxGeometry(0.012, 0.016, 0.5), M.seam, Array.from({ length: 8 }, (_, i) => [sx * (fx + 0.012), 0.3 + i * 0.05, -0.35])); }
  // PC 防护罩（前后整面 + 侧面留输送开口）
  for (const sz of [-1, 1]) { plane(2.42, 1.33, M.poly, 0, 1.6, sz * fz); bx(0.04, 1.33, 0.04, M.gun, 0, 1.6, sz * fz, root, true); }
  for (const sx of [-1, 1]) { plane(1.5, 1.05, M.poly, sx * fx, 1.74, 0, Math.PI / 2); bx(0.05, 0.05, 1.5, M.gun, sx * fx, 1.2, 0, root, true); }
  // 顶板 + 紫色饰条 + 顶灯 + 铭牌
  rb(2.62, 0.05, 1.68, M.gunD, 0, H + 0.06, 0, root, 0.015); bx(2.62, 0.06, 0.02, M.purple, 0, H + 0.02, fz + 0.045);
  bx(1.8, 0.02, 0.06, M.lamp, 0, H - 0.05, 0.25);
  plane(0.6, 0.15, S({ map: plateTex('VIS-200', '视觉检测站', 'VISION INSPECTION', '#b07bff'), roughness: 0.4, metalness: 0.4 }), -0.6, 0.6, fz + 0.016);
  plane(0.14, 0.14, S({ map: warnT, transparent: true }), 0.75, 0.6, fz + 0.016);
  // 线槽（顶部）
  bx(2.3, 0.01, 0.16, M.alu, 0, H + 0.1, -0.45, root, true); for (const s of [-1, 1]) bx(2.3, 0.06, 0.01, M.alu, 0, H + 0.13, -0.45 + s * 0.08, root, true);
  for (let i = 0; i < 3; i++) tube([[-1.15, H + 0.12, -0.49 + i * 0.04], [0, H + 0.12, -0.49 + i * 0.04], [1.15, H + 0.12, -0.49 + i * 0.04]], 0.012, [M.black, M.blueHose, M.black][i]);
  inst(new THREE.BoxGeometry(0.02, 0.08, 0.18), M.alu, [-0.9, -0.3, 0.3, 0.9].map(x => [x, H + 0.13, -0.45]));
  // ---- 内部输送段 ----
  const beltT = ctex(64, 64, (g) => { g.fillStyle = '#1a1d21'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#2b3036'; for (let i = 0; i < 64; i += 8) g.fillRect(i, 0, 3, 64); }); beltT.wrapS = beltT.wrapT = THREE.RepeatWrapping; beltT.repeat.set(14, 1);
  bx(3.36, 0.02, 0.48, S({ map: beltT, roughness: 0.8 }), 0, 0.86, 0);
  for (const s of [-1, 1]) rb(3.4, 0.12, 0.04, M.alu, 0, 0.82, s * 0.27, root, 0.01);
  inst(new THREE.BoxGeometry(0.05, 0.74, 0.05), M.alu, [[-1.6, 0.4, -0.25], [-1.6, 0.4, 0.25], [1.6, 0.4, -0.25], [1.6, 0.4, 0.25]]);
  inst(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12), M.steel, [[-1.68, 0.84, 0, Math.PI / 2], [1.68, 0.84, 0, Math.PI / 2]]);
  cyl(0.07, 0.07, 0.14, M.black, 1.6, 0.7, 0.34).rotation.x = Math.PI / 2; // 驱动电机
  const prod = [0, 1, 2].map(i => rb(0.24, 0.16, 0.2, M.carton, 0, 0.95, 0, root, 0.015));
  // ---- 龙门 + 工业相机 + 环形光 ----
  for (const s of [-1, 1]) rb(0.07, 1.15, 0.07, M.alu, -0.1, 1.48, s * 0.62, root, 0.01);
  rb(0.1, 0.1, 1.32, M.alu, -0.1, 2.05, 0, root, 0.01); bx(0.012, 0.012, 1.3, M.seam, -0.1, 2.05, 0.0).position.x = -0.152;
  const rings = [];
  const camU = (x, y, z, rx = 0, rz = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(rx, 0, rz); root.add(g);
    rb(0.09, 0.16, 0.09, M.black, 0, 0, 0, g, 0.01); bx(0.092, 0.03, 0.092, M.purple, 0, 0.05, 0, g); cyl(0.032, 0.032, 0.08, M.gunD, 0, -0.12, 0, g); cyl(0.025, 0.025, 0.005, glow(0x113355, 1), 0, -0.162, 0, g, 16, false);
    const rm = glow(0xcfe6ff, 1.0); rings.push(rm); const r = add(new THREE.TorusGeometry(0.075, 0.014, 8, 28), rm, 0, -0.17, 0, g, false); r.rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(0.09, 0.008, 6, 28), M.gun, 0, -0.17, 0, g).rotation.x = Math.PI / 2;
    tube([[0, 0.08, 0], [0.04, 0.16, 0], [0.12, 0.2, 0]], 0.008, M.black, g); return g; };
  camU(-0.1, 1.88, -0.22); camU(-0.1, 1.88, 0.22); camU(-0.75, 1.45, 0.5, -0.7, 0.3); camU(0.6, 1.45, -0.5, 0.7, -0.3);
  // 激光发射器 + 蓝色扫描光幕
  rb(0.12, 0.08, 0.5, M.black, 0.45, 2.0, 0, root, 0.01); bx(0.02, 0.01, 0.46, glow(0x5fd0ff, 1.4), 0.45, 1.955, 0);
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.05), new THREE.MeshBasicMaterial({ color: 0x5fc8ff, transparent: true, opacity: 0.14, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false })); beam.rotation.y = Math.PI / 2; beam.position.set(0.45, 1.42, 0); root.add(beam);
  const line = bx(0.02, 0.004, 0.46, glow(0x7fd8ff, 2.2), 0.45, 0.873, 0);
  // ---- 剔除气缸 + 推板 + 滑槽 + NG 箱 ----
  cyl(0.045, 0.045, 0.34, M.alu, 0.95, 0.95, -0.5).rotation.x = Math.PI / 2; cyl(0.05, 0.05, 0.03, M.gunD, 0.95, 0.95, -0.33).rotation.x = Math.PI / 2; cyl(0.05, 0.05, 0.03, M.gunD, 0.95, 0.95, -0.67).rotation.x = Math.PI / 2;
  const rod = cyl(0.012, 0.012, 0.3, M.steel, 0.95, 0.95, -0.2); rod.rotation.x = Math.PI / 2; const pad = rb(0.22, 0.1, 0.025, M.purple, 0.95, 0.95, -0.05, root, 0.008);
  tube([[0.95, 1.0, -0.62], [0.95, 1.25, -0.7], [0.5, 2.2, -0.6]], 0.008, M.blueHose); tube([[0.95, 1.0, -0.4], [0.9, 1.3, -0.55], [0.45, 2.2, -0.5]], 0.008, M.blueHose);
  const ch = rb(0.3, 0.02, 0.5, M.steel, 0.95, 0.62, 0.95, root, 0.005); ch.rotation.x = 0.5;
  rb(0.5, 0.4, 0.4, S({ color: 0xd8312b, roughness: 0.5 }), 0.95, 0.2, 1.25, root, 0.03); plane(0.2, 0.1, S({ map: ctex(128, 64, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#d8312b'; g.font = 'bold 48px sans-serif'; g.fillText('NG', 30, 50); }) }), 0.95, 0.28, 1.452);
  // ---- HMI ----
  const scr = ctex(256, 192, (g) => { g.fillStyle = '#0a0f1f'; g.fillRect(0, 0, 256, 192); g.fillStyle = '#3a2470'; g.fillRect(0, 0, 256, 24); g.fillStyle = '#e8dcff'; g.font = 'bold 15px "Noto Sans CJK SC",sans-serif'; g.fillText('视觉检测  CAM×4  运行', 8, 17);
    g.font = '15px monospace'; [['长度', '25.02 mm'], ['宽度', '18.98 mm'], ['高度', '12.01 mm']].forEach(([a, v], i) => { g.fillStyle = '#b07bff'; g.fillText(a, 10, 52 + i * 24); g.fillStyle = '#eef'; g.fillText(v, 60, 52 + i * 24); });
    g.fillStyle = '#3ddc84'; g.font = 'bold 34px sans-serif'; g.fillText('OK', 170, 80); g.font = '14px monospace'; g.fillText('良率 99.2%', 160, 110); g.fillStyle = '#123'; g.fillRect(8, 130, 240, 52); g.strokeStyle = '#5fd0ff'; g.beginPath(); for (let x = 0; x < 236; x++) g.lineTo(10 + x, 160 - Math.sin(x / 7) * 8 - (x % 37 === 0 ? 14 : 0)); g.stroke(); });
  const hm = new THREE.Group(); hm.position.set(1.5, 0, 0.98); hm.rotation.y = -0.5; root.add(hm);
  rb(0.25, 0.04, 0.25, M.gunD, 0, 0.02, 0, hm, 0.01); cyl(0.03, 0.03, 1.2, M.gun, 0, 0.62, 0, hm);
  const sb = rb(0.42, 0.32, 0.06, M.gun, 0, 1.36, 0.02, hm, 0.02); sb.rotation.x = -0.25; const sp = plane(0.36, 0.26, S({ color: 0, emissive: 0xffffff, emissiveMap: scr, emissiveIntensity: 1.2 }), 0, 1.365, 0.06, 0, hm); sp.rotation.x = -0.25;
  inst(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 10), S({ color: 0xe8ecef }), [0, 1, 2].map(i => [-0.08 + i * 0.08, 1.17, 0.07, Math.PI / 2 - 0.25]), hm);
  // 三色灯 + 螺丝
  const lit = stack(1.1, H + 0.085, 0.6, root, 0);
  for (const sx of [-1.2, 1.2]) for (const sz of [-0.74, 0.74]) bolt(sx, H + 0.087, sz, 'y');
  flush();
  const update = (t) => { beltT.offset.x = -t * 0.25 % 1; prod.forEach((p, i) => { p.position.x = -1.6 + ((t * 0.18 + i / 3) % 1) * 3.2; });
    beam.position.x = line.position.x = 0.45 + Math.sin(t * 1.6) * 0.35; beam.material.opacity = 0.14 + Math.sin(t * 6) * 0.04;
    const c = (t % 6) / 6, push = Math.sin(Math.min(1, Math.max(0, (c - 0.7) / 0.2)) * Math.PI); rod.position.z = -0.2 + push * 0.3; pad.position.z = -0.05 + push * 0.3;
    rings.forEach((m, i) => m.emissiveIntensity = 0.9 + (Math.sin(t * 9 + i) > 0.9 ? 1.0 : 0)); lit[0].emissiveIntensity = 3 + Math.sin(t * 3) * 0.4; };
  return { root, update };
}
