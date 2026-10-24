// 封箱机 PK-60：输送进/出料、折盖臂、胶带机头、纸箱料仓、橙色内光、带门防护、HMI、气管、纸箱封箱动画
import * as THREE from 'three';
import { M, S, ctex, glow, kit, stripeMat, warnT, plateTex } from './kit.js';
export function buildPacker() {
  const root = new THREE.Group(); const { add, rb, bx, tube, cyl, bolt, boltRect, inst, flush, stack, plane } = kit(root);
  const L = 1.7, D = 1.1, bt = 0.72, H = 1.7, hx = L / 2, hz = D / 2;
  // 机座
  rb(L, 0.5, D - 0.1, M.gunD, 0, 0.35, 0, root, 0.03); for (const x of [-0.3, 0.3]) bx(0.012, 0.5, D - 0.09, M.seam, x, 0.35, 0);
  inst(new THREE.CylinderGeometry(0.04, 0.05, 0.1, 12), M.black, [-1, 1].flatMap(sx => [-1, 1].map(sz => [sx * (hx - 0.08), 0.05, sz * (hz - 0.1)])));
  bx(L, 0.05, 0.01, stripeMat(10), 0, 0.57, hz - 0.045); boltRect(-hx + 0.05, hx - 0.05, 0.16, 0.55, hz - 0.045);
  plane(0.56, 0.14, S({ map: plateTex('PK-60', '自动封箱机', 'CASE ERECT / SEAL', '#ff9a2e'), roughness: 0.4, metalness: 0.4 }), -0.4, 0.38, hz - 0.044);
  plane(0.13, 0.13, S({ map: warnT, transparent: true }), 0.35, 0.38, hz - 0.044);
  // 立柱 + 顶框
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { rb(0.07, H - 0.6, 0.07, M.gun, sx * hx, 0.6 + (H - 0.6) / 2, sz * hz, root, 0.01); bx(0.012, H - 0.65, 0.073, M.seam, sx * (hx + 0.034), 0.6 + (H - 0.6) / 2, sz * hz); }
  for (const sz of [-1, 1]) rb(L + 0.07, 0.07, 0.07, M.gun, 0, H, sz * hz, root, 0.01); for (const sx of [-1, 1]) rb(0.07, 0.07, D, M.gun, sx * hx, H, 0, root, 0.01);
  rb(L + 0.1, 0.05, D + 0.1, M.gunD, 0, H + 0.06, 0, root, 0.015); bx(L + 0.1, 0.05, 0.02, S({ color: 0xe08a2a, metalness: 0.3, roughness: 0.4 }), 0, H + 0.03, hz + 0.055);
  // 前侧双开门（框 + PC + 把手 + 铰链），后侧整面 PC
  const doors = [];
  for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * hx, 0, hz + 0.02); root.add(g); doors.push(g); const w = hx - 0.01, cx = -s * w / 2;
    for (const y of [0.64, 1.62]) rb(w, 0.04, 0.03, M.gun, cx, y, 0, g, 0.008); for (const x of [cx - w / 2 + 0.02, cx + w / 2 - 0.02]) rb(0.04, 1.0, 0.03, M.gun, x, 1.13, 0, g, 0.008);
    plane(w - 0.06, 0.94, M.poly, cx, 1.13, 0, 0, g); rb(0.025, 0.25, 0.03, M.steel, cx + s * (w / 2 - 0.08), 1.13, 0.03, g, 0.01);
    for (const y of [0.75, 1.5]) cyl(0.012, 0.012, 0.08, M.steel, 0, y, 0.0, g, 8); }
  plane(L, 1.0, M.poly, 0, 1.13, -hz);
  // 橙色内光
  plane(L - 0.2, 0.7, glow(0xff7a1a, 1.4), 0, 1.15, -hz + 0.04); const pl = new THREE.PointLight(0xff8a2a, 0.7, 2.2, 2); pl.position.set(0, 1.3, 0); root.add(pl);
  bx(L - 0.2, 0.02, 0.04, glow(0xffa040, 2.2), 0, H - 0.05, 0.2);
  // 输送：进料 / 机内侧皮带 / 出料（滚筒实例化）
  const rl = []; for (const [x0, x1] of [[-1.4, -0.86], [0.86, 1.4]]) { for (let x = x0; x <= x1 + 1e-3; x += 0.08) rl.push([x, bt - 0.02, 0, Math.PI / 2]); for (const s of [-1, 1]) rb(x1 - x0 + 0.06, 0.08, 0.03, M.alu, (x0 + x1) / 2, bt - 0.03, s * 0.28, root, 0.008); inst(new THREE.BoxGeometry(0.04, bt - 0.06, 0.04), M.alu, [[x0 + 0.02, (bt - 0.06) / 2, -0.26], [x0 + 0.02, (bt - 0.06) / 2, 0.26]].map(a => [a[0] + (x0 < 0 ? 0 : x1 - x0 - 0.04), a[1], a[2]])); }
  rl.push(...Array.from({ length: 21 }, (_, i) => [-0.8 + i * 0.08, bt - 0.02, 0, Math.PI / 2])); inst(new THREE.CylinderGeometry(0.022, 0.022, 0.52, 12), M.steel, rl);
  const sbT = ctex(64, 16, (g) => { g.fillStyle = '#16181b'; g.fillRect(0, 0, 64, 16); g.fillStyle = '#2a2e33'; for (let i = 0; i < 64; i += 6) g.fillRect(i, 0, 2, 16); }); sbT.wrapS = THREE.RepeatWrapping; sbT.repeat.set(8, 1);
  for (const s of [-1, 1]) { rb(1.5, 0.2, 0.04, S({ map: sbT, roughness: 0.8 }), 0, bt + 0.17, s * 0.24, root, 0.01); for (const x of [-0.75, 0.75]) cyl(0.06, 0.06, 0.22, M.gunD, x, bt + 0.17, s * 0.24); rb(1.4, 0.08, 0.06, M.gun, 0, bt + 0.34, s * 0.3, root, 0.01); }
  // 顶部：折盖臂（摆动）、导杆、胶带机头
  const top = bt + 0.36;
  rb(0.6, 0.12, 0.4, M.gun, -0.05, H - 0.12, 0, root, 0.015);
  for (const s of [-1, 1]) tube([[-0.8, top + 0.32, s * 0.24], [-0.4, top + 0.12, s * 0.16], [-0.1, top + 0.03, s * 0.04], [0.8, top + 0.03, s * 0.04]], 0.012, M.steel);
  const arm = new THREE.Group(); arm.position.set(-0.55, H - 0.12, 0); root.add(arm); rb(0.04, 0.42, 0.06, M.steel, 0, -0.21, 0, arm, 0.01); rb(0.16, 0.03, 0.14, M.black, 0.06, -0.42, 0, arm, 0.008);
  cyl(0.03, 0.03, 0.2, M.alu, -0.25, H - 0.2, 0.0).rotation.z = 0.9;
  const tape = new THREE.Group(); tape.position.set(0.3, top + 0.12, 0); root.add(tape);
  rb(0.42, 0.18, 0.1, M.black, 0, 0.04, 0, tape, 0.015); const roll = add(new THREE.TorusGeometry(0.08, 0.035, 10, 28), M.tape, 0.02, 0.2, 0, tape); roll.rotation.y = 0;
  cyl(0.045, 0.045, 0.06, M.steel, 0.02, 0.2, 0, tape).rotation.x = Math.PI / 2; for (const x of [-0.17, 0.17]) cyl(0.025, 0.025, 0.08, M.rubber, x, -0.06, 0, tape).rotation.x = Math.PI / 2;
  rb(0.06, 0.02, 0.07, S({ color: 0xff3b3b, roughness: 0.4 }), 0.1, -0.05, 0, tape, 0.004); cyl(0.012, 0.012, 0.15, M.steel, 0, 0.2, 0, tape, 8).position.y = 0.3;
  // 纸箱料仓（后侧，平板纸箱实例化）
  const mg = new THREE.Group(); mg.position.set(-0.4, 0.6, -hz - 0.22); root.add(mg);
  for (const x of [-0.32, 0.32]) rb(0.04, 0.8, 0.04, M.alu, x, 0.4, 0, mg, 0.01); rb(0.7, 0.03, 0.3, M.alu, 0, 0.02, 0, mg, 0.008); rb(0.7, 0.03, 0.3, M.alu, 0, 0.8, 0, mg, 0.008);
  inst(new THREE.BoxGeometry(0.62, 0.6, 0.012), M.carton, Array.from({ length: 12 }, (_, i) => [0, 0.36, -0.12 + i * 0.019, 0.12]), mg);
  const sucker = add(new THREE.CylinderGeometry(0.03, 0.04, 0.05, 12), M.rubber, 0, 0.5, 0.17, mg); sucker.rotation.x = Math.PI / 2;
  // 气管 + 过滤减压阀
  rb(0.12, 0.22, 0.1, M.alu, hx + 0.08, 1.0, -0.3, root, 0.015); cyl(0.04, 0.04, 0.03, M.gunD, hx + 0.08, 1.14, -0.3);
  tube([[hx + 0.08, 1.12, -0.3], [hx + 0.1, H + 0.2, -0.3], [0.3, H + 0.15, -0.2], [-0.25, H - 0.12, -0.05]], 0.009, M.blueHose); tube([[hx + 0.08, 0.9, -0.3], [hx - 0.05, 0.75, -0.42], [-0.4, 0.8, -0.5], [-0.4, 1.0, -hz - 0.15]], 0.009, M.blueHose);
  tube([[hx + 0.06, 1.12, -0.28], [hx + 0.2, 1.6, 0.1], [0.3, H + 0.1, 0.1], [0.3, top + 0.3, 0.02]], 0.007, M.black);
  // HMI
  const scr = ctex(256, 192, (g) => { g.fillStyle = '#100a04'; g.fillRect(0, 0, 256, 192); g.fillStyle = '#6a3a10'; g.fillRect(0, 0, 256, 24); g.fillStyle = '#ffe3c0'; g.font = 'bold 15px "Noto Sans CJK SC",sans-serif'; g.fillText('封箱机  自动  运行中', 8, 17);
    g.font = '15px "Noto Sans CJK SC",monospace'; [['速度', '12 箱/分'], ['今日', '4,382 箱'], ['胶带', '68 %']].forEach(([a, v], i) => { g.fillStyle = '#ff9a2e'; g.fillText(a, 10, 52 + i * 26); g.fillStyle = '#fff'; g.fillText(v, 60, 52 + i * 26); });
    g.fillStyle = '#ff9a2e'; g.fillRect(150, 40, 90, 70); g.fillStyle = '#100a04'; g.fillRect(156, 46, 78, 58); g.fillStyle = '#3ddc84'; g.font = 'bold 22px sans-serif'; g.fillText('RUN', 170, 82); g.fillStyle = '#331c08'; g.fillRect(10, 140, 236, 14); g.fillStyle = '#ff9a2e'; g.fillRect(10, 140, 160, 14); });
  const hm = new THREE.Group(); hm.position.set(-hx - 0.2, 0, hz + 0.15); hm.rotation.y = 0.5; root.add(hm); rb(0.22, 0.04, 0.22, M.gunD, 0, 0.02, 0, hm, 0.01); cyl(0.028, 0.028, 1.1, M.gun, 0, 0.57, 0, hm);
  const sb = rb(0.38, 0.3, 0.06, M.gun, 0, 1.24, 0.02, hm, 0.02); sb.rotation.x = -0.25; plane(0.32, 0.24, S({ color: 0, emissive: 0xffffff, emissiveMap: scr, emissiveIntensity: 1.2 }), 0, 1.245, 0.06, 0, hm).rotation.x = -0.25;
  cyl(0.03, 0.03, 0.03, S({ color: 0xd8212b, roughness: 0.4 }), 0.12, 1.06, 0.08, hm).rotation.x = Math.PI / 2;
  const lit = stack(hx - 0.1, H + 0.085, -hz + 0.1, root, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bolt(sx * (hx - 0.02), H + 0.087, sz * (hz - 0.0), 'y');
  flush();
  // 纸箱（4 片盖 + 胶带）
  const mkCarton = () => { const g = new THREE.Group(); root.add(g); const w = 0.5, h = 0.34, d = 0.4; rb(w, h, d, M.carton, 0, h / 2, 0, g, 0.008); bx(w + 0.002, 0.04, d + 0.002, S({ color: 0x8a6038, roughness: 0.9 }), 0, h * 0.35, 0);
    plane(0.12, 0.08, S({ map: ctex(96, 64, (c) => { c.fillStyle = '#c8925a'; c.fillRect(0, 0, 96, 64); c.strokeStyle = '#222'; c.lineWidth = 3; c.strokeRect(4, 4, 88, 56); c.fillStyle = '#222'; c.font = 'bold 18px sans-serif'; c.fillText('↑↑ 易碎', 10, 40); }) }), 0.12, 0.2, d / 2 + 0.002, 0, g);
    const fl = []; for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(0, h, s * d / 2); g.add(p); bx(w - 0.01, 0.006, d / 2, M.carton, 0, 0, -s * d / 4, p, true); fl.push({ p, ax: 'x', s, k: 0.12 }); }
    for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(s * w / 2, h - 0.004, 0); g.add(p); bx(0.2, 0.006, d - 0.02, M.carton, -s * 0.1, 0, 0, p, true); fl.push({ p, ax: 'z', s, k: 0 }); }
    const tp = bx(1, 0.004, 0.06, M.tape, 0, h + 0.006, 0, g); return { g, fl, tp, w, h }; };
  const cartons = [mkCarton(), mkCarton()];
  const sm = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
  const update = (t) => { sbT.offset.x = -t * 0.4 % 1; let armA = 0;
    cartons.forEach((c, i) => { const u = ((t / 9) + i * 0.5) % 1, x = -1.35 + u * 2.7; c.g.position.set(x, bt + 0.005, 0);
      const fs = sm(-0.75, -0.5, x), fsB = sm(-0.15, 0.05, x), fl = sm(-0.45, -0.1, x);
      c.fl.forEach(f => { if (f.ax === 'z') { const v = f.s > 0 ? fs : fsB; f.p.rotation.z = -f.s * 1.2 * (1 - v); } else f.p.rotation.x = f.s * 1.25 * (1 - fl); });
      const tl = Math.min(c.w + 0.1, Math.max(0.001, (0.3 + c.w / 2 - x) < 0 ? c.w + 0.1 : (x + c.w / 2 - 0.3 + 0.05))); c.tp.scale.x = Math.max(0.001, Math.min(c.w + 0.1, x + c.w / 2 - 0.25)); c.tp.position.x = c.w / 2 + 0.05 - c.tp.scale.x / 2; c.tp.visible = c.tp.scale.x > 0.01;
      if (Math.abs(x + 0.55) < 0.35) armA = Math.max(armA, Math.sin((x + 0.9) / 0.7 * Math.PI)); });
    arm.rotation.z = -0.9 + armA * 0.9; roll.rotation.z = -t * 2; doors.forEach(d => d.rotation.y = 0); lit[0].emissiveIntensity = 3 + Math.sin(t * 3) * 0.4; pl.intensity = 0.7 + Math.sin(t * 2) * 0.1; };
  return { root, update };
}
