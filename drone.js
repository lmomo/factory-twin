// 程序化四旋翼无人机：机身、4 组机臂+电机+桨叶、云台、电池、吊挂货箱
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
const S = o => new THREE.MeshStandardMaterial(o);
const DM = {
  shell: new THREE.MeshPhysicalMaterial({ color: 0xe8edf2, roughness: 0.3, metalness: 0.1, clearcoat: 0.8 }),
  dark: S({ color: 0x23272e, roughness: 0.4, metalness: 0.7 }),
  carbon: S({ color: 0x15181c, roughness: 0.5, metalness: 0.4 }),
  prop: S({ color: 0x0e1012, roughness: 0.4, transparent: true, opacity: 0.85 }),
  lens: S({ color: 0x050608, roughness: 0.05, metalness: 1 }),
  batt: S({ color: 0x2b6fd8, roughness: 0.45, metalness: 0.3 }),
  crate: S({ color: 0xe08a2a, roughness: 0.6, metalness: 0.05 }),
  strap: S({ color: 0x222222, roughness: 0.8 }),
  ledG: S({ color: 0, emissive: 0x3ddc84, emissiveIntensity: 3 }),
  ledR: S({ color: 0, emissive: 0xff3b3b, emissiveIntensity: 3 }),
  ledB: S({ color: 0, emissive: 0x39b6ff, emissiveIntensity: 4 }),
};
const mesh = (g, m, p) => { const o = new THREE.Mesh(g, m); o.castShadow = true; p.add(o); return o; };
export function buildDrone() {
  const root = new THREE.Group(), props = [];
  const body = mesh(new RoundedBoxGeometry(0.62, 0.2, 0.42, 4, 0.08), DM.shell, root);
  mesh(new RoundedBoxGeometry(0.4, 0.06, 0.3, 3, 0.03), DM.dark, root).position.y = 0.12;
  mesh(new THREE.BoxGeometry(0.3, 0.02, 0.02), DM.ledB, root).position.set(0, 0.0, 0.215);
  // 电池（顶部插拔）
  const bat = mesh(new RoundedBoxGeometry(0.34, 0.08, 0.2, 3, 0.02), DM.batt, root); bat.position.y = 0.18;
  // 4 组机臂 + 电机 + 桨
  const armG = new THREE.CylinderGeometry(0.025, 0.03, 0.62, 12), motG = new THREE.CylinderGeometry(0.055, 0.06, 0.09, 24);
  const bladeG = new RoundedBoxGeometry(0.5, 0.008, 0.055, 2, 0.004);
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz], i) => {
    const a = mesh(armG, DM.carbon, root); a.rotation.z = Math.PI / 2; a.rotation.y = Math.atan2(-sz, sx);
    a.position.set(sx * 0.3, 0.05, sz * 0.25);
    const m = mesh(motG, DM.dark, root); m.position.set(sx * 0.55, 0.1, sz * 0.47);
    mesh(new THREE.SphereGeometry(0.02, 8, 8), DM.ledB, root).position.set(sx * 0.55, 0.03, sz * 0.47);
    const p = new THREE.Group(); p.position.set(sx * 0.55, 0.16, sz * 0.47); root.add(p);
    mesh(bladeG, DM.prop, p); mesh(bladeG, DM.prop, p).rotation.y = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 12), DM.shell, p); props.push({ p, dir: i % 3 ? 1 : -1 });
  });
  // 起落架
  for (const s of [-1, 1]) { const l = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 8), DM.dark, root); l.rotation.z = Math.PI / 2; l.position.set(0, -0.26, s * 0.18);
    for (const x of [-0.15, 0.15]) mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), DM.dark, root).position.set(x, -0.17, s * 0.18); }
  // 云台相机
  const gim = new THREE.Group(); gim.position.set(0.26, -0.12, 0); root.add(gim);
  mesh(new THREE.SphereGeometry(0.07, 20, 16), DM.dark, gim);
  const lens = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 16), DM.lens, gim); lens.rotation.z = Math.PI / 2; lens.position.x = 0.06;
  // 吊挂货箱
  const crate = new THREE.Group(); crate.position.y = -0.48; root.add(crate);
  mesh(new RoundedBoxGeometry(0.36, 0.28, 0.32, 3, 0.03), DM.crate, crate);
  mesh(new THREE.BoxGeometry(0.37, 0.04, 0.33), DM.strap, crate);
  for (const x of [-0.12, 0.12]) mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 6), DM.strap, root).position.set(x, -0.3, 0);
  root.scale.setScalar(2.4);
  return { root, props, body };
}
