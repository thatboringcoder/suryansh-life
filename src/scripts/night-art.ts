/** Hand-shaped silhouette frames and small reusable scenery textures.
 * These canvases are baked once at scene creation, never repainted per frame. */
export const random = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
type Context = CanvasRenderingContext2D;
type Point = [number, number];
export const WALK_FRAMES = 48;
export const STRIDE = 88;
export const BOY_FRAME = { width: 128, height: 160, x: 64, y: 153 };
export const idleFrame = WALK_FRAMES * 3;
export function gait(phase: number, amount: number) {
  return { bob: Math.cos(phase * Math.PI * 4) * 1.8 * amount, swing: Math.cos(phase * Math.PI * 2) * 12 * amount };
}
function shape(c: Context, path: string, fill: string) {
  c.fillStyle = fill;
  c.fill(new Path2D(path));
}
function oval(c: Context, x: number, y: number, rx: number, ry: number, fill: string, rotation = 0) {
  c.fillStyle = fill; c.beginPath(); c.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2); c.fill();
}
function limb(c: Context, a: Point, b: Point, widthA: number, widthB: number, color: string) {
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const nx = Math.sin(angle), ny = -Math.cos(angle);
  c.fillStyle = color; c.beginPath();
  c.moveTo(a[0] + nx * widthA, a[1] + ny * widthA);
  c.lineTo(b[0] + nx * widthB, b[1] + ny * widthB);
  c.quadraticCurveTo(b[0] + Math.cos(angle) * widthB, b[1] + Math.sin(angle) * widthB, b[0] - nx * widthB, b[1] - ny * widthB);
  c.lineTo(a[0] - nx * widthA, a[1] - ny * widthA); c.closePath(); c.fill();
  oval(c, a[0], a[1], widthA, widthA, color);
}
function foot(phase: number, amount: number, side: number): Point {
  const t = phase % 1;
  // The planted foot travels at exactly the inverse of world speed for 60% of a cycle.
  const x = t < .6 ? 26.4 - STRIDE * t : -26.4 + 52.8 * ((t - .6) / .4);
  const lift = t < .6 ? 0 : Math.sin((t - .6) / .4 * Math.PI) * 11;
  return [x * amount + side * 5 * (1 - amount), -5 - lift * amount];
}
function leg(c: Context, hip: Point, ankle: Point, front: boolean) {
  const dx = ankle[0] - hip[0], dy = ankle[1] - hip[1];
  const d = Math.max(1, Math.hypot(dx, dy));
  const a = Math.min(d / 2, 24), bend = Math.sqrt(Math.max(0, 24 * 24 - a * a));
  const knee: Point = [hip[0] + dx * .5 + dy / d * bend, hip[1] + dy * .5 - dx / d * bend];
  const skin = front ? '#111316' : '#080a0c';
  limb(c, hip, knee, 5.8, 4.8, skin); limb(c, knee, ankle, 4.8, 3.5, skin);
  // A broad shoe shape, not a line at the end of a stick leg.
  c.save(); c.translate(...ankle);
  shape(c, 'M-4 -3 Q0 -5 4 -2 L7 0 Q14 -1 15 3 Q15 6 9 6 L-5 6 Q-8 2 -4 -3Z', '#060708');
  shape(c, 'M-5 5 L12 5 L11 6 L-5 6Z', '#37383a'); c.restore();
}
function boy(c: Context, phase: number, amount: number) {
  const { bob, swing } = gait(phase, amount);
  const hip: Point = [-2, -51 + bob];
  leg(c, [-5, hip[1]], foot((phase + .5) % 1, amount, -1), false);
  // Far arm moves opposite the near arm, with a relaxed elbow.
  limb(c, [-8, -96 + bob], [-12 + swing * .45, -76 + bob], 5, 3.5, '#090b0d');
  limb(c, [-12 + swing * .45, -76 + bob], [-9 + swing, -60 + bob], 3.5, 3, '#090b0d');
  leg(c, [3, hip[1]], foot(phase, amount, 1), true);
  c.save(); c.translate(0, bob);
  shape(c, 'M-13 -69 Q1 -74 14 -67 L15 -47 L4 -45 L-1 -55 L-3 -45 L-15 -47Z', '#0b0e11');
  shape(c, 'M-13 -68 L-12 -49 L-5 -48 L-5 -66Z', '#14171a');
  // Loose shirt, rounded shoulders, small upright neck.
  shape(c, 'M-5 -110 L6 -110 L7 -99 L-5 -98Z', '#17191b');
  shape(c, 'M-5 -103 Q-13 -103 -18 -93 L-15 -83 L-10 -84 L-12 -68 Q0 -64 15 -69 L11 -85 L16 -87 Q14 -101 6 -103Z', '#171b1e');
  shape(c, 'M-5 -101 Q-12 -100 -16 -93 L-14 -89 Q-9 -97 -5 -98Z', '#444643');
  shape(c, 'M-8 -88 Q-8 -76 -10 -71 L9 -70 Q-4 -74 -8 -88Z', '#101316');
  // The near arm emerges from a sleeve, with weight in the hand and elbow.
  limb(c, [10, -90], [11 - swing * .45, -75], 4.8, 3.8, '#14171a');
  limb(c, [11 - swing * .45, -75], [13 - swing, -60], 3.8, 3.1, '#14171a');
  oval(c, 13 - swing, -59, 3.4, 4.3, '#121518', -.12);
  shape(c, 'M7 -99 Q13 -99 16 -88 L7 -84 L4 -94Z', '#202428');
  // Child proportions: a substantial head, cheek, small nose and messy hair.
  shape(c, 'M-13 -128 Q-13 -142 1 -141 Q15 -139 16 -127 L18 -122 L16 -120 Q16 -109 6 -108 L-5 -110 Q-15 -113 -13 -128Z', '#101315');
  oval(c, -10, -121, 3.7, 4.7, '#1c2022');
  shape(c, 'M-15 -117 L-18 -123 L-16 -128 L-21 -130 L-17 -136 L-19 -139 L-11 -140 L-9 -146 L-4 -144 L1 -149 L4 -144 L11 -147 L11 -142 L18 -142 L15 -136 L18 -131 L13 -129 L10 -133 L5 -130 L0 -133 L-5 -127 L-10 -128 L-11 -117Z', '#080a0b');
  shape(c, 'M-17 -136 L-11 -139 L-9 -144 L-7 -140 L1 -146 L-2 -141 L-10 -136Z', '#5c5b51');
  shape(c, 'M11 -140 L15 -140 L12 -135 L9 -134Z', '#363b3d');
  c.restore();
}
export function boySheet() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048; canvas.height = 1600;
  const c = canvas.getContext('2d')!;
  for (let i = 0; i <= idleFrame; i++) {
    const amount = i === idleFrame ? 0 : (Math.floor(i / WALK_FRAMES) + 1) / 3;
    c.save(); c.translate(i % 16 * BOY_FRAME.width + BOY_FRAME.x, Math.floor(i / 16) * BOY_FRAME.height + BOY_FRAME.y);
    boy(c, (i % WALK_FRAMES) / WALK_FRAMES, amount); c.restore();
  }
  return canvas;
}
export function eyesTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 20;
  const c = canvas.getContext('2d')!;
  c.shadowColor = '#ded9c2'; c.shadowBlur = 3;
  oval(c, 12, 10, 1.7, 2.5, '#dedcca'); oval(c, 19, 9.5, 1.2, 2, '#e7e5d6');
  return canvas;
}
export function pathTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256;
  const c = canvas.getContext('2d')!;
  const wash = c.createLinearGradient(0, 60, 0, 150);
  wash.addColorStop(0, '#111518'); wash.addColorStop(.3, '#060809'); wash.addColorStop(1, '#010203');
  c.fillStyle = wash; c.fillRect(0, 64, 1024, 192);
  for (let i = 0; i < 1800; i++) {
    const x = random(i) * 1024, y = 62 + random(i + 23) ** 3 * 90;
    c.fillStyle = `rgba(163,160,140,${.015 + random(i + 2) * .12 * (1 - (y - 62) / 100)})`;
    c.fillRect(x, y, 1 + random(i + 8) * 9, .6 + random(i + 9));
  }
  for (let i = 0; i < 240; i++) {
    const x = random(i + 300) * 1024, height = 4 + random(i + 10) * 21;
    c.strokeStyle = i % 4 ? '#080c0d' : '#343936'; c.lineWidth = .7 + random(i) * 1.1;
    c.beginPath(); c.moveTo(x, 68); c.quadraticCurveTo(x + 2, 64 - height * .7, x + (random(i + 9) - .5) * 16, 64 - height); c.stroke();
  }
  return canvas;
}
export function mistTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
  const c = canvas.getContext('2d')!;
  c.scale(1, .25);
  const gradient = c.createRadialGradient(256, 256, 0, 256, 256, 256);
  gradient.addColorStop(0, '#9ba6a923'); gradient.addColorStop(1, '#9ba6a900');
  c.fillStyle = gradient; c.fillRect(0, 0, 512, 512); return canvas;
}

/** A recessed amber window; its painted surround stays transparent. */
export function windowLightTexture() {
  const canvas = document.createElement('canvas'); canvas.width = 90; canvas.height = 110;
  const c = canvas.getContext('2d')!;
  const spill = c.createRadialGradient(45, 55, 8, 45, 55, 44);
  spill.addColorStop(0, '#b18b4538'); spill.addColorStop(1, '#b18b4500');
  c.fillStyle = spill; c.fillRect(0, 0, 90, 110);
  const glass = c.createLinearGradient(0, 30, 0, 80);
  glass.addColorStop(0, '#7c6231'); glass.addColorStop(.55, '#a38347'); glass.addColorStop(1, '#53452b');
  c.fillStyle = glass; c.fillRect(31, 29, 28, 53);
  c.fillStyle = '#151713'; c.fillRect(44, 29, 2, 53); c.fillRect(31, 54, 28, 3);
  return canvas;
}
