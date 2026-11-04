import Phaser from 'phaser';
import { BOY_FRAME, WALK_FRAMES, STRIDE, boySheet, eyesTexture, gait, idleFrame, mistTexture, pathTexture, random, windowLightTexture } from './night-art';
import { nightAudio } from './night-audio';

const host = document.querySelector<HTMLElement>('#night-game')!;
const intro = document.querySelector<HTMLElement>('.intro')!;
const caption = document.querySelector<HTMLElement>('.chapter-caption')!;
const end = document.querySelector<HTMLElement>('.end-note')!;
const status = document.querySelector<HTMLElement>('#game-status')!;
const begin = document.querySelector<HTMLButtonElement>('#begin')!;
const pause = document.querySelector<HTMLButtonElement>('#motion-toggle')!;
const number = document.querySelector<HTMLElement>('#chapter-number')!;
const name = document.querySelector<HTMLElement>('#chapter-name')!;
const description = document.querySelector<HTMLElement>('#chapter-description')!;
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-chapter]')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const chapters = [
  ['THE FIRST LIGHT', 'Chiranjeeve School', 'The beginning. Before the world became so big.'],
  ['ANOTHER DOOR', 'Oxford Public School', 'A different place. Another part of me.'],
  ['THE YEARS BETWEEN', 'Sarala Birla Public School', 'Some places stay with you long after you leave.'],
  ['BEYOND THE TREES', 'KIIT', 'Still learning. Still curious. Still walking.'],
];
const stops = [660, 1860, 3060, 4260];
const WORLD_END = 4620;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smooth = (v: number) => { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
const attribute = (el: Element, key: string, value: string) => { if (el.getAttribute(key) !== value) el.setAttribute(key, value); };
let target = 0, position = 0, speed = 0, held = 0, started = false, active = -1;
let lastStep = 0, distance = 0, paused = false, ready = false;
let cinematic = false, stillFor = 0;
function setCinematic(value: boolean) {
  if (cinematic === value) return;
  cinematic = value;
  document.body.classList.toggle('is-walking', value);
  host.dataset.walking = String(value);
}
function stopWalking() {
  pressed.clear(); held = 0; target = position; speed = 0;
  stillFor = 1; setCinematic(false);
}
const pressed = new Set<string>();
function start() { started = true; intro.classList.add('departing'); }
function go(index: number) {
  if (!ready) return;
  start(); target = stops[clamp(index, 0, stops.length - 1)];
  if (reduced.matches) { position = target; speed = 0; }
}
function clearInput() {
  if (pressed.size || held) { target = position; speed = 0; }
  pressed.clear(); held = 0;
}
addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || (e.target instanceof HTMLElement && e.target.closest('input,textarea,select,[contenteditable=true]'))) return;
  if (ready && (e.key === 'Escape' || e.key === 'Tab')) stopWalking();
  if (ready && ['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
    e.preventDefault(); start(); pressed.add(e.key.toLowerCase());
  }
});
addEventListener('keyup', e => {
  const key = e.key.toLowerCase(); if (!pressed.has(key)) return;
  pressed.delete(key); if (!pressed.size) target = position;
});
addEventListener('blur', clearInput);
document.addEventListener('visibilitychange', () => { if (document.hidden) clearInput(); });
document.querySelectorAll<HTMLButtonElement>('[data-walk]').forEach(button => {
  button.addEventListener('pointerdown', e => {
    if (!ready) return;
    start(); held = Number(button.dataset.walk); button.setPointerCapture(e.pointerId);
  });
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(event, () => { held = 0; target = position; });
  button.addEventListener('keydown', e => {
    if (ready && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); start(); held = Number(button.dataset.walk); }
  });
  button.addEventListener('keyup', e => { if (e.key === 'Enter' || e.key === ' ') { held = 0; target = position; } });
  button.addEventListener('blur', clearInput);
});
buttons.forEach(b => b.addEventListener('click', () => go(Number(b.dataset.chapter))));
begin.addEventListener('click', () => go(0));
// A tap on the unobstructed scene stops an automatic walk on touch devices.
host.addEventListener('pointerdown', () => { if (cinematic) stopWalking(); });
host.parentElement!.addEventListener('wheel', e => {
  if (!ready || e.ctrlKey) return;
  e.preventDefault(); start(); target = clamp(target + clamp(e.deltaY + e.deltaX, -250, 250) * 1.7, 0, WORLD_END);
}, { passive: false });
pause.addEventListener('click', () => {
  paused = !paused; pause.setAttribute('aria-pressed', String(paused));
  pause.textContent = paused ? 'Resume motion' : 'Pause motion';
  stopWalking();
});

