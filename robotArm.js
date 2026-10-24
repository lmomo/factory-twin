// 程序化六轴机械臂：6 个独立部件，按关节层级组织（参考 fpv-drone-lab 的建模方式）
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const S = o => new THREE.MeshStandardMaterial(o), Ph = o => new THREE.MeshPhysicalMaterial(o);
export const M = {
  paint: Ph({ color: 0xf5b301, roughness: 0.3, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12 }),
  dark: S({ color: 0x2a2e35, roughness: 0.45, metalness: 0.75 }),
  cast: S({ color: 0x3b4048, roughness: 0.7, metalness: 0.6 }),
  steel: S({ color: 0xc3c9d0, roughness: 0.22, metalness: 1 }),
  bolt: S({ color: 0x15171a, roughness: 0.35, metalness: 0.9 }),
  rubber: S({ color: 0x141518, roughness: 0.85 }),
  label: S({ color: 0x111111, roughness: 0.5 }),
  glow: S({ color: 0x000000, emissive: 0x3ddc84, emissiveIntensity: 2.5 }),
};
const mesh = (g, m, p) => { const o = new THREE.Mesh(g, m); o.castShadow = o.receiveShadow = true; if (p) p.add(o); return o; };
// 拉伸带倒角的侧板轮廓（臂杆主体）
function linkGeo(len, r0, r1, depth) {
  const s = new THREE.Shape(); s.absarc(0, 0, r0, Math.PI / 2, Math.PI * 1.5, false);
  s.lineTo(len, -r1); s.absarc(len, 0, r1, -Math.PI / 2, Math.PI / 2, false); s.lineTo(0, r0);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4, curveSegments: 32 });
  g.translate(0, 0, -depth / 2); return g;
}
// 电机盖：圆盘 + 一圈螺栓 + 中心铭牌
function motorCap(r, parent, z, dir = 1) {
  const g = new THREE.Group(); g.position.z = z; parent.add(g);
  const c = mesh(new THREE.CylinderGeometry(r, r, 0.05, 48), M.dark, g); c.rotation.x = Math.PI / 2;
  const c2 = mesh(new THREE.CylinderGeometry(r * 0.72, r * 0.72, 0.02, 48), M.cast, g); c2.rotation.x = Math.PI / 2; c2.position.z = 0.03 * dir;
  const bg = new THREE.CylinderGeometry(0.013, 0.013, 0.03, 6);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const b = mesh(bg, M.bolt, g); b.rotation.x = Math.PI / 2; b.position.set(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86, 0.03 * dir); }
  return g;
}
const cable = (pts, parent, r = 0.018) => mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 48, r, 10), M.rubber, parent);

