/* ThumbTCG studio: game routing, artwork framing, library search and portable drafts. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),engine=window.ThumbEngine,providers=window.ThumbProviders;
const games={
 digimon:{name:'Digimon TCG',accent:'#b5ed7a',ribbon:'DIGIMON CARD GAME • DECK BATTLE',layout:'layout1',colors:[['green','Verde'],['blue','Azul'],['red','Vermelho'],['yellow','Amarelo'],['purple','Roxo'],['black','Preto'],['white','Branco']],left:'green',right:'blue',note:'Energia digital, contraste de cores e enquadramento original de Digimon.',crop:[0,0,1,1],font:'hyper'},
 yugioh:{name:'Yu-Gi-Oh!',accent:'#c7a1ff',ribbon:'YU-GI-OH! • DUEL',layout:'layout3',colors:[['normal','Monstro normal'],['effect','Monstro de efeito'],['fusion','Fusão'],['synchro','Sincro'],['xyz','Xyz'],['link','Link'],['ritual','Ritual'],['spell','Magia'],['trap','Armadilha'],['pendulum','Pêndulo']],left:'fusion',right:'link',note:'Geometria de duelo e cores inspiradas nas molduras. O foco inicial recorta a ilustração.',crop:[.12,.18,.76,.48],font:'knockout'},
 magic:{name:'Magic: The Gathering',accent:'#efbb80',ribbon:'MAGIC: THE GATHERING • MATCH',layout:'layout4',colors:[['white','Mana branca'],['blue','Mana azul'],['black','Mana preta'],['red','Mana vermelha'],['green','Mana verde'],['yellow','Multicolorido / Dourado']],left:'red',right:'blue',note:'Atmosfera arcana, cores da mana e ilustração em primeiro plano. Ajuste o recorte para versões especiais.',crop:[.08,.12,.84,.43],font:'duel'},
 onepiece:{name:'One Piece',accent:'#ff9380',ribbon:'ONE PIECE CARD GAME • LEADER BATTLE',layout:'layout2',colors:[['red','Vermelho'],['green','Verde'],['blue','Azul'],['purple','Roxo'],['black','Preto'],['yellow','Amarelo']],left:'red',right:'yellow',note:'Impacto de mangá e cores dos líderes. Recorte amplo para valorizar o personagem.',crop:[.05,.12,.9,.66],font:'arena'}
};
const colorHex={normal:'#d0ab60',effect:'#d9864c',fusion:'#b878ff',synchro:'#eef4ff',xyz:'#929aa6',link:'#47bcff',ritual:'#5ca4d8',spell:'#49c69e',trap:'#d866a8',pendulum:'#69cda3',green:'#8cff4b',blue:'#47bcff',red:'#ff6b63',yellow:'#ffd24d',purple:'#b878ff',black:'#9da8b6',white:'#eef4ff'};
let active=null,busy=0,routeVersion=0;const drafts=new Map(),art={left:{},right:{}};
const requests={left:null,right:null},searchState={left:{},right:{}};
const editor=$('editor'),controls=document.querySelector('.controls'),preview=document.querySelector('.preview');
const baseFields=[...editor.querySelectorAll('input[id],select[id]')].filter(el=>el.type!=='file');
// Keep the canvas visible beside tools on larger screens; use a single column on mobile.
const workspace=document.createElement('div');workspace.className='workspace';
const canvasColumn=document.createElement('div');canvasColumn.className='canvas-column';
preview.before(workspace);workspace.append(canvasColumn,controls);canvasColumn.append(preview,$('status'));
const actions=document.createElement('div');actions.className='project-actions';
actions.innerHTML='<button class="studio-btn" id="save-project" type="button">↓ Salvar projeto</button><label class="studio-btn" for="open-project">↑ Abrir projeto</label><input id="open-project" class="file-hidden" type="file" accept=".json,application/json"/><button class="studio-btn" id="move-art" type="button" aria-pressed="false">Mover arte na prévia</button><select class="studio-btn" id="move-side" aria-label="Carta para mover"><option value="left">Carta esquerda</option><option value="right">Carta direita</option></select>';
canvasColumn.append(actions);
const themeNote=document.createElement('p');themeNote.className='theme-description';canvasColumn.append(themeNote);
const tabs=document.createElement('div');tabs.className='panel-tabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Opções do editor');
tabs.innerHTML='<button class="active" type="button" aria-pressed="true" data-panel="layouts">01 · Layouts</button><button type="button" aria-pressed="false" data-panel="custom">02 · Textos e elementos</button>';
const layoutPanel=document.querySelector('.layout-toolbar'),customPanel=document.querySelector('.custom-toolbar');
canvasColumn.append(tabs,layoutPanel,customPanel);customPanel.hidden=true;
tabs.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{tabs.querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn));});layoutPanel.hidden=btn.dataset.panel!=='layouts';customPanel.hidden=btn.dataset.panel!=='custom';}));
const patterns={
 digimon:'<path d="M0 0H80V80" fill="none" stroke="#b4ffd5" stroke-opacity=".09"/>',
 yugioh:'<path d="M40 5L75 40 40 75 5 40Z" fill="none" stroke="#ffe0a0" stroke-opacity=".13"/>',
 magic:'<circle cx="40" cy="40" r="30" fill="none" stroke="#ffe6b7" stroke-opacity=".1"/><circle cx="40" cy="40" r="23" fill="none" stroke="#ffe6b7" stroke-opacity=".05"/>',
 onepiece:'<path d="M0 75L80 5M0 80L80 10" stroke="#fff" stroke-opacity=".1"/><circle cx="20" cy="20" r="2" fill="#fff" fill-opacity=".13"/>'
};
function value(id,text){const el=$(id);el.value=text;el.dispatchEvent(new Event('input',{bubbles:true}));}
function setColor(side,key){const hex=colorHex[key]||colorHex.blue;$(`theme-${side}`).value=key;$(`accent-${side}`).value=hex;engine.applyTheme(side,engine.paletteFromAccent(hex));}
function defaults(side){art[side]={original:'',x:0,y:0,zoom:1,mode:active==='digimon'?'full':'art',generation:(art[side].generation||0)+1};syncArt(side);}
function syncArt(side){for(const key of ['x','y','zoom']){$(`${key}-${side}`).value=art[side][key];$(`${key}-value-${side}`).textContent=key==='zoom'?`${Math.round(art[side][key]*100)}%`:`${Math.round(art[side][key])}`;}$(`crop-${side}`).value=art[side].mode;transform(side);}
function transform(side){const img=$(`art-${side}`),a=art[side],cx=Number(img.getAttribute('x'))+Number(img.getAttribute('width'))/2,cy=Number(img.getAttribute('y'))+Number(img.getAttribute('height'))/2;
 img.setAttribute('transform',`translate(${a.x||0} ${a.y||0}) translate(${cx} ${cy}) scale(${a.zoom||1}) translate(${-cx} ${-cy})`);
}
async function cropImage(source,side){
 const a=art[side];if(a.mode==='full'||active==='digimon')return source;
 const img=new Image();img.src=source;await img.decode();
 const [x,y,w,h]=games[active].crop,canvas=document.createElement('canvas');canvas.width=Math.round(img.naturalWidth*w);canvas.height=Math.round(img.naturalHeight*h);
 canvas.getContext('2d').drawImage(img,img.naturalWidth*x,img.naturalHeight*y,canvas.width,canvas.height,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/png');
}
window.ThumbStudio={async prepareImage(source,side){
 const game=active;art[side].original=source;art[side].x=0;art[side].y=0;art[side].zoom=1;syncArt(side);const result=await cropImage(source,side);if(active!==game)throw new Error('O cardgame foi alterado. Envie a carta novamente.');return result;
}};
window.addEventListener('thumb:image',e=>transform(e.detail.side));
window.addEventListener('thumb:layout',()=>{
 if(!active)return;value('top-ribbon-input',games[active].ribbon);value('deck-font',games[active].font);value('card-font',games[active].font);for(const side of ['left','right'])transform(side);
});
function snapshot(){
 return {format:'thumbtcg',version:2,game:active,fields:Object.fromEntries(baseFields.map(el=>[el.id,el.type==='checkbox'?el.checked:el.value])),art:structuredClone(art)};
}
async function restore(data){
 engine.applyLayout(data.fields['layout-preset']||games[active].layout);
 for(const el of baseFields){if(!(el.id in data.fields))continue;if(el.type==='checkbox')el.checked=Boolean(data.fields[el.id]);else el.value=String(data.fields[el.id]);}
 for(const side of ['left','right']){
  art[side]={...data.art[side],generation:0};syncArt(side);engine.applyTheme(side,engine.paletteFromAccent($(`accent-${side}`).value));
  if(art[side].original)engine.setImage(side,await cropImage(art[side].original,side));
 }
 engine.applyCustomControls();
}
async function route(){
 const next=location.hash.slice(1),valid=Object.hasOwn(games,next)?next:null;
 if(busy){$('status').textContent='Aguarde a imagem terminar de carregar antes de trocar de jogo.';history.replaceState(null,'',active?`#${active}`:location.pathname);return;}
 if(active)drafts.set(active,snapshot());routeVersion++;for(const s of ['left','right'])requests[s]?.abort();
 active=valid;editor.hidden=!active;$('welcome').hidden=!!active;$('change-game').hidden=!active;document.querySelector('.nav-label').hidden=!!active;
 if(!active){document.title='ThumbTCG — seu deck em destaque';document.body.removeAttribute('data-game');document.documentElement.style.setProperty('--accent','#c6f36b');return;}
 const game=games[active];document.body.dataset.game=active;document.title=`${game.name} · ThumbTCG`;$('editor-title').textContent=game.name;themeNote.textContent=game.note;
 document.documentElement.style.setProperty('--accent',game.accent);engine.resetImages();
 const mesh=$('mesh');mesh.setAttribute('width','80');mesh.setAttribute('height','80');mesh.innerHTML=patterns[active];
 for(const side of ['left','right']){
  defaults(side);const select=$(`theme-${side}`);select.replaceChildren(...game.colors.map(([key,name])=>new Option(name,key)),new Option('Personalizada','custom'));
  const provider=providers[active];$(`search-${side}`).placeholder=provider.placeholder;$(`search-${side}`).value='';$(`source-${side}`).textContent=provider.label;$(`source-${side}`).href=provider.link;$(`source-note-${side}`).textContent=provider.note;$(`results-${side}`).replaceChildren();$(`search-status-${side}`).textContent='';$(`more-${side}`).hidden=true;$(`search-button-${side}`).disabled=false;searchState[side]={};
  $(`crop-${side}`).querySelector('[value=art]').textContent=active==='digimon'?'Enquadramento Digimon':'Destacar ilustração';
 }
 if(drafts.has(active)){busy++;try{await restore(drafts.get(active));}finally{busy--;}}else{
  engine.applyLayout(game.layout);for(const side of ['left','right']){setColor(side,game[side]);value(`input-${side}-deck`,side==='left'?'DECK 01':'DECK 02');value(`input-${side}-digimon`,'');value(`input-${side}-detail`,'');}
  value('top-ribbon-input',game.ribbon);value('deck-font',game.font);value('card-font',game.font);
 }
 $('status').textContent='Busque uma carta ou envie suas imagens para começar.';engine.applyCustomControls();
 $('editor-title').setAttribute('tabindex','-1');$('editor-title').focus({preventScroll:true});window.scrollTo({top:0});
}
function buildSide(side){
 const panel=$(`panel-${side}`),box=document.createElement('form');box.className='library-box';box.innerHTML=`<label for="search-${side}">BUSCAR CARTA · ${side==='left'?'ESQUERDA':'DIREITA'}</label><div class="search-row"><input id="search-${side}" type="search" maxlength="80" autocomplete="off"/><button type="submit" id="search-button-${side}">Buscar</button></div><p class="source-note">Base: <a id="source-${side}" target="_blank" rel="noopener noreferrer"></a></p><p class="source-note" id="source-note-${side}"></p><p class="search-status" id="search-status-${side}" role="status" aria-live="polite"></p><div class="search-results" id="results-${side}"></div><button type="button" class="studio-btn more-results" id="more-${side}" hidden>Mostrar mais</button>`;
 panel.querySelector('.side-heading').after(box);box.addEventListener('submit',e=>{e.preventDefault();search(side);});$(`more-${side}`).addEventListener('click',()=>more(side));
 const adjust=document.createElement('details');adjust.className='art-tools';adjust.open=true;
 adjust.innerHTML=`<summary>Enquadramento e posição</summary><label class="field"><span>Área da carta</span><select id="crop-${side}"><option value="art">Destacar ilustração</option><option value="full">Carta inteira / arte já recortada</option></select></label>${[['zoom','Zoom',.5,3,.05],['x','Horizontal',-640,640,1],['y','Vertical',-720,720,1]].map(([key,label,min,max,step])=>`<label class="field"><span class="range-line">${label}<output id="${key}-value-${side}"></output></span><input type="range" id="${key}-${side}" aria-label="${label} da carta ${side==='left'?'esquerda':'direita'}" min="${min}" max="${max}" step="${step}"/></label>`).join('')}<button type="button" class="studio-btn reset-art" id="reset-${side}">Centralizar e zerar zoom</button><p class="drag-hint">Ative “Mover arte na prévia” e arraste. Os controles acima também funcionam com teclado e toque.</p>`;
 $(`drop-${side}`).after(adjust);
 for(const key of ['x','y','zoom'])$(`${key}-${side}`).addEventListener('input',e=>{art[side][key]=Number(e.target.value);syncArt(side);});
 $(`reset-${side}`).addEventListener('click',()=>{Object.assign(art[side],{x:0,y:0,zoom:1});syncArt(side);});
 $(`crop-${side}`).addEventListener('change',async e=>{
  art[side].mode=e.target.value;if(!art[side].original)return;
  const generation=++art[side].generation,version=routeVersion;
  try{const data=await cropImage(art[side].original,side);if(version===routeVersion&&generation===art[side].generation)engine.setImage(side,data);}catch{$('status').textContent='Não foi possível recortar esta imagem. Tente enviar outro arquivo.';}
 });
}
for(const side of ['left','right']){buildSide(side);$(`theme-${side}`).addEventListener('change',e=>{if(e.target.value!=='custom')setColor(side,e.target.value);});}
async function search(side){
 const query=$(`search-${side}`).value.trim();if(query.length<2){$(`search-status-${side}`).textContent='Digite pelo menos 2 caracteres.';return;}
 requests[side]?.abort();const ctrl=new AbortController();requests[side]=ctrl;const version=routeVersion,game=active;
 searchState[side]={query,cards:[],shown:0,next:null};$(`results-${side}`).replaceChildren();$(`more-${side}`).hidden=true;
 const btn=$(`search-button-${side}`);btn.disabled=true;$(`search-status-${side}`).textContent='Buscando na base de cartas…';
 try{
  const data=await providers[game].search(query,null,ctrl.signal);if(ctrl.signal.aborted||version!==routeVersion)return;
  Object.assign(searchState[side],data);renderBatch(side);
 }catch(e){if(ctrl.signal.aborted||version!==routeVersion)return;$(`search-status-${side}`).textContent=e.name==='AbortError'?'A busca demorou demais. Tente novamente ou envie sua imagem.':`${e.message||'Falha de conexão.'} Use o upload abaixo se necessário.`;}
 finally{if(requests[side]===ctrl)btn.disabled=false;}
}
function renderBatch(side){
 const state=searchState[side],cards=state.cards||[],end=Math.min((state.shown||0)+12,cards.length),container=$(`results-${side}`);
 for(const card of cards.slice(state.shown||0,end)){
  const row=document.createElement('div');row.className='result-card';
  if(card.thumb){const img=document.createElement('img');img.src=card.thumb;img.alt=card.name;img.loading='lazy';img.onerror=()=>{img.remove();};row.append(img);}else{const ph=document.createElement('div');ph.className='result-placeholder';ph.textContent=active==='digimon'?'D':'Y';row.append(ph);}
  const title=document.createElement('strong');title.textContent=card.name;const meta=document.createElement('span');meta.textContent=card.detail||card.id;const use=document.createElement('button');use.type='button';use.textContent=card.image?'Usar carta':'Usar dados';use.addEventListener('click',()=>useCard(side,card,use));row.append(title,meta,use);
  if(card.url){const link=document.createElement('a');link.href=card.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=card.image?'Abrir imagem / fonte ↗':'Ver carta na base ↗';row.append(link);}
  container.append(row);
 }
 state.shown=end;$(`search-status-${side}`).textContent=cards.length?`${end} de ${cards.length}${state.next?' +':''} resultados. ${state.warning||''}`:'Nenhuma carta encontrada. Tente o nome em inglês ou envie a imagem.';$(`more-${side}`).hidden=end>=cards.length&&!state.next;
}
async function more(side){
 const state=searchState[side];if(state.shown<state.cards.length){renderBatch(side);return;}if(!state.next)return;
 const btn=$(`more-${side}`);btn.disabled=true;const version=routeVersion;
 try{const data=await providers[active].search(state.query,state.next,requests[side]?.signal);if(version!==routeVersion)return;state.cards.push(...data.cards);state.next=data.next;renderBatch(side);}catch(e){if(version===routeVersion)$(`search-status-${side}`).textContent='Não foi possível carregar a próxima página. Tente novamente.';}finally{btn.disabled=false;}
}
const importing={left:false,right:false};
async function useCard(side,card,button){
 if(importing[side])return;
 const applyDetails=()=>{value(`input-${side}-digimon`,card.name);value(`input-${side}-detail`,card.detail||card.id);if(colorHex[card.color]&&games[active].colors.some(c=>c[0]===card.color))setColor(side,card.color);};
 if(!card.image){applyDetails();$(`search-status-${side}`).textContent='Imagem não disponível nesta base. Envie a carta pelo campo abaixo.';return;}
 button.disabled=true;importing[side]=true;busy++;const originalLabel=button.textContent;button.textContent='Carregando…';
 $(`search-status-${side}`).textContent='Carregando a imagem da carta…';
 try{
  const blob=await window.ThumbImages.load(card.image);
  const ok=await engine.loadFile(side,new File([blob],`${card.id}.png`,{type:blob.type}));
  if(ok)applyDetails();
  $(`search-status-${side}`).textContent=ok?'Carta aplicada. Ajuste o enquadramento como preferir.':'A imagem não pôde ser aberta. Envie-a manualmente.';
 }catch(e){$(`search-status-${side}`).textContent=e.code==='SERVICE_REQUIRED'?'A importação desta base ainda precisa ser ativada pelo administrador. Por enquanto, abra a imagem pelo link do resultado e envie pelo campo abaixo.':'Não foi possível importar a imagem. Tente novamente ou envie o arquivo pelo campo abaixo.';}
 finally{busy--;importing[side]=false;button.disabled=false;button.textContent=originalLabel;}
}
// Optional drag mode prevents accidental movement while scrolling on a phone.
let drag=null;
$('move-art').addEventListener('click',()=>{const on=!preview.classList.contains('move-mode');preview.classList.toggle('move-mode',on);$('move-art').setAttribute('aria-pressed',String(on));});
preview.addEventListener('pointerdown',e=>{if(!preview.classList.contains('move-mode'))return;const side=$('move-side').value;if(!engine.uploaded[side])return;drag={side,x:e.clientX,y:e.clientY,startX:art[side].x,startY:art[side].y};preview.setPointerCapture(e.pointerId);e.preventDefault();});
preview.addEventListener('pointermove',e=>{if(!drag)return;const scale=1280/preview.getBoundingClientRect().width;art[drag.side].x=Math.max(-640,Math.min(640,drag.startX+(e.clientX-drag.x)*scale));art[drag.side].y=Math.max(-720,Math.min(720,drag.startY+(e.clientY-drag.y)*scale));syncArt(drag.side);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])preview.addEventListener(event,()=>{drag=null;});
$('save-project').addEventListener('click',()=>{
 const data=JSON.stringify(snapshot()),url=URL.createObjectURL(new Blob([data],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`thumbtcg-${active}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('status').textContent='Projeto salvo com as imagens. Use “Abrir projeto” para continuar depois.';
});
$('open-project').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;
 try{
  if(file.size>25*1024*1024)throw new Error('O projeto deve ter até 25 MB.');const data=JSON.parse(await file.text());
  if(data.format!=='thumbtcg'||data.version!==2||!Object.hasOwn(games,data.game)||!data.fields||!data.art)throw new Error('Arquivo de projeto inválido.');
  for(const side of ['left','right']){const a=data.art[side];if(!a||typeof a.original!=='string'||(a.original&&!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(a.original))||!['full','art'].includes(a.mode)||!Number.isFinite(a.x)||Math.abs(a.x)>640||!Number.isFinite(a.y)||Math.abs(a.y)>720||!Number.isFinite(a.zoom)||a.zoom<.5||a.zoom>3)throw new Error('Dados de imagem inválidos.');}
  for(const side of ['left','right'])if(data.art[side].original){const img=new Image();img.src=data.art[side].original;await img.decode();if(img.naturalWidth>1800||img.naturalHeight>1800)throw new Error('Imagem do projeto excede o tamanho permitido.');}
  for(const side of ['left','right'])if(!/^#[0-9a-f]{6}$/i.test(data.fields[`accent-${side}`]))throw new Error('Cor inválida.');
  if(active)drafts.set(active,snapshot());drafts.set(data.game,data);active=null;history.replaceState(null,'',`#${data.game}`);await route();$('status').textContent='Projeto restaurado. Continue sua edição.';
 }catch(error){$('status').textContent=error.message||'Não foi possível abrir este projeto.';}finally{e.target.value='';}
});
$('copy-pix').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('suportebakura@gmail.com');$('pix-status').textContent='Chave PIX copiada.';}catch{$('pix-status').textContent='Copie a chave acima: suportebakura@gmail.com';}});
window.addEventListener('hashchange',route);route();
})();
