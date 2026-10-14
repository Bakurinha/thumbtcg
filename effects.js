/* SVG-only visual engine: deterministic static output, scheduled live preview, no external service. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),svg=$('thumb'),defs=svg.querySelector('defs'),ns=svg.namespaceURI;
const make=(tag,attrs={})=>{const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;};
const attrs=(el,values)=>{for(const [k,v]of Object.entries(values))el.setAttribute(k,v);};
const cardNumbers={rotation:[-180,180,1,0,'Rotação Z (°)'],tiltX:[-55,55,1,0,'Inclinação vertical simulada (°)'],tiltY:[-55,55,1,0,'Inclinação horizontal simulada (°)'],shadowBlur:[0,30,1,8,'Desfoque da sombra'],shadowX:[-60,60,1,12,'Sombra · horizontal'],shadowY:[-60,60,1,12,'Sombra · vertical'],shadowOpacity:[0,1,.05,.6,'Opacidade da sombra'],glowBlur:[0,25,1,8,'Desfoque do neon'],glowSpread:[0,12,1,2,'Expansão do neon'],glowOpacity:[0,1,.05,.8,'Intensidade do neon'],reflectionOpacity:[0,1,.05,.35,'Opacidade do reflexo'],reflectionGap:[0,100,1,10,'Distância do reflexo'],foilOpacity:[0,1,.05,.3,'Intensidade foil'],foilAngle:[0,180,1,25,'Ângulo das cores']};
const numbers={fanCount:[2,5,1,2,'Quantidade de cartas'],fanAngle:[0,100,1,45,'Abertura do leque (°)'],fanSpread:[25,260,5,150,'Espaçamento'],fanLift:[0,150,5,45,'Elevação da carta focal'],fanFocus:[1,5,1,1,'Carta focal'],fanX:[150,1130,5,640,'Centro horizontal'],fanY:[200,650,5,430,'Centro vertical'],fanScale:[.4,1.4,.05,1,'Escala do leque'],splitTop:[100,1180,10,760,'Divisão no topo'],splitBottom:[100,1180,10,520,'Divisão na base'],loupeX:[80,1200,5,1050,'Lupa · horizontal'],loupeY:[80,640,5,190,'Lupa · vertical'],loupeRadius:[50,240,5,120,'Raio da lupa'],loupeZoom:[1,5,.1,2,'Ampliação da lupa'],loupeU:[0,100,1,50,'Ponto da carta · horizontal (%)'],loupeV:[0,100,1,35,'Ponto da carta · vertical (%)'],burstX:[0,1280,10,640,'Origem dos raios · horizontal'],burstY:[0,720,10,360,'Origem dos raios · vertical'],burstOpacity:[0,1,.05,.35,'Intensidade dos raios'],leakX:[0,1280,10,1100,'Luz · horizontal'],leakY:[0,720,10,80,'Luz · vertical'],leakOpacity:[0,1,.05,.6,'Intensidade da luz'],speedCount:[8,80,1,35,'Quantidade de linhas'],particleCount:[5,120,1,45,'Quantidade de partículas'],seed:[1,999,1,7,'Variação das partículas'],textDepth:[1,16,1,8,'Profundidade do texto'],textStroke:[0,12,1,3,'Espessura da borda']};
const cardToggles=['transform','shadow','glow','reflection','foil'],toggles=['fan','split','loupe','guides','snap','burst','leak','speed','particles','text3d'];
const masks=['none','circle','blade','claw','shards','blast'];
const cardDefault=()=>({...Object.fromEntries(Object.entries(cardNumbers).map(([k,v])=>[k,v[3]])),...Object.fromEntries(cardToggles.map(k=>[k,false])),mask:'none',shadowColor:'#000000',glowColor:'#83ffaf'});
const defaults=()=>({...Object.fromEntries(Object.entries(numbers).map(([k,v])=>[k,v[3]])),...Object.fromEntries(toggles.map(k=>[k,false])),cards:{left:cardDefault(),right:cardDefault()},fanImages:['','',''],loupeSource:'left',color:'#75ffd6',textFinish:'metal',textColor:'#ffffff',textBottom:'#8baccf',textEdge:'#172439'});
let state=defaults(),target='left',frame=0,uploadSequence=[0,0,0],renderCount=0;
const slider=(key,card=false)=>{const [min,max,step,val,label]=(card?cardNumbers:numbers)[key];return `<label class="field"><span>${label} <output id="fx-value-${key}">${val}</output></span><input id="fx-${key}" data-fx="${key}" ${card?'data-card="true"':''} type="range" min="${min}" max="${max}" step="${step}" value="${val}"/></label>`;};
const color=(key,label,card=false)=>`<label class="field"><span>${label}</span><input type="color" id="fx-${key}" data-fx="${key}" ${card?'data-card="true"':''}/></label>`;
const feature=(key,label,body,card=false)=>`<section class="fx-feature"><label class="direct-switch"><input type="checkbox" id="fx-${key}" data-fx="${key}" ${card?'data-card="true"':''} aria-controls="fx-body-${key}"/> ${label}</label><div id="fx-body-${key}" class="fx-feature-body" hidden>${body}</div></section>`;
const panel=document.createElement('section');panel.className='fx-panel';panel.innerHTML=`<label class="direct-switch fx-title"><input type="checkbox" id="fx-mode" aria-controls="fx-options"/> Avançada e Prévia</label><p class="drag-hint">Enquadramento e efeitos com prévia ao vivo. As opções começam desligadas.</p><div id="fx-options" hidden><div class="fx-tabs" role="tablist" aria-label="Ferramentas visuais"><button type="button" role="tab" aria-selected="true" aria-controls="fx-camera" id="fx-camera-tab">Enquadramento & Câmera</button><button type="button" role="tab" aria-selected="false" aria-controls="fx-shaders" id="fx-shaders-tab" tabindex="-1">Efeitos & Shaders</button></div><label class="field fx-target"><span>Carta para ajustes individuais</span><select id="fx-target"><option value="left">Carta esquerda</option><option value="right">Carta direita</option></select></label><div id="fx-camera" role="tabpanel" aria-labelledby="fx-camera-tab" class="fx-grid">
${feature('transform','Rotação e inclinação 2D',`<p class="drag-hint">Simulação plana; não altera a perspectiva real da carta.</p>${['rotation','tiltX','tiltY'].map(k=>slider(k,true)).join('')}`,true)}
<section class="fx-feature"><label class="field"><span>Máscara da carta selecionada</span><select id="fx-mask" data-fx="mask" data-card="true"><option value="none">Sem máscara adicional</option><option value="circle">Círculo</option><option value="blade">Corte de lâmina</option><option value="claw">Rasgos de garra</option><option value="shards">Estilhaços</option><option value="blast">Explosão</option></select></label><p class="drag-hint">Combine com o recorte da ilustração e ajuste a posição nos controles da carta.</p></section>
${feature('fan','Leque de 2 a 5 cartas',`<p class="drag-hint">As duas primeiras são as cartas do editor. Envie as outras abaixo. O leque substitui visualmente as cartas soltas; desative para voltar. Os efeitos individuais se aplicam às cartas soltas.</p>${['fanCount','fanAngle','fanSpread','fanLift','fanFocus','fanX','fanY','fanScale'].map(k=>slider(k)).join('')}<div class="fx-uploads">${[0,1,2].map(i=>`<label class="field"><span>Carta ${i+3} <output id="fx-upload-state-${i}">Vazia</output></span><input type="file" id="fx-upload-${i}" accept="image/*"/></label><button class="studio-btn" type="button" data-remove-fan="${i}">Remover carta ${i+3}</button>`).join('')}</div><p id="fx-fan-status" class="drag-hint" role="status"></p>`)}
${feature('split','Divisão diagonal ajustável',`${slider('splitTop')}${slider('splitBottom')}<p class="drag-hint">Recorta as cartas nos dois lados da divisão. Desative para recuperar as máscaras do layout.</p>`)}
${feature('loupe','Lupa de detalhe',`<label class="field"><span>Carta de origem</span><select id="fx-loupeSource" data-fx="loupeSource"><option value="left">Esquerda</option><option value="right">Direita</option></select></label>${['loupeU','loupeV','loupeZoom','loupeX','loupeY','loupeRadius'].map(k=>slider(k)).join('')}<p class="drag-hint">Usa a carta original, inclusive nome e texto de efeito. Ajuste o ponto de interesse manualmente.</p>`)}
<section class="fx-feature"><label class="direct-switch"><input id="fx-guides" type="checkbox" data-fx="guides"/> Mostrar regra dos terços e centro</label><label class="direct-switch"><input id="fx-snap" type="checkbox" data-fx="snap"/> Encaixe magnético ao arrastar</label><p class="drag-hint">Ative “Editar elementos na prévia” para arrastar. As guias não aparecem no PNG.</p></section>
</div><div id="fx-shaders" role="tabpanel" aria-labelledby="fx-shaders-tab" class="fx-grid" hidden>
${feature('reflection','Reflexo em superfície',`${slider('reflectionOpacity',true)}${slider('reflectionGap',true)}<p class="drag-hint">Deixe espaço abaixo da carta para o reflexo aparecer.</p>`,true)}
${feature('shadow','Sombra projetada',`${color('shadowColor','Cor da sombra',true)}${['shadowBlur','shadowX','shadowY','shadowOpacity'].map(k=>slider(k,true)).join('')}`,true)}
${feature('glow','Aura / contorno neon',`${color('glowColor','Cor do neon',true)}${['glowBlur','glowSpread','glowOpacity'].map(k=>slider(k,true)).join('')}`,true)}
${feature('foil','Acabamento holográfico',`${slider('foilOpacity',true)}${slider('foilAngle',true)}<p class="drag-hint">Sobreposição estática de cores, preservada no PNG.</p>`,true)}
${feature('burst','Raios radiais',`${slider('burstX')}${slider('burstY')}${slider('burstOpacity')}`)}
${feature('leak','Luz difusa / flare',`${slider('leakX')}${slider('leakY')}${slider('leakOpacity')}`)}
${feature('speed','Linhas de velocidade',`${slider('speedCount')}<p class="drag-hint">Convergem para a origem dos raios radiais.</p>`)}
${feature('particles','Faíscas e partículas',`${slider('particleCount')}${slider('seed')}`)}
<section class="fx-feature">${color('color','Cor de raios, luzes, partículas e lupa')}<label class="field"><span>Fonte do fundo</span><select id="fx-bg-source"><option value="none">Tema do cardgame</option><option value="left">Carta esquerda</option><option value="right">Carta direita</option><option value="both">Duas cartas</option><option value="wallpaper">Wallpaper enviado</option></select></label><label class="field"><span>Desfoque do fundo <output id="fx-bg-blur-value">0</output></span><input type="range" id="fx-bg-blur" min="0" max="30" step="1" value="0"/></label><p class="drag-hint">Compartilha o fundo de “Edição avançada”, onde ficam gamma, brilho e upload.</p></section>
${feature('text3d','Títulos com volume simulado',`${slider('textDepth')}${slider('textStroke')}<label class="field"><span>Acabamento</span><select id="fx-textFinish" data-fx="textFinish"><option value="metal">Metálico</option><option value="plastic">Plástico / gradiente</option></select></label>${color('textColor','Cor superior')}${color('textBottom','Cor inferior')}${color('textEdge','Extrusão e borda')}<p class="drag-hint">Aplicado aos dois títulos de deck. Extrusão 2D; sem geometria ou bisel 3D real.</p>`)}
<section class="fx-feature"><strong>Personagem fora da moldura</strong><p class="drag-hint">Envie um PNG já recortado como “Imagem adicional” em Edição avançada, posicione na prévia e traga a camada para a frente. O recorte do personagem é manual.</p><button class="studio-btn" type="button" id="fx-open-extra">Abrir imagem adicional</button></section>
</div><div class="fx-footer"><button class="studio-btn" type="button" id="fx-reset-card">Restaurar efeitos desta carta</button><button class="studio-btn" type="button" id="fx-reset">Restaurar este módulo</button><span id="fx-status" role="status">Prévia pronta</span></div></div>`;
document.querySelector('.advanced-tools').after(panel);
$('fx-mode').onchange=()=>{$('fx-options').hidden=!$('fx-mode').checked;};
function tab(name){for(const key of ['camera','shaders']){const active=key===name;$('fx-'+key).hidden=!active;$('fx-'+key+'-tab').setAttribute('aria-selected',String(active));$('fx-'+key+'-tab').tabIndex=active?0:-1;}}
for(const key of ['camera','shaders']){const b=$('fx-'+key+'-tab');b.onclick=()=>tab(key);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'camera':e.key==='End'?'shaders':key==='camera'?'shaders':'camera';tab(next);$('fx-'+next+'-tab').focus();}};}
function updateUI(){panel.querySelectorAll('[data-fx]').forEach(el=>{const v=el.dataset.card?state.cards[target][el.dataset.fx]:state[el.dataset.fx];if(el.type==='checkbox')el.checked=v;else el.value=v;const output=$('fx-value-'+el.dataset.fx);if(output)output.value=v;const body=$('fx-body-'+el.dataset.fx);if(body)body.hidden=!v;});for(let i=0;i<3;i++)$('fx-upload-state-'+i).value=state.fanImages[i]?'Carregada':'Vazia';syncBackgroundUI();}
function syncBackgroundUI(){const a=window.ThumbAdvanced.getState();$('fx-bg-source').value=a.source;$('fx-bg-blur').value=a.blur;$('fx-bg-blur-value').value=a.blur;}
$('fx-target').onchange=()=>{target=$('fx-target').value;updateUI();};
panel.addEventListener('input',e=>{const el=e.target,key=el.dataset.fx;if(!key)return;const data=el.dataset.card?state.cards[target]:state;data[key]=el.type==='checkbox'?el.checked:el.type==='range'?Number(el.value):el.value;const output=$('fx-value-'+key);if(output)output.value=data[key];const body=$('fx-body-'+key);if(body)body.hidden=!data[key];schedule();});
// Select changes and programmatic checkbox changes also follow the same path.
panel.addEventListener('change',e=>{if(e.target.dataset.fx)e.target.dispatchEvent(new Event('input',{bubbles:true}));});
$('fx-bg-source').onchange=()=>{$('background-source').value=$('fx-bg-source').value;$('background-source').dispatchEvent(new Event('change',{bubbles:true}));};
$('fx-bg-blur').oninput=()=>{$('bg-blur').value=$('fx-bg-blur').value;$('bg-blur').dispatchEvent(new Event('input',{bubbles:true}));syncBackgroundUI();};
document.querySelector('.advanced-tools').addEventListener('input',syncBackgroundUI);document.querySelector('.advanced-tools').addEventListener('change',syncBackgroundUI);
$('fx-open-extra').onclick=()=>{$('advanced-mode').checked=true;$('advanced-mode').dispatchEvent(new Event('change'));$('extra-upload').scrollIntoView({behavior:'smooth',block:'center'});$('extra-upload').focus({preventScroll:true});};
// Reusable masks are native vectors and export without external assets.
const paths={blade:'M.16 0H1L.84 1H0Z',claw:'M0 0H.27L.2 .3 .31 .58 .24 1H0ZM.37 0H.62L.55 .35 .67 .65 .59 1H.34L.42 .6 .31 .29ZM.74 0H1V1H.7L.79 .64 .68 .28Z',shards:'M0 .02L.45 .08 .3 .48 .02 .56ZM.5 0L1 .06 .89 .49 .35 .45ZM0 .62L.29 .54 .48 .98H.02ZM.37 .52L.94 .56 1 1 .55 .95Z',blast:'M.5 0L.59 .15 .76 .04 .78 .23 .98 .2 .86 .39 1 .5 .85 .59 .96 .8 .76 .77 .73 .98 .57 .85 .48 1 .4 .84 .2 .96 .23 .76 .02 .8 .15 .59 0 .48 .16 .4 .04 .2 .24 .24 .26 .03 .42 .16Z'};
for(const name of masks.filter(k=>k!=='none')){const clip=make('clipPath',{id:'fx-mask-'+name,clipPathUnits:'objectBoundingBox'});clip.append(name==='circle'?make('circle',{cx:.5,cy:.5,r:.5}):make('path',{d:paths[name]}));defs.append(clip);}
for(const side of ['left','right']){const clip=make('clipPath',{id:'fx-split-'+side});clip.append(make('path'));defs.append(clip);}
const visuals={};
for(const side of ['left','right']){
 const image=$('art-'+side),geo=make('g',{'data-fx-card':side}),photo=make('g'),face=make('g'),reflection=make('g'),foil=make('rect',{'pointer-events':'none'});
 image.before(geo);geo.append(reflection,photo);photo.append(face);face.append(image,foil);
 const f=make('filter',{id:'fx-light-'+side,x:'-65%',y:'-65%',width:'230%',height:'230%','color-interpolation-filters':'sRGB'});defs.append(f);
 const gradient=make('linearGradient',{id:'fx-foil-'+side,x1:0,y1:0,x2:1,y2:1});['#ff416f','#ffd94c','#67ffb1','#59bfff','#b765ff','#ff9dd9'].forEach((c,i)=>gradient.append(make('stop',{offset:i/5,'stop-color':c})));defs.append(gradient);
 const fade=make('linearGradient',{id:'fx-reflection-fade-'+side,gradientUnits:'userSpaceOnUse',x1:0,x2:0});fade.append(make('stop',{offset:0,'stop-color':'white'}),make('stop',{offset:1,'stop-color':'black'}));defs.append(fade);
 const mask=make('mask',{id:'fx-reflection-mask-'+side,maskUnits:'userSpaceOnUse'});mask.append(make('rect',{fill:`url(#fx-reflection-fade-${side})`}));defs.append(mask);
 const reflectionUse=make('use',{href:'#art-'+side});reflection.append(reflectionUse);reflection.setAttribute('mask',`url(#fx-reflection-mask-${side})`);
 visuals[side]={image,geo,photo,face,reflection,reflectionUse,foil,gradient,fade,mask,filter:f};
}
function layer(id,label,before,editable=false){const node=make('g',{id});svg.insertBefore(node,svg.querySelector('[data-editor-only]'));const wrapper=editable?window.ThumbInteractions.register(id,label):node;window.ThumbAdvanced.registerLayer(id,label,wrapper,before);return node;}
const atmosphere=layer('fx-scene-atmosphere','Luzes e linhas de ação','art-left');
const fan=layer('fx-scene-fan','Leque de cartas','text-versus',true);
const particles=layer('fx-scene-particles','Faíscas e partículas','extra-image');
const loupe=layer('fx-scene-loupe','Lupa de detalhe','extra-image',true);
const selectionOverlay=svg.querySelector('[data-editor-only]');
const guides=make('g',{'data-editor-only':'true','pointer-events':'none',opacity:.7});svg.insertBefore(guides,svg.querySelector('[data-editor-only]'));
for(const x of [1280/3,640,2560/3])guides.append(make('path',{d:`M${x} 0V720`,stroke:'#e8ffb2','stroke-width':1.4,'stroke-dasharray':'9 7'}));
for(const y of [240,360,480])guides.append(make('path',{d:`M0 ${y}H1280`,stroke:'#e8ffb2','stroke-width':1.4,'stroke-dasharray':'9 7'}));
const loupeClip=make('clipPath',{id:'fx-loupe-clip'});loupeClip.append(make('circle'));defs.append(loupeClip);
const leakGradient=make('radialGradient',{id:'fx-leak-gradient'});leakGradient.append(make('stop',{offset:0,'stop-color':'white'}),make('stop',{offset:.22,'stop-color':state.color}),make('stop',{offset:1,'stop-color':state.color,'stop-opacity':0}));defs.append(leakGradient);
const textGroups={};
for(const side of ['left','right']){const text=$('text-'+side+'-deck'),group=make('g',{'pointer-events':'none'});text.before(group);textGroups[side]=group;const gradient=make('linearGradient',{id:'fx-text-'+side,x1:0,y1:0,x2:0,y2:1});defs.append(gradient);}
function shadowFilter(v,c){
 const f=v.filter;f.replaceChildren();if(!c.shadow&&!c.glow){v.photo.removeAttribute('filter');return;}
 if(c.glow){f.append(make('feMorphology',{in:'SourceAlpha',operator:'dilate',radius:c.glowSpread,result:'spread'}),make('feGaussianBlur',{in:'spread',stdDeviation:c.glowBlur,result:'soft'}),make('feFlood',{'flood-color':c.glowColor,'flood-opacity':c.glowOpacity,result:'color'}),make('feComposite',{in:'color',in2:'soft',operator:'in',result:'glow'}));}
 if(c.shadow)f.append(make('feGaussianBlur',{in:'SourceAlpha',stdDeviation:c.shadowBlur,result:'shadowBlur'}),make('feOffset',{in:'shadowBlur',dx:c.shadowX,dy:c.shadowY,result:'offset'}),make('feFlood',{'flood-color':c.shadowColor,'flood-opacity':c.shadowOpacity,result:'shadowColor'}),make('feComposite',{in:'shadowColor',in2:'offset',operator:'in',result:'shadow'}));
 const merge=make('feMerge');if(c.shadow)merge.append(make('feMergeNode',{in:'shadow'}));if(c.glow)merge.append(make('feMergeNode',{in:'glow'}));merge.append(make('feMergeNode',{in:'SourceGraphic'}));f.append(merge);v.photo.setAttribute('filter',`url(#${f.id})`);
}
function renderCard(side){
 const v=visuals[side],c=state.cards[side],image=v.image,x=+image.getAttribute('x'),y=+image.getAttribute('y'),w=+image.getAttribute('width'),h=+image.getAttribute('height'),cx=x+w/2,cy=y+h/2;
 const ax=c.tiltX*Math.PI/180,ay=c.tiltY*Math.PI/180;
 v.geo.setAttribute('transform',c.transform?`translate(${cx} ${cy}) rotate(${c.rotation}) skewX(${c.tiltY*.35}) scale(${Math.cos(ay)} ${Math.cos(ax)}) translate(${-cx} ${-cy})`:'');
 v.geo.style.visibility=state.fan?'hidden':'';
 v.face.setAttribute('clip-path',c.mask==='none'?'none':`url(#fx-mask-${c.mask})`);
 shadowFilter(v,c);
 attrs(v.foil,{x,y,width:w,height:h,fill:`url(#fx-foil-${side})`,opacity:c.foilOpacity,transform:image.getAttribute('transform')||'','clip-path':image.getAttribute('clip-path')||'none'});v.foil.style.display=c.foil&&!!image.getAttribute('href')&&image.style.display!=='none'?'':'none';v.foil.style.mixBlendMode='screen';v.gradient.setAttribute('gradientTransform',`rotate(${c.foilAngle} .5 .5)`);
 v.reflection.style.display=c.reflection&&!!image.getAttribute('href')&&image.style.display!=='none'?'':'none';v.reflection.setAttribute('opacity',c.reflectionOpacity);
 v.reflectionUse.setAttribute('clip-path',c.mask==='none'?'none':`url(#fx-mask-${c.mask})`);
 v.reflectionUse.setAttribute('transform',`translate(0 ${2*(y+h)+c.reflectionGap}) scale(1 -1)`);
 attrs(v.fade,{y1:y+h+c.reflectionGap,y2:y+h+c.reflectionGap+h*.75});attrs(v.mask,{x:x-w,y:y+h+c.reflectionGap,width:w*3,height:h});attrs(v.mask.firstElementChild,{x:x-w,y:y+h+c.reflectionGap,width:w*3,height:h});
 const clipRoot=image.closest('[data-original-clip]');if(clipRoot){const kind=window.ThumbEngine.layoutExtra()?.kind;clipRoot.setAttribute('clip-path',state.split?`url(#fx-split-${side})`:!kind||kind==='diagonal'?clipRoot.dataset.originalClip:'none');}
}
function renderFan(){
 fan.replaceChildren();fan.style.display=state.fan?'':'none';if(!state.fan){$('fx-fan-status').textContent='';return;}
 const images=[$('art-left').getAttribute('href')||'',$('art-right').getAttribute('href')||'',...state.fanImages];const entries=images.slice(0,state.fanCount).map((src,i)=>({src,i})).filter(v=>v.src),focus=Math.min(state.fanFocus,state.fanCount)-1;
 $('fx-fan-status').textContent=entries.length<state.fanCount?`${entries.length} de ${state.fanCount} imagens disponíveis. Envie as cartas que faltam.`:'Leque pronto. Arraste o conjunto pela prévia ou use os controles.';
 entries.sort((a,b)=>(a.i===focus?1:0)-(b.i===focus?1:0));
 for(const {src,i}of entries){const offset=i-(state.fanCount-1)/2,angle=offset*state.fanAngle/Math.max(1,state.fanCount-1),x=state.fanX+offset*state.fanSpread*state.fanScale,y=state.fanY-(i===focus?state.fanLift:0),g=make('g',{transform:`translate(${x} ${y}) rotate(${angle}) scale(${state.fanScale})`});g.append(make('rect',{x:-150,y:-210,width:300,height:420,rx:12,fill:'#111827',stroke:'#d9e9ff','stroke-width':3}),make('image',{href:src,x:-145,y:-205,width:290,height:410,preserveAspectRatio:'xMidYMid meet'}));fan.append(g);}
}
function renderLoupe(){
 loupe.replaceChildren();loupe.style.display=state.loupe?'':'none';if(!state.loupe)return;
 const source=window.ThumbStudio.getOriginal(state.loupeSource);if(!source)return;
 const r=state.loupeRadius,cx=state.loupeX,cy=state.loupeY,ratio=sourceSizes[state.loupeSource]||.714,w=r*2*state.loupeZoom,h=w/ratio;
 attrs(loupeClip.firstElementChild,{cx,cy,r});loupe.append(make('circle',{cx,cy,r:r+5,fill:'#111827',stroke:state.color,'stroke-width':8}),make('image',{href:source,x:cx-w*state.loupeU/100,y:cy-h*state.loupeV/100,width:w,height:h,preserveAspectRatio:'none','clip-path':'url(#fx-loupe-clip)'}));
}
function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function renderAtmosphere(){
 atmosphere.replaceChildren();const cx=state.burstX,cy=state.burstY;
 if(state.burst)for(let i=0;i<28;i++){const a=i*Math.PI/14,b=a+.047;atmosphere.append(make('path',{d:`M${cx} ${cy}L${cx+1600*Math.cos(a)} ${cy+1600*Math.sin(a)}L${cx+1600*Math.cos(b)} ${cy+1600*Math.sin(b)}Z`,fill:state.color,opacity:state.burstOpacity}));}
 if(state.leak){leakGradient.children[1].setAttribute('stop-color',state.color);leakGradient.children[2].setAttribute('stop-color',state.color);atmosphere.append(make('ellipse',{cx:state.leakX,cy:state.leakY,rx:520,ry:310,fill:'url(#fx-leak-gradient)',opacity:state.leakOpacity}));}
 if(state.speed){const rand=random(31);for(let i=0;i<state.speedCount;i++){const a=i/state.speedCount*Math.PI*2,r=220+rand()*220;atmosphere.append(make('path',{d:`M${cx+r*Math.cos(a)} ${cy+r*Math.sin(a)}L${cx+1500*Math.cos(a)} ${cy+1500*Math.sin(a)}`,stroke:state.color,'stroke-width':1+rand()*5,opacity:.25+rand()*.5}));}}
 particles.replaceChildren();particles.style.display=state.particles?'':'none';if(state.particles){const rand=random(state.seed);for(let i=0;i<state.particleCount;i++){const x=rand()*1280,y=rand()*720,r=1+rand()*5;particles.append(make(i%4?'circle':'path',i%4?{cx:x,cy:y,r,fill:state.color,opacity:.3+rand()*.7}:{d:`M${x-r*3} ${y}h${r*6}M${x} ${y-r*3}v${r*6}`,stroke:state.color,'stroke-width':1.5,opacity:.8}));}}
}
function renderText(){
 for(const side of ['left','right']){const text=$('text-'+side+'-deck'),group=textGroups[side],gradient=$('fx-text-'+side);group.replaceChildren();text.setAttribute('opacity',state.text3d?0:1);if(!state.text3d||text.style.display==='none')continue;
 gradient.replaceChildren();const colors=state.textFinish==='metal'?[[0,state.textColor],[.42,'#ffffff'],[.47,state.textBottom],[.53,state.textEdge],[1,state.textBottom]]:[[0,state.textColor],[1,state.textBottom]];for(const [offset,c]of colors)gradient.append(make('stop',{offset,'stop-color':c}));
 const clone=(dx,dy,front)=>{const c=text.cloneNode(true);c.removeAttribute('id');c.removeAttribute('filter');c.setAttribute('opacity',1);c.setAttribute('transform',`${text.getAttribute('transform')||''} translate(${dx} ${dy})`);c.setAttribute('fill',front?`url(#fx-text-${side})`:state.textEdge);c.setAttribute('stroke',state.textEdge);c.setAttribute('stroke-width',state.textStroke);c.setAttribute('paint-order','stroke');return c;};for(let d=state.textDepth;d>=1;d--)group.append(clone(d,d,false));group.append(clone(0,0,true));
 }
}
let sourceSizes={left:.714,right:.714},sourceTokens={left:0,right:0};
function measureSources(){for(const side of ['left','right']){const src=window.ThumbStudio.getOriginal(side);if(!src)continue;const token=++sourceTokens[side],img=new Image();img.onload=()=>{if(token===sourceTokens[side]){sourceSizes[side]=img.naturalWidth/img.naturalHeight;schedule();}};img.src=src;}}
function render(){
 for(const side of ['left','right'])renderCard(side);
 $('fx-split-left').firstElementChild.setAttribute('d',`M0 0H${state.splitTop}L${state.splitBottom} 720H0Z`);$('fx-split-right').firstElementChild.setAttribute('d',`M${state.splitTop} 0H1280V720H${state.splitBottom}Z`);
 renderFan();renderLoupe();renderAtmosphere();renderText();guides.style.display=state.guides?'':'none';svg.insertBefore(guides,selectionOverlay);renderCount++;$('fx-status').textContent='Prévia atualizada';window.ThumbInteractions.refresh();
}
function schedule(){if(!frame){$('fx-status').textContent='Atualizando prévia…';frame=requestAnimationFrame(()=>{frame=0;render();});}}
function flush(){if(frame){cancelAnimationFrame(frame);frame=0;}render();}
function validateState(v){
 if(v==null)return;if(typeof v!=='object'||Array.isArray(v))throw Error('Efeitos inválidos.');
 const check=(data,schema,flags)=>{if(!data||typeof data!=='object')throw Error('Configuração visual inválida.');for(const [key,[min,max,step]]of Object.entries(schema))if(!Number.isFinite(data[key])||data[key]<min||data[key]>max||(step===1&&!Number.isInteger(data[key])))throw Error('Parâmetro visual inválido: '+key);for(const key of flags)if(typeof data[key]!=='boolean')throw Error('Opção visual inválida.');};
 check(v,numbers,toggles);for(const side of ['left','right']){const c=v.cards?.[side];check(c,cardNumbers,cardToggles);if(!masks.includes(c.mask))throw Error('Máscara inválida.');for(const key of ['shadowColor','glowColor'])if(!/^#[0-9a-f]{6}$/i.test(c[key]))throw Error('Cor de efeito inválida.');}
 for(const key of ['color','textColor','textBottom','textEdge'])if(!/^#[0-9a-f]{6}$/i.test(v[key]))throw Error('Cor visual inválida.');if(!['metal','plastic'].includes(v.textFinish)||!['left','right'].includes(v.loupeSource))throw Error('Origem ou acabamento inválido.');
 if(!Array.isArray(v.fanImages)||v.fanImages.length!==3||v.fanImages.some(src=>typeof src!=='string'||src.length>50*1024*1024||src&&!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(src)))throw Error('Cartas do leque inválidas.');
}
function setState(v){validateState(v);state=v?structuredClone(v):defaults();updateUI();measureSources();flush();}
function reset(){uploadSequence=uploadSequence.map(n=>n+1);setState(null);}
$('fx-reset-card').onclick=()=>{window.ThumbInteractions.commit();state.cards[target]=cardDefault();updateUI();flush();window.ThumbInteractions.commit();};
$('fx-reset').onclick=()=>{window.ThumbInteractions.commit();reset();window.ThumbInteractions.commit();};
for(let i=0;i<3;i++){
 $('fx-upload-'+i).onchange=async e=>{const file=e.target.files[0];if(!file)return;const ticket=++uploadSequence[i];window.dispatchEvent(new CustomEvent('thumb:loading',{detail:true}));try{const data=await window.ThumbEngine.normalizeImage(file);if(ticket!==uploadSequence[i])return;state.fanImages[i]=data;updateUI();schedule();}catch(err){$('status').textContent=err.message;}finally{e.target.value='';window.dispatchEvent(new CustomEvent('thumb:loading',{detail:false}));window.ThumbInteractions.commit();}};
 panel.querySelector(`[data-remove-fan="${i}"]`).onclick=()=>{window.ThumbInteractions.commit();uploadSequence[i]++;state.fanImages[i]='';updateUI();schedule();window.ThumbInteractions.commit();};
}
function snap(box,dx,dy){
 if(!state.snap)return {dx,dy};const best=(positions,anchors)=>{let delta=0,distance=11;for(const p of positions)for(const a of anchors){const d=a-p;if(Math.abs(d)<distance){distance=Math.abs(d);delta=d;}}return delta;};
 return {dx:dx+best([box.x+dx,box.x+dx+box.width/2,box.x+dx+box.width],[0,1280/3,640,2560/3,1280]),dy:dy+best([box.y+dy,box.y+dy+box.height/2,box.y+dy+box.height],[0,240,360,480,720])};
}
// Observe only source properties; renderer-owned attributes are excluded to avoid feedback loops.
for(const side of ['left','right']){new MutationObserver(schedule).observe($('art-'+side),{attributes:true,attributeFilter:['href','x','y','width','height','transform','style']});new MutationObserver(schedule).observe($('text-'+side+'-deck'),{attributes:true,attributeFilter:['x','y','font-size','font-family','text-anchor','style','textLength','lengthAdjust'],childList:true,characterData:true,subtree:true});}
window.addEventListener('thumb:layout',schedule);window.addEventListener('thumb:image',()=>{measureSources();schedule();});window.addEventListener('thumb:ready',()=>{measureSources();schedule();});
window.ThumbFX={getBounds:id=>id==='fx-scene-loupe'?{x:state.loupeX-state.loupeRadius-9,y:state.loupeY-state.loupeRadius-9,width:2*(state.loupeRadius+9),height:2*(state.loupeRadius+9)}:null,getState:()=>({...state,cards:{left:{...state.cards.left},right:{...state.cards.right}},fanImages:[...state.fanImages]}),setState,validateState,reset,flush,snap,renderCount:()=>renderCount};
updateUI();flush();window.ThumbInteractions.resetHistory();
})();
