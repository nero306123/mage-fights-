// ================= DŹWIĘK (WebAudio, syntetyczny) =================
"use strict";
const SND={ctx:null,on:true,vol:0.5};
SND.init=function(){ if(SND.ctx)return; try{SND.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){} };
addEventListener('pointerdown',()=>{SND.init();if(SND.ctx&&SND.ctx.state==='suspended')SND.ctx.resume();},{once:false});
SND.tone=function(freq,dur,type,vol,slide){
  if(!SND.on||!SND.ctx)return;
  const t0=SND.ctx.currentTime;
  const o=SND.ctx.createOscillator(),g=SND.ctx.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(freq,t0);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq*slide),t0+dur);
  g.gain.setValueAtTime((vol||0.2)*SND.vol,t0);
  g.gain.exponentialRampToValueAtTime(0.001,t0+dur);
  o.connect(g);g.connect(SND.ctx.destination);
  o.start(t0);o.stop(t0+dur+0.02);
};
SND.noise=function(dur,vol,freq){
  if(!SND.on||!SND.ctx)return;
  const t0=SND.ctx.currentTime;const n=SND.ctx.sampleRate*dur;
  const buf=SND.ctx.createBuffer(1,n,SND.ctx.sampleRate);
  const d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const src=SND.ctx.createBufferSource();src.buffer=buf;
  const f=SND.ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=freq||800;
  const g=SND.ctx.createGain();g.gain.value=(vol||0.2)*SND.vol;
  src.connect(f);f.connect(g);g.connect(SND.ctx.destination);src.start();
};
SND.hit=()=>{SND.noise(0.08,0.25,900);SND.tone(180,0.08,'square',0.12,0.6);};
SND.hurt=()=>{SND.tone(140,0.18,'sawtooth',0.16,0.5);};
SND.cast=()=>{SND.tone(520,0.16,'sine',0.14,1.8);};
SND.pickup=()=>{SND.tone(660,0.09,'sine',0.14,1.5);setTimeout(()=>SND.tone(990,0.1,'sine',0.12),60);};
SND.gold=()=>{SND.tone(1180,0.07,'triangle',0.12);setTimeout(()=>SND.tone(1560,0.09,'triangle',0.1),50);};
SND.lvl=()=>{[440,554,659,880].forEach((f,i)=>setTimeout(()=>SND.tone(f,0.22,'triangle',0.16),i*110));};
SND.die=()=>{SND.tone(220,0.5,'sawtooth',0.2,0.25);SND.noise(0.4,0.2,300);};
SND.kill=()=>{SND.noise(0.14,0.22,500);SND.tone(90,0.2,'square',0.14,0.4);};
SND.portal=()=>{SND.tone(300,0.4,'sine',0.14,2.4);};
SND.godRoar=()=>{SND.tone(70,0.9,'sawtooth',0.26,0.5);SND.noise(0.7,0.25,200);};
// ---------- MUZYKA AMBIENT (pad akordowy) ----------
SND.music={on:true,playing:false,timer:null};
SND.chord=function(freqs,dur){
  if(!SND.ctx||!SND.music.on||!SND.on)return;
  const t0=SND.ctx.currentTime;
  freqs.forEach(f=>{
    const o=SND.ctx.createOscillator(),g=SND.ctx.createGain();
    o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.linearRampToValueAtTime(0.035*SND.vol,t0+dur*0.3);
    g.gain.linearRampToValueAtTime(0.0001,t0+dur);
    const o2=SND.ctx.createOscillator(),g2=SND.ctx.createGain();
    o2.type='triangle';o2.frequency.value=f/2;
    g2.gain.setValueAtTime(0.0001,t0);
    g2.gain.linearRampToValueAtTime(0.02*SND.vol,t0+dur*0.4);
    g2.gain.linearRampToValueAtTime(0.0001,t0+dur);
    o.connect(g);g.connect(SND.ctx.destination);o.start(t0);o.stop(t0+dur);
    o2.connect(g2);g2.connect(SND.ctx.destination);o2.start(t0);o2.stop(t0+dur);
  });
};
SND.startMusic=function(){
  if(SND.music.playing)return;SND.music.playing=true;
  const prog=[[110,164.8,196],[87.3,130.8,164.8],[98,146.8,174.6],[73.4,110,146.8]];
  let i=0;
  function step(){
    if(!SND.music.on||!SND.on){SND.music.timer=setTimeout(step,4000);return;}
    SND.chord(prog[i%prog.length],7);
    i++;SND.music.timer=setTimeout(step,6000);
  }
  step();
};
addEventListener('pointerdown',()=>{SND.init();SND.startMusic();},{once:true});
