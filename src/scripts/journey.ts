const canvas = document.querySelector<HTMLCanvasElement>('.scene')!;
const ctx = canvas.getContext('2d')!;
const journey = document.querySelector<HTMLElement>('.journey')!;
const world = document.querySelector<HTMLElement>('.world')!;
const walker = document.querySelector<HTMLElement>('.walker')!;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const chapters = [
 ['THE BEGINNING','Chiranjeeve School','Every journey starts somewhere. Mine started here.'],
 ['A NEW CHAPTER','Oxford Public School','Another school. Another part of the story.'],
 ['GROWING UP','Sarala Birla Public School','A few more steps along the way.'],
 ['THE ROAD AHEAD','KIIT','The story keeps going. Still learning, still curious.']
];
let width=0,height=0,progress=0,lastProgress=-1,active=-1,stopTimer:ReturnType<typeof setTimeout>,frame=0,facing=1;
const random=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const terrain=(x:number)=>height*.8+Math.sin(x/190)*11+Math.sin(x/67)*3+Math.sin(x/430)*18;
function line(points:number[][],weight:number,color:string){ctx.strokeStyle=color;ctx.lineWidth=weight;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
function tree(x:number,y:number,h:number,seed:number,color:string){
 const thick=h*(.025+random(seed)*.035),lean=(random(seed+8)-.5)*h*.22;
 ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x-thick,y);ctx.bezierCurveTo(x-thick*.45,y-h*.3,x+lean-thick*.3,y-h*.7,x+lean,y-h);ctx.bezierCurveTo(x+lean+thick*.4,y-h*.7,x+thick*.7,y-h*.3,x+thick,y);ctx.closePath();ctx.fill();
 for(let j=0;j<5;j++){const f=.47+j*.105,yy=y-h*f,dir=j%2?1:-1,l=h*(.1+random(seed+j+17)*.23),root=x+lean*f;
 line([[root,yy],[root+dir*l*.5,yy-l*.2],[root+dir*l,yy-l*.65],[root+dir*l*1.1,yy-l]],Math.max(1,thick*(.25-j*.035)),color);
 line([[root+dir*l*.5,yy-l*.2],[root+dir*l*.52,yy-l*.62],[root+dir*l*.4,yy-l*.9]],1.4,color);
 }
 for(let j=0;j<4;j++){const dir=j%2?1:-1;line([[x,y-12],[x+dir*thick*1.6,y-3],[x+dir*thick*(2+random(seed+j)),y+5]],thick*.25,color);}
}
function building(x:number,g:number,index:number){
 ctx.save();ctx.translate(x,g);const scale=Math.max(.62,Math.min(1,width/1200));ctx.scale(scale,scale);
 const w=510+index*55,h=155+index*28;
 ctx.fillStyle='#34383b';ctx.fillRect(-w/2,-h,w,h);ctx.fillStyle='#454a4d';ctx.fillRect(-w/2-6,-h-8,w+12,8);
 // Long classroom wings, horizontal floor slabs and an elevated entrance block.
 for(let row=0;row<3;row++){const yy=-h+22+row*(h/3);ctx.fillStyle='#171c20';for(let col=0;col<14;col++){const xx=-w/2+18+col*(w-30)/14;if(Math.abs(xx)<57)continue;ctx.fillRect(xx,yy,21,27);ctx.fillStyle='#70777a38';ctx.fillRect(xx+3,yy+2,7,24);ctx.fillStyle='#171c20';}ctx.fillStyle='#585e6038';ctx.fillRect(-w/2,yy+35,w,3);}
 ctx.fillStyle='#42484b';ctx.fillRect(-66,-h-27,132,h+27);ctx.fillStyle='#545a5d';ctx.fillRect(-74,-h-31,148,7);
 if(index===1||index===2){ctx.fillStyle='#3b4144';ctx.beginPath();ctx.moveTo(-77,-h-31);ctx.lineTo(0,-h-69);ctx.lineTo(77,-h-31);ctx.fill();ctx.fillStyle='#909594';ctx.beginPath();ctx.arc(0,-h-40,10,0,Math.PI*2);ctx.fill();line([[0,-h-47],[0,-h-40],[5,-h-38]],1,'#22282b');}
 ctx.fillStyle='#141a1e';ctx.fillRect(-33,-58,66,58);for(const a of [-48,40]){ctx.fillStyle='#697073';ctx.fillRect(a,-66,8,66);}ctx.fillStyle='#747b7d';ctx.fillRect(-59,-70,118,6);
 ctx.fillStyle='#a4aaac';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText(chapters[index][1].toUpperCase(),0,-h+5);
 for(let j=0;j<4;j++){ctx.fillStyle=j%2?'#363c3e':'#53595b';ctx.fillRect(-76-j*8,j*4,152+j*16,4);}
 line([[92,-h],[92,-h-70]],2,'#92989a');ctx.fillStyle='#7b8081';ctx.beginPath();ctx.moveTo(92,-h-70);ctx.lineTo(130,-h-65);ctx.lineTo(92,-h-49);ctx.fill();
 // Boundary wall and iron school gates.
 for(let side=-1;side<=1;side+=2){ctx.fillStyle='#242a2d';ctx.fillRect(side<0?-w/2-35:75,10,w/2-40,22);for(let j=0;j<13;j++){const xx=side*(85+j*17);line([[xx,13],[xx,-14]],2,'#252b2e');}line([[side*75,-7],[side*(w/2+25),-7]],2,'#252b2e');}
 ctx.restore();
}
function person(travel:number){
 const growth=1+progress*.52,unit=Math.max(.82,Math.min(1.15,height/800))*growth,x=width*(width<760?.32:.34),worldX=x+travel;
 const step=34*unit,cycle=worldX/step,phase=cycle-Math.floor(cycle),hipY=terrain(worldX)-40*unit-Math.abs(Math.sin(phase*Math.PI*2))*1.3*unit;
 // A planted foot stays at a fixed world coordinate until the swing phase.
 function foot(offset:number){const c=cycle+offset,n=Math.floor(c),t=c-n;let wx:number,lift=0;if(t<.5)wx=(n-offset+.25)*step;else{const u=(t-.5)*2;wx=(n-offset+.25+u)*step;lift=Math.sin(u*Math.PI)*8*unit;}return [wx-travel,terrain(wx)-lift-2*unit];}
 const feet=(reduce.matches||!walker.classList.contains('walking'))?[[x-5*unit,terrain(worldX-5*unit)-2*unit],[x+6*unit,terrain(worldX+6*unit)-2*unit]]:[foot(0),foot(.5)];
 ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(x,terrain(worldX)+3,19*unit,3*unit,0,0,Math.PI*2);ctx.fill();
 feet.forEach(([fx,fy],i)=>{const dx=fx-x,dy=fy-hipY,d=Math.hypot(dx,dy),len=21*unit,bend=walker.classList.contains('walking')?Math.sqrt(Math.max(0,len*len-d*d/4)):2*unit;const kx=(x+fx)/2+dy/Math.max(d,1)*bend*facing,ky=(hipY+fy)/2-dx/Math.max(d,1)*bend*facing;const color=i?'#030405':'#101316';line([[x,hipY],[kx,ky],[fx,fy]],(i?6:5.5)*unit,color);line([[fx-2*unit*facing,fy],[fx+6*unit*facing,fy]],4*unit,color);});
 ctx.save();ctx.translate(x,hipY);ctx.scale(unit*facing,unit);const swing=(reduce.matches||!walker.classList.contains('walking'))?0:Math.sin(cycle*Math.PI*2)*7;
 line([[-3,-22],[-7-swing*.6,-10],[-5-swing,1]],4.4,'#131619');
 ctx.fillStyle='#050607';ctx.beginPath();ctx.moveTo(-7,-26);ctx.quadraticCurveTo(0,-31,7,-24);ctx.lineTo(9,-3);ctx.quadraticCurveTo(0,4,-8,0);ctx.closePath();ctx.fill();
 // Neck, a soft cheek profile, tousled hair and a small curious eye.
 line([[0,-25],[1,-33]],5,'#050607');ctx.beginPath();ctx.ellipse(1,-40,9-progress*1.2,10-progress, -.12,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(8,-43);ctx.lineTo(11,-39);ctx.lineTo(8,-38);ctx.lineTo(7,-34);ctx.lineTo(3,-32);ctx.fill();ctx.beginPath();ctx.moveTo(-8,-41);ctx.quadraticCurveTo(-10,-49,-5,-48);ctx.quadraticCurveTo(-3,-52,1,-49);ctx.quadraticCurveTo(6,-51,8,-45);ctx.lineTo(8,-44);ctx.fill();
 ctx.fillStyle='#dedfe0';ctx.shadowColor='#cdd7dd';ctx.shadowBlur=3;ctx.beginPath();ctx.ellipse(7,-41,1.1,1.25,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 line([[4,-22],[8+swing*.6,-11],[7+swing,0]],4.5,'#080a0c');ctx.restore();
}
function draw(){frame=0;const travel=progress*width*3.3,g=height*.8;
 ctx.clearRect(0,0,width,height);const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,'#080a0e');sky.addColorStop(.5,'#30373e');sky.addColorStop(.78,'#697278');sky.addColorStop(1,'#090b0e');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
 const glow=ctx.createRadialGradient(width*.7,height*.48,0,width*.7,height*.48,width*.65);glow.addColorStop(0,'#b6c0c333');glow.addColorStop(1,'#0000');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
 for(let layer=0;layer<2;layer++){ctx.save();ctx.filter=`blur(${3-layer}px)`;for(let i=-4;i<65;i++){const xx=i*105+random(i+40)*50-travel*(.15+layer*.16);if(xx<-100||xx>width+100)continue;tree(xx,g-25, height*(.7+random(i+20)*.5),i+layer*13,layer?'#252b304f':'#333c4355');}ctx.restore();}
 for(let i=0;i<4;i++){const bx=width*.75+i*width*1.1-travel; if(bx>-700&&bx<width+700)building(bx,g-30,i);}
 const fog=ctx.createLinearGradient(0,g-230,0,g+15);fog.addColorStop(0,'#9ba6ad00');fog.addColorStop(.6,'#aab5bb25');fog.addColorStop(1,'#9ba6ad00');ctx.fillStyle=fog;ctx.fillRect(0,g-230,width,245);
 for(let i=-3;i<50;i++){const xx=i*240+random(i+90)*95-travel*.85;if(xx<-170||xx>width+170)continue;tree(xx,terrain(xx+travel)+5,height*(.82+random(i+18)*.4),i+100,'#080c10');}
 ctx.fillStyle='#030507';ctx.beginPath();ctx.moveTo(0,height);for(let x=0;x<=width+5;x+=5)ctx.lineTo(x,terrain(x+travel));ctx.lineTo(width,height);ctx.fill();
 // Moss, irregular stones, grass clumps and exposed roots follow the same terrain.
 const start=Math.floor(travel/15)-2,end=start+Math.ceil(width/15)+4;
 for(let i=start;i<end;i++){const wx=i*15,x=wx-travel,y=terrain(wx),r=random(i+100);if(r>.55){ctx.fillStyle='#080b0e';ctx.beginPath();ctx.ellipse(x,y,3+r*8,2+r*4,-.3,Math.PI,Math.PI*2);ctx.fill();}for(let j=0;j<3;j++){const len=5+random(i*3+j)*19;line([[x,y+2],[x+(j-1)*3,y-len*.55],[x+(j-1)*7,y-len]],.7,'#080b0e');}}
 person(travel);
 const vignette=ctx.createRadialGradient(width*.5,height*.6,width*.17,width*.5,height*.55,Math.max(width,height)*.76);vignette.addColorStop(0,'#0000');vignette.addColorStop(1,'#000b');ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
 canvas.dataset.growth=(1+progress*.52).toFixed(2);
}
function update(){const range=journey.offsetHeight-world.offsetHeight;progress=Math.min(1,Math.max(0,-journey.getBoundingClientRect().top/range));const moving=Math.abs(progress-lastProgress)>.00001;if(moving&&!reduce.matches){facing=progress>=lastProgress?1:-1;walker.classList.add('walking');clearTimeout(stopTimer);stopTimer=setTimeout(()=>{walker.classList.remove('walking');if(!frame)frame=requestAnimationFrame(draw);},180);}lastProgress=progress;const next=Math.round(progress*3);if(next!==active){active=next;document.querySelector('#chapter-number')!.textContent=`CHAPTER 0${active+1} · ${chapters[active][0]}`;document.querySelector('#chapter-name')!.textContent=chapters[active][1];document.querySelector('#chapter-description')!.textContent=chapters[active][2];document.querySelectorAll<HTMLButtonElement>('[data-chapter]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===active)));(document.querySelector('#previous') as HTMLButtonElement).disabled=active===0;(document.querySelector('#next') as HTMLButtonElement).disabled=active===3;}(document.querySelector('.end-note') as HTMLElement).style.opacity=progress>.93?'1':'0';if(!frame)frame=requestAnimationFrame(draw);}
function go(n:number){const top=journey.getBoundingClientRect().top+scrollY;window.scrollTo({top:top+Math.max(0,Math.min(3,n))/3*(journey.offsetHeight-world.offsetHeight),behavior:reduce.matches?'instant':'smooth'});}
document.querySelectorAll<HTMLButtonElement>('[data-chapter]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.chapter))));document.querySelector('#previous')!.addEventListener('click',()=>go(active-1));document.querySelector('#next')!.addEventListener('click',()=>go(active+1));addEventListener('keydown',e=>{if(e.target instanceof HTMLElement&&e.target.closest('a,button,input,textarea'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(active+(e.key==='ArrowRight'?1:-1));}});function resize(){width=world.clientWidth;height=world.clientHeight;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=width*ratio;canvas.height=height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);update();}addEventListener('resize',resize);addEventListener('scroll',update,{passive:true});resize();
