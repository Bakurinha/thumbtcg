/**
 * Optional composition layers and SVG filters. Preserve the original layer clipping and project serialization.
 * Maintenance: preserve exported APIs, stored JSON and the existing PNG output.
 */
(()=>{
  'use strict';
  const $=id=>document.getElementById(id),svg=$('thumb'),ns=svg.namespaceURI,engine=window.ThumbEngine;
  const make=(tag,attrs={})=>{const el=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,v);return el;};
  const defs=svg.querySelector('defs'),overlay=svg.querySelector('[data-editor-only]');
  const circle=make('clipPath',{id:'advanced-circle',clipPathUnits:'objectBoundingBox'});circle.append(make('circle',{cx:.5,cy:.5,r:.5}));defs.append(circle);
  const filter=make('filter',{id:'background-adjust',x:'-30%',y:'-30%',width:'160%',height:'160%','color-interpolation-filters':'sRGB'});
  const gamma=make('feComponentTransfer'),linear=make('feComponentTransfer'),sat=make('feColorMatrix',{type:'saturate'}),blur=make('feGaussianBlur');
  for(const channel of ['R','G','B']){gamma.append(make('feFunc'+channel,{type:'gamma',amplitude:1,exponent:1,offset:0}));linear.append(make('feFunc'+channel,{type:'linear',slope:1,intercept:0}));}filter.append(gamma,linear,sat,blur);defs.append(filter);
  const glow=make('filter',{id:'foreground-glow',x:'-30%',y:'-30%',width:'160%',height:'160%'});glow.append(make('feDropShadow',{dx:0,dy:0,stdDeviation:9,'flood-color':'#b8ff72','flood-opacity':.9}));defs.append(glow);
  // Give each original clipped child an independent layer, preserving its original clipping.
  const clipLayers=[];
  for(const group of [...svg.children].filter(el=>el.tagName==='g'&&el.hasAttribute('clip-path'))){
    for(const child of [...group.children]){const wrap=make('g',{'clip-path':group.getAttribute('clip-path')});wrap.dataset.originalClip=group.getAttribute('clip-path');wrap.append(child);group.before(wrap);clipLayers.push(wrap);}group.remove();
  }
  const originalNodes=[...svg.children].filter(el=>el!==defs&&!el.hasAttribute('data-editor-only'));
  const background=make('g',{id:'advanced-background'}),bgImages=[make('image',{preserveAspectRatio:'xMidYMid slice'}),make('image',{preserveAspectRatio:'xMidYMid slice'})];
  background.append(...bgImages);background.setAttribute('filter','url(#background-adjust)');originalNodes[4].before(background);
  const shade=make('rect',{id:'advanced-shade',x:0,y:0,width:1280,height:720,fill:'#000',opacity:0});background.after(shade);
  const band=make('rect',{id:'advanced-band',x:0,y:550,width:1280,height:170,fill:'#060a10','fill-opacity':.78});svg.querySelector('[data-edit-element="text-left-deck"]').before(band);
  const extra=make('image',{id:'extra-image',x:20,y:170,width:620,height:550,preserveAspectRatio:'xMidYMid meet'});svg.insertBefore(extra,overlay);window.ThumbInteractions.register('extra-image','Imagem adicional / retrato');
  const layerNodes=[...svg.children].filter(el=>el!==defs&&!el.hasAttribute('data-editor-only'));
  const layers=new Map();let deco=0;
  for(const [i,node]of layerNodes.entries()){
    const id=node.id||node.querySelector('[data-edit-element]')?.dataset.editElement||node.dataset.editElement||node.querySelector('[id]')?.id||'decoration-'+(++deco);
    const label=({'advanced-background':'Fundo ampliado / wallpaper','advanced-shade':'Escurecimento do fundo','advanced-band':'Faixa da composição','extra-image':'Imagem adicional / retrato','art-left':'Carta esquerda','art-right':'Carta direita','text-left-deck':'Título esquerdo','text-right-deck':'Título direito','text-versus':'VS / texto central','placeholder-left':'Guia esquerda','placeholder-right':'Guia direita'})[id]||$('selected-element').querySelector(`option[value="${id}"]`)?.textContent||decorationName(node,i);
    node.dataset.layer=id;layers.set(id,{node,label});
  }
  function decorationName(node,i){
    const shape=node.matches('g')?node.firstElementChild:node,fill=shape?.getAttribute('fill'),path=shape?.getAttribute('d')||'';
    if(fill==='url(#bgL)')return 'Tema · fundo esquerdo';if(fill==='url(#bgR)')return 'Tema · fundo direito';if(fill==='url(#mesh)')return 'Textura do cardgame';
    if(fill==='url(#greenGlow)')return 'Luz esquerda';if(fill==='url(#blueGlow)')return 'Luz direita';if(fill==='url(#fade)')return 'Sombra inferior '+(node.dataset.originalClip?.includes('clipL')?'esquerda':'direita');
    if(path.startsWith('M740')||path.startsWith('M563'))return 'Raio central · '+i;
    if(shape?.tagName==='rect')return shape.getAttribute('fill')==='none'?'Borda da thumbnail':'Base sólida';
    if(shape?.id?.includes('edge-stripe'))return 'Faixa lateral '+(shape.id.startsWith('left')?'esquerda':'direita');return `Decoração ${i+1}`;
  }
  const canonical=[...layers.keys()],optionalLayers=new Set();
  const ranges={zoom:[1,4,.05,1.5,'Zoom do fundo'],x:[-640,640,5,0,'Posição horizontal'],y:[-360,360,5,0,'Posição vertical'],brightness:[.2,2.5,.05,.8,'Brilho'],gamma:[.3,3,.05,1,'Gamma'],contrast:[.2,2.5,.05,1,'Contraste'],saturation:[0,2.5,.05,1,'Saturação'],blur:[0,30,1,0,'Desfoque'],opacity:[0,1,.05,1,'Opacidade'],shade:[0,.9,.05,.25,'Escurecer fundo']};
  const defaults=()=>({source:'none',wallpaper:'',extra:'',effect:'none',order:[...canonical],...Object.fromEntries(Object.entries(ranges).map(([k,v])=>[k,v[3]]))});
  let state=defaults(),sequence=0;
  const panel=document.createElement('section');panel.className='advanced-tools';panel.innerHTML=`<label class="direct-switch"><input type="checkbox" id="advanced-mode" aria-controls="advanced-options"/> Edição avançada</label><p class="drag-hint">Camadas, fundos e efeitos. Marque para abrir as opções.</p><div id="advanced-options" hidden><div class="advanced-grid"><div><h3>Camadas</h3><p class="drag-hint">O primeiro item fica na frente. Selecione uma camada e altere sua ordem.</p><label class="field"><span>Ordem de sobreposição</span><select id="layer-list" size="8"></select></label><div class="alignment-actions"><button type="button" class="studio-btn" data-layer-move="top">Trazer à frente</button><button type="button" class="studio-btn" data-layer-move="up">Subir uma camada</button><button type="button" class="studio-btn" data-layer-move="down">Descer uma camada</button><button type="button" class="studio-btn" data-layer-move="bottom">Enviar ao fundo</button></div><button type="button" class="studio-btn" id="reset-layers">Restaurar ordem</button><label class="field"><span>Imagem adicional / retrato (PNG transparente recomendado)</span><input type="file" id="extra-upload" accept="image/*"/></label><button type="button" class="studio-btn" id="remove-extra">Remover imagem adicional</button><p class="drag-hint">Posicione e redimensione em “Edição na prévia”. O upload mantém o fundo original da imagem.</p></div><div><h3>Fundo e efeitos</h3><label class="field"><span>Imagem de fundo</span><select id="background-source"><option value="none">Somente tema do cardgame</option><option value="left">Ampliar carta esquerda</option><option value="right">Ampliar carta direita</option><option value="both">Ampliar as duas cartas</option><option value="wallpaper">Papel de parede enviado</option></select></label><label class="field"><span>Enviar papel de parede</span><input type="file" id="wallpaper-upload" accept="image/*"/></label><button type="button" class="studio-btn" id="remove-wallpaper">Remover papel de parede</button><label class="field"><span>Efeito rápido</span><select id="effect-preset"><option value="none">Personalizado / sem brilho externo</option><option value="cinema">Cinema escuro</option><option value="dream">Fundo suave</option><option value="mono">Preto e branco no fundo</option><option value="vivid">Cores intensas</option><option value="neon">Brilho neon nas cartas</option></select></label><div class="background-sliders">${Object.entries(ranges).map(([k,[min,max,step,val,label]])=>`<label class="field"><span>${label} <output id="bg-${k}-value">${val}</output></span><input id="bg-${k}" type="range" min="${min}" max="${max}" step="${step}" value="${val}"/></label>`).join('')}</div><button type="button" class="studio-btn" id="reset-background">Restaurar ajustes do fundo</button><p class="drag-hint">Os ajustes afetam apenas a imagem de fundo. O brilho neon é aplicado às cartas da frente.</p></div></div></div>`;
  document.querySelector('.direct-tools').after(panel);
  $('advanced-mode').onchange=()=>{$('advanced-options').hidden=!$('advanced-mode').checked;};
  function order(){for(const id of state.order)svg.insertBefore(layers.get(id).node,overlay);for(const guide of [...svg.children].filter(el=>el.hasAttribute('data-editor-only')))svg.append(guide);renderList();}
  function renderList(){const selected=$('layer-list').value;$('layer-list').replaceChildren(...[...state.order].reverse().map(id=>new Option(layers.get(id).label,id)));if(state.order.includes(selected))$('layer-list').value=selected;}
  function updateUI(){ $('background-source').value=state.source;$('effect-preset').value=state.effect;for(const k of Object.keys(ranges)){$('bg-'+k).value=state[k];$('bg-'+k+'-value').value=state[k];}}
  /** Redraw layers in their persisted stacking order. */
  function render(){
    const left=$('art-left').getAttribute('href')||'',right=$('art-right').getAttribute('href')||'';
    const sources=state.source==='both'?[left,right]:[state.source==='left'?left:state.source==='right'?right:state.source==='wallpaper'?state.wallpaper:'',''];
    bgImages.forEach((img,i)=>{const w=state.source==='both'?640:1280,base=i*w;img.setAttribute('x',base+(w-w*state.zoom)/2+state.x);img.setAttribute('y',(720-720*state.zoom)/2+state.y);img.setAttribute('width',w*state.zoom);img.setAttribute('height',720*state.zoom);if(sources[i])img.setAttribute('href',sources[i]);else img.removeAttribute('href');img.style.display=sources[i]?'':'none';});
    // Split backgrounds are individually clipped so their zoom never spills into the other half.
    for(const [i,img]of bgImages.entries()){const id='bg-half-'+i;let clip=$(id);if(!clip){clip=make('clipPath',{id});clip.append(make('rect',{x:i*640,y:0,width:640,height:720}));defs.append(clip);}img.setAttribute('clip-path',state.source==='both'?`url(#${id})`:'none');}
    background.setAttribute('opacity',state.opacity);shade.setAttribute('opacity',sources.some(Boolean)?state.shade:0);
    for(const el of gamma.children)el.setAttribute('exponent',1/state.gamma);
    for(const el of linear.children){el.setAttribute('slope',state.brightness*state.contrast);el.setAttribute('intercept',(1-state.contrast)/2);}
    sat.setAttribute('values',state.saturation);blur.setAttribute('stdDeviation',state.blur);
    if(state.extra)extra.setAttribute('href',state.extra);else extra.removeAttribute('href');extra.style.display=state.extra?'':'none';
    for(const side of ['left','right']){const art=$('art-'+side);art.removeAttribute('filter');art.closest('[data-edit-element]').setAttribute('filter',state.effect==='neon'?'url(#foreground-glow)':'none');}
  }
  function geometry(){
    const cfg=engine.layoutExtra(),kind=cfg?.kind;
    for(const node of clipLayers){const art=node.querySelector('image');node.setAttribute('clip-path',kind?'none':node.dataset.originalClip);if(!art&&!node.querySelector('[id^="placeholder-"]'))node.style.display=kind?'none':'';}
    // Classic lightning is decoration only; new compositions have a clean center.
    for(const node of originalNodes){if(node.tagName==='path'&&node.getAttribute('d')?.startsWith('M740')||node.tagName==='path'&&node.getAttribute('d')?.startsWith('M563'))node.style.display=kind?'none':'';}
    for(const side of ['left','right']){const image=$('art-'+side);const rounded=['circles','circleRight','circleLeft','creator','soloCircle'].includes(kind)||kind==='focus'&&side==='right';image.setAttribute('clip-path',rounded?'url(#advanced-circle)':'none');image.setAttribute('preserveAspectRatio',['split','band','diagonal','cinema','soloWide'].includes(kind)||rounded?'xMidYMid slice':'xMidYMid meet');if(kind==='diagonal'){const wrap=clipLayers.find(n=>n.contains(image));wrap.setAttribute('clip-path',wrap.dataset.originalClip);}}
    band.style.display=kind&&['band','split','cinema'].includes(kind)?'':'none';band.setAttribute('y',kind==='band'?325:550);band.setAttribute('height',kind==='band'?130:170);
  }
  /** Check serialized layer state before restoring SVG properties. */
  function validateState(v){
    if(v==null)return;if(typeof v!=='object'||Array.isArray(v))throw Error('Edição avançada inválida.');
    if(!['none','left','right','both','wallpaper'].includes(v.source)||!['none','cinema','dream','mono','vivid','neon'].includes(v.effect))throw Error('Efeito inválido.');
    for(const [k,[min,max]]of Object.entries(ranges))if(!Number.isFinite(v[k])||v[k]<min||v[k]>max)throw Error('Ajuste de fundo inválido.');
    for(const k of ['wallpaper','extra'])if(typeof v[k]!=='string'||v[k].length>50*1024*1024||v[k]&&!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(v[k]))throw Error('Imagem avançada inválida.');
    if(!Array.isArray(v.order)||v.order.length>canonical.length||new Set(v.order).size!==v.order.length||v.order.some(id=>!layers.has(id))||canonical.some(id=>!optionalLayers.has(id)&&!v.order.includes(id)))throw Error('Ordem de camadas inválida.');
  }
  function setState(v){validateState(v);state=v?structuredClone(v):defaults();
    for(const id of canonical)if(!state.order.includes(id)){const next=canonical.slice(canonical.indexOf(id)+1).find(key=>state.order.includes(key)),index=next?state.order.indexOf(next):state.order.length;state.order.splice(index,0,id);}
    geometry();order();updateUI();render();}
  function change(fn){window.ThumbInteractions.commit();fn();render();updateUI();window.ThumbInteractions.commit();}
  for(const k of Object.keys(ranges))$('bg-'+k).addEventListener('input',()=>{state[k]=Number($('bg-'+k).value);render();$('bg-'+k+'-value').value=state[k];});
  $('background-source').onchange=()=>change(()=>{state.source=$('background-source').value;});
  $('effect-preset').onchange=()=>change(()=>{state.effect=$('effect-preset').value;const presets={none:{brightness:1,contrast:1,saturation:1,blur:0,shade:0,gamma:1},cinema:{brightness:.65,contrast:1.3,shade:.3,blur:0},dream:{brightness:1.1,blur:12,shade:.15},mono:{saturation:0,contrast:1.2,blur:0},vivid:{saturation:1.7,contrast:1.2,brightness:1,blur:0},neon:{brightness:.6,blur:3,shade:.3}};Object.assign(state,presets[state.effect]);});
  panel.querySelectorAll('[data-layer-move]').forEach(btn=>btn.onclick=()=>change(()=>{const id=$('layer-list').value,i=state.order.indexOf(id);if(i<0)return;const action=btn.dataset.layerMove,j=action==='top'?state.order.length-1:action==='bottom'?0:Math.max(0,Math.min(state.order.length-1,i+(action==='up'?1:-1)));state.order.splice(i,1);state.order.splice(j,0,id);order();$('layer-list').value=id;}));
  $('reset-layers').onclick=()=>change(()=>{state.order=[...canonical];order();});
  $('reset-background').onclick=()=>change(()=>{for(const [k,v]of Object.entries(ranges))state[k]=v[3];state.effect='none';});
  for(const target of ['wallpaper','extra']){
    $(target+'-upload').onchange=async e=>{const file=e.target.files[0];if(!file)return;const ticket=++sequence;window.dispatchEvent(new CustomEvent('thumb:loading',{detail:true}));try{const data=await engine.normalizeImage(file);if(ticket!==sequence)return;state[target]=data;if(target==='wallpaper')state.source='wallpaper';render();updateUI();$('status').textContent='Imagem adicionada. Ajuste o fundo ou posicione a imagem adicional na prévia.';}catch(err){$('status').textContent=window.ThumbI18n?.errorText(err)||err.message;}finally{e.target.value='';window.dispatchEvent(new CustomEvent('thumb:loading',{detail:false}));window.ThumbInteractions.commit();}};
    $('remove-'+target).onclick=()=>change(()=>{sequence++;state[target]='';if(target==='wallpaper'&&state.source==='wallpaper')state.source='none';});
  }
  window.addEventListener('thumb:layout',e=>{geometry();if(e.detail){state.source=state.wallpaper?'wallpaper':e.detail.source;state.shade=.25;}updateUI();render();});
  new MutationObserver(render).observe($('art-left'),{attributes:true,attributeFilter:['href']});new MutationObserver(render).observe($('art-right'),{attributes:true,attributeFilter:['href']});
  window.ThumbAdvanced={registerLayer(id,label,node,before){
      if(layers.has(id))throw Error('Camada duplicada');node.dataset.layer=id;layers.set(id,{node,label});optionalLayers.add(id);
      const index=canonical.indexOf(before);canonical.splice(index<0?canonical.length:index,0,id);
      const current=state.order.indexOf(before);state.order.splice(current<0?state.order.length:current,0,id);order();
    },getState:()=>structuredClone(state),setState,validateState,reset(){sequence++;setState(null);}};
  setState(null);window.ThumbInteractions.commit();
})();