interface Scenery { image: Phaser.GameObjects.Image; x: number; size: number; factor: number; foreground: boolean; seed: number }
class Night extends Phaser.Scene {
  backdrop!: Phaser.GameObjects.Image;
  buildings: Phaser.GameObjects.Image[] = [];
  windows: Phaser.GameObjects.Image[] = [];
  trees: Scenery[] = [];
  path: Phaser.GameObjects.Image[] = [];
  fog: Phaser.GameObjects.Image[] = [];
  motes: Phaser.GameObjects.Arc[] = [];
  boy!: Phaser.GameObjects.Image;
  eyes!: Phaser.GameObjects.Image;
  shadow!: Phaser.GameObjects.Ellipse;
  cameraX = 0;
  facing = 1;
  clock = 0;
  nextTelemetry = 0;
  nextBlink = 2600;
  blinkUntil = 0;
  missing = false;
  preload() {
    this.load.image('forest', '/art/night/forest.webp');
    this.load.image('architecture', '/art/night/buildings.webp');
    this.load.image('tree', '/art/night/tree.webp');
    this.load.on('loaderror', () => { this.missing = true; });
  }
  create() {
    if (this.missing) {
      status.textContent = 'The scenery could not load. Reload to try again, or visit Blog and Work above.';
      host.dataset.state = 'error'; return;
    }
    const sheet = this.textures.addCanvas('boy', boySheet())!;
    for (let i = 0; i <= idleFrame; i++) sheet.add(i, 0, i % 16 * BOY_FRAME.width, Math.floor(i / 16) * BOY_FRAME.height, BOY_FRAME.width, BOY_FRAME.height);
    this.textures.addCanvas('eyes', eyesTexture());
    this.textures.addCanvas('path', pathTexture());
    this.textures.addCanvas('mist', mistTexture());
    this.textures.addCanvas('window-light', windowLightTexture());
    const architecture = this.textures.get('architecture');
    const source = architecture.getSourceImage() as HTMLImageElement;
    const fw = source.width / 2, fh = source.height / 2;
    for (let i = 0; i < 4; i++) architecture.add(i, 0, (i % 2) * fw, Math.floor(i / 2) * fh, fw, fh);
    this.backdrop = this.add.image(0, 0, 'forest').setDepth(0);
    for (let i = -1; i < 6; i++) {
      this.trees.push({ image: this.add.image(0, 0, 'tree').setOrigin(.5, .965).setDepth(1).setTint(0x4b5155).setFlipX(i % 2 === 0), x: i * 1670 + 900, size: 470 + random(i) * 230, factor: .48, foreground: false, seed: i });
    }
    for (let i = 0; i < 4; i++) this.buildings.push(this.add.image(0, 0, 'architecture', i).setOrigin(.5, i < 2 ? .92 : .855).setDepth(2).setTint(0xa8aaa9));
    for (let i = 0; i < 4; i++) this.windows.push(this.add.image(0, 0, 'window-light').setDepth(2.1));
    for (let i = 0; i < 3; i++) this.fog.push(this.add.image(0, 0, 'mist').setDepth(i === 2 ? 7 : 3));
    for (let i = 0; i < 8; i++) this.path.push(this.add.image(0, 0, 'path').setOrigin(0, .25).setDepth(4));
    this.shadow = this.add.ellipse(0, 0, 48, 8, 0x000000, .6).setDepth(5);
    this.boy = this.add.image(0, 0, 'boy', idleFrame).setOrigin(BOY_FRAME.x / BOY_FRAME.width, BOY_FRAME.y / BOY_FRAME.height).setDepth(6);
    this.eyes = this.add.image(0, 0, 'eyes').setDepth(6);
    for (let i = -1; i < 8; i++) {
      // Sparse foreground trunks frame the view without continually hiding the player.
      this.trees.push({ image: this.add.image(0, 0, 'tree').setOrigin(.5, .965).setDepth(8).setTint(0x11171b).setFlipX(i % 2 === 0), x: i * 1800 - 430, size: 1030 + random(i + 19) * 190, factor: 1.14, foreground: true, seed: i + 50 });
    }
    for (let i = 0; i < 10; i++) this.motes.push(this.add.circle(0, 0, .65 + random(i) * .45, 0xd6d5c7, .15).setDepth(7));
    ready = true; begin.disabled = false; status.hidden = true;
    host.dataset.state = 'ready'; host.dataset.renderer = this.game.renderer.type === Phaser.WEBGL ? 'webgl' : 'canvas';
    this.game.events.on(Phaser.Core.Events.BLUR, clearInput);
  }
  update(_time: number, delta: number) {
    if (!ready) return;
    const dt = Math.min(delta / 1000, .05);
    if (!paused && !reduced.matches) this.clock += dt * 1000;
    const direction = held + (pressed.has('arrowright') || pressed.has('d') ? 1 : 0) - (pressed.has('arrowleft') || pressed.has('a') ? 1 : 0);
    if (direction && !paused) { start(); target = clamp(position + Math.sign(direction) * 170, 0, WORLD_END); }
    const wanted = paused ? 0 : clamp((target - position) * 2.5, -128, 128);
    speed += (wanted - speed) * (1 - Math.exp(-dt * 9));
    if (Math.abs(target - position) < .25 && Math.abs(speed) < 1) { position = target; speed = 0; }
    const before = position;
    position = clamp(position + speed * dt, 0, WORLD_END);
    if (position === before && Math.abs(target - position) < .25) speed = 0;
    distance += Math.abs(position - before);
    if (Math.abs(speed) > 2) this.facing = Math.sign(speed);
    const walking = !paused && (Math.abs(speed) > 2 || Math.abs(target - position) > 1);
    stillFor = walking ? 0 : stillFor + dt;
    if (walking) setCinematic(true);
    else if (stillFor > .6 || paused) setCinematic(false);
    this.cameraX += (position - this.cameraX) * (reduced.matches ? 1 : 1 - Math.exp(-dt * 8));
    const nearest = stops.reduce((best, stop, i) => Math.abs(position - stop) < Math.abs(position - stops[best]) ? i : best, 0);
    const proximity = 1 - smooth((Math.abs(position - stops[nearest]) - 70) / 275);
    if (!cinematic && nearest !== active && proximity > .1) {
      active = nearest; number.textContent = `0${active + 1} / ${chapters[active][0]}`;
      name.textContent = chapters[active][1]; description.textContent = chapters[active][2];
    }
    const opacity = String(started ? Math.round(proximity * 100) / 100 : 0);
    if (caption.style.opacity !== opacity) caption.style.opacity = opacity;
    attribute(caption, 'aria-hidden', String(cinematic || proximity < .1 || !started));
    const introOpacity = started ? 1 - smooth(position / 250) : 1;
    intro.style.opacity = String(Math.round(introOpacity * 100) / 100);
    intro.style.visibility = introOpacity < .01 ? 'hidden' : 'visible';
    end.classList.toggle('visible', position > 4540);
    buttons.forEach((b, i) => attribute(b, 'aria-pressed', String(i === nearest && proximity > .4)));
    const stride = Math.floor(distance / (STRIDE / 2));
    if (stride !== lastStep && Math.abs(speed) > 15 && !paused) { nightAudio.step(); lastStep = stride; }
    if (!paused) nightAudio.ambience(this.clock);
    this.compose();
    if (_time > this.nextTelemetry) {
      this.nextTelemetry = _time + 1000;
      host.dataset.position = position.toFixed(1); host.dataset.chapter = String(proximity > .4 ? nearest : -1);
      host.dataset.fps = this.game.loop.actualFps.toFixed(0);
    }
  }
  compose() {
    const w = this.scale.width, h = this.scale.height, time = this.clock;
    const unit = clamp(h / 820, .72, 1.25), ground = h * .84, anchor = w * (w < 650 ? .3 : .31);
    const sx = (x: number, factor = 1) => anchor + (x - this.cameraX) * unit * factor;
    // Upload art once; only move textured game objects during animation.
    const backgroundScale = Math.max(w / 1672, h / 941) * 1.16;
    this.backdrop.setScale(backgroundScale).setPosition(w / 2 + (0.5 - position / WORLD_END) * w * .1, h / 2 - h * .025).setAlpha(.8);
    for (const tree of this.trees) {
      const x = sx(tree.x, tree.factor), size = tree.size * unit;
      tree.image.setVisible(x > -size * .6 && x < w + size * .6);
      if (!tree.image.visible) continue;
      const sway = reduced.matches ? 0 : Math.sin(time / 8300 + tree.seed) * .0017;
      tree.image.setDisplaySize(size, size).setPosition(x, ground + (tree.foreground ? 35 : -13) * unit).setRotation(sway);
      const edge = smooth((Math.abs(x - w * .5) / (w * .5) - .25) / .7);
      tree.image.setAlpha(tree.foreground ? edge * .88 : .30);
    }
    this.buildings.forEach((building, i) => {
      const reveal = 1 - smooth((Math.abs(position - stops[i]) - 130) / 560);
      const offset = w < 650 ? w * .36 / unit : 520;
      const x = sx(stops[i] + offset), width = Math.min((i === 2 ? 1080 : 980) * unit, w < 650 ? w * 1.65 : Infinity);
      building.setVisible(reveal > .001 && x > -width && x < w + width);
      if (building.visible) building.setDisplaySize(width, width * .75).setPosition(x, ground - 5 * unit).setAlpha(reveal * .88);
      // A single weak light in a real window, kept beneath the fog and foliage.
      const window = this.windows[i];
      const slots = [[194, 319], [353, 291], [188, 293], [85, 280]];
      const [wx, wy] = slots[i], artScale = width / 724;
      const flicker = .85 + Math.sin(time / 1700 + i) * .08 + Math.sin(time / 630 + i * 2) * .025;
      window.setVisible(building.visible).setScale(artScale * .94)
        .setPosition(x + (wx - 362) * artScale, ground - 5 * unit + (wy - (i < 2 ? .92 : .855) * 543) * artScale)
        .setAlpha(reveal * flicker * .48);
    });
    const startTile = Math.floor((this.cameraX - anchor / unit) / 1024) - 1;
    this.path.forEach((piece, i) => piece.setScale(unit).setPosition(sx((startTile + i) * 1024), ground));
    const phase = (distance / STRIDE) % 1;
    const amount = Math.abs(speed) < 3 ? 0 : Math.ceil(clamp(Math.abs(speed) / 105, 0, 1) * 3) / 3;
    const frame = amount === 0 ? idleFrame : (Math.round(amount * 3) - 1) * WALK_FRAMES + Math.floor(phase * WALK_FRAMES);
    const bob = amount ? gait(Math.floor(phase * WALK_FRAMES) / WALK_FRAMES, amount).bob : 0;
    const breathing = !amount && !reduced.matches ? Math.sin(time / 1800) * .4 : 0;
    const px = sx(position);
    this.boy.setFrame(frame).setPosition(px, ground + breathing * unit).setScale(unit).setFlipX(this.facing < 0);
    this.shadow.setPosition(px + 3 * unit, ground + 2 * unit).setScale(unit);
    if (time >= this.nextBlink && !paused && !reduced.matches) {
      this.blinkUntil = time + 135; this.nextBlink = time + 3100 + random(Math.floor(time)) * 3400;
    }
    const blink = time < this.blinkUntil;
    this.eyes.setPosition(px + this.facing * 9 * unit, ground + (-123 + bob + breathing) * unit).setScale(unit, blink ? unit * .08 : unit).setFlipX(this.facing < 0);
    this.fog.forEach((fog, i) => fog.setDisplaySize(w * (1.1 + i * .2), 115 * unit).setPosition(w * (.35 + i * .22) + Math.sin(time / 16000 + i) * 70, ground - (10 + i * 18) * unit).setAlpha(i === 2 ? .2 : .38));
    this.motes.forEach((mote, i) => mote.setPosition(random(i + 400) * w + Math.sin(time / 5100 + i) * 13, h * .38 + random(i + 170) * h * .42 + Math.sin(time / 6200 + i) * 8));
  }
}
try {
  new Phaser.Game({
    type: Phaser.AUTO, parent: host, backgroundColor: '#020304',
    scale: { mode: Phaser.Scale.RESIZE, width: host.clientWidth, height: host.clientHeight },
    scene: Night, render: { antialias: true, roundPixels: false, powerPreference: 'low-power' },
    fps: { target: 60 }, audio: { noAudio: true }, banner: false,
  });
} catch {
  status.textContent = 'The path could not open. You can still visit Blog and Work above.';
  host.dataset.state = 'error';
}
