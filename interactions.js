/* Direct SVG editing and bounded project history. All positions use the 1280 × 720 canvas. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),svg=$('thumb'),studio=window.ThumbStudio;
const names={
 'art-left':'Carta esquerda','art-right':'Carta direita','text-left-deck':'Deck esquerdo','text-right-deck':'Deck direito',
 'text-left-digimon':'Nome da carta esquerda','text-right-digimon':'Nome da carta direita',
 'text-left-detail':'Detalhe esquerdo','text-right-detail':'Detalhe direito','text-versus':'VS / texto central',
 'battle-ribbon':'Fundo da faixa superior','battle-ribbon-text':'Texto da faixa superior',
 'left-nameplate':'Base esquerda','right-nameplate':'Base direita','vs-plate':'Fundo central','vs-plate-ring':'Moldura central'
};
const ns='http://www.w3.org/2000/svg',wrappers=new Map();let state={},selected='',gesture=null,restoring=false,loading=0;
let past=[],future=[],current=null,timer=null,qualityTimer=null;
const panel=document.createElement('section');panel.className='direct-tools';panel.setAttribute('aria-label','Edição direta');
panel.innerHTML=`<div class="direct-heading"><strong>Edição na prévia</strong><div class="history-actions"><button type="button" id="undo-edit" class="studio-btn" disabled>↶ Desfazer</button><button type="button" id="redo-edit" class="studio-btn" disabled>↷ Refazer</button></div></div>
<label class="direct-switch"><input type="checkbox" id="direct-mode"/> Editar elementos na prévia</label>
<p class="drag-hint">Ative para selecionar e arrastar. Use o ponto no canto para redimensionar. Desative para rolar a página pelo toque.</p>
<label class="field"><span>Elemento</span><select id="selected-element"><option value="">Selecione na imagem ou nesta lista</option>${Object.entries(names).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label>
<div class="element-controls"><label class="field"><span>Horizontal</span><input id="element-x" type="number" min="-2560" max="2560" step="1"/></label><label class="field"><span>Vertical</span><input id="element-y" type="number" min="-1440" max="1440" step="1"/></label><label class="field"><span>Tamanho (%)</span><input id="element-scale" type="number" min="20" max="400" step="1"/></label></div>
<div class="alignment-actions"><button type="button" class="studio-btn" data-align="left">Esquerda</button><button type="button" class="studio-btn" data-align="center">Centro horizontal</button><button type="button" class="studio-btn" data-align="right">Direita</button><button type="button" class="studio-btn" data-align="top">Topo</button><button type="button" class="studio-btn" data-align="middle">Centro vertical</button><button type="button" class="studio-btn" data-align="bottom">Base</button><button type="button" class="studio-btn" id="reset-element">Restaurar posição e tamanho</button></div>`;
document.querySelector('.project-actions').after(panel);
const quality=document.createElement('p');quality.id='quality-status';quality.className='quality-status';quality.setAttribute('role','status');panel.before(quality);
const directOptions=document.createElement('div');directOptions.id='direct-options';directOptions.hidden=true;
while(panel.querySelector('.direct-switch').nextSibling)directOptions.append(panel.querySelector('.direct-switch').nextSibling);
panel.append(directOptions);
// Unified selection replaces the duplicate card-only movement buttons.
for(const id of ['move-art','move-side']){const el=$(id);if(el){el.hidden=true;directOptions.append(el);}}

for(const id of Object.keys(names)){
 const el=$(id),group=document.createElementNS(ns,'g');group.dataset.editElement=id;
 el.before(group);group.append(el);wrappers.set(id,group);
}
const overlay=document.createElementNS(ns,'g');overlay.dataset.editorOnly='true';overlay.setAttribute('aria-hidden','true');overlay.style.pointerEvents='none';
const outline=document.createElementNS(ns,'rect');outline.setAttribute('fill','none');outline.setAttribute('stroke','#d9ff8c');outline.setAttribute('stroke-width','2');outline.setAttribute('vector-effect','non-scaling-stroke');
const handle=document.createElementNS(ns,'circle');handle.setAttribute('r','13');handle.setAttribute('fill','#d9ff8c');handle.setAttribute('stroke','#151c26');handle.setAttribute('stroke-width','2');handle.style.pointerEvents='all';handle.style.cursor='nwse-resize';
overlay.append(outline,handle);svg.append(overlay);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const defaults=()=>({x:0,y:0,scale:1});
function transform(id){const v=state[id]||defaults();wrappers.get(id).setAttribute('transform',`translate(${v.x} ${v.y}) scale(${v.scale})`);}
function validateState(data){
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Posições de elementos inválidas.');
 for(const [id,v] of Object.entries(data))if(!Object.hasOwn(names,id)||!v||!Number.isFinite(v.x)||Math.abs(v.x)>2560||!Number.isFinite(v.y)||Math.abs(v.y)>1440||!Number.isFinite(v.scale)||v.scale<.2||v.scale>4)throw Error('Posições de elementos inválidas.');
}
function setState(data){validateState(data);state=structuredClone(data);for(const id of wrappers.keys())transform(id);refresh();}
function bounds(id){
 const el=$(id),box=window.ThumbFX?.getBounds(id)||el.getBBox(),matrix=svg.getScreenCTM().inverse().multiply(el.getScreenCTM());
 const points=[[box.x,box.y],[box.x+box.width,box.y],[box.x,box.y+box.height],[box.x+box.width,box.y+box.height]].map(([x,y])=>new DOMPoint(x,y).matrixTransform(matrix));
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y);return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
}
function visible(id){return !!id&&$(id).style.display!=='none'&&(!id.startsWith('art-')||window.ThumbEngine.uploaded[id.slice(4)]);}
function refresh(){
 const valid=visible(selected),value=state[selected]||defaults();
 for(const key of ['x','y','scale']){const input=$(`element-${key}`);input.disabled=!valid;input.value=valid?Math.round(value[key]*(key==='scale'?100:1)):'';}
 panel.querySelectorAll('[data-align],#reset-element').forEach(b=>b.disabled=!valid);
 overlay.style.display=valid&&$('direct-mode').checked?'':'none';
 if(valid&&$('direct-mode').checked){try{const b=bounds(selected);for(const key of ['x','y','width','height'])outline.setAttribute(key,b[key]);handle.setAttribute('cx',clamp(b.x+b.width,14,1266));handle.setAttribute('cy',clamp(b.y+b.height,14,706));}catch{overlay.style.display='none';}}
}
function select(id){selected=id;$('selected-element').value=id;refresh();}
function point(e){return new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());}
function historyButtons(){const locked=restoring||loading>0||studio.isBusy();$('undo-edit').disabled=locked||!past.length;$('redo-edit').disabled=locked||!future.length;}
function snapshot(){return studio.snapshot();}
function equal(a,b){
 if(['left','right'].some(side=>a.art[side].original!==b.art[side].original))return false;
 if(['wallpaper','extra'].some(key=>a.advanced?.[key]!==b.advanced?.[key]))return false;
 if([0,1,2].some(i=>a.fx?.fanImages?.[i]!==b.fx?.fanImages?.[i]))return false;
 const small=data=>({...data,fx:data.fx?{...data.fx,fanImages:undefined}:null,advanced:data.advanced?{...data.advanced,wallpaper:undefined,extra:undefined}:null,art:Object.fromEntries(['left','right'].map(side=>[side,{...data.art[side],original:undefined}]))});
 return JSON.stringify(small(a))===JSON.stringify(small(b));
}
function commit(){
 clearTimeout(timer);if(restoring||!document.body.dataset.game)return;
 if(loading||studio.isBusy()||gesture){timer=setTimeout(commit,150);return;}
 const next=snapshot();if(current&&!equal(current,next)){past.push(current);if(past.length>25)past.shift();future=[];}current=next;historyButtons();refresh();scheduleQuality();
}
function schedule(){if(!restoring){clearTimeout(timer);timer=setTimeout(commit,350);}}
function resetHistory(){clearTimeout(timer);past=[];future=[];current=snapshot();select('');historyButtons();scheduleQuality();}
async function travel(redo){
 if(restoring||loading||studio.isBusy()||gesture)return;commit();const from=redo?future:past,to=redo?past:future;if(!from.length)return;
 const next=from[from.length-1],previous=current;restoring=true;$('editor').inert=true;historyButtons();
 try{await studio.restore(next);from.pop();to.push(previous);current=snapshot();$('status').textContent=redo?'Alteração refeita.':'Alteração desfeita.';}
 catch{await studio.restore(previous);$('status').textContent='Não foi possível restaurar esta alteração.';}
 finally{restoring=false;$('editor').inert=false;historyButtons();refresh();scheduleQuality();}
}
$('undo-edit').addEventListener('click',()=>travel(false));$('redo-edit').addEventListener('click',()=>travel(true));
$('direct-mode').addEventListener('change',()=>{
 const enabled=$('direct-mode').checked;directOptions.hidden=!enabled;svg.classList.toggle('direct-editing',enabled);
 if(enabled){document.querySelector('.preview').classList.remove('move-mode');$('move-art').setAttribute('aria-pressed','false');}
 refresh();
});
$('move-art').addEventListener('click',()=>{$('direct-mode').checked=false;svg.classList.remove('direct-editing');refresh();});
$('selected-element').addEventListener('change',e=>{select(e.target.value);$('direct-mode').checked=true;$('direct-mode').dispatchEvent(new Event('change'));});
for(const key of ['x','y','scale'])$(`element-${key}`).addEventListener('input',e=>{
 if(!visible(selected)||e.target.value==='')return;const number=Number(e.target.value);if(!Number.isFinite(number))return;
 const v=state[selected]||defaults();if(key==='scale')resize(selected,clamp(number/100,.2,4));else{state[selected]={...v,[key]:clamp(number,key==='x'?-2560:-1440,key==='x'?2560:1440)};transform(selected);}
 // Do not replace the focused numeric field while the user is typing.
 schedule();
});
function resize(id,scale){const old=state[id]||defaults(),b=bounds(id),ratio=scale/old.scale,cx=b.x+b.width/2,cy=b.y+b.height/2;state[id]={x:clamp(cx+(old.x-cx)*ratio,-2560,2560),y:clamp(cy+(old.y-cy)*ratio,-1440,1440),scale};transform(id);}
panel.querySelectorAll('[data-align]').forEach(button=>button.addEventListener('click',()=>{
 if(!visible(selected))return;commit();const b=bounds(selected),v=state[selected]||defaults(),a=button.dataset.align;
 const dx={left:-b.x,center:640-b.x-b.width/2,right:1280-b.x-b.width}[a]||0,dy={top:-b.y,middle:360-b.y-b.height/2,bottom:720-b.y-b.height}[a]||0;
 state[selected]={...v,x:clamp(v.x+dx,-2560,2560),y:clamp(v.y+dy,-1440,1440)};transform(selected);commit();
}));
$('reset-element').addEventListener('click',()=>{if(!selected)return;commit();delete state[selected];transform(selected);commit();});
svg.addEventListener('pointerdown',e=>{
 if(!$('direct-mode').checked||e.button!==0||restoring||loading||studio.isBusy()||gesture)return;
 const resizeHandle=e.target===handle,id=resizeHandle?selected:e.target.closest('[data-edit-element]')?.dataset.editElement;
 if(!visible(id)){select('');return;}commit();select(id);const p=point(e),b=bounds(id);
 gesture={id,start:p,value:{...(state[id]||defaults())},bounds:b,resize:resizeHandle,pointer:e.pointerId};svg.setPointerCapture(e.pointerId);e.preventDefault();e.stopPropagation();
});
svg.addEventListener('pointermove',e=>{
 if(!gesture||e.pointerId!==gesture.pointer)return;const g=gesture,p=point(e),v=g.value;
 if(g.resize){const cx=g.bounds.x+g.bounds.width/2,cy=g.bounds.y+g.bounds.height/2,initial=Math.hypot(g.start.x-cx,g.start.y-cy)||1,scale=clamp(v.scale*Math.hypot(p.x-cx,p.y-cy)/initial,.2,4),ratio=scale/v.scale;state[g.id]={x:clamp(cx+(v.x-cx)*ratio,-2560,2560),y:clamp(cy+(v.y-cy)*ratio,-1440,1440),scale};}
 else {const dx=p.x-g.start.x,dy=p.y-g.start.y,snap=window.ThumbFX?.snap(g.bounds,dx,dy)||{dx,dy};state[g.id]={...v,x:clamp(v.x+snap.dx,-2560,2560),y:clamp(v.y+snap.dy,-1440,1440)};}
 transform(g.id);refresh();e.preventDefault();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(event,e=>{
 if(!gesture||e.pointerId!==gesture.pointer)return;if(event==='pointercancel'){state[gesture.id]=gesture.value;transform(gesture.id);}gesture=null;commit();
});
document.addEventListener('keydown',e=>{
 if($('editor').hidden||e.target.closest('input,textarea,select,[contenteditable=true]'))return;
 if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();travel(e.key.toLowerCase()==='y'||e.shiftKey);}
 if(e.key==='Escape')select('');
 if($('direct-mode').checked&&visible(selected)&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
 e.preventDefault();const v=state[selected]||defaults(),step=e.shiftKey?10:1;state[selected]={...v,x:clamp(v.x+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0),-2560,2560),y:clamp(v.y+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0),-1440,1440)};transform(selected);refresh();schedule();
 }
});
$('editor').addEventListener('input',e=>{if(!panel.contains(e.target)&&!e.target.id.startsWith('search-'))schedule();});
$('editor').addEventListener('change',e=>{if(!panel.contains(e.target)&&e.target.type!=='file')schedule();});
$('editor').addEventListener('click',e=>{if(e.target.closest('.layout-card,.reset-art'))schedule();});
window.addEventListener('thumb:layout',()=>{for(const id of wrappers.keys())transform(id);schedule();});
window.addEventListener('thumb:image',()=>schedule());
window.addEventListener('thumb:loading',e=>{loading=Math.max(0,loading+(e.detail?1:-1));historyButtons();if(!loading)schedule();});
window.addEventListener('thumb:ready',resetHistory);
window.addEventListener('resize',refresh);
document.querySelector('.preview').addEventListener('pointerup',schedule);
// Warn using the embedded image's real dimensions and its actual SVG scale, including user zoom.
let qualityVersion=0;
async function qualityWarnings(width){
 const warnings=[];
 for(const side of ['left','right']){
  const el=$(`art-${side}`);if(!window.ThumbEngine.uploaded[side]||el.style.display==='none')continue;
  const img=new Image();img.src=el.getAttribute('href');await img.decode();
  const matrix=svg.getScreenCTM().inverse().multiply(el.getScreenCTM());
  const fit=Math.min(Number(el.getAttribute('width'))/img.naturalWidth,Number(el.getAttribute('height'))/img.naturalHeight);
  const scale=fit*Math.max(Math.hypot(matrix.a,matrix.b),Math.hypot(matrix.c,matrix.d))*width/1280;
  if(scale>1.15)warnings.push(`Carta ${side==='left'?'esquerda':'direita'}: a imagem original limita a nitidez nesta resolução/zoom.`);
 }
 return warnings;
}
function scheduleQuality(){clearTimeout(qualityTimer);qualityTimer=setTimeout(async()=>{const version=++qualityVersion;if($('editor').hidden)return;try{const warnings=await qualityWarnings(Number($('export-size').value));if(version===qualityVersion)quality.textContent=warnings.join(' ');}catch{if(version===qualityVersion)quality.textContent='Não foi possível avaliar a nitidez das imagens.';}},300);}
window.ThumbInteractions={refresh,resetHistory,register(id,label){names[id]=label;const el=$(id),group=document.createElementNS(ns,'g');group.dataset.editElement=id;el.before(group);group.append(el);wrappers.set(id,group);$('selected-element').add(new Option(label,id));return group;},select,getState:()=>structuredClone(state),setState,validateState,commit,undo:()=>travel(false),redo:()=>travel(true)};
studio.qualityWarnings=qualityWarnings;
resetHistory();
})();
