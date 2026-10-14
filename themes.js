/* TCG-specific visual presets. SVG-only effects remain sharp in every PNG size. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),svg=$('thumb'),ns='http://www.w3.org/2000/svg';
const catalog={
 digimon:[['circuit','Circuito digital','#79ffb0','#47baff','circuit','tech'],['evolution','Evolução','#e0ff62','#ba79ff','rays','tech'],['dark','Zona sombria','#b67dff','#ff647d','hex','double']],
 yugioh:[['millennium','Relíquia dourada','#ffd275','#b981ff','runes','ornament'],['link','Rede Link','#55dfff','#4c8eff','hex','tech'],['fusion','Portal de fusão','#cf8dff','#ff819f','rings','double']],
 magic:[['mana','Círculos de mana','#83dc9d','#70c7ff','rings','ornament'],['ember','Forja de brasas','#ff9061','#ffe094','embers','double'],['arcane','Arquivo arcano','#a4a0ff','#7ce4da','runes','ornament']],
 onepiece:[['ocean','Grande rota','#58d9ec','#ffd284','waves','double'],['impact','Impacto de mangá','#ff7c66','#ffe16e','rays','tech'],['treasure','Tesouro pirata','#edc86f','#e99673','compass','ornament']],
 pokemon:[['electric','Energia elétrica','#ffe970','#68ceff','bolts','tech'],['forest','Floresta de energia','#9be894','#f0d982','leaves','ornament'],['cosmic','Horizonte cósmico','#c296ff','#90dfff','stars','double']],
 lorcana:[['ink','Mar de tintas','#bc90ff','#6be0c5','ink','ornament'],['story','Livro encantado','#efd18d','#ae9be8','stars','ornament'],['sapphire','Safira e aço','#74c5ff','#d0e1ec','runes','double']]
};
let game=null,state={id:'',intensity:55,frame:true};
const panel=document.createElement('details');panel.className='theme-gallery';panel.open=true;
panel.innerHTML='<summary>Temas do cardgame</summary><p>Escolha um fundo e uma paleta. Suas cartas, textos e posições são preservados.</p><div class="theme-presets"></div><div class="theme-adjust"><label class="field"><span>Intensidade dos efeitos <output id="theme-intensity-value">55%</output></span><input id="theme-intensity" type="range" min="0" max="100" value="55"/></label><label class="toggle"><input id="theme-frame" type="checkbox" checked/> Moldura temática</label><button class="studio-btn" id="theme-clear" type="button">Remover efeitos e moldura</button></div>';
document.querySelector('.theme-description').after(panel);
const background=document.createElementNS(ns,'g');background.id='theme-background';background.style.pointerEvents='none';window.ThumbAdvanced.registerLayer('theme-background','Fundo temático',background,'fx-scene-atmosphere');
const frame=document.createElementNS(ns,'g');frame.id='theme-border';frame.style.pointerEvents='none';window.ThumbAdvanced.registerLayer('theme-border','Moldura temática',frame,'extra-image');
function pattern(type,a,b){
 const path=(d,color=a,width=2)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
 if(type==='circuit')return path('M0 20H35V55H80M20 0V35H55V80')+`<circle cx="35" cy="20" r="4" fill="${b}"/>`;
 if(type==='hex')return path('M20 5H60L80 40 60 75H20L0 40Z');
 if(type==='rings')return `<circle cx="40" cy="40" r="30" fill="none" stroke="${a}"/><circle cx="40" cy="40" r="23" fill="none" stroke="${b}"/>`+path('M40 4V16M40 64V76M4 40H16M64 40H76');
 if(type==='runes')return path('M40 5L70 40 40 75 10 40ZM28 28L52 52M52 28L28 52')+`<circle cx="40" cy="40" r="7" fill="none" stroke="${b}"/>`;
 if(type==='waves')return path('M-10 20Q10 0 30 20T70 20T110 20M-10 55Q10 35 30 55T70 55T110 55',a,3);
 if(type==='bolts')return path('M48 0L24 38H44L20 80M77 15L63 42H77',a,3);
 if(type==='leaves')return path('M10 68Q5 20 62 12Q80 60 10 68ZM10 68L55 22M25 53V35M37 42H56');
 if(type==='ink')return `<path d="M0 60Q25 5 45 42T80 20V80H0Z" fill="${a}" opacity=".4"/>`+path('M0 22Q25 65 50 22T100 22',b);
 if(type==='compass')return path('M40 2V78M2 40H78M40 10L49 31 70 40 49 49 40 70 31 49 10 40 31 31Z');
 if(type==='stars')return path('M20 5V35M5 20H35M60 43V73M45 58H75')+`<circle cx="55" cy="15" r="2" fill="${b}"/>`;
 if(type==='embers')return `<path d="M20 68Q0 40 25 10Q18 40 40 35Q55 60 20 68Z" fill="${a}" opacity=".35"/><circle cx="65" cy="18" r="3" fill="${b}"/>`;
 return path('M0 80L80 0M40 80L80 40',a,3);
}
function validate(data,g){
 if(!data||typeof data!=='object'||typeof data.id!=='string'||(data.id&&!(catalog[g]||[]).some(t=>t[0]===data.id))||!Number.isFinite(data.intensity)||data.intensity<0||data.intensity>100||typeof data.frame!=='boolean')throw Error('Tema de projeto inválido.');
}
function draw(){
 background.replaceChildren();frame.replaceChildren();const theme=(catalog[game]||[]).find(t=>t[0]===state.id);
 if(theme){const [,name,a,b,type,border]=theme;
  let defs=$('theme-pattern');if(!defs){defs=document.createElementNS(ns,'pattern');defs.id='theme-pattern';defs.setAttribute('patternUnits','userSpaceOnUse');defs.setAttribute('width','80');defs.setAttribute('height','80');svg.querySelector('defs').append(defs);}defs.innerHTML=pattern(type,a,b);
  background.innerHTML=`<rect width="1280" height="720" fill="url(#theme-pattern)"/>`;
  if(type==='rays')background.innerHTML+=Array.from({length:22},(_,i)=>{const angle=i*Math.PI/11,x=640+Math.cos(angle)*1100,y=360+Math.sin(angle)*900;return `<path d="M640 360L${x} ${y}" stroke="${i%2?a:b}" stroke-width="${i%3?3:12}"/>`;}).join('');
  background.setAttribute('opacity',String(state.intensity/100*.5));
  if(state.frame){
   const base=`<rect x="18" y="18" width="1244" height="684" rx="${border==='ornament'?30:4}" fill="none" stroke="${a}" stroke-width="3"/>`;
   const accent=border==='tech'?`<path d="M18 95V18H160M1120 18H1262V95M18 625V702H160M1120 702H1262V625" stroke="${b}" stroke-width="9" fill="none"/>`:border==='double'?`<rect x="28" y="28" width="1224" height="664" rx="4" fill="none" stroke="${b}" stroke-width="2"/>`:`<path d="M18 60L60 18 100 60 60 100ZM1180 60L1220 18 1262 60 1220 100ZM18 660L60 620 100 660 60 702ZM1180 660L1220 620 1262 660 1220 702Z" fill="none" stroke="${b}" stroke-width="3"/>`;
   frame.innerHTML=base+accent;frame.setAttribute('opacity',String(.3+state.intensity/100*.7));
  }
 }
 $('theme-intensity').value=state.intensity;$('theme-intensity-value').textContent=state.intensity+'%';$('theme-frame').checked=state.frame;
 panel.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===state.id)));
}
function reset(g){game=g;state={id:'',intensity:55,frame:true};const list=panel.querySelector('.theme-presets');list.replaceChildren();
 for(const t of catalog[game]||[]){const button=document.createElement('button');button.type='button';button.className='theme-preset';button.dataset.theme=t[0];button.setAttribute('aria-pressed','false');button.innerHTML=`<svg viewBox="0 0 160 90" aria-hidden="true"><rect width="160" height="90" fill="#111b26"/><g opacity=".6">${pattern(t[4],t[2],t[3])}</g><path d="M88 0L70 90" stroke="${t[3]}" stroke-width="3"/><rect x="18" y="24" width="40" height="56" rx="4" fill="${t[2]}" opacity=".65"/><rect x="105" y="24" width="40" height="56" rx="4" fill="${t[3]}" opacity=".65"/><rect x="4" y="4" width="152" height="82" rx="6" stroke="${t[2]}" fill="none"/></svg><span>${t[1]}</span>`;
  button.addEventListener('click',()=>{window.ThumbInteractions?.commit();state.id=t[0];for(const [i,side] of ['left','right'].entries()){const input=$(`accent-${side}`);input.value=t[i+2];input.dispatchEvent(new Event('input',{bubbles:true}));$(`theme-${side}`).value='custom';}draw();window.dispatchEvent(new Event('thumb:theme'));});list.append(button);
 }
 draw();
}
$('theme-intensity').addEventListener('input',e=>{state.intensity=Number(e.target.value);draw();window.dispatchEvent(new Event('thumb:theme'));});
$('theme-frame').addEventListener('change',e=>{state.frame=e.target.checked;draw();window.dispatchEvent(new Event('thumb:theme'));});
$('theme-clear').addEventListener('click',()=>{window.ThumbInteractions?.commit();state.id='';draw();window.dispatchEvent(new Event('thumb:theme'));});
window.ThumbThemes={reset,validate,getState:()=>({...state}),setState(data){if(!data)data={id:'',intensity:55,frame:true};validate(data,game);state={...data};draw();}};
window.addEventListener('thumb:theme',()=>window.ThumbInteractions?.commit());
reset(document.body.dataset.game||null);
window.ThumbInteractions?.resetHistory();
})();
