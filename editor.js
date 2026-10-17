/**
 * Core SVG editor. The 1280 x 720 viewBox is the canonical coordinate system; PNG export scales that scene.
 * Maintenance: preserve exported APIs, stored JSON and the existing PNG output.
 */

(()=>{
  'use strict';
  const svg=document.getElementById('thumb');
  const status=document.getElementById('status');
  const exportBtn=document.getElementById('export');
  const layoutGrid=document.getElementById('layout-grid');
  const layoutSelect=document.getElementById('layout-preset');
  const ribbonInput=document.getElementById('top-ribbon-input');
  const centerLabelInput=document.getElementById('center-label');
  const centerFontInput=document.getElementById('center-font');
  const centerSizeInput=document.getElementById('center-size');
  const deckFontInput=document.getElementById('deck-font');
  const cardFontInput=document.getElementById('card-font');
  const detailFontInput=document.getElementById('detail-font');
  const toggleEls={
    vs:document.getElementById('toggle-vs'),
    vsPlate:document.getElementById('toggle-vs-plate'),
    ribbon:document.getElementById('toggle-ribbon'),
    ribbonText:document.getElementById('toggle-ribbon-text'),
    deckNames:document.getElementById('toggle-deck-names'),
    cardNames:document.getElementById('toggle-card-names'),
    cardDetails:document.getElementById('toggle-card-details'),
    nameplates:document.getElementById('toggle-nameplates'),
    leftArt:document.getElementById('toggle-left-art'),
    rightArt:document.getElementById('toggle-right-art'),
    leftStripe:document.getElementById('toggle-left-stripe'),
    rightStripe:document.getElementById('toggle-right-stripe')
  };
  const mappings=[
  ['left','deck',500,36],['right','deck',514,36],
  ['left','digimon',487,14],['right','digimon',476,14],
  ['left','detail',488,12],['right','detail',487,12]
  ];
  const presetPalettes={
    green:{accent:'#8cff4b',title:'#9fff76',detail:'#b3ff70',grad:['#163e27','#0d2e29','#050f13'],glow:['#cbff53','#7cf54d'],panelFill:'#03150e',panelStroke:'#8cff4b',placeholderFill:'#04170e',placeholderStroke:'#9cff65',placeholderText:'#e4ffda',placeholderSub:'#a6d5a6',plus:'#a2fc8a',circle:'#d0ffa1',stripe:'#5eff6c'},
    blue:{accent:'#47bcff',title:'#aeeaff',detail:'#a9eaff',grad:['#132c4b','#12263c','#090b1c'],glow:['#77eafe','#67abff'],panelFill:'#04152a',panelStroke:'#75e4ff',placeholderFill:'#071426',placeholderStroke:'#87dffe',placeholderText:'#e1f5ff',placeholderSub:'#b4d6ef',plus:'#9cdeff',circle:'#b9edff',stripe:'#47bcff'},
    red:{accent:'#ff6b63',title:'#ff9b94',detail:'#ffd1cc',grad:['#4d1717','#351117','#14070a'],glow:['#ff9a8d','#ff5b58'],panelFill:'#1b0909',panelStroke:'#ff7f76',placeholderFill:'#230808',placeholderStroke:'#ffa29a',placeholderText:'#ffe5e2',placeholderSub:'#f3b6b0',plus:'#ff9f90',circle:'#ffd0c7',stripe:'#ff6457'},
    yellow:{accent:'#ffd24d',title:'#ffe680',detail:'#fff3ae',grad:['#5b4812','#3f3110','#151005'],glow:['#fff095','#ffc82d'],panelFill:'#1a1204',panelStroke:'#ffd85c',placeholderFill:'#221904',placeholderStroke:'#ffe08a',placeholderText:'#fff4d0',placeholderSub:'#f0df95',plus:'#ffe07f',circle:'#fff2ba',stripe:'#ffd24d'},
    purple:{accent:'#b878ff',title:'#d9b0ff',detail:'#efd6ff',grad:['#35134d','#24113b','#11071b'],glow:['#e0a8ff','#905dff'],panelFill:'#12071d',panelStroke:'#c993ff',placeholderFill:'#1a0a28',placeholderStroke:'#d5aeff',placeholderText:'#f2e5ff',placeholderSub:'#ceb1ef',plus:'#d1a4ff',circle:'#ead4ff',stripe:'#ba7bff'},
    black:{accent:'#c1c8d4',title:'#eff4ff',detail:'#d7deea',grad:['#32353c','#1d2129','#090b10'],glow:['#f2f7ff','#8898ba'],panelFill:'#0d1015',panelStroke:'#c9d2de',placeholderFill:'#0f1319',placeholderStroke:'#d3dbe8',placeholderText:'#f4f8ff',placeholderSub:'#bac3d2',plus:'#d7deea',circle:'#eef2f8',stripe:'#bcc5d1'},
    white:{accent:'#eef4ff',title:'#ffffff',detail:'#dae7ff',grad:['#7f92a8','#44586f','#101825'],glow:['#ffffff','#bdd7ff'],panelFill:'#18283a',panelStroke:'#eef4ff',placeholderFill:'#1f3045',placeholderStroke:'#f4f8ff',placeholderText:'#ffffff',placeholderSub:'#d7e5fb',plus:'#ffffff',circle:'#f3f7ff',stripe:'#eef4ff'}
  };
  const FONTS={
    impact:{label:'Impact Max', css:"Impact, Haettenschweiler, 'Arial Black', sans-serif"},
    knockout:{label:'Knockout', css:"'Franklin Gothic Heavy', 'Arial Narrow', Arial, sans-serif"},
    arena:{label:'Arena Bold', css:"Bahnschrift, 'Arial Narrow', 'Segoe UI', sans-serif"},
    hyper:{label:'Hyper Tech', css:"'Trebuchet MS', Verdana, Arial, sans-serif"},
    condensed:{label:'Condensed Power', css:"'Arial Narrow', Tahoma, Arial, sans-serif"},
    stream:{label:'Streamline', css:"Tahoma, Geneva, Verdana, sans-serif"},
    neon:{label:'Neon Heavy', css:"'Segoe UI Black', Impact, sans-serif"},
    duel:{label:'Duel Serif', css:"Georgia, 'Palatino Linotype', serif"}
  };
  const layoutPresets={
    layout1:{name:'Classic Split', note:'Estilo base com placas inferiores', vs:{label:'VS',x:640,y:393,size:188,rotate:0,font:'impact',style:'italic',stroke:25,letter:0,anchor:'middle'}, showPlate:true, artL:{x:87,y:137,w:476,h:604},artR:{x:743,y:137,w:476,h:604}, deckL:{x:44,y:111,size:92,anchor:'start',font:'impact'}, deckR:{x:1240,y:111,size:86,anchor:'end',font:'impact'}, digiL:{x:43,y:652,size:51,font:'impact',display:true},detailL:{x:45,y:681,size:21,font:'hyper',display:true}, digiR:{x:1240,y:647,size:52,font:'impact',display:true},detailR:{x:1240,y:682,size:22,font:'hyper',display:true}, nameplates:true, topRibbon:true, ribbonText:'DIGIMON CARD GAME  •  DECK BATTLE'},
    layout2:{name:'Knockout X', note:'Cartas maiores e centro agressivo', vs:{label:'X',x:640,y:394,size:216,rotate:-5,font:'knockout',style:'italic',stroke:22,letter:1,anchor:'middle'}, showPlate:true, artL:{x:58,y:116,w:498,h:628},artR:{x:724,y:116,w:498,h:628}, deckL:{x:52,y:96,size:82,anchor:'start',font:'knockout'}, deckR:{x:1228,y:96,size:82,anchor:'end',font:'knockout'}, digiL:{x:56,y:624,size:40,font:'arena',display:true},detailL:{x:56,y:654,size:18,font:'hyper',display:false}, digiR:{x:1228,y:624,size:40,font:'arena',display:true},detailR:{x:1228,y:654,size:18,font:'hyper',display:false}, nameplates:true, topRibbon:false, ribbonText:''},
    layout3:{name:'Diagonal Strike', note:'Leve diagonal sem texto extra no meio', vs:{label:'VS',x:640,y:364,size:150,rotate:-13,font:'condensed',style:'italic',stroke:17,letter:3,anchor:'middle'}, showPlate:false, artL:{x:30,y:100,w:520,h:642},artR:{x:726,y:152,w:480,h:592}, deckL:{x:62,y:110,size:72,anchor:'start',font:'knockout'}, deckR:{x:1218,y:130,size:72,anchor:'end',font:'knockout'}, digiL:{x:48,y:646,size:44,font:'duel',display:true},detailL:{x:50,y:678,size:18,font:'hyper',display:true}, digiR:{x:1228,y:610,size:42,font:'duel',display:true},detailR:{x:1228,y:640,size:17,font:'hyper',display:true}, nameplates:true, topRibbon:true, ribbonText:'DIGIMON TCG  •  FACE OFF'},
    layout4:{name:'Clean Matchup', note:'Minimalista com X em destaque maior', vs:{label:'X',x:640,y:372,size:178,rotate:0,font:'arena',style:'normal',stroke:18,letter:2,anchor:'middle'}, showPlate:false, artL:{x:104,y:134,w:444,h:576},artR:{x:732,y:134,w:444,h:576}, deckL:{x:71,y:636,size:44,anchor:'start',font:'arena'}, deckR:{x:1209,y:636,size:44,anchor:'end',font:'arena'}, digiL:{x:70,y:84,size:68,font:'arena',display:false},detailL:{x:71,y:670,size:18,font:'stream',display:false}, digiR:{x:1209,y:84,size:68,font:'arena',display:false},detailR:{x:1209,y:670,size:18,font:'stream',display:false}, nameplates:false, topRibbon:true, ribbonText:'DIGIMON TCG  •  MATCHUP'},
    layout5:{name:'Arena Banner', note:'Faixa forte no topo, centro limpo', vs:{label:'VERSUS',x:640,y:108,size:92,rotate:0,font:'condensed',style:'italic',stroke:15,letter:6,anchor:'middle'}, showPlate:false, artL:{x:78,y:150,w:455,h:578},artR:{x:747,y:150,w:455,h:578}, deckL:{x:94,y:620,size:62,anchor:'start',font:'impact'}, deckR:{x:1186,y:620,size:62,anchor:'end',font:'impact'}, digiL:{x:94,y:673,size:28,font:'arena',display:true},detailL:{x:94,y:697,size:16,font:'hyper',display:false}, digiR:{x:1186,y:673,size:28,font:'arena',display:true},detailR:{x:1186,y:697,size:16,font:'hyper',display:false}, nameplates:false, topRibbon:true, ribbonText:'BATTLE OF THE DECKS'},
    layout6:{name:'Heavy Card Focus', note:'Cartas muito grandes e pouco texto', vs:{label:'VS',x:640,y:405,size:150,rotate:0,font:'knockout',style:'normal',stroke:19,letter:1,anchor:'middle'}, showPlate:false, artL:{x:24,y:70,w:540,h:680},artR:{x:716,y:70,w:540,h:680}, deckL:{x:58,y:88,size:58,anchor:'start',font:'condensed'}, deckR:{x:1222,y:88,size:58,anchor:'end',font:'condensed'}, digiL:{x:56,y:655,size:30,font:'arena',display:false},detailL:{x:56,y:684,size:17,font:'stream',display:false}, digiR:{x:1222,y:655,size:30,font:'arena',display:false},detailR:{x:1222,y:684,size:17,font:'stream',display:false}, nameplates:false, topRibbon:false, ribbonText:''},
    layout7:{name:'Topline Duel', note:'Título forte em cima, sem círculo central', vs:{label:'VS',x:640,y:146,size:118,rotate:0,font:'duel',style:'italic',stroke:15,letter:4,anchor:'middle'}, showPlate:false, artL:{x:64,y:172,w:460,h:560},artR:{x:756,y:172,w:460,h:560}, deckL:{x:64,y:95,size:86,anchor:'start',font:'impact'}, deckR:{x:1216,y:95,size:86,anchor:'end',font:'impact'}, digiL:{x:56,y:627,size:44,font:'duel',display:true},detailL:{x:60,y:658,size:19,font:'hyper',display:true}, digiR:{x:1222,y:627,size:44,font:'duel',display:true},detailR:{x:1220,y:658,size:19,font:'hyper',display:true}, nameplates:true, topRibbon:false, ribbonText:''},
    layout8:{name:'Bottom Impact', note:'VS embaixo e decks com fonte mais forte', vs:{label:'VERSUS',x:640,y:632,size:110,rotate:0,font:'knockout',style:'italic',stroke:16,letter:4,anchor:'middle'}, showPlate:false, artL:{x:98,y:88,w:448,h:572},artR:{x:734,y:88,w:448,h:572}, deckL:{x:52,y:106,size:78,anchor:'start',font:'neon'}, deckR:{x:1228,y:106,size:78,anchor:'end',font:'neon'}, digiL:{x:52,y:592,size:36,font:'arena',display:true},detailL:{x:52,y:619,size:17,font:'stream',display:false}, digiR:{x:1228,y:592,size:36,font:'arena',display:true},detailR:{x:1228,y:619,size:17,font:'stream',display:false}, nameplates:false, topRibbon:true, ribbonText:'HEAD TO HEAD'},
    layout9:{name:'Minimal Neon', note:'Centro limpo com marcador simples', vs:{label:'X',x:640,y:370,size:132,rotate:0,font:'neon',style:'normal',stroke:13,letter:0,anchor:'middle'}, showPlate:false, artL:{x:96,y:146,w:442,h:560},artR:{x:742,y:146,w:442,h:560}, deckL:{x:64,y:654,size:50,anchor:'start',font:'arena'}, deckR:{x:1216,y:654,size:50,anchor:'end',font:'arena'}, digiL:{x:68,y:85,size:42,font:'arena',display:false},detailL:{x:68,y:682,size:17,font:'stream',display:false}, digiR:{x:1212,y:85,size:42,font:'arena',display:false},detailR:{x:1212,y:682,size:17,font:'stream',display:false}, nameplates:false, topRibbon:false, ribbonText:''},
    layout10:{name:'Extreme Faceoff', note:'Destaque máximo sem círculo central', vs:{label:'X',x:640,y:352,size:204,rotate:10,font:'impact',style:'italic',stroke:24,letter:0,anchor:'middle'}, showPlate:false, artL:{x:40,y:95,w:508,h:640},artR:{x:734,y:95,w:508,h:640}, deckL:{x:78,y:629,size:68,anchor:'start',font:'impact'}, deckR:{x:1206,y:629,size:68,anchor:'end',font:'impact'}, digiL:{x:80,y:677,size:23,font:'arena',display:true},detailL:{x:80,y:699,size:14,font:'stream',display:false}, digiR:{x:1206,y:677,size:23,font:'arena',display:true},detailR:{x:1206,y:699,size:14,font:'stream',display:false}, nameplates:false, topRibbon:false, ribbonText:''}
  };
  // New compositions share the same editable text/image model as the classic layouts.
  const compositions=[
  ['Duelo panorâmico','Artes preenchidas e faixa inferior',[0,0,640,720],[640,0,640,720],'split','both'],
  ['Duelo com faixa central','Duas artes e nomes no centro',[0,0,640,720],[640,0,640,720],'band','both'],
  ['Círculos em duelo','Duas ilustrações circulares',[55,105,520,520],[705,105,520,520],'circles','both'],
  ['Destaque à direita','Título à esquerda e círculo grande',[790,100,420,420],[965,440,230,230],'circleRight','left'],
  ['Destaque à esquerda','Círculo grande e título à direita',[70,100,420,420],[100,440,230,230],'circleLeft','right'],
  ['Cartas completas','Duas cartas sem recortar a borda',[110,30,450,630],[720,30,450,630],'cards','both'],
  ['Galeria assimétrica','Uma carta grande e outra de apoio',[80,85,520,560],[835,240,340,400],'gallery','left'],
  ['Criador + cartas','Envie um retrato PNG e combine as cartas',[715,60,470,470],[925,435,245,245],'creator','right'],
  ['Cinema TCG','Arte panorâmica e títulos na base',[0,0,850,600],[930,110,290,405],'cinema','left'],
  ['Confronto diagonal','Dois painéis diagonais sem raios',[0,0,800,720],[540,0,740,720],'diagonal','both'],
  ['Wallpaper + cartas','Envie seu papel de parede',[85,200,350,450],[845,200,350,450],'wallpaper','none'],
  ['Foco + miniatura','Carta em destaque sobre sua própria arte',[755,45,455,630],[65,440,210,210],'focus','right']
  ];
  compositions.forEach(([name,note,l,r,kind,source],i)=>{
    const c=structuredClone(layoutPresets.layout9);c.name=name;c.note=note;
    c.artL={x:l[0],y:l[1],w:l[2],h:l[3]};c.artR={x:r[0],y:r[1],w:r[2],h:r[3]};
    c.vs={...c.vs,label:'VS',x:640,y:385,size:120};c.extra={kind,source};
    c.deckL={x:55,y:660,size:60,anchor:'start',font:'impact'};c.deckR={x:1225,y:660,size:60,anchor:'end',font:'impact'};
    if(kind==='band'){c.deckL.y=c.deckR.y=410;c.vs.y=420;}
    if(['circleRight','focus'].includes(kind)){c.deckL={x:55,y:230,size:74,anchor:'start',font:'impact'};c.deckR={x:55,y:330,size:54,anchor:'start',font:'impact'};c.vs.label='';}
    if(kind==='circleLeft'){c.deckL={x:1220,y:230,size:74,anchor:'end',font:'impact'};c.deckR={x:1220,y:330,size:54,anchor:'end',font:'impact'};c.vs.label='';}
    if(kind==='creator'){c.deckL={x:50,y:100,size:70,anchor:'start',font:'impact'};c.deckR={x:50,y:180,size:55,anchor:'start',font:'impact'};c.vs.label='';}
    if(['cinema','wallpaper'].includes(kind))c.vs.label='';
    layoutPresets['layout'+(i+11)]=c;
  });
  // Single-card layouts share the same image slot and portable state model.
  const singles=[
  ['Carta central','Uma carta inteira e título discreto',[415,35,450,625],[640,698,'middle'],'solo'],
  ['Deck em destaque','Carta à direita, título à esquerda',[775,45,450,625],[60,250,'start'],'solo'],
  ['Apresentação à esquerda','Carta à esquerda, título à direita',[55,45,450,625],[740,250,'start'],'solo'],
  ['Retrato circular','Uma ilustração circular em destaque',[720,90,540,540],[55,290,'start'],'soloCircle'],
  ['Arte panorâmica','Ilustração ampla e título na base',[0,0,1280,720],[60,655,'start'],'soloWide'],
  ['Galeria de deck','Carta menor com espaço para seu fundo',[820,175,340,475],[65,180,'start'],'solo']
  ];
  singles.forEach(([name,note,art,title,kind],i)=>{
    const c=structuredClone(layoutPresets.layout9);c.name=name;c.note=note;c.solo=true;
    c.artL={x:art[0],y:art[1],w:art[2],h:art[3]};c.artR={x:850,y:220,w:300,h:420};
    c.deckL={x:title[0],y:title[1],size:i===0?42:68,anchor:title[2],font:'arena'};
    c.deckR={...c.deckL,display:false};c.digiL.display=c.digiR.display=c.detailL.display=c.detailR.display=false;
    c.vs.label='';c.showPlate=false;c.topRibbon=false;c.nameplates=false;c.extra={kind,source:'left'};
    layoutPresets['layout'+(23+i)]=c;
  });
  const moon=structuredClone(layoutPresets.layout9);
  Object.assign(moon,{name:'Lua vermelha',note:'Digimon · castelo, duas cartas inclinadas e neon',game:'digimon',showDeckNames:false,showPlate:false,topRibbon:false,nameplates:false,artL:{x:135,y:65,w:420,h:590},artR:{x:725,y:65,w:420,h:590},extra:{kind:'bloodMoon',source:'none'}});
  for(const key of ['deckL','deckR','digiL','digiR','detailL','detailR'])moon[key].display=false;
  moon.vs.label='';layoutPresets.layout29=moon;
  const isLayoutAvailable=id=>!!layoutPresets[id]&&(!layoutPresets[id].game||layoutPresets[id].game===document.body.dataset.game);
  // Stable IDs keep older projects compatible as the layout catalog grows.
  const editorial=structuredClone(layoutPresets.layout24);
  Object.assign(editorial,{name:'Editorial diagonal',note:'Uma carta inclinada e espaço para seu título',artL:{x:760,y:80,w:400,h:560},deckL:{x:70,y:270,size:68,anchor:'start',font:'arena'},extra:{kind:'solo',source:'left',rotation:9}});
  layoutPresets.layout30=editorial;
  const showcase=structuredClone(layoutPresets.layout29);
  Object.assign(showcase,{name:'Vitrine assimétrica',note:'Carta principal em destaque e apoio lateral',game:null,artL:{x:130,y:45,w:440,h:620},artR:{x:830,y:160,w:320,h:450},extra:{kind:'wallpaper',source:'none'}});
  layoutPresets.layout31=showcase;
  const layoutOrder=Object.keys(layoutPresets);
  const currentLayout={value:'layout1'};
  function fontCss(key){return (FONTS[key]||FONTS.impact).css;}
  function fillFontSelect(select, selected){
    select.innerHTML='';
    Object.entries(FONTS).forEach(([key,obj])=>{
      const opt=document.createElement('option');
      opt.value=key; opt.textContent=obj.label; opt.selected=key===selected;
      select.appendChild(opt);
    });
  }
  fillFontSelect(centerFontInput,'impact');
  fillFontSelect(deckFontInput,'impact');
  fillFontSelect(cardFontInput,'impact');
  fillFontSelect(detailFontInput,'hyper');
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function hexToRgb(hex){const h=hex.replace('#','').trim();const full=h.length===3?h.split('').map(c=>c+c).join(''):h;return {r:parseInt(full.slice(0,2),16),g:parseInt(full.slice(2,4),16),b:parseInt(full.slice(4,6),16)};}
  function rgbToHex(r,g,b){return '#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');}
  function mix(hex1,hex2,t){const a=hexToRgb(hex1),b=hexToRgb(hex2);return rgbToHex(a.r+(b.r-a.r)*t,a.g+(b.g-a.g)*t,a.b+(b.b-a.b)*t);}
  function lighten(hex,t){return mix(hex,'#ffffff',t);}
  function darken(hex,t){return mix(hex,'#000000',t);}
  function alpha(hex,a){const c=hexToRgb(hex);return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;}
  function paletteFromAccent(accent){
    return {accent,title:lighten(accent,.23),detail:lighten(accent,.38),grad:[darken(accent,.72),mix(accent,'#09121d',.8),'#050912'],glow:[lighten(accent,.28),accent],panelFill:mix(accent,'#000000',.9),panelStroke:lighten(accent,.08),placeholderFill:mix(accent,'#000000',.92),placeholderStroke:lighten(accent,.18),placeholderText:lighten(accent,.83),placeholderSub:lighten(accent,.5),plus:lighten(accent,.25),circle:lighten(accent,.58),stripe:accent};
  }
  function setAttr(id,attr,val){const el=document.getElementById(id); if(el) el.setAttribute(attr,val);}
  function updateColorCode(side,hex){document.getElementById(`accent-code-${side}`).textContent=hex.toUpperCase();}
  function applyTheme(side,palette){
    setAttr(`${side}-bg-stop-1`,'stop-color',palette.grad[0]);
    setAttr(`${side}-bg-stop-2`,'stop-color',palette.grad[1]);
    setAttr(`${side}-bg-stop-3`,'stop-color',palette.grad[2]);
    setAttr(`${side}-glow-stop-1`,'stop-color',palette.glow[0]);
    setAttr(`${side}-glow-stop-2`,'stop-color',palette.glow[1]);
    setAttr(`${side}-placeholder-box`,'fill',palette.placeholderFill);
    setAttr(`${side}-placeholder-box`,'stroke',palette.placeholderStroke);
    setAttr(`${side}-placeholder-circle`,'stroke',palette.circle);
    setAttr(`${side}-placeholder-plus`,'stroke',palette.plus);
    setAttr(`${side}-placeholder-text-main`,'fill',palette.placeholderText);
    setAttr(`${side}-placeholder-text-sub`,'fill',palette.placeholderSub);
    setAttr(`text-${side}-deck`,'fill',palette.title);
    setAttr(`text-${side}-detail`,'fill',palette.detail);
    setAttr(`${side}-nameplate`,'fill',palette.panelFill);
    setAttr(`${side}-nameplate`,'stroke',palette.panelStroke);
    setAttr(`${side}-edge-stripe`,'stroke',palette.stripe);
    const panel=document.getElementById(`panel-${side}`);
    panel.style.setProperty('--side-accent',palette.accent);
    panel.style.setProperty('--side-soft',lighten(palette.accent,.22));
    panel.style.setProperty('--side-glow',alpha(palette.accent,.58));
    panel.style.setProperty('--side-hover',mix(palette.accent,'#081321',.8));
    panel.style.setProperty('--side-ring',alpha(palette.accent,.16));
    const dot=panel.querySelector('.dot');
    dot.style.background=palette.accent;
    dot.style.boxShadow=`0 0 16px ${alpha(palette.accent,.55)}`;
    updateColorCode(side,palette.accent);
  }
  function pickPreset(side,name){
    const colorInput=document.getElementById(`accent-${side}`);
    const preset=document.getElementById(`theme-${side}`);
    const palette=name==='custom'?paletteFromAccent(colorInput.value):(presetPalettes[name]||paletteFromAccent(colorInput.value));
    if(name!=='custom') colorInput.value=palette.accent;
    preset.value=name;
    applyTheme(side,palette);
  }
  function wireTheme(side){
    const preset=document.getElementById(`theme-${side}`);
    const colorInput=document.getElementById(`accent-${side}`);
    preset.addEventListener('change',()=>pickPreset(side,preset.value));
    colorInput.addEventListener('input',()=>{preset.value='custom'; applyTheme(side,paletteFromAccent(colorInput.value));});
    pickPreset(side,preset.value);
  }
  const textUpdaters=mappings.map(([side,type,maxWidth,min])=>{
    const input=document.getElementById(`input-${side}-${type}`);
    const target=document.getElementById(`text-${side}-${type}`);
    /** Render the current editor state into the SVG preview. */
    function update(){
      target.textContent=input.value.trim().toUpperCase() || ' ';
      const base=Number(target.dataset.baseSize || target.getAttribute('font-size') || 40);
      target.removeAttribute('textLength');target.removeAttribute('lengthAdjust');
      target.setAttribute('font-size',base);
      const width=target.getComputedTextLength();
      if(width>maxWidth){
        const size=Math.max(min,Math.floor(base*maxWidth/width));
        target.setAttribute('font-size',size);
        const rest=target.getComputedTextLength();
        if(rest>maxWidth){target.setAttribute('textLength',String(maxWidth));target.setAttribute('lengthAdjust','spacingAndGlyphs');}
      }
    }
    input.addEventListener('input',update);
    update();return update;
  });
  function setTextEl(id, cfg){
    const el=document.getElementById(id); if(!el||!cfg) return;
    if(cfg.x!==undefined) el.setAttribute('x',cfg.x);
    if(cfg.y!==undefined) el.setAttribute('y',cfg.y);
    if(cfg.size!==undefined){ el.setAttribute('font-size',cfg.size); el.dataset.baseSize=String(cfg.size); }
    if(cfg.anchor) el.setAttribute('text-anchor',cfg.anchor);
    if(cfg.font) el.setAttribute('font-family',fontCss(cfg.font));
    if(cfg.style!==undefined) el.setAttribute('font-style',cfg.style);
    if(cfg.letter!==undefined) el.setAttribute('letter-spacing',cfg.letter);
    el.style.display=cfg.display===false?'none':'';
  }
  function adjustPlaceholderLines(side,cx,cy){
    setAttr(`${side}-placeholder-plus`,'d',`M${cx-48} ${cy}H${cx+48}M${cx} ${cy-48}V${cy+48}`);
    setAttr(`${side}-placeholder-text-main`,'x',cx); setAttr(`${side}-placeholder-text-main`,'y',cy+112);
    setAttr(`${side}-placeholder-text-sub`,'x',cx); setAttr(`${side}-placeholder-text-sub`,'y',cy+145);
  }
  function setArt(side, cfg){
    const art=document.getElementById(`art-${side}`); if(!art||!cfg) return;
    if(cfg.x!==undefined) art.setAttribute('x',cfg.x);
    if(cfg.y!==undefined) art.setAttribute('y',cfg.y);
    if(cfg.w!==undefined) art.setAttribute('width',cfg.w);
    if(cfg.h!==undefined) art.setAttribute('height',cfg.h);
    const marginX=Math.round((cfg.w||476)*0.1), marginY=Math.round((cfg.h||604)*0.07);
    const bx=(cfg.x||87)+marginX, by=(cfg.y||137)+marginY, bw=(cfg.w||476)-marginX*2, bh=(cfg.h||604)-marginY*2;
    setAttr(`${side}-placeholder-box`,'x',bx); setAttr(`${side}-placeholder-box`,'y',by); setAttr(`${side}-placeholder-box`,'width',bw); setAttr(`${side}-placeholder-box`,'height',bh);
    const cx=bx+bw/2, cy=by+bh*0.42;
    setAttr(`${side}-placeholder-circle`,'cx',cx); setAttr(`${side}-placeholder-circle`,'cy',cy);
    adjustPlaceholderLines(side,cx,cy);
  }
  function buildLayoutUI(){
    layoutSelect.innerHTML='';
    layoutGrid.innerHTML='';
    layoutOrder.forEach((key,idx)=>{
      const cfg=layoutPresets[key];
      const opt=document.createElement('option');
      opt.value=key; opt.textContent=`${idx+1}. ${cfg.name}`;
      layoutSelect.appendChild(opt);
      const card=document.createElement('button');
      card.type='button';
      card.className='layout-card';
      card.dataset.layout=key;
      card.innerHTML=`<div class="layout-thumb">${buildThumbSvg(cfg)}</div><div class="layout-name">${idx+1}. ${cfg.name}</div><div class="layout-note">${cfg.note}</div>`;
      card.addEventListener('click',()=>{ layoutSelect.value=key; applyLayout(key, true); });
      layoutGrid.appendChild(card);
    });
  }
  function buildThumbSvg(cfg){
    if(cfg.extra?.kind==='bloodMoon')return `<svg viewBox="0 0 160 90"><image href="assets/layouts/digimon-red-moon.webp" width="160" height="90" preserveAspectRatio="xMidYMid slice"/><rect x="17" y="9" width="52" height="72" rx="3" fill="#181523" stroke="#ff4545" stroke-width="2" transform="rotate(-7 43 45)"/><rect x="91" y="9" width="52" height="72" rx="3" fill="#20152d" stroke="#ce75ff" stroke-width="2" transform="rotate(7 117 45)"/></svg>`;

    if(cfg.extra){const circle=['circles','circleRight','circleLeft','creator','soloCircle'].includes(cfg.extra.kind);const art=(r,color)=>circle?`<ellipse cx="${(r.x+r.w/2)/8}" cy="${(r.y+r.h/2)/8}" rx="${r.w/16}" ry="${r.h/16}" fill="${color}" stroke="#e5f9bb"/>`:`<rect x="${r.x/8}" y="${r.y/8}" width="${r.w/8}" height="${r.h/8}" rx="2" fill="${color}"/>`;return `<svg viewBox="0 0 160 90"><rect width="160" height="90" fill="#182b34"/>${art(cfg.artL,'#49785a')}${cfg.solo?'':art(cfg.artR,'#487b94')}<text x="${cfg.deckL.x/8}" y="${cfg.deckL.y/8}" text-anchor="${cfg.deckL.anchor}" fill="white" font-size="7">DECK 01</text><text opacity="${cfg.solo?0:1}" x="${cfg.deckR.x/8}" y="${cfg.deckR.y/8}" text-anchor="${cfg.deckR.anchor}" fill="white" font-size="7">DECK 02</text><text x="80" y="48" text-anchor="middle" fill="#fff" font-size="12">${cfg.vs.label}</text></svg>`;}

    const cx=cfg.vs.x/1280*160, cy=cfg.vs.y/720*90;
    const leftX=cfg.artL.x/1280*160, leftY=cfg.artL.y/720*90, leftW=cfg.artL.w/1280*160, leftH=cfg.artL.h/720*90;
    const rightX=cfg.artR.x/1280*160, rightY=cfg.artR.y/720*90, rightW=cfg.artR.w/1280*160, rightH=cfg.artR.h/720*90;
    return `<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="l-${cfg.name.replace(/\s+/g,'')}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1b4c2d"/><stop offset="1" stop-color="#091016"/></linearGradient><linearGradient id="r-${cfg.name.replace(/\s+/g,'')}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#153661"/><stop offset="1" stop-color="#091016"/></linearGradient></defs><rect width="160" height="90" fill="#070b12"/><path d="M0 0H92L76 90H0Z" fill="url(#l-${cfg.name.replace(/\s+/g,'')})"/><path d="M91 0H160V90H76Z" fill="url(#r-${cfg.name.replace(/\s+/g,'')})"/><rect x="${leftX.toFixed(1)}" y="${leftY.toFixed(1)}" width="${leftW.toFixed(1)}" height="${leftH.toFixed(1)}" rx="3" fill="#2b924f" fill-opacity=".55" stroke="#d9ffe8" stroke-opacity=".7"/><rect x="${rightX.toFixed(1)}" y="${rightY.toFixed(1)}" width="${rightW.toFixed(1)}" height="${rightH.toFixed(1)}" rx="3" fill="#3b79e8" fill-opacity=".55" stroke="#e7f2ff" stroke-opacity=".75"/><path d="M92 -3L75 35 82 33 70 96" stroke="#84dfff" stroke-width="4" opacity=".65" fill="none"/>${cfg.showPlate?`<ellipse cx="${cx.toFixed(1)}" cy="${(cy-6).toFixed(1)}" rx="20" ry="12" fill="#08111e" fill-opacity=".8"/>`:''}<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="${Math.max(12, cfg.vs.size/16).toFixed(1)}" fill="#fff1a8" transform="rotate(${cfg.vs.rotate||0} ${cx.toFixed(1)} ${cy.toFixed(1)})">${cfg.vs.label}</text><rect x="50" y="3" width="60" height="7" rx="3" fill="#0a1420" opacity="${cfg.topRibbon?1:0}"/><text x="8" y="13" font-family="Arial Black, Impact, sans-serif" font-size="7" fill="#eafcff">A</text><text x="152" y="13" text-anchor="end" font-family="Arial Black, Impact, sans-serif" font-size="7" fill="#eafcff">B</text>${cfg.nameplates?`<rect x="0" y="74" width="68" height="16" fill="#08130c" opacity=".9"/><rect x="92" y="74" width="68" height="16" fill="#08131b" opacity=".9"/>`:''}</svg>`;
  }
  function syncLayoutCardSelection(){
    document.querySelectorAll('.layout-card').forEach(el=>el.classList.toggle('active', el.dataset.layout===currentLayout.value));
  }
  function applyFontCustomization(){
    document.getElementById('text-left-deck').setAttribute('font-family',fontCss(deckFontInput.value));
    document.getElementById('text-right-deck').setAttribute('font-family',fontCss(deckFontInput.value));
    document.getElementById('text-left-digimon').setAttribute('font-family',fontCss(cardFontInput.value));
    document.getElementById('text-right-digimon').setAttribute('font-family',fontCss(cardFontInput.value));
    document.getElementById('text-left-detail').setAttribute('font-family',fontCss(detailFontInput.value));
    document.getElementById('text-right-detail').setAttribute('font-family',fontCss(detailFontInput.value));
    document.getElementById('text-versus').setAttribute('font-family',fontCss(centerFontInput.value));
  }
  function applyToggles(){
    document.getElementById('text-versus').style.display=toggleEls.vs.checked?'':'none';
    document.getElementById('vs-plate').style.display=toggleEls.vsPlate.checked?'':'none';
    document.getElementById('vs-plate-ring').style.display=toggleEls.vsPlate.checked?'':'none';
    document.getElementById('battle-ribbon').style.display=toggleEls.ribbon.checked?'':'none';
    document.getElementById('battle-ribbon-text').style.display=(toggleEls.ribbon.checked && toggleEls.ribbonText.checked)?'':'none';
    document.getElementById('text-left-deck').style.display=toggleEls.deckNames.checked?'':'none';
    document.getElementById('text-right-deck').style.display=toggleEls.deckNames.checked?'':'none';
    document.getElementById('text-left-digimon').style.display=toggleEls.cardNames.checked?'':'none';
    document.getElementById('text-right-digimon').style.display=toggleEls.cardNames.checked?'':'none';
    document.getElementById('text-left-detail').style.display=toggleEls.cardDetails.checked?'':'none';
    document.getElementById('text-right-detail').style.display=toggleEls.cardDetails.checked?'':'none';
    document.getElementById('left-nameplate').style.display=toggleEls.nameplates.checked?'':'none';
    document.getElementById('right-nameplate').style.display=toggleEls.nameplates.checked?'':'none';
    document.getElementById('art-left').style.display=(toggleEls.leftArt.checked && uploaded.left)?'':'none';
    document.getElementById('art-right').style.display=(toggleEls.rightArt.checked && uploaded.right)?'':'none';
    for(const side of ['left','right'])document.getElementById('placeholder-'+side).style.display=(!uploaded[side]&&toggleEls[side==='left'?'leftArt':'rightArt'].checked)?'':'none';
    document.getElementById('left-edge-stripe').style.display=toggleEls.leftStripe.checked?'':'none';
    document.getElementById('right-edge-stripe').style.display=toggleEls.rightStripe.checked?'':'none';
  }
  function applyCustomControls(){
    const center=document.getElementById('text-versus');
    center.textContent=(centerLabelInput.value.trim()||'VS').toUpperCase();
    center.setAttribute('font-size', String(clamp(Number(centerSizeInput.value)||188,48,260)));
    center.dataset.baseSize=String(clamp(Number(centerSizeInput.value)||188,48,260));
    document.getElementById('battle-ribbon-text').textContent=ribbonInput.value.trim()||' ';
    applyFontCustomization();
    applyToggles();
    textUpdaters.forEach(fn=>fn());
    window.dispatchEvent(new Event('thumb:controls'));
  }
  function applyLayout(name, announce=false){
    if(!isLayoutAvailable(name))name="layout1";
    const cfg=layoutPresets[name]||layoutPresets.layout1;
    currentLayout.value=name;
    layoutSelect.value=name;
    setArt('left',cfg.artL); setArt('right',cfg.artR);
    setTextEl('text-left-deck',cfg.deckL); setTextEl('text-right-deck',cfg.deckR);
    setTextEl('text-left-digimon',cfg.digiL); setTextEl('text-left-detail',cfg.detailL);
    setTextEl('text-right-digimon',cfg.digiR); setTextEl('text-right-detail',cfg.detailR);
    const vs=document.getElementById('text-versus');
    vs.textContent=cfg.vs.label;
    centerLabelInput.value=cfg.vs.label;
    centerFontInput.value=cfg.vs.font;
    centerSizeInput.value=cfg.vs.size;
    setTextEl('text-versus',cfg.vs);
    vs.setAttribute('transform',cfg.vs.rotate?`rotate(${cfg.vs.rotate} ${cfg.vs.x} ${cfg.vs.y})`:'' );
    if(cfg.vs.stroke!==undefined) vs.setAttribute('stroke-width',cfg.vs.stroke);
    toggleEls.vsPlate.checked=cfg.showPlate!==false;
    toggleEls.ribbon.checked=cfg.topRibbon!==false;
    toggleEls.ribbonText.checked=cfg.topRibbon!==false;
    toggleEls.nameplates.checked=cfg.nameplates!==false;
    toggleEls.deckNames.checked=cfg.showDeckNames!==false;
    toggleEls.leftArt.checked=true;toggleEls.rightArt.checked=!cfg.solo;
    toggleEls.cardNames.checked=(cfg.digiL.display!==false || cfg.digiR.display!==false);
    toggleEls.cardDetails.checked=(cfg.detailL.display!==false || cfg.detailR.display!==false);
    toggleEls.vs.checked=cfg.vs.label!=='';
    ribbonInput.value=cfg.ribbonText || 'DIGIMON CARD GAME  •  DECK BATTLE';
    deckFontInput.value=cfg.deckL.font || 'impact';
    cardFontInput.value=cfg.digiL.font || 'impact';
    detailFontInput.value=cfg.detailL.font || 'hyper';
    document.getElementById('battle-ribbon').style.display=cfg.topRibbon===false?'none':'';
    document.getElementById('battle-ribbon-text').style.display=cfg.topRibbon===false?'none':'';
    document.getElementById('battle-ribbon-text').textContent=ribbonInput.value;
    document.getElementById('vs-plate').style.display=cfg.showPlate===false?'none':'';
    document.getElementById('vs-plate-ring').style.display=cfg.showPlate===false?'none':'';
    applyCustomControls();
    syncLayoutCardSelection();
    window.dispatchEvent(new CustomEvent('thumb:layout',{detail:cfg.extra||null}));
    if(announce) status.textContent=`Layout aplicado: ${cfg.name}. Agora você pode editar VS/X/VERSUS, fontes e mostrar/ocultar elementos como quiser.`;
  }
  async function normalizeImage(file){
    if(!file||!file.type.startsWith('image/'))throw new Error('Selecione um arquivo de imagem válido.');
    if(file.size>35*1024*1024)throw new Error('Imagem muito grande. Use um arquivo de até 35 MB.');
    const url=URL.createObjectURL(file);
    try{
      const img=new Image();
      img.src=url;
      if(img.decode)await img.decode();else await new Promise((ok,fail)=>{img.onload=ok;img.onerror=fail;});
      if(!img.naturalWidth||!img.naturalHeight)throw new Error('Não consegui abrir a imagem.');
      const limit=4096;
      const factor=Math.min(1,limit/Math.max(img.naturalWidth,img.naturalHeight));
      const canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(img.naturalWidth*factor));
      canvas.height=Math.max(1,Math.round(img.naturalHeight*factor));
      const ctx=canvas.getContext('2d');
      if(!ctx)throw new Error('Canvas indisponível.');
      ctx.imageSmoothingEnabled=true;
      ctx.imageSmoothingQuality='high';
      ctx.drawImage(img,0,0,canvas.width,canvas.height);
      return canvas.toDataURL('image/png');
    }finally{URL.revokeObjectURL(url);}
  }
  const uploaded={left:false,right:false};
  const imageSequence={left:0,right:0};
  async function loadFile(side,file){
    const sequence=++imageSequence[side];
    if(!file)return;
    window.dispatchEvent(new CustomEvent('thumb:loading',{detail:true}));
    status.textContent=`Carregando carta da ${side==='left'?'esquerda':'direita'}...`;
    try{
      let base64=await normalizeImage(file);
      if(sequence!==imageSequence[side]) return false;
      if(window.ThumbStudio) base64=await window.ThumbStudio.prepareImage(base64,side);
      if(sequence!==imageSequence[side]) return false;
      const image=document.getElementById(`art-${side}`);
      image.setAttribute('href',base64);
      if(toggleEls[side==='left'?'leftArt':'rightArt'].checked) image.style.display='';
      document.getElementById(`placeholder-${side}`).style.display='none';
      document.getElementById(`file-name-${side}`).textContent=file.name;
      uploaded[side]=true;
      applyToggles();
      window.dispatchEvent(new CustomEvent('thumb:image',{detail:{side}}));
      status.textContent='Imagem centralizada. Edite os nomes, escolha as cores, o layout e exporte quando quiser.';
      return true;
    }catch(err){status.textContent='Erro: '+(window.ThumbI18n?.errorText(err)||err.message||String(err));return false;}
    finally{window.dispatchEvent(new CustomEvent('thumb:loading',{detail:false}));}
  }
  for(const side of ['left','right']){
    const input=document.getElementById('file-'+side);
    const zone=document.getElementById('drop-'+side);
    input.addEventListener('change',()=>loadFile(side,input.files?.[0]));
    for(const eventName of ['dragenter','dragover'])zone.addEventListener(eventName,e=>{e.preventDefault();zone.classList.add('dragging')});
    for(const eventName of ['dragleave','drop'])zone.addEventListener(eventName,e=>{e.preventDefault();zone.classList.remove('dragging')});
    zone.addEventListener('drop',e=>loadFile(side,e.dataTransfer?.files?.[0]));
  }
  /** Serialize and rasterize the SVG at the selected output resolution. */
  async function exportPNG(){
    exportBtn.disabled=true;
    const old=exportBtn.textContent;
    exportBtn.textContent='Preparando PNG…';
    try{
      const width=Number(document.getElementById('export-size')?.value)||1280;
      if(![1280,1920,2560].includes(width))throw new Error('Resolução inválida.');
      const height=width*9/16;
      const warnings=await window.ThumbStudio?.qualityWarnings?.(width)||[];
      status.textContent=`Renderizando a capa em ${width} × ${height}…`; 
      await window.ThumbScenes?.ready();
      await window.ThumbThemes?.ready();
      await window.ThumbRaster?.ready();
      window.ThumbComposition?.flush();window.ThumbFX?.flush();
      const copy=svg.cloneNode(true);
      copy.setAttribute('width',width);copy.setAttribute('height',height);
      copy.querySelectorAll('[data-editor-only]').forEach(el=>el.remove());
      copy.removeAttribute('id');
      for(const side of ['left','right']) if(!window.ThumbEndscreen?.getState().enabled && toggleEls[side==='left'?'leftArt':'rightArt'].checked && !uploaded[side]) throw new Error(`Selecione a carta da ${side==='left'?'esquerda':'direita'} antes de exportar.`);
      for(const side of ['left','right']){
        const ph=copy.querySelector(`#placeholder-${side}`); if(ph) ph.remove();
        const art=copy.querySelector(`#art-${side}`); if(art && ((side==='left' && toggleEls.leftArt.checked) || (side==='right' && toggleEls.rightArt.checked))) art.removeAttribute('style');
      }
      const xml=new XMLSerializer().serializeToString(copy);
      const svgBlob=new Blob([xml],{type:'image/svg+xml;charset=utf-8'});
      const blobUrl=URL.createObjectURL(svgBlob);
      try{
        const img=new Image();img.src=blobUrl;
        if(img.decode)await img.decode();else await new Promise((ok,fail)=>{img.onload=ok;img.onerror=fail;});
        const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
        const ctx=canvas.getContext('2d',{alpha:false});
        ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
        ctx.drawImage(img,0,0,width,height);
        const png=await new Promise((ok,fail)=>canvas.toBlob(blob=>blob?ok(blob):fail(new Error('Falha ao gerar PNG')),'image/png'));
        const link=URL.createObjectURL(png);
        const a=document.createElement('a');a.href=link;a.download=`ThumbTCG-${document.body.dataset.game||'capa'}-${width}x${height}.png`;
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(link),2000);
      }finally{URL.revokeObjectURL(blobUrl);}
      status.textContent=`PNG exportado (${width} × ${height} pixels). ${warnings.join(' ')}`;
    }catch(e){status.textContent='Não foi possível exportar: '+(window.ThumbI18n?.errorText(e)||e.message||String(e));}
    finally{exportBtn.disabled=false;exportBtn.textContent=old;}
  }
  exportBtn.addEventListener('click',exportPNG);
  layoutSelect.addEventListener('change',()=>applyLayout(layoutSelect.value,true));
  [centerLabelInput, centerFontInput, centerSizeInput, ribbonInput, deckFontInput, cardFontInput, detailFontInput].forEach(el=>el.addEventListener('input',applyCustomControls));
  Object.values(toggleEls).forEach(el=>el.addEventListener('change',applyCustomControls));
  buildLayoutUI();
  wireTheme('left');
  wireTheme('right');
  applyLayout('layout1', false);
  /** Public editor API shared with studio modules. */
  window.ThumbEngine={resetFragmentGeometry(){
      applyToggles();
      const c=layoutPresets[currentLayout.value]||layoutPresets.layout1;
      for(const[id,key]of [['text-left-deck','deckL'],['text-right-deck','deckR'],['text-left-detail','detailL'],['text-right-detail','detailR']]){const cfg=c[key],el=document.getElementById(id);for(const a of ['x','y'])if(cfg[a]!==undefined)el.setAttribute(a,cfg[a]);if(cfg.anchor)el.setAttribute('text-anchor',cfg.anchor);el.dataset.baseSize=cfg.size;}
      const center=document.getElementById('text-versus');center.setAttribute('x',c.vs.x);center.setAttribute('y',c.vs.y);center.setAttribute('font-size',centerSizeInput.value);center.setAttribute('transform',c.vs.rotate?`rotate(${c.vs.rotate} ${c.vs.x} ${c.vs.y})`:'');
      for(const id of ['vs-plate','vs-plate-ring']){document.getElementById(id).setAttribute('cx',640);document.getElementById(id).setAttribute('cy',334);document.getElementById(id).style.display=toggleEls.vsPlate.checked?'':'none';}
      document.getElementById('left-nameplate').setAttribute('d','M0 589H550L520 712H0Z');document.getElementById('right-nameplate').setAttribute('d','M737 589H1280V712H766Z');for(const side of ['left','right'])document.getElementById(side+'-nameplate').style.display=toggleEls.nameplates.checked?'':'none';
      applyFontCustomization();textUpdaters.forEach(fn=>fn());
    },isLayoutAvailable,layouts:()=>Object.entries(layoutPresets).map(([id,c])=>({id,name:c.name,solo:!!c.solo})),isSolo:()=>!!layoutPresets[currentLayout.value]?.solo,
    applyFragment(part,key){const c=layoutPresets[key];if(!c)return;
      const textParts={titleLeft:['text-left-deck','deckL'],titleRight:['text-right-deck','deckR'],detailLeft:['text-left-detail','detailL'],detailRight:['text-right-detail','detailR']};
      if(textParts[part]){const [id,k]=textParts[part];setTextEl(id,{...c[k],display:true});}
      if(part==='center'){setTextEl('text-versus',{...c.vs,display:true});for(const id of ['vs-plate','vs-plate-ring']){const el=document.getElementById(id);el.setAttribute('cx',c.vs.x);el.setAttribute('cy',c.vs.y-50);el.style.display=c.showPlate?'':'none';}}
      if(part==='baseLeft'||part==='baseRight'){const left=part==='baseLeft',el=document.getElementById(left?'left-nameplate':'right-nameplate');el.style.display='';const x=left?0:737,y=Math.max(0,Math.min(590,(left?c.deckL:c.deckR).y-65));el.setAttribute('d',left?`M0 ${y}H550L520 ${y+120}H0Z`:`M737 ${y}H1280V${y+120}H766Z`);}
    },clearImage(side){imageSequence[side]++;uploaded[side]=false;document.getElementById('art-'+side).removeAttribute('href');document.getElementById('file-name-'+side).textContent='PNG, JPG ou WebP • clique ou arraste aqui';applyToggles();window.dispatchEvent(new CustomEvent('thumb:image',{detail:{side}}));},layoutExtra:()=>layoutPresets[currentLayout.value]?.extra||null,loadFile,applyLayout,applyCustomControls,applyTheme,paletteFromAccent,uploaded,normalizeImage,
    resetImages(){for(const side of ['left','right']){imageSequence[side]++;uploaded[side]=false;document.getElementById(`art-${side}`).removeAttribute('href');document.getElementById(`art-${side}`).removeAttribute('transform');document.getElementById(`placeholder-${side}`).style.display='';document.getElementById(`file-name-${side}`).textContent='PNG, JPG ou WebP • clique ou arraste aqui';}applyToggles();},
    setImage(side,data){document.getElementById(`art-${side}`).setAttribute('href',data);uploaded[side]=true;document.getElementById(`placeholder-${side}`).style.display='none';applyToggles();}
  };
})();

