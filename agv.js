// 黄黑 AGV：底盘/防撞条、旋转激光雷达、前后安全扫描仪、驱动轮+万向轮、状态灯带、急停、充电触点、顶升板+料箱、警示贴、状态屏
import * as THREE from 'three';
import { M, S, ctex, glow, kit, stripeMat, warnT } from './kit.js';
export function buildAGV({ id = 'AGV-01', fault = false, bin = 0x2f7dff } = {}) {
  const g = new THREE.Group(); const { add, rb, bx, tube, cyl, bolt, inst, flush, plane } = kit(g);
  const L = 1.1, W = 0.78;
  rb(L - 0.06, 0.12, W, M.black, 0, 0.1, 0, g, 0.03);
  rb(L - 0.12, 0.22, W - 0.04, M.yellow, 0, 0.27, 0, g, 0.05);
  bx(L - 0.2, 0.012, W - 0.03, M.seam, 0, 0.38, 0); // 顶缝
  // 防撞条 + 警示条
  for (const s of [-1, 1]) { rb(0.07, 0.11, W - 0.02, M.rubber, s * (L / 2 - 0.02), 0.14, 0, g, 0.03); const st = plane(W - 0.1, 0.05, stripeMat(6), s * (L / 2 + 0.017), 0.14, 0, s * Math.PI / 2); }
  for (const s of [-1, 1]) plane(L - 0.24, 0.04, stripeMat(8), 0, 0.32, s * (W / 2 - 0.018), s > 0 ? 0 : Math.PI);
  // 安全扫描仪（前后）
  for (const s of [-1, 1]) { rb(0.07, 0.07, 0.16, M.black, s * (L / 2 - 0.04), 0.25, 0, g, 0.01); plane(0.12, 0.035, S({ color: 0x220808, emissive: 0x801818, emissiveIntensity: 0.6, roughness: 0.1 }), s * (L / 2 - 0.004), 0.25, 0, s * Math.PI / 2); }
  // 激光雷达
  cyl(0.065, 0.07, 0.04, M.black, 0.4, 0.4, 0); cyl(0.025, 0.025, 0.3, M.alu, 0.4, 0.55, 0); const lid = new THREE.Group(); lid.position.set(0.4, 0.73, 0); g.add(lid);
  cyl(0.055, 0.055, 0.06, M.gunD, 0, 0, 0, lid, 20); cyl(0.056, 0.056, 0.016, glow(0x39d0ff, 2.2), 0, 0.005, 0, lid, 20, false); bx(0.02, 0.03, 0.03, glow(0xff3030, 3), 0.055, 0, 0, lid); cyl(0.05, 0.055, 0.015, M.black, 0, 0.037, 0, lid, 20);
  // 驱动轮 + 万向轮（实例化）
  inst(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 20), M.rubber, [-1, 1].map(s => [0, 0.075, s * (W / 2 - 0.04), Math.PI / 2]));
  inst(new THREE.CylinderGeometry(0.04, 0.04, 0.052, 12), M.steel, [-1, 1].map(s => [0, 0.075, s * (W / 2 - 0.035), Math.PI / 2]));
  inst(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 12), M.rubber, [-1, 1].flatMap(x => [-1, 1].map(z => [x * 0.4, 0.035, z * 0.27, Math.PI / 2])));
  inst(new THREE.BoxGeometry(0.05, 0.04, 0.05), M.alu, [-1, 1].flatMap(x => [-1, 1].map(z => [x * 0.4, 0.07, z * 0.27])));
  // 状态灯带
  const led = S({ color: 0, emissive: fault ? 0xff2020 : 0x3ddc84, emissiveIntensity: 3 });
  for (const s of [-1, 1]) { bx(L - 0.3, 0.03, 0.012, led, 0, 0.2, s * (W / 2 - 0.012)); bx(0.012, 0.03, W - 0.2, led, s * (L / 2 - 0.052), 0.2, 0); }
  // 急停 + 充电触点
  cyl(0.04, 0.045, 0.03, M.yellow, -0.4, 0.395, 0.27); cyl(0.032, 0.03, 0.03, S({ color: 0xd8212b, roughness: 0.35, clearcoat: 1 }), -0.4, 0.425, 0.27); cyl(0.02, 0.02, 0.01, S({ color: 0xd8212b, roughness: 0.3 }), -0.4, 0.445, 0.27);
  for (const x of [-0.3, -0.18]) rb(0.08, 0.035, 0.006, M.copper, x, 0.15, W / 2 + 0.002, g, 0.004);
  // 警示贴 + 编号
  const lbl = ctex(256, 64, (c) => { c.fillStyle = '#111'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#f2c230'; c.font = 'bold 44px sans-serif'; c.fillText(id, 18, 48); });
  for (const s of [-1, 1]) { plane(0.26, 0.065, S({ map: lbl, roughness: 0.5 }), 0.12, 0.25, s * (W / 2 - 0.018) + s * 0.001, s > 0 ? 0 : Math.PI); plane(0.08, 0.08, S({ map: warnT, transparent: true }), -0.18, 0.26, s * (W / 2 - 0.017), s > 0 ? 0 : Math.PI); }
  // 状态屏（尾部）
  const scrT = ctex(160, 96, (c) => { c.fillStyle = fault ? '#2a0606' : '#06140c'; c.fillRect(0, 0, 160, 96); c.fillStyle = '#eee'; c.font = 'bold 20px sans-serif'; c.fillText(id, 10, 26); c.fillStyle = fault ? '#ff4040' : '#3ddc84'; c.font = 'bold 22px "Noto Sans CJK SC",sans-serif'; c.fillText(fault ? '故障 E-204' : '运行  86%', 10, 58); c.fillStyle = '#334'; c.fillRect(10, 72, 140, 10); c.fillStyle = fault ? '#ff4040' : '#3ddc84'; c.fillRect(10, 72, fault ? 40 : 120, 10); });
  const sc = rb(0.04, 0.1, 0.16, M.black, -0.47, 0.42, -0.2, g, 0.01); sc.rotation.z = 0.35; const sp = plane(0.13, 0.08, S({ color: 0, emissive: 0xffffff, emissiveMap: scrT, emissiveIntensity: 1.3 }), -0.49, 0.425, -0.2, -Math.PI / 2); sp.rotation.order = 'YXZ'; sp.rotation.x = -0.35;
  // 顶升板 + 料箱
  const lift = new THREE.Group(); g.add(lift); cyl(0.09, 0.09, 0.06, M.steel, -0.08, 0.4, 0, lift);
  rb(0.72, 0.035, 0.6, M.gun, -0.08, 0.44, 0, lift, 0.01); for (const s of [-1, 1]) bx(0.72, 0.012, 0.02, M.seam, -0.08, 0.46, s * 0.2, lift);
  const bm = S({ color: bin, roughness: 0.5, metalness: 0.05 }); rb(0.6, 0.3, 0.5, bm, -0.08, 0.61, 0, lift, 0.025); rb(0.63, 0.03, 0.53, bm, -0.08, 0.76, 0, lift, 0.012);
  for (const s of [-1, 1]) bx(0.012, 0.04, 0.12, M.seam, -0.08 + s * 0.301, 0.7, 0, lift); plane(0.16, 0.08, S({ map: ctex(128, 64, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#111'; for (let i = 0; i < 30; i++) c.fillRect(8 + i * 3.8, 8, i % 3 ? 1.5 : 2.5, 34); c.font = '12px monospace'; c.fillText('BIN-' + id.slice(4), 30, 58); }) }), -0.08, 0.6, 0.252, 0, lift);
  inst(new THREE.BoxGeometry(0.2, 0.12, 0.16), S({ color: 0x4a5058, roughness: 0.6 }), [[-0.2, 0.75, -0.1], [0.05, 0.74, 0.08]], lift);
  for (const x of [-0.4, 0.4]) for (const z of [-0.32, 0.32]) bolt(x, 0.382, z, 'y'); flush();
  const update = (t) => { lid.rotation.y = t * 7; led.emissiveIntensity = fault ? (Math.sin(t * 8) > 0 ? 9 : 0.15) : 2.6 + Math.sin(t * 2) * 0.3; lift.position.y = fault ? 0 : Math.max(0, Math.sin(t * 0.5)) * 0.03; };
  return { g, update, fault };
}