export function buildArm() {
  const root = new THREE.Group(); const parts = [];
  const part = (parent, pos, info) => { const joint = new THREE.Group(); joint.position.set(...pos); parent.add(joint);
    const off = new THREE.Group(); joint.add(off); parts.push({ joint, off, ...info }); return off; };

  // 1 底座
  const base = part(root, [0, 0, 0], { name: '底座', desc: '固定在地面，承受整机重量和反作用力', exp: [0, -0.05, 0] });
  mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.08, 64), M.cast, base).position.y = 0.04;
  mesh(new THREE.CylinderGeometry(0.46, 0.55, 0.22, 64), M.dark, base).position.y = 0.19;
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2;
    const rib = mesh(new THREE.BoxGeometry(0.04, 0.2, 0.14), M.cast, base); rib.position.set(Math.cos(a) * 0.53, 0.18, Math.sin(a) * 0.53); rib.rotation.y = -a;
    const b = mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 6), M.bolt, base); b.position.set(Math.cos(a + 0.4) * 0.6, 0.1, Math.sin(a + 0.4) * 0.6); }
  const ring = mesh(new THREE.TorusGeometry(0.47, 0.012, 8, 64), M.glow, base); ring.rotation.x = Math.PI / 2; ring.position.y = 0.3;

  // 2 腰部转台
  const waist = part(base, [0, 0.3, 0], { name: '腰部转台', desc: '伺服电机驱动绕竖直轴旋转，决定机械臂朝向', exp: [0, 0.35, 0], axis: 'y' });
  mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.18, 64), M.paint, waist).position.y = 0.09;
  for (const z of [-0.2, 0.2]) { const y = mesh(new RoundedBoxGeometry(0.5, 0.55, 0.12, 4, 0.05), M.paint, waist); y.position.set(0.02, 0.42, z); }
  const back = mesh(new RoundedBoxGeometry(0.28, 0.32, 0.5, 4, 0.06), M.paint, waist); back.position.set(-0.3, 0.3, 0);
  const m1 = mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.26, 32), M.dark, waist); m1.position.set(-0.3, 0.55, 0);
  motorCap(0.2, waist, 0.27).position.y = 0.6; motorCap(0.2, waist, -0.27, -1).position.y = 0.6;
  const plate = mesh(new THREE.BoxGeometry(0.16, 0.06, 0.005), M.label, waist); plate.position.set(0.05, 0.25, 0.262);

  // 3 大臂（绕 z 俯仰）
  const upper = part(waist, [0, 0.6, 0], { name: '大臂', desc: '肩部电机带动前后俯仰，决定工作半径', exp: [0.3, 0.35, 0.55], axis: 'z' });
  const ug = mesh(linkGeo(1.15, 0.17, 0.13, 0.22), M.paint, upper); ug.rotation.z = Math.PI / 2;
  const rib = mesh(new THREE.BoxGeometry(0.06, 0.8, 0.24), M.paint, upper); rib.position.set(-0.11, 0.58, 0);
  motorCap(0.15, upper, 0.16).position.y = 1.15; motorCap(0.15, upper, -0.16, -1).position.y = 1.15;
  for (const y of [0.35, 0.65, 0.95]) { const cl = mesh(new RoundedBoxGeometry(0.1, 0.05, 0.28, 2, 0.015), M.dark, upper); cl.position.set(-0.13, y, 0); }
  cable([[-0.16, 0.05, 0.08], [-0.2, 0.5, 0.09], [-0.18, 1.0, 0.09], [-0.1, 1.28, 0.06]], upper);
  cable([[-0.16, 0.05, -0.08], [-0.2, 0.5, -0.09], [-0.18, 1.0, -0.09], [-0.1, 1.28, -0.06]], upper);

  // 4 小臂
  const fore = part(upper, [0, 1.15, 0], { name: '小臂', desc: '肘部电机驱动上下摆动，配合大臂到达目标高度', exp: [0, 0.45, 0.5], axis: 'z' });
  const hous = mesh(new RoundedBoxGeometry(0.36, 0.3, 0.3, 4, 0.07), M.paint, fore); hous.position.set(-0.08, 0.02, 0);
  const fg = mesh(linkGeo(0.95, 0.12, 0.085, 0.16), M.paint, fore); fg.position.x = 0.02;
  const motor3 = mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.22, 32), M.dark, fore); motor3.rotation.z = Math.PI / 2; motor3.position.set(-0.32, 0.02, 0);
  mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.02, 32), M.cast, fore).position.set(-0.43, 0.02, 0); fore.children.at(-1).rotation.z = Math.PI / 2;
  const tube = mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.55, 32), M.steel, fore); tube.rotation.z = Math.PI / 2; tube.position.set(0.55, 0, 0);
  cable([[-0.2, 0.15, 0.05], [0.2, 0.17, 0.06], [0.7, 0.12, 0.05], [0.95, 0.05, 0.03]], fore, 0.014);

  // 5 手腕
  const wrist = part(fore, [1.0, 0, 0], { name: '手腕', desc: '两轴旋转调整末端姿态，让夹爪对准工件', exp: [0.45, 0.15, 0.4], axis: 'x' });
  const wh = mesh(new THREE.SphereGeometry(0.1, 32, 24), M.paint, wrist);
  const wy = mesh(new RoundedBoxGeometry(0.14, 0.18, 0.22, 4, 0.04), M.paint, wrist); wy.position.x = 0.05;
  motorCap(0.075, wrist, 0.115).position.x = 0.05; motorCap(0.075, wrist, -0.115, -1).position.x = 0.05;
  const fl = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 32), M.steel, wrist); fl.rotation.z = Math.PI / 2; fl.position.x = 0.15;

  // 6 末端夹爪
  const grip = part(wrist, [0.18, 0, 0], { name: '末端夹爪', desc: '气动手指开合，完成抓取和释放', exp: [0.4, -0.15, 0.3], axis: 'x' });
  const gb = mesh(new RoundedBoxGeometry(0.1, 0.16, 0.12, 3, 0.02), M.dark, grip); gb.position.x = 0.05;
  const valve = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12), M.steel, grip); valve.position.set(0.04, 0.1, 0);
  const fingers = [];
  for (const s of [-1, 1]) { const f = new THREE.Group(); f.position.set(0.1, s * 0.04, 0); grip.add(f);
    mesh(new THREE.BoxGeometry(0.12, 0.025, 0.07), M.steel, f).position.x = 0.06;
    const pad = mesh(new THREE.BoxGeometry(0.05, 0.012, 0.06), M.rubber, f); pad.position.set(0.1, -s * 0.016, 0); fingers.push({ f, s }); }
  return { root, parts, fingers, status: ring };
}
