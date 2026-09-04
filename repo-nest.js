/* ============================================================
   THE REPOSITORY NEST — circular map of every public repository
   centre: live readout · inner ring: repos grouped into contiguous
   FIELD arcs and coloured by field · outer ring: field + language
   pills on two staggered rows (click to filter).
   Threads never cross the centre: they leave a repo radially, run
   along a circular "highway" arc concentric with the ring, then
   step out to the pill.
   ============================================================ */
(function(){
  "use strict";
  var R=(window.REPOS||[]).map(function(r){ return Object.assign({},r,{dom:(r.d==null?"Forks":r.d),lang:(r.l||"Other")}); });

  var LANG={"Python":"#5B93C4","Jupyter Notebook":"#E0982E","C++":"#D85C46","TypeScript":"#3FA796","JavaScript":"#E0B83C","HTML":"#D2743E","MATLAB":"#9170C0","VBA":"#6FA563","Mathematica":"#C95E89","Solidity":"#7A8A99","FreeBasic":"#BE9A5A","Other":"#A39B8B"};
  var LANG_SHORT={"Jupyter Notebook":"Jupyter"};
  var LANG_ORDER=["Python","Jupyter Notebook","C++","TypeScript","JavaScript","HTML","MATLAB","VBA","Mathematica","Solidity","FreeBasic","Other"];
  /* fields ordered so neighbours are kin, coloured along one continuous
     warm→cool ramp: adjacent fields read as related, distant ones don't */
  var DOM_ORDER=["ML & Data","Simulation & OR","Systems & Algorithms","Web & Interactive","Blockchain","Profile / Meta","Forks"];
  var FIELD_C={"ML & Data":"#C0552C","Simulation & OR":"#B0812F","Systems & Algorithms":"#7E8B45","Web & Interactive":"#4C8A70","Blockchain":"#43788F","Profile / Meta":"#6C6E92","Forks":"#8C857A"};
  var FIELD_LABEL={"ML & Data":"Machine Learning","Simulation & OR":"Simulation & OR","Systems & Algorithms":"Systems & Algorithms","Web & Interactive":"Web & Interactive","Blockchain":"Blockchain","Profile / Meta":"Profile","Forks":"Forks"};
  var FIELD_PILL={"ML & Data":"ML & Data","Simulation & OR":"Simulation","Systems & Algorithms":"Systems","Web & Interactive":"Web","Blockchain":"Blockchain","Profile / Meta":"Profile","Forks":"Forks"};
  var FIELD_ARC={"ML & Data":"MACHINE LEARNING","Simulation & OR":"SIMULATION","Systems & Algorithms":"SYSTEMS","Web & Interactive":"WEB","Blockchain":"BLOCKCHAIN","Profile / Meta":"PROFILE","Forks":"FORKS"};

  function fmt(kb){ return kb>=1024?(kb/1024).toFixed(kb>=10240?0:1)+" MB":kb+" KB"; }
  function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function darken(h,t){ var n=parseInt(h.slice(1),16); return "rgb("+Math.round(((n>>16)&255)*(1-t))+","+Math.round(((n>>8)&255)*(1-t))+","+Math.round((n&255)*(1-t))+")"; }
  function lighten(h,t){ var n=parseInt(h.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
    return "rgb("+Math.round(r+(255-r)*t)+","+Math.round(g+(255-g)*t)+","+Math.round(b+(255-b)*t)+")"; }
  /* field text ink: one rule shared with repo-radar.js — field colours are disc
     colours, so text darkens 25% in light and lightens 50% in dark to clear AA */
  function inkVars(h){ return "--fc-l:"+darken(h,.25)+";--fc-d:"+lighten(h,.5); }
  function sizeT(s){ var t=(Math.log(s+1)-Math.log(2))/(Math.log(770159)-Math.log(2)); return Math.max(0,Math.min(1,t)); }
  var SVGNS="http://www.w3.org/2000/svg";
  function E(tag,a){ var e=document.createElementNS(SVGNS,tag); for(var k in a) e.setAttribute(k,a[k]); return e; }
  function f(p){ return p[0].toFixed(1)+","+p[1].toFixed(1); }

  /* --- geometry. viewBox is kept tight so type survives a ~470px column --- */
  /* real language logos (Devicon, MIT — brand marks used for identification only).
     languages Devicon has no mark for fall back to the geometric glyphs below. */
  var ICON_BASE="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/";
  var SI_BASE="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/";
  var SIMPLE={"Mathematica":"wolframmathematica"};
  var DEVICON={"Python":"python/python-original","Jupyter Notebook":"jupyter/jupyter-original","C++":"cplusplus/cplusplus-original","TypeScript":"typescript/typescript-original","JavaScript":"javascript/javascript-original","HTML":"html5/html5-original","MATLAB":"matlab/matlab-original","Solidity":"solidity/solidity-original","VBA":"visualbasic/visualbasic-original"};

  /* original geometric glyphs — semantic, not imitations of brand logos.
     each is drawn inside a ±10 box around the badge centre. */
  function glyph(key,cx,cy,col){
    var g=E("g",{class:"rn-glyph",stroke:col,fill:"none","stroke-width":2.4,"stroke-linecap":"round","stroke-linejoin":"round"});
    function m(x,y){ return (cx+x).toFixed(1)+","+(cy+y).toFixed(1); }
    function L(d){ g.appendChild(E("path",{d:d})); }
    function D(x,y,r){ g.appendChild(E("circle",{"class":"f",cx:cx+x,cy:cy+y,r:r,fill:col,stroke:"none"})); }
    function O(x,y,r){ g.appendChild(E("circle",{cx:cx+x,cy:cy+y,r:r})); }
    function Rc(x,y,w,h,rx,filled){ var a={x:cx+x,y:cy+y,width:w,height:h,rx:rx||0}; if(filled){ a.fill=col; a.stroke="none"; a["class"]="f"; } g.appendChild(E("rect",a)); }
    switch(key){
      case "Python": O(-3.2,-3.2,5.2); O(3.2,3.2,5.2); break;
      case "Jupyter Notebook": D(0,0,2.4); D(0,-7,1.9); D(6,3.5,1.9); D(-6,3.5,1.9); break;
      case "C++": L("M"+m(-8,0)+"L"+m(-1,0)); L("M"+m(-4.5,-3.5)+"L"+m(-4.5,3.5)); L("M"+m(2,0)+"L"+m(9,0)); L("M"+m(5.5,-3.5)+"L"+m(5.5,3.5)); break;
      case "TypeScript": Rc(-8,-8,16,16,3); Rc(-3,-3,6,6,1,true); break;
      case "JavaScript": L("M"+m(3.5,-8.5)+"L"+m(-4.5,0.5)+"L"+m(1,0.5)+"L"+m(-3,8.5)); break;
      case "HTML": L("M"+m(-2,-6.5)+"L"+m(-8,0)+"L"+m(-2,6.5)); L("M"+m(2,-6.5)+"L"+m(8,0)+"L"+m(2,6.5)); break;
      case "MATLAB": D(-4,-4,2.1); D(4,-4,2.1); D(-4,4,2.1); D(4,4,2.1); break;
      case "VBA": Rc(-7.5,-7.5,15,15,1.5); L("M"+m(-7.5,-1.5)+"L"+m(7.5,-1.5)); L("M"+m(-1.5,-7.5)+"L"+m(-1.5,7.5)); Rc(-7.5,-7.5,6,6,0,true); break;
      case "Mathematica": L("M"+m(-8,3.5)+"C"+m(-5,-7.5)+" "+m(-2,-7.5)+" "+m(0,0)+"C"+m(2,7.5)+" "+m(5,7.5)+" "+m(8,-3.5)); break;
      case "Solidity": L("M"+m(0,-8.5)+"L"+m(7.4,-4.2)+"L"+m(7.4,4.2)+"L"+m(0,8.5)+"L"+m(-7.4,4.2)+"L"+m(-7.4,-4.2)+"Z"); break;
      case "FreeBasic": Rc(-7,-5.5,5.5,11,1,true); L("M"+m(1.5,5.5)+"L"+m(8,5.5)); break;
      default: D(-5.5,0,1.9); D(0,0,1.9); D(5.5,0,1.9);
    }
    return g;
  }

  /* --- geometry: one evenly-spaced badge ring, nothing at a stray radius --- */
  var C=390, RR=214, RB=240, RBL=256, RH=280, RBADGE=322, BR=22, GRP=9, GAPDEG=3.2;
  function pol(r,deg){ var a=deg*Math.PI/180; return [C+r*Math.sin(a), C-r*Math.cos(a)]; }
  function arcPath(r,a0,a1,rev){
    var p0=pol(r,rev?a1:a0), p1=pol(r,rev?a0:a1), large=Math.abs(a1-a0)>180?1:0;
    return "M"+f(p0)+"A"+r+","+r+" 0 "+large+" "+(rev?0:1)+" "+f(p1);
  }
  /* repo → pill, routed around the centre, never through it */
  function threadPath(rA,aA,rB,aB,rh){
    var d=((aB-aA+540)%360)-180, sweep=d>0?1:0;
    return "M"+f(pol(rA,aA))+"L"+f(pol(rh,aA))+"A"+rh+","+rh+" 0 0 "+sweep+" "+f(pol(rh,aB))+"L"+f(pol(rB,aB));
  }

  var present=DOM_ORDER.filter(function(d){ return R.some(function(r){return r.dom===d;}); });
  var DC={}; R.forEach(function(r){ DC[r.dom]=(DC[r.dom]||0)+1; });
  var LC={}; R.forEach(function(r){ LC[r.lang]=(LC[r.lang]||0)+1; });

  /* ---- order repos into contiguous field arcs, largest first ---- */
  var ordered=[];
  present.forEach(function(d){ R.filter(function(r){return r.dom===d;}).sort(function(a,b){return b.s-a.s;}).forEach(function(r){ ordered.push(r); }); });
  var N=ordered.length, usable=360-present.length*GAPDEG, cursor=0, fieldArc={};
  /* every field needs enough arc to carry its name and be clickable, so small
     fields get a floor and the surplus comes proportionally off the big ones */
  var MINSPAN=22, spans={}, deficit=0, flexible=[];
  present.forEach(function(d){ spans[d]=DC[d]/N*usable; });
  present.forEach(function(d){ if(spans[d]<MINSPAN){ deficit+=MINSPAN-spans[d]; spans[d]=MINSPAN; } else flexible.push(d); });
  var flexTotal=flexible.reduce(function(a,d){ return a+spans[d]; },0);
  if(deficit>0&&flexTotal>0) flexible.forEach(function(d){ spans[d]-=deficit*spans[d]/flexTotal; });
  present.forEach(function(d){ fieldArc[d]={a0:cursor+GAPDEG/2,a1:cursor+GAPDEG/2+spans[d]}; fieldArc[d].mid=(fieldArc[d].a0+fieldArc[d].a1)/2; cursor+=spans[d]+GAPDEG; });
  var idxInField={};
  ordered.forEach(function(r){
    idxInField[r.dom]=(idxInField[r.dom]||0); var k=DC[r.dom], j=idxInField[r.dom]++;
    var fa=fieldArc[r.dom], pad=Math.min(2.4,(fa.a1-fa.a0)*0.1);
    r._a = k===1 ? fa.mid : (fa.a0+pad)+j/(k-1)*((fa.a1-pad)-(fa.a0+pad));
    r._cr=6+sizeT(r.s)*5.5; var p=pol(RR,r._a); r._x=p[0]; r._y=p[1];
  });

  var svg=E("svg",{id:"rn-svg",viewBox:"0 0 "+(C*2)+" "+(C*2),preserveAspectRatio:"xMidYMid meet"});
  var defs=E("defs",{}); svg.appendChild(defs);
  var gr1=E("circle",{cx:C,cy:C,r:RR,fill:"none","stroke-width":1}); gr1.style.stroke="var(--line-2)"; svg.appendChild(gr1);
  var gr2=E("circle",{cx:C,cy:C,r:RH,fill:"none","stroke-width":1,"stroke-dasharray":"1 8"}); gr2.style.stroke="var(--line-2)"; svg.appendChild(gr2);

  /* ---- field arcs: the grouping, stated plainly ---- */
  var bandG=E("g",{id:"rn-bands"});
  var bandEls={};
  present.forEach(function(d,i){
    var fa=fieldArc[d], col=FIELD_C[d];
    var bg=E("g",{class:"rn-bandg","data-key":d});
    bg.appendChild(E("path",{class:"rn-bandhit",d:arcPath(RB,fa.a0,fa.a1),stroke:"transparent",fill:"none","stroke-width":40}));
    var bp=E("path",{d:arcPath(RB,fa.a0,fa.a1),class:"rn-band",stroke:col,fill:"none"});
    bg.appendChild(bp);
    var lower=fa.mid>90&&fa.mid<270;
    var arcLen=2*Math.PI*RBL*(fa.a1-fa.a0)/360;
    var txt=FIELD_ARC[d];
    /* the whole field name always reads: type shrinks to fit its arc (floor 11.5px)
       and only truncates if even that will not fit */
    var fs=Math.max(11.5,Math.min(16,arcLen/(txt.length*0.74)));
    var cap=Math.floor(arcLen/(fs*0.74));
    if(cap>=5){
      if(txt.length>cap) txt=txt.slice(0,Math.max(4,cap-1))+"·";
      var id="rnfa"+i;
      defs.appendChild(E("path",{id:id,d:arcPath(lower?RBL+13:RBL,fa.a0,fa.a1,lower),fill:"none"}));
      var t=E("text",{class:"rn-fname","font-size":fs,style:inkVars(col)});
      var tp=E("textPath",{"text-anchor":"middle","startOffset":"50%"}); tp.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","#"+id); tp.setAttribute("href","#"+id);
      tp.textContent=txt; t.appendChild(tp); bg.appendChild(t);
    }
    bg.style.cursor="pointer";
    bandG.appendChild(bg); bandEls[d]=bg;
  });
  svg.appendChild(bandG);

  var threads=E("g",{id:"rn-threads"}); svg.appendChild(threads);
  var hoverThreads=E("g",{id:"rn-hthreads"}); svg.appendChild(hoverThreads);

  /* ---- repo circles, coloured by field ---- */
  var repoG=E("g",{id:"rn-repos"}), repoEls=[];
  ordered.forEach(function(r,i){
    var col=FIELD_C[r.dom];
    var g=E("g",{class:"rn-repo","data-i":i,"data-lang":r.lang,"data-dom":r.dom});
    g.appendChild(E("circle",{class:"rn-hit",cx:r._x,cy:r._y,r:Math.max(r._cr+6,13),fill:"transparent"}));
    g.appendChild(E("circle",{class:"rn-dot",cx:r._x,cy:r._y,r:r._cr,fill:col,stroke:darken(col,.3),"stroke-width":1}));
    if(r.f) g.appendChild(E("circle",{class:"rn-feat",cx:r._x,cy:r._y,r:r._cr+3,fill:"none",stroke:"#C49A45","stroke-width":1.1}));
    repoG.appendChild(g); repoEls.push(g);
  });
  svg.appendChild(repoG);

  /* ---- outer ring: languages, one evenly-spaced circle ---- */
  var pills=[];
  LANG_ORDER.filter(function(l){return LC[l];}).forEach(function(l){ pills.push({type:"lang",key:l,label:l,color:LANG[l],n:LC[l]}); });
  var step=360/pills.length;
  var pillG=E("g",{id:"rn-pills"});
  pills.forEach(function(p,i){
    var ang=step/2+i*step;
    p._ang=ang; p._r=RBADGE;
    var pp=pol(RBADGE,ang);
    var g=E("g",{class:"rn-pill","data-type":p.type,"data-key":p.key});
    g.appendChild(E("circle",{class:"rn-pill-bg",cx:pp[0],cy:pp[1],r:BR,stroke:p.color}));
    var ttl=E("title",{}); ttl.textContent=p.label+" — "+p.n+(p.n===1?" repository":" repositories"); g.appendChild(ttl);
    var IS=28;
    var srcs=[];
    if(DEVICON[p.key]) srcs.push({url:ICON_BASE+DEVICON[p.key]+".svg",mono:false});
    if(SIMPLE[p.key]) srcs.push({url:SI_BASE+SIMPLE[p.key]+".svg",mono:true});
    /* Draw the built-in vector mark first so the badge is complete without any
       network, then try to upgrade it to the real logo on a hard 2.5s abort.
       Un-timed fetches keep the document's load state pending forever when a
       CDN is blocked, which is what made this page look hung. */
    var own=glyph(p.key,pp[0],pp[1],darken(p.color,.18));
    g.appendChild(own);
    (function tryNext(i){
      if(i>=srcs.length) return;
      var ac=window.AbortController?new AbortController():null;
      var killed=false, timer=setTimeout(function(){ killed=true; if(ac) ac.abort(); },2500);
      fetch(srcs[i].url,ac?{signal:ac.signal}:undefined).then(function(res){ if(!res.ok) throw 0; return res.text(); }).then(function(txt){
        clearTimeout(timer); if(killed) return;
        var root=new DOMParser().parseFromString(txt,"image/svg+xml").documentElement;
        if(!root||String(root.nodeName).toLowerCase()!=="svg") throw 0;
        var a={class:"rn-logo",x:pp[0]-IS/2,y:pp[1]-IS/2,width:IS,height:IS,viewBox:root.getAttribute("viewBox")||"0 0 128 128",preserveAspectRatio:"xMidYMid meet"};
        if(srcs[i].mono) a.fill=darken(p.color,.12);
        var sv=E("svg",a);
        while(root.firstChild) sv.appendChild(root.firstChild);
        g.appendChild(sv);
        if(own&&own.parentNode) own.parentNode.removeChild(own);   /* swap, never stack */
      }).catch(function(){ clearTimeout(timer); if(!killed) tryNext(i+1); });
    })(0);
    pillG.appendChild(g); p._el=g;
  });
  svg.appendChild(pillG);

  var gl=pol(RBADGE+42,0); var t1=E("text",{x:gl[0],y:gl[1]+4,class:"rn-grp","text-anchor":"middle"}); t1.textContent="LANGUAGES"; svg.appendChild(t1);
  document.getElementById("rn-figure").appendChild(svg);

  /* ---- state + centre readout ---- */
  var center=document.getElementById("rn-center"), detail=document.getElementById("rn-detail");
  var COARSE=window.matchMedia&&window.matchMedia("(hover:none)").matches;
  var active=null, hovered=null, hoverTimer=null, hoveredPill=null, hoveredField=null;

  var REDUCED=window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  /* Entrance motion is driven imperatively and gated on a live animation clock:
     if the clock is stalled (some embedded webviews) we skip it entirely rather
     than leave content held at an invisible start state. Motion also only moves
     things — never fades them — so a stall can't hide anything. */
  var CLOCK_OK=false;
  if(!REDUCED&&window.requestAnimationFrame&&document.timeline){
    var t0=document.timeline.currentTime||0;
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ CLOCK_OK=(document.timeline.currentTime||0)>t0; }); });
  }
  function animIn(el){
    if(!el||!CLOCK_OK||!el.animate) return;
    var kids=el.children;
    for(var i=0;i<kids.length;i++){
      try{ kids[i].animate([{transform:"translateY(6px)"},{transform:"none"}],{duration:340,delay:i*42,easing:"cubic-bezier(.23,1,.32,1)",fill:"backwards"}); }catch(e){}
    }
    var rule=el.querySelector(".rn-d-rule");
    if(rule){ try{ rule.animate([{transform:"scaleX(0)"},{transform:"scaleX(1)"}],{duration:580,delay:90,easing:"cubic-bezier(.23,1,.32,1)",fill:"backwards"}); }catch(e){} }
  }

  function repoMatch(r){ if(!active) return true; return active.type==="lang"? r.lang===active.key : r.dom===active.key; }
  function renderCenter(anim){
    if(hovered){
      center.innerHTML='<div class="rn-name-k" style="color:'+darken(FIELD_C[hovered.dom],.1)+'">'+esc(FIELD_LABEL[hovered.dom]||hovered.dom)+'</div>'+
        '<div class="rn-name rn-name-hov">'+esc(hovered.n)+'</div>'+
        '<div class="rn-name-s">'+esc(hovered.lang)+' · '+fmt(hovered.s)+'</div>';
    } else if(hoveredPill||hoveredField){
      var hp=hoveredPill||{type:"cat",label:FIELD_LABEL[hoveredField]||hoveredField,color:FIELD_C[hoveredField],n:DC[hoveredField]};
      center.innerHTML='<div class="rn-name-k" style="color:'+darken(hp.color,.12)+'">'+(hp.type==="lang"?"LANGUAGE":"FIELD")+'</div>'+
        '<div class="rn-name rn-name-hov">'+esc(hp.label)+'</div>'+
        '<div class="rn-name-s">'+hp.n+' '+(hp.n===1?"repository":"repositories")+' · click to filter</div>';
    } else if(active){
      var cnt=ordered.filter(repoMatch).length, label=active.type==="lang"?active.key:(FIELD_LABEL[active.key]||active.key);
      center.innerHTML='<div class="rn-name-k">Repositories in</div><div class="rn-name rn-name-filter">'+esc(label)+'</div><div class="rn-name-s">'+cnt+' of '+N+' · click again to reset</div>';
    } else {
      center.innerHTML='<div class="rn-name-k">GitHub</div><div class="rn-name">'+N+' repositories</div>';
    }
    if(anim) animIn(center);
  }
  function pillByKey(type,key){ for(var i=0;i<pills.length;i++){ if(pills[i].type===type&&pills[i].key===key) return pills[i]; } return null; }

  function applyFilter(){
    svg.classList.toggle("filtering",!!active);
    threads.innerHTML="";
    var langCol=active&&active.type==="lang"?LANG[active.key]:null;
    repoEls.forEach(function(g,i){
      var r=ordered[i], m=repoMatch(r), dot=g.querySelector(".rn-dot");
      g.classList.toggle("dim",!!active&&!m); g.classList.toggle("on",!!active&&m);
      var col=(m&&langCol)?langCol:FIELD_C[r.dom];
      dot.setAttribute("fill",col); dot.setAttribute("stroke",darken(col,.3));
    });
    pills.forEach(function(p){
      var sel=!!active&&active.type==="lang"&&p.key===active.key;
      var used=!active||ordered.some(function(r){ return repoMatch(r)&&r.lang===p.key; });
      p._el.classList.toggle("sel",sel); p._el.classList.toggle("fade",!!active&&!sel&&!used); p._el.classList.remove("link");
    });
    present.forEach(function(d){
      var sel=!!active&&active.type==="cat"&&active.key===d;
      var used=!active||ordered.some(function(r){ return repoMatch(r)&&r.dom===d; });
      bandEls[d].classList.toggle("sel",sel); bandEls[d].classList.toggle("fade",!!active&&!sel&&!used); bandEls[d].classList.remove("link");
    });
    if(active&&active.type==="lang"){
      var p=pillByKey("lang",active.key), matched=ordered.filter(repoMatch), n=matched.length, ti=0;
      matched.forEach(function(r){
        var rh=n>1? RH-14+(ti/(n-1))*28 : RH;
        var pth=E("path",{d:threadPath(RR+r._cr+4,r._a,p._r-BR-3,p._ang,rh),class:"rn-thread",pathLength:"1"});
        pth.style.animationDelay=Math.min(ti*0.028,0.4).toFixed(2)+"s";
        threads.appendChild(pth); ti++;
      });
    }
    renderCenter(true);
  }

  pills.forEach(function(p){
    var act=function(){ active=(active&&active.type===p.type&&active.key===p.key)?null:{type:p.type,key:p.key}; applyFilter(); };
    p._el.addEventListener("click",act);
    keyActivate(p._el,"Filter by "+p.label+" — "+p.n+(p.n===1?" repository":" repositories"),act);
    p._el.addEventListener("mouseenter",function(){ if(hovered) return; hoveredPill=p; renderCenter(false); });
    p._el.addEventListener("focusin",function(){ hovered=null; hoveredPill=p; renderCenter(false); });
    p._el.addEventListener("blur",function(){ if(hoveredPill===p){ hoveredPill=null; renderCenter(false); } });
    p._el.addEventListener("mouseleave",function(){ if(hoveredPill===p){ hoveredPill=null; renderCenter(false); } });
    p._el.style.cursor="pointer";
  });

  present.forEach(function(d){
    var el=bandEls[d];
    var act=function(){ active=(active&&active.type==="cat"&&active.key===d)?null:{type:"cat",key:d}; applyFilter(); };
    el.addEventListener("click",act);
    keyActivate(el,"Filter by "+(FIELD_LABEL[d]||d)+" — "+DC[d]+" repositories",act);
    el.addEventListener("focusin",function(){ hovered=null; hoveredField=d; el.classList.add("link"); renderCenter(false); });
    el.addEventListener("blur",function(){ el.classList.remove("link"); if(hoveredField===d){ hoveredField=null; renderCenter(false); } });
    el.addEventListener("mouseenter",function(){ if(hovered) return; hoveredField=d; el.classList.add("link"); renderCenter(false); });
    el.addEventListener("mouseleave",function(){ el.classList.remove("link"); if(hoveredField===d){ hoveredField=null; renderCenter(false); } });
  });

  /* the card is never empty: at rest it shows the newest featured repository */
  var DEFAULT=ordered.filter(function(r){ return r.f&&r.desc; }).sort(function(a,b){ return (b.y*100+b.m)-(a.y*100+a.m) || b.s-a.s; })[0] || ordered[0];
  var PREF=ordered.filter(function(r){ return r.n==="nl-to-sql-genbi"; })[0]; if(PREF&&PREF.desc) DEFAULT=PREF;
  var selected=DEFAULT, revertTimer=null;

  function keyActivate(el,label,fn){
    el.setAttribute("tabindex","0"); el.setAttribute("role","button"); el.setAttribute("aria-label",label);
    el.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); fn(); } });
  }

  function closeDetail(){ hovered=null; selected=DEFAULT; detail.classList.remove("on"); if(DEFAULT) showDetail(DEFAULT,true); renderCenter(true); }
  function select(r){ selected=r; hovered=r; showDetail(r,true); renderCenter(false); }

  function showDetail(r,anim){
    var col=LANG[r.lang]||LANG.Other;
    if(detail.dataset.repo===r.n) return;
    detail.dataset.repo=r.n;
    detail.innerHTML=window.repoCard(r,{fieldLabel:FIELD_LABEL[r.dom]||r.dom,fieldColor:FIELD_C[r.dom],langColor:col,closable:r!==DEFAULT});
    detail.classList.add("on");
    if(anim) animIn(detail);
    var cb=detail.querySelector(".rn-d-close");
    if(cb) cb.addEventListener("click",function(e){ e.stopPropagation(); closeDetail(); });
  }

  repoEls.forEach(function(g,i){
    var r=ordered[i];
    function enter(){
      clearTimeout(hoverTimer);
      hoverThreads.innerHTML="";
      pills.forEach(function(p){ p._el.classList.remove("link"); });
      repoEls.forEach(function(o){ o.classList.remove("hot"); });
      g.classList.add("hot"); g.parentNode.appendChild(g);
      if(!active){
        var lp=pillByKey("lang",r.lang);
        if(lp){ lp._el.classList.add("link"); hoverThreads.appendChild(E("path",{d:threadPath(RR+r._cr+4,r._a,lp._r-BR-3,lp._ang,RH),class:"rn-thread",pathLength:"1"})); }
        if(bandEls[r.dom]) bandEls[r.dom].classList.add("link");
      }
      /* brief hover intent so a sweep across the ring doesn't churn the readout */
      clearTimeout(revertTimer);
      hoverTimer=setTimeout(function(){ var fresh=!detail.classList.contains("on"); hovered=r; hoveredPill=null; hoveredField=null; renderCenter(false); showDetail(r,fresh); },50);
    }
    function leave(){ clearTimeout(hoverTimer); g.classList.remove("hot"); hoverThreads.innerHTML=""; pills.forEach(function(p){ p._el.classList.remove("link"); }); present.forEach(function(d){ bandEls[d].classList.remove("link"); }); hovered=null; renderCenter(false);
      clearTimeout(revertTimer); revertTimer=setTimeout(function(){ if(!hovered&&selected) showDetail(selected,false); },260); }
    g.addEventListener("mouseenter",enter);
    g.addEventListener("mouseleave",leave);
    g.addEventListener("click",function(e){ e.stopPropagation(); clearTimeout(hoverTimer); clearTimeout(revertTimer); if(COARSE){ enter(); clearTimeout(hoverTimer); } select(r); });
    g.style.cursor="pointer";
  });

  svg.addEventListener("click",function(e){ if(!e.target.closest(".rn-repo")&&!e.target.closest(".rn-pill")&&!e.target.closest(".rn-bandg")){ if(active){ active=null; applyFilter(); } } });

  /* one tab stop for the whole ring, arrow keys walk it */
  var kbIdx=0;
  repoG.setAttribute("tabindex","0"); repoG.setAttribute("role","group");
  repoG.setAttribute("aria-label",N+" repositories — use the arrow keys to walk the ring, Enter to show one");
  function kbGo(i){ kbIdx=(i+repoEls.length)%repoEls.length; repoEls[kbIdx].dispatchEvent(new MouseEvent("mouseenter",{bubbles:true})); }
  repoG.addEventListener("focusin",function(){ kbGo(kbIdx); });
  function onKey(e){
    var k=e.key;
    /* if focus feedback has not landed yet (some engines do not fire focus on a
       programmatically focused frame), the first key press lights the entry point */
    var cold=!svg.querySelector(".rn-repo.hot");
    if(cold&&(k==="ArrowRight"||k==="ArrowDown"||k==="ArrowLeft"||k==="ArrowUp")){ kbGo(kbIdx); e.preventDefault(); return; }
    if(k==="ArrowRight"||k==="ArrowDown") kbGo(kbIdx+1);
    else if(k==="ArrowLeft"||k==="ArrowUp") kbGo(kbIdx-1);
    else if(k==="Home") kbGo(0);
    else if(k==="End") kbGo(repoEls.length-1);
    else if(k==="Enter"){ var r=ordered[kbIdx]; if(r) select(r); e.preventDefault(); return; }
    else if(k==="Escape"){ if(active){ active=null; applyFilter(); } else closeDetail(); return; }
    else return;
    e.preventDefault();
  }
  repoG.addEventListener("keydown",onKey);
  /* the SVG's own nodes are not focusable in every engine, so the figure's
     HTML container carries the tab stop for the whole map */
  var fig=document.getElementById("rn-figure");
  fig.setAttribute("tabindex","0"); fig.setAttribute("role","group");
  fig.setAttribute("aria-label","Repository map — "+N+" repositories. Arrow keys walk the ring, Enter shows the repository, Escape resets.");
  fig.addEventListener("keydown",onKey);
  fig.addEventListener("focusin",function(){ kbGo(kbIdx); });
  renderCenter(true);
  if(DEFAULT) showDetail(DEFAULT,false);

  /* entrance when first seen: dots pop in field by field, badges follow.
     Gated on a live animation clock and transform/opacity only with backwards
     fill, so a stalled clock can never hide the figure. */
  if(!REDUCED&&window.requestAnimationFrame){
    var et0=document.timeline&&document.timeline.currentTime||0, eClock=false, ePlayed=false, eTries=0;
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ eClock=!!(document.timeline&&document.timeline.currentTime>et0); }); });
    var ePlay=function(){
      if(ePlayed) return;
      if(!eClock){ if(++eTries<6) setTimeout(ePlay,160); return; }
      ePlayed=true;
      repoEls.forEach(function(g,i){
        var d=g.querySelector(".rn-dot");
        try{ d.animate([{transform:"scale(.5)"},{transform:"scale(1)"}],{duration:420,delay:Math.min(i*11,500),easing:"cubic-bezier(.23,1,.32,1)",fill:"backwards"}); }catch(e){}
      });
      try{ bandG.animate([{opacity:0},{opacity:1}],{duration:640,delay:120,easing:"cubic-bezier(.23,1,.32,1)",fill:"none"}); }catch(e){}
      pills.forEach(function(p,i){
        try{ p._el.animate([{transform:"scale(.8)"},{transform:"scale(1)"}],{duration:380,delay:260+i*34,easing:"cubic-bezier(.23,1,.32,1)",fill:"backwards"}); }catch(e){}
      });
    };
    if("IntersectionObserver" in window){
      var eio=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ ePlay(); eio.disconnect(); } }); },{threshold:.25});
      eio.observe(svg);
    } else ePlay();
  }
})();
