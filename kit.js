// 设备建模公共工具：PBR 材质、贴图、圆角盒、实例化螺丝、三色灯、铭牌
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
export const P = o => new THREE.MeshPhysicalMaterial(o), S = o => new THREE.MeshStandardMaterial(o);
export const ctex = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
export const glow = (c, i = 2.5) => S({ color: 0, emissive: c, emissiveIntensity: i });
export const M = {
  gun: P({ color: 0x4c535c, metalness: 0.7, roughness: 0.36, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
  gunD: P({ color: 0x30353c, metalness: 0.7, roughness: 0.42, clearcoat: 0.2 }),
  purple: P({ color: 0x6a44c8, metalness: 0.25, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
  yellow: P({ color: 0xf2b705, metalness: 0.25, roughness: 0.34, clearcoat: 0.8, clearcoatRoughness: 0.2 }),
  base: S({ color: 0x24282d, metalness: 0.6, roughness: 0.5 }),
  steel: S({ color: 0xb4bcc4, metalness: 1, roughness: 0.25 }),
  alu: S({ color: 0x9aa2aa, metalness: 0.9, roughness: 0.35 }),
  black: S({ color: 0x15171b, metalness: 0.4, roughness: 0.55 }),
  rubber: S({ color: 0x0b0c0e, metalness: 0, roughness: 0.85 }),
  seam: S({ color: 0x0a0c0f, metalness: 0.3, roughness: 0.7 }),
  copper: S({ color: 0xc8823e, metalness: 1, roughness: 0.3 }),
  blueHose: S({ color: 0x2f7dff, metalness: 0.1, roughness: 0.45 }),
  carton: S({ color: 0xc8925a, roughness: 0.85, emissive: 0xff7a1a, emissiveIntensity: 0.08 }),
  tape: S({ color: 0xb08850, roughness: 0.3, metalness: 0.1 }),
  poly: P({ color: 0x8fb4d0, metalness: 0, roughness: 0.06, transparent: true, opacity: 0.16, envMapIntensity: 0.6, depthWrite: false, side: THREE.DoubleSide }),
  lamp: S({ color: 0, emissive: 0xeaf4ff, emissiveIntensity: 0.6 }),
};
const stripeBase = ctex(128, 16, (g) => { g.fillStyle = '#111'; g.fillRect(0, 0, 128, 16); g.fillStyle = '#f2c230'; for (let i = -16; i < 144; i += 16) { g.beginPath(); g.moveTo(i, 16); g.lineTo(i + 8, 0); g.lineTo(i + 16, 0); g.lineTo(i + 8, 16); g.fill(); } });
export const stripeMat = (rep) => { const t = stripeBase.clone(); t.wrapS = THREE.RepeatWrapping; t.repeat.set(rep, 1); t.needsUpdate = true; return S({ map: t, roughness: 0.55 }); };
export const warnT = ctex(128, 128, (g) => { g.fillStyle = '#f2c230'; g.beginPath(); g.moveTo(64, 6); g.lineTo(122, 116); g.lineTo(6, 116); g.closePath(); g.fill(); g.lineWidth = 6; g.strokeStyle = '#111'; g.stroke(); g.fillStyle = '#111'; g.font = 'bold 70px sans-serif'; g.fillText('!', 50, 104); });
export const plateTex = (a, b, c, col = '#3ddc84') => ctex(512, 128, (g) => { g.fillStyle = '#1a1d22'; g.fillRect(0, 0, 512, 128); g.strokeStyle = '#9aa4ae'; g.lineWidth = 4; g.strokeRect(4, 4, 504, 120); g.fillStyle = '#eef2f6'; g.font = 'bold 54px sans-serif'; g.fillText(a, 22, 74); g.fillStyle = col; g.font = '600 30px "Noto Sans CJK SC",sans-serif'; g.fillText(b, 270, 58); g.fillStyle = '#8a96a4'; g.font = '19px sans-serif'; g.fillText(c, 270, 96); });
export function kit(root) {
  const add = (geo, m, x, y, z, p = root, sh = true) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = sh; o.receiveShadow = true; p.add(o); return o; };
  const rb = (w, h, d, m, x, y, z, p = root, r = 0.012, sh = true) => add(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.1, h / 2.1, d / 2.1)), m, x, y, z, p, sh);
  const bx = (w, h, d, m, x, y, z, p = root, sh = false) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, p, sh);
  const tube = (pts, r, m, p = root) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(a => new THREE.Vector3(...a))), 40, r, 8), m, 0, 0, 0, p);
  const cyl = (rt, rb_, h, m, x, y, z, p = root, seg = 16, sh = true) => add(new THREE.CylinderGeometry(rt, rb_, h, seg), m, x, y, z, p, sh);
  const bolts = new Map(); const bolt = (x, y, z, ax = 'z', p = root) => { if (!bolts.has(p)) bolts.set(p, []); bolts.get(p).push([x, y, z, ax]); };
  const boltRect = (x0, x1, y0, y1, z, p = root) => { for (const x of [x0, x1]) for (const y of [y0, y1]) bolt(x, y, z, 'z', p); };
  const inst = (geo, m, list, p = root) => { const im = new THREE.InstancedMesh(geo, m, list.length); const o = new THREE.Object3D(); list.forEach((a, i) => { o.position.set(a[0], a[1], a[2]); o.rotation.set(a[3] || 0, a[4] || 0, a[5] || 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.castShadow = im.receiveShadow = true; p.add(im); return im; };
  const flush = () => { const G = new THREE.CylinderGeometry(0.011, 0.011, 0.008, 6); bolts.forEach((l, p) => inst(G, M.steel, l.map(([x, y, z, ax]) => [x, y, z, ax === 'z' ? Math.PI / 2 : 0, 0, ax === 'x' ? Math.PI / 2 : 0]), p)); };
  const stack = (x, y, z, p = root, on = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); p.add(g); cyl(0.05, 0.06, 0.04, M.black, 0, 0.02, 0, g); cyl(0.012, 0.012, 0.2, M.steel, 0, 0.12, 0, g, 8);
    const cols = [0x3ddc84, 0xff9a2e, 0xff3b3b], lit = cols.map((c, i) => S({ color: i === on ? 0 : [0x0a2a14, 0x3a2a08, 0x3a0a0a][i], emissive: c, emissiveIntensity: i === on ? 3.2 : 0.12 }));
    lit.forEach((m, i) => { cyl(0.045, 0.045, 0.08, m, 0, 0.26 + i * 0.085, 0, g, 20, false); cyl(0.047, 0.047, 0.006, M.black, 0, 0.3 + i * 0.085, 0, g, 20, false); }); cyl(0.04, 0.047, 0.03, M.black, 0, 0.53, 0, g, 20); return lit; };
  const plane = (w, h, m, x, y, z, ry = 0, p = root) => { const o = add(new THREE.PlaneGeometry(w, h), m, x, y, z, p, false); o.rotation.y = ry; return o; };
  return { add, rb, bx, tube, cyl, bolt, boltRect, inst, flush, stack, plane };
}
