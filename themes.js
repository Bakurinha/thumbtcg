/**
 * Game-specific SVG themes. Theme decoration does not replace editable card content.
 * Maintenance: preserve project JSON compatibility and the existing rendering contract.
 */
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
  // Additional themes keep the original identifiers compatible with saved projects.
  catalog.digimon.push(["memory", "Trilha de memória", "#83e8ff", "#8d92ff", "pixels", "segmented"],["armor", "Armadura cromada", "#d4e8ff", "#e6ad67", "plates", "etched"],["digital-sea", "Oceano de dados", "#43c6e8", "#63f6c0", "datawaves", "wave"],["virus", "Alerta de vírus", "#f17e8d", "#bb8cf1", "hazard", "segmented"],["holy", "Luz sagrada", "#fff0ae", "#87dcf4", "halo", "ornament"],["nature", "Selva digital", "#87dc83", "#62dcd2", "vines", "tech"],["terminal", "Terminal retrô", "#9ee68a", "#edcf84", "grid", "segmented"]);
  catalog.yugioh.push(["synchro", "Órbita Sincro", "#e6f6ff", "#8edbcc", "orbit", "etched"],["xyz", "Constelação Xyz", "#c4a5f8", "#ecce7e", "constellation", "star"],["ritual", "Selo ritual", "#819fe9", "#b1e1fa", "seal", "ornament"],["pendulum", "Pêndulo dual", "#68d4b1", "#e5af75", "pendulum", "double"],["spell", "Pergaminho mágico", "#66d8bf", "#f5dc99", "script", "page"],["trap", "Armadilha escarlate", "#e887b5", "#ba9de7", "lattice", "etched"],["duel", "Arena de duelo", "#e9b563", "#83c7ee", "arena", "segmented"]);
  catalog.magic.push(["plains", "Horizonte das planícies", "#f2e3b4", "#d0ba83", "horizon", "ornament"],["island", "Maré das ilhas", "#72b6ea", "#9edce8", "datawaves", "wave"],["swamp", "Névoa do pântano", "#b59abf", "#9cb699", "mist", "etched"],["mountain", "Cristas da montanha", "#eb986e", "#e2c08c", "mountains", "etched"],["grove", "Bosque ancestral", "#86bf83", "#d3c68d", "vines", "ornament"],["artifact", "Engrenagem arcana", "#c2d4de", "#bfaa86", "gears", "tech"],["prism", "Prisma multicolorido", "#deb875", "#a89bdf", "prism", "double"]);
  catalog.onepiece.push(["wanted", "Cartaz de recompensa", "#e6ca98", "#c39177", "script", "page"],["haki", "Pulso de Haki", "#dc777b", "#bf9de4", "shock", "segmented"],["navy", "Ordem naval", "#b7d9ec", "#ded1ab", "anchor", "etched"],["sun", "Alvorada no mar", "#efc77c", "#ed9d86", "horizon", "wave"],["storm", "Tempestade no oceano", "#8eb5d7", "#c9c4e9", "storm", "wave"],["map", "Mapa da aventura", "#dab98e", "#85bcb1", "map", "page"],["manga", "Página de mangá", "#dbdfe4", "#eea68c", "panels", "etched"]);
  catalog.pokemon.push(["water", "Ondas de água", "#7fc8f2", "#9fe2e3", "bubbles", "wave"],["fire", "Brasa de fogo", "#f4a174", "#f6d98a", "embers", "segmented"],["psychic", "Espiral psíquica", "#d3a0ed", "#b8b5f3", "orbit", "star"],["metal", "Placas metálicas", "#b7c8d2", "#d4c0a1", "plates", "etched"],["darkness", "Eclipse noturno", "#a4a1cf", "#7ebabb", "eclipse", "double"],["dragon", "Escamas de dragão", "#d6bc7a", "#91bcb4", "scales", "ornament"],["arena", "Campo de batalha", "#9ed6ad", "#e5c777", "arena", "segmented"]);
  catalog.lorcana.push(["amber", "Brilho de âmbar", "#edcb82", "#e5b594", "halo", "ornament"],["amethyst", "Cristais de ametista", "#c49be9", "#a6bde8", "prism", "star"],["emerald", "Jardim de esmeralda", "#8ccda5", "#c7da9e", "vines", "ornament"],["ruby", "Centelhas de rubi", "#e58f9a", "#e5be85", "shock", "etched"],["sapphire-ink", "Correntes de safira", "#8abde8", "#9dd6de", "datawaves", "wave"],["steel", "Fortaleza de aço", "#c5cdd8", "#c4ae91", "plates", "etched"],["storybook", "Páginas de história", "#dbc89f", "#c3a6df", "script", "page"]);
  catalog.digimon.push(...[["scene-cathedral", "Catedral sombria", "#a6b5f4", "#d5ddef", "image", "ornament", "assets/themes/digimon/cathedral.webp"], ["scene-forge", "Forja industrial", "#ffac58", "#9bbfd3", "image", "etched", "assets/themes/digimon/forge.webp"], ["scene-village", "Vila da floresta", "#a7d87f", "#ffc47d", "image", "ornament", "assets/themes/digimon/village.webp"], ["scene-golden-portal", "Portal dourado", "#ffe2a0", "#d2b3ff", "image", "ornament", "assets/themes/digimon/golden-portal.webp"], ["scene-neon-arena", "Arena neon", "#54dfff", "#ff70c7", "image", "tech", "assets/themes/digimon/neon-arena.webp"], ["scene-fire-ice", "Fogo e gelo", "#ffa365", "#88dcff", "image", "double", "assets/themes/digimon/fire-ice.webp"], ["scene-throne", "Trono ancestral", "#dfc385", "#92b69a", "image", "ornament", "assets/themes/digimon/throne.webp"], ["scene-undersea", "Reino submarino", "#8be4ff", "#cca2f5", "image", "wave", "assets/themes/digimon/undersea.webp"]]);
  catalog.digimon.push(
    ['cs-eden','CS · Ciberespaço EDEN','#62dfff','#c9eaff','image','tech','assets/themes/digimon/cs-eden.webp'],
    ['cs-kuremi','CS · Agência Kuremi','#ffc078','#a8a0ff','image','etched','assets/themes/digimon/cs-kuremi.webp'],
    ['cs-hudie','CS · Café Hudie','#75dfff','#d99bff','image','tech','assets/themes/digimon/cs-hudie.webp']
  );
  let game=null,state={id:'',intensity:55,frame:true};
  const panel=document.createElement('details');panel.className='theme-gallery';panel.open=true;
  panel.innerHTML='<summary>Temas do cardgame</summary><p>Escolha um fundo e uma paleta. Suas cartas, textos e posições são preservados.</p><div class="theme-presets"></div><div class="theme-adjust"><label class="field"><span>Intensidade dos efeitos <output id="theme-intensity-value">55%</output></span><input id="theme-intensity" type="range" min="0" max="100" value="55"/></label><label class="toggle"><input id="theme-frame" type="checkbox" checked/> Moldura temática</label><button class="studio-btn" id="theme-clear" type="button">Remover efeitos e moldura</button></div>';
  document.querySelector('.theme-description').after(panel);
  const background=document.createElementNS(ns,'g');background.id='theme-background';background.style.pointerEvents='none';window.ThumbAdvanced.registerLayer('theme-background','Fundo temático',background,'fx-scene-atmosphere');
  const frame=document.createElementNS(ns,'g');frame.id='theme-border';frame.style.pointerEvents='none';window.ThumbAdvanced.registerLayer('theme-border','Moldura temática',frame,'extra-image');
  // Raster themes load on demand and are embedded before SVG-to-PNG export.
  const assetCache=new Map(),assetRequests=new Map();
  const assetStyle=document.createElementNS(ns,'style');assetStyle.textContent='.image-theme [data-composition-base="true"]:not(#theme-background):not(#theme-border){display:none!important}';svg.querySelector('defs').append(assetStyle);
  function selectedImage(){return (catalog[game]||[]).find(t=>t[0]===state.id&&t[4]==='image');}
  async function ready(){
    const theme=selectedImage();if(!theme)return;
    const url=theme[6];if(assetCache.has(url))return;
    if(!assetRequests.has(url))assetRequests.set(url,(async()=>{
      const response=await fetch(url);if(!response.ok)throw Error('asset');
      const blob=await response.blob(),data=await new Promise((ok,fail)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=fail;r.readAsDataURL(blob);});
      const img=new Image();img.src=data;await img.decode();assetCache.set(url,data);
    })().catch(()=>{throw Error(window.ThumbI18n?.t('Não foi possível carregar o tema. Selecione-o novamente para tentar outra vez.')||'Não foi possível carregar o tema. Selecione-o novamente para tentar outra vez.');}).finally(()=>assetRequests.delete(url)));
    await assetRequests.get(url);if(selectedImage()?.[6]===url)draw();else return ready();
  }
  function pattern(type,a,b){
    const path=(d,color=a,width=2)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}"/>`;

    if(type==='pixels')return path('M4 4H28V28H4ZM44 44H68V68H44Z',a)+path('M40 0V24H80M0 40H24V80',b);
    if(type==='plates')return path('M12 4H68L76 12V68L68 76H12L4 68V12ZM18 18H62V62H18Z')+`<circle cx="12" cy="12" r="2" fill="${b}"/><circle cx="68" cy="68" r="2" fill="${b}"/>`;
    if(type==='datawaves')return path('M-10 30Q15 2 40 30T90 30M-10 50Q15 22 40 50T90 50',a)+path('M0 72H24V64H48V72H80',b);
    if(type==='hazard')return path('M40 7L73 66H7ZM40 25V44M40 51V56')+path('M0 0L12 12M68 68L80 80',b,5);
    if(type==='halo')return `<circle cx="40" cy="40" r="24" fill="none" stroke="${a}"/><circle cx="40" cy="40" r="16" fill="none" stroke="${b}"/>`+path('M40 2V10M40 70V78M2 40H10M70 40H78');
    if(type==='vines')return path('M0 75Q40 60 40 40T80 5M40 40Q9 40 14 15Q40 12 40 40M42 45Q68 35 69 63Q49 76 42 45',a)+path('M14 15L40 40L69 63',b,1);
    if(type==='grid')return path('M0 20H80M0 60H80M20 0V80M60 0V80',a,1)+`<rect x="34" y="34" width="12" height="12" fill="${b}" opacity=".5"/>`;
    if(type==='orbit')return `<ellipse cx="40" cy="40" rx="36" ry="13" transform="rotate(-35 40 40)" fill="none" stroke="${a}"/><ellipse cx="40" cy="40" rx="36" ry="13" transform="rotate(35 40 40)" fill="none" stroke="${b}"/><circle cx="40" cy="40" r="5" fill="${a}"/>`;
    if(type==='constellation')return path('M6 16L38 29 63 8M38 29L50 65 74 53',a,1)+[ [6,16],[38,29],[63,8],[50,65],[74,53] ].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="${b}"/>`).join('');
    if(type==='seal')return path('M40 5L70 57H10ZM40 75L10 23H70Z',a,1)+`<circle cx="40" cy="40" r="33" fill="none" stroke="${b}"/>`;
    if(type==='pendulum')return path('M16 4V42L28 58 16 74 4 58 16 42M64 4V22L76 38 64 54 52 38 64 22',a)+path('M30 20H48M30 60H48',b);
    if(type==='script')return path('M12 14H68M12 22H50M12 54H68M12 62H45',a,1)+path('M30 34L40 28 50 34 40 42Z',b);
    if(type==='lattice')return path('M0 40L40 0 80 40 40 80ZM20 40L40 20 60 40 40 60Z',a)+path('M0 0L20 20M60 60L80 80',b);
    if(type==='arena')return path('M5 5H75V75H5ZM5 40H75M40 5V75',a,1)+`<circle cx="40" cy="40" r="16" fill="none" stroke="${b}"/>`;
    if(type==='horizon')return path('M0 48H80M0 60H80M0 72H80',a,1)+`<path d="M20 43A20 20 0 0 1 60 43" fill="none" stroke="${b}"/>`;
    if(type==='mist')return path('M-10 24Q20 4 50 24T110 24M-10 46Q20 26 50 46T110 46M-10 68Q20 48 50 68T110 68',a,1)+`<circle cx="15" cy="35" r="3" fill="${b}" opacity=".4"/>`;
    if(type==='mountains')return path('M0 70L27 15 55 70M30 70L56 27 80 70',a)+path('M17 35L27 41 36 34M48 41L56 47 63 41',b);
    if(type==='gears')return path('M32 4H48V14L57 19 66 14 76 31 67 36V46L76 51 66 68 57 63 48 68V78H32V68L23 63 14 68 4 51 13 46V36L4 31 14 14 23 19 32 14Z',a,1)+`<circle cx="40" cy="41" r="15" fill="none" stroke="${b}"/>`;
    if(type==='prism')return path('M40 5L70 25V55L40 75 10 55V25ZM40 5V75M10 25L70 55M70 25L10 55',a,1)+path('M10 25L40 35 70 25M40 35V75',b);
    if(type==='shock')return path('M0 65L28 40 20 27 55 20 80 0',a,3)+path('M0 80L35 58 49 65 60 40 80 35',b,1);
    if(type==='anchor')return `<circle cx="40" cy="15" r="7" fill="none" stroke="${b}"/>`+path('M40 22V68M22 32H58M12 48Q12 72 40 68Q68 72 68 48M6 54L12 46 20 54M60 54L68 46 74 54',a);
    if(type==='storm')return path('M0 18Q20 0 40 18T80 18M0 62Q20 44 40 62T80 62',a)+path('M44 24L31 43H45L34 57',b,3);
    if(type==='map')return path('M5 12L28 7 52 15 75 8V65L52 72 28 64 5 72ZM28 7V64M52 15V72',a,1)+`<path d="M13 45Q30 12 63 45" fill="none" stroke="${b}" stroke-dasharray="4 5"/>`;
    if(type==='panels')return path('M5 5H42L30 42H5ZM49 5H75V42H37ZM5 49H75V75H5Z',a,2)+path('M58 9L44 36M66 9L53 36',b,1);
    if(type==='bubbles')return `<circle cx="25" cy="27" r="17" fill="none" stroke="${a}"/><circle cx="61" cy="58" r="12" fill="none" stroke="${b}"/><circle cx="12" cy="67" r="4" fill="none" stroke="${a}"/>`;
    if(type==='eclipse')return `<path d="M52 12A28 28 0 1 0 52 68A30 30 0 0 1 52 12Z" fill="none" stroke="${a}"/>`+path('M66 16V26M61 21H71',b);
    if(type==='scales')return path('M0 20Q20 54 40 20Q60 54 80 20M-20 60Q0 94 20 60Q40 94 60 60Q80 94 100 60',a)+path('M20 0Q40 34 60 0',b);
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

  function borderArt(border,a,b){
    const base=`<rect x="18" y="18" width="1244" height="684" rx="${border==='ornament'?30:4}" fill="none" stroke="${a}" stroke-width="3"/>`;
    const accents={
      tech:`<path d="M18 95V18H160M1120 18H1262V95M18 625V702H160M1120 702H1262V625" stroke-width="9"/>`,
      double:`<rect x="28" y="28" width="1224" height="664" rx="4" stroke-width="2"/>`,
      ornament:`<path d="M18 60L60 18 100 60 60 100ZM1180 60L1220 18 1262 60 1220 100ZM18 660L60 620 100 660 60 702ZM1180 660L1220 620 1262 660 1220 702Z" stroke-width="3"/>`,
      segmented:`<rect x="26" y="26" width="1228" height="668" stroke-dasharray="95 22 12 22" stroke-width="6"/>`,
      etched:`<path d="M30 115V30H230M1050 30H1250V115M30 605V690H230M1050 690H1250V605M42 75V42H140M1140 42H1238V75M42 645V678H140M1140 678H1238V645" stroke-width="3"/>`,
      wave:`<path d="M35 40Q180 12 325 40T615 40T905 40T1245 40M35 680Q180 708 325 680T615 680T905 680T1245 680" stroke-width="3"/>`,
      page:`<path d="M32 50Q330 12 630 46V674Q330 642 32 680ZM1250 50Q950 12 650 46V674Q950 642 1250 680Z" stroke-width="2"/>`,
      star:`<path d="M75 24L87 52 115 64 87 76 75 104 63 76 35 64 63 52ZM1205 616L1217 644 1245 656 1217 668 1205 696 1193 668 1165 656 1193 644Z" stroke-width="3"/>`
    };
    return base+`<g fill="none" stroke="${b}">${accents[border]||accents.double}</g>`;
  }
  function validate(data,g){
    if(!data||typeof data!=='object'||typeof data.id!=='string'||(data.id&&!(catalog[g]||[]).some(t=>t[0]===data.id))||!Number.isFinite(data.intensity)||data.intensity<0||data.intensity>100||typeof data.frame!=='boolean')throw Error('Tema de projeto inválido.');
  }
  /** Draw the selected theme without clearing user artwork. */
  function draw(){
    background.replaceChildren();frame.replaceChildren();svg.classList.toggle('image-theme',!!selectedImage());const theme=(catalog[game]||[]).find(t=>t[0]===state.id);
    if(theme){const [,name,a,b,type,border]=theme;
      let defs=$('theme-pattern');if(!defs){defs=document.createElementNS(ns,'pattern');defs.id='theme-pattern';defs.setAttribute('patternUnits','userSpaceOnUse');defs.setAttribute('width','80');defs.setAttribute('height','80');svg.querySelector('defs').append(defs);}defs.innerHTML=pattern(type,a,b);
      background.innerHTML=`<rect width="1280" height="720" fill="url(#theme-pattern)"/>`;
      if(type==='rays')background.innerHTML+=Array.from({length:22},(_,i)=>{const angle=i*Math.PI/11,x=640+Math.cos(angle)*1100,y=360+Math.sin(angle)*900;return `<path d="M640 360L${x} ${y}" stroke="${i%2?a:b}" stroke-width="${i%3?3:12}"/>`;}).join('');
      background.setAttribute('opacity',String(state.intensity/100*.5));
      if(type==='image'){
        const data=assetCache.get(theme[6]);
        background.innerHTML='<rect width="1280" height="720" fill="#10131b"/>';
        if(data)background.innerHTML+=`<image href="${data}" width="1280" height="720" preserveAspectRatio="xMidYMid slice"/><rect width="1280" height="720" fill="#000" opacity="${(1-state.intensity/100)*.65}"/>`;
        else ready().catch(e=>{if(selectedImage()?.[6]===theme[6])$('status').textContent=e.message;});
        background.setAttribute('opacity','1');
      }
      if(state.frame){
        frame.innerHTML=borderArt(border,a,b);frame.setAttribute('opacity',String(.3+state.intensity/100*.7));
      }
    }
    $('theme-intensity').value=state.intensity;$('theme-intensity-value').textContent=state.intensity+'%';$('theme-frame').checked=state.frame;
    panel.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===state.id)));
  }
  /** Reset the theme controls when changing card games. */
  function reset(g){game=g;state={id:'',intensity:55,frame:true};const list=panel.querySelector('.theme-presets');list.replaceChildren();
    for(const t of catalog[game]||[]){const button=document.createElement('button');button.type='button';button.className='theme-preset';button.dataset.theme=t[0];button.setAttribute('aria-pressed','false');const patternId='theme-preview-'+game+'-'+t[0];button.innerHTML=`<svg viewBox="0 0 1280 720" aria-hidden="true"><defs><pattern id="${patternId}" width="80" height="80" patternUnits="userSpaceOnUse">${pattern(t[4],t[2],t[3])}</pattern></defs><rect width="1280" height="720" fill="#111b26"/><rect width="1280" height="720" fill="url(#${patternId})" opacity=".5"/><path d="M720 0L560 720" stroke="${t[3]}" stroke-width="5"/><rect x="190" y="145" width="270" height="425" rx="18" fill="${t[2]}" opacity=".7"/><rect x="820" y="145" width="270" height="425" rx="18" fill="${t[3]}" opacity=".7"/>${borderArt(t[5],t[2],t[3])}</svg><span>${t[1]}</span>`;
      if(t[4]==='image')button.innerHTML=`<img src="${t[6].replace('.webp','-preview.webp')}" loading="lazy" decoding="async" alt="" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px"/><span>${t[1]}</span>`;
      button.addEventListener('click' ,()=>{window.ThumbInteractions?.commit();state.id=t[0];for(const [i,side] of ['left','right'].entries()){const input=$(`accent-${side}`);input.value=t[i+2];input.dispatchEvent(new Event('input',{bubbles:true}));$(`theme-${side}`).value='custom';}draw();window.dispatchEvent(new Event('thumb:theme'));});list.append(button);
    }
    draw();
  }
  $('theme-intensity').addEventListener('input',e=>{state.intensity=Number(e.target.value);draw();window.dispatchEvent(new Event('thumb:theme'));});
  $('theme-frame').addEventListener('change',e=>{state.frame=e.target.checked;draw();window.dispatchEvent(new Event('thumb:theme'));});
  $('theme-clear').addEventListener('click',()=>{window.ThumbInteractions?.commit();state.id='';draw();window.dispatchEvent(new Event('thumb:theme'));});
  window.ThumbThemes={ready,reset,validate,getState:()=>({...state}),setState(data){if(!data)data={id:'',intensity:55,frame:true};validate(data,game);state={...data};draw();}};
  window.addEventListener('thumb:theme',()=>window.ThumbInteractions?.commit());
  reset(document.body.dataset.game||null);
  window.ThumbInteractions?.resetHistory();
})();

