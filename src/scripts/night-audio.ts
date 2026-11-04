/** A quiet, generated soundscape. No audio starts without a deliberate click. */
export class NightAudio {
  context?: AudioContext;
  master?: GainNode;
  noise?: AudioBuffer;
  enabled = false;
  private nextBell = 0;
  private nextCreak = 12000;
  async toggle() {
    if (!this.context) this.create();
    const ctx = this.context!;
    await ctx.resume();
    this.enabled = !this.enabled;
    this.master!.gain.setTargetAtTime(this.enabled ? .32 : 0, ctx.currentTime, .35);
    return this.enabled;
  }
  private create() {
    const ctx = this.context = new AudioContext();
    const master = this.master = ctx.createGain();
    master.gain.value = 0;
    const compressor = ctx.createDynamicsCompressor();
    master.connect(compressor); compressor.connect(ctx.destination);
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const samples = this.noise.getChannelData(0);
    let previous = 0;
    for(let i=0;i<samples.length;i++){previous=(previous+(Math.random()*2-1)*.025)/1.025;samples[i]=previous*4;}
    const wind = ctx.createBufferSource(); wind.buffer=this.noise;wind.loop=true;
    const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=420;
    const gain=ctx.createGain();gain.gain.value=.42;
    wind.connect(filter);filter.connect(gain);gain.connect(master);wind.start();
    const lfo=ctx.createOscillator(),depth=ctx.createGain();lfo.frequency.value=.075;depth.gain.value=.14;lfo.connect(depth);depth.connect(gain.gain);lfo.start();
    for(const frequency of [48,72.12]){const drone=ctx.createOscillator(),level=ctx.createGain();drone.frequency.value=frequency;level.gain.value=.035;drone.connect(level);level.connect(master);drone.start();}
  }
  step() {
    if(!this.enabled || !this.context || this.context.state!=='running') return;
    const ctx=this.context,now=ctx.currentTime;
    const source=ctx.createBufferSource();source.buffer=this.noise!;source.playbackRate.value=.8+Math.random()*.3;
    const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=750;
    const gain=ctx.createGain();gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.6,now+.012);gain.gain.exponentialRampToValueAtTime(.001,now+.18);
    source.connect(filter);filter.connect(gain);gain.connect(this.master!);source.start(now,Math.random());source.stop(now+.2);
    source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
  }
  ambience(time:number) {
    if(!this.enabled || !this.context || this.context.state !== 'running') return;
    if (time >= this.nextCreak) {
      this.nextCreak = time + 24000 + Math.random() * 21000;
      this.creak();
    }
    if (time < this.nextBell) return;
    this.nextBell=time+19000+Math.random()*18000;
    const ctx=this.context,now=ctx.currentTime;
    [174.61,349.8,523.3].forEach((f,i)=>{const bell=ctx.createOscillator(),gain=ctx.createGain();bell.frequency.value=f;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.014/(i+1),now+.08);gain.gain.exponentialRampToValueAtTime(.0001,now+7);bell.connect(gain);gain.connect(this.master!);bell.start();bell.stop(now+7);bell.onended=()=>{bell.disconnect();gain.disconnect();};});
  }
  private creak() {
    const ctx = this.context!, now = ctx.currentTime;
    const source = ctx.createBufferSource(); source.buffer = this.noise!;
    source.playbackRate.setValueAtTime(.65, now);
    source.playbackRate.linearRampToValueAtTime(.43, now + 1.8);
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.Q.value = 12;
    filter.frequency.setValueAtTime(330, now);
    filter.frequency.exponentialRampToValueAtTime(135, now + 1.8);
    const gain = ctx.createGain(), pan = ctx.createStereoPanner();
    pan.pan.value = Math.random() > .5 ? -.65 : .65;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(.075, now + .35);
    gain.gain.exponentialRampToValueAtTime(.001, now + 2.2);
    source.connect(filter); filter.connect(gain); gain.connect(pan); pan.connect(this.master!);
    source.start(now, Math.random()); source.stop(now + 2.3);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); pan.disconnect(); };
  }
  pause(){void this.context?.suspend();}
  resume(){if(this.enabled)void this.context?.resume();}
}
export const nightAudio = new NightAudio();
const button=document.querySelector<HTMLButtonElement>('#sound-toggle');
button?.addEventListener('click',async()=>{try{const on=await nightAudio.toggle();button.setAttribute('aria-pressed',String(on));button.textContent=on?'Sound on':'Sound off';}catch{button.textContent='Sound unavailable';}});
document.addEventListener('visibilitychange',()=>document.hidden?nightAudio.pause():nightAudio.resume());
addEventListener('pagehide',()=>nightAudio.pause());
