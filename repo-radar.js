/* ============================================================
   REPOSITORY RADAR — one axis per field, one dot per repo.
   Radius = footprint (log). The polygon is each field's weight.

   Motion follows Apple's fluid-interface rules:
   · 1:1 pointer tracking with the grab offset respected
   · velocity history → release velocity handed to the spring
   · momentum projection (exponential decay) picks the landing axis
   · springs are interruptible: a new grab starts from the live value
   · damping 1.0 for plain moves, 0.8 only after a real flick
   Motion is additive: the resting state is drawn first, so a stalled
   animation clock can never leave anything hidden.
   ============================================================ */
(function(){
  "use strict";
  var R=(window.REPOS||[]).map(function(r){ return Object.assign({},r,{dom:(r.d==null?"Forks":r.d),lang:(r.l||"Other")}); });

  /* one field palette across both figures — mirrors FIELD_C in repo-nest.js */
  var AXES=[
    {key:"ML & Data",label:"ML & Data",color:"#C0552C"},
    {key:"Web & Interactive",label:"Web",color:"#4C8A70"},
    {key:"Simulation & OR",label:"Simulation",color:"#B0812F"},
    {key:"Systems & Algorithms",label:"Systems",color:"#7E8B45"},
    {key:"Blockchain",label:"Blockchain",color:"#43788F"},
    {key:"Profile / Meta",label:"Profile",color:"#6C6E92"},
    {key:"Forks",label:"Forks",color:"#8C857A"}
  ].filter(function(a){ return R.some(function(r){ return r.dom===a.key; }); });

  var CX=560, CY=360, R0=62, R1=292, NA=AXES.length, STEP=360/NA;
  var REDUCED=window.matchMedia&&window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var SVGNS="http://www.w3.org/2000/svg";
  function E(t,a){ var e=document.createElementNS(SVGNS,t); for(var k in a) e.setAttribute(k,a[k]); return e; }
  function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function fmt(kb){ return kb>=1024?(kb/1024).toFixed(kb>=10240?0:1)+" MB":kb+" KB"; }
  /* Field colours were chosen for 10px discs, where 3:1 is enough. As text they
     need real contrast, and it has to follow the theme — so JS supplies both
     variants and the stylesheet picks. */
  function darken(h,t){ var n=parseInt(h.slice(1),16); return "rgb("+Math.round(((n>>16)&255)*(1-t))+","+Math.round(((n>>8)&255)*(1-t))+","+Math.round((n&255)*(1-t))+")"; }
  function lighten(h,t){ var n=parseInt(h.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
    return "rgb("+Math.round(r+(255-r)*t)+","+Math.round(g+(255-g)*t)+","+Math.round(b+(255-b)*t)+")"; }
  function inkVars(h){ return "--fc-l:"+darken(h,.25)+";--fc-d:"+lighten(h,.5); }
  function sizeT(s){ var t=(Math.log(s+1)-Math.log(2))/(Math.log(770159)-Math.log(2)); return Math.max(0,Math.min(1,t)); }
  function pol(r,deg){ var a=deg*Math.PI/180; return [CX+r*Math.sin(a), CY-r*Math.cos(a)]; }
  function f2(p){ return p[0].toFixed(1)+","+p[1].toFixed(1); }

  var svg=document.getElementById("rr-svg");
  var tip=document.getElementById("rr-tip");
  var stage=document.getElementById("rr-stage");

  /* ---- static frame: rings + spokes (do not rotate with content) ---- */
  var frame=E("g",{});
  [0.34,0.67,1].forEach(function(t){ frame.appendChild(E("circle",{class:"rr-ring",cx:CX,cy:CY,r:(R0+(R1-R0)*t).toFixed(1)})); });
  frame.appendChild(E("circle",{class:"rr-ring",cx:CX,cy:CY,r:R0,"stroke-dasharray":"1 6"}));
  svg.appendChild(frame);

  var spokes=E("g",{}); svg.appendChild(spokes);
  var rot=E("g",{id:"rr-rot"}); svg.appendChild(rot);
  var labels=E("g",{id:"rr-labs"}); svg.appendChild(labels);

  /* ---- per-axis data ---- */
  var byAxis={}, maxCount=0;
  AXES.forEach(function(a,i){
    var list=R.filter(function(r){ return r.dom===a.key; }).sort(function(x,y){ return y.s-x.s; });
    byAxis[a.key]={axis:a,i:i,base:i*STEP,list:list};
    if(list.length>maxCount) maxCount=list.length;
  });

  /* spokes + rotating polygon + dots */
  var spokeEls=[], labEls=[], poly=E("path",{class:"rr-poly"}), vtx=[];
  rot.appendChild(poly);
  var dotEls=[];
  AXES.forEach(function(a){
    var A=byAxis[a.key];
    spokeEls.push(spokes.appendChild(E("line",{class:"rr-spoke",x1:CX,y1:CY,x2:0,y2:0})));
    var g=E("g",{class:"rr-g","data-key":a.key});
    A.list.forEach(function(r,j){
      var spread=Math.min(13,3+A.list.length*0.5);
      var jit=A.list.length===1?0:((j%2?1:-1)*spread*(0.25+0.75*((j*0.37)%1)));
      var rr=R0+(R1-R0)*(0.06+0.94*sizeT(r.s));
      var rad=3.2+sizeT(r.s)*4.6;
      r._ang=A.base+jit; r._r=rr; r._rad=rad; r._axis=a;
      var p=pol(rr,r._ang);
      var c=E("circle",{class:"rr-dot",cx:p[0].toFixed(1),cy:p[1].toFixed(1),r:rad.toFixed(1),fill:a.color});
      if(r.f) g.appendChild(E("circle",{class:"rr-feat",cx:p[0].toFixed(1),cy:p[1].toFixed(1),r:(rad+3).toFixed(1)}));
      g.appendChild(c); c._r=r; c._base=rad; dotEls.push(c);
    });
    rot.appendChild(g); A.g=g;
    var v=E("circle",{class:"rr-vtx",r:2.6,cx:0,cy:0}); rot.appendChild(v); vtx.push(v);
    var t=E("text",{class:"rr-lab",style:inkVars(a.color),"text-anchor":"middle"}); t.textContent=a.label;
    var n=E("text",{class:"rr-lab-n",style:inkVars(a.color),"text-anchor":"middle"}); n.textContent=A.list.length;
    labels.appendChild(t); labels.appendChild(n); labEls.push({t:t,n:n,A:A});
  });

  function polyPath(){
    var d="";
    AXES.forEach(function(a,i){
      var A=byAxis[a.key], rr=R0+(R1-R0)*(A.list.length/maxCount);
      var p=pol(rr,A.base);
      d+=(i?"L":"M")+f2(p);
      vtx[i].setAttribute("cx",p[0].toFixed(1)); vtx[i].setAttribute("cy",p[1].toFixed(1));
    });
    poly.setAttribute("d",d+"Z");
  }
  polyPath();

  /* ---- spring: Apple's damping-ratio + response, not mass/stiffness ---- */
  function Spring(v,damping,response){ this.x=v; this.t=v; this.v=0; this.z=damping; this.r=response; }
  Spring.prototype.set=function(t,vel){ this.t=t; if(vel!=null) this.v=vel; };
  Spring.prototype.step=function(dt){
    var w=2*Math.PI/this.r;
    this.v+=(-2*this.z*w*this.v - w*w*(this.x-this.t))*dt;
    this.x+=this.v*dt;
    if(Math.abs(this.v)<0.02&&Math.abs(this.x-this.t)<0.02){ this.x=this.t; this.v=0; return false; }
    return true;
  };

  var spin=new Spring(0,1,0.4), lift={}, raf=null;
  AXES.forEach(function(a){ lift[a.key]=new Spring(0,1,0.35); });

  /* labels stay upright and legible whatever the rotation */
  function paint(){
    rot.setAttribute("transform","rotate("+spin.x.toFixed(2)+" "+CX+" "+CY+")");
    labEls.forEach(function(L,i){
      var ang=L.A.base+spin.x, r=R1+34+lift[L.A.axis.key].x*10;
      var p=pol(r,ang);
      L.t.setAttribute("x",p[0].toFixed(1)); L.t.setAttribute("y",(p[1]+4).toFixed(1));
      L.n.setAttribute("x",p[0].toFixed(1)); L.n.setAttribute("y",(p[1]+18).toFixed(1));
      var sp=pol(R1+16,ang);
      spokeEls[i].setAttribute("x2",sp[0].toFixed(1)); spokeEls[i].setAttribute("y2",sp[1].toFixed(1));
      L.A.g.style.transform=lift[L.A.axis.key].x?("translate("+(lift[L.A.axis.key].x*Math.sin(L.A.base*Math.PI/180)*9).toFixed(2)+"px,"+(-lift[L.A.axis.key].x*Math.cos(L.A.base*Math.PI/180)*9).toFixed(2)+"px)"):"";
    });
  }
  function tick(){
    var now=performance.now(), dt=Math.min(0.032,(now-(tick.last||now-16))/1000); tick.last=now;
    var alive=spin.step(dt);
    AXES.forEach(function(a){ if(lift[a.key].step(dt)) alive=true; });
    paint();
    raf=alive?requestAnimationFrame(tick):null;
  }
  function kick(){ if(REDUCED){ AXES.forEach(function(a){ lift[a.key].x=lift[a.key].t; }); spin.x=spin.t; paint(); return; } if(!raf){ tick.last=performance.now(); raf=requestAnimationFrame(tick); } }
  paint();

  /* ---- drag to spin: 1:1, velocity history, projection, handoff ---- */
  function angleAt(e){
    var b=svg.getBoundingClientRect(), vb=svg.viewBox.baseVal;
    var s=Math.min(b.width/vb.width,b.height/vb.height);
    var x=(e.clientX-b.left-(b.width-vb.width*s)/2)/s+vb.x;
    var y=(e.clientY-b.top-(b.height-vb.height*s)/2)/s+vb.y;
    return Math.atan2(x-CX,-(y-CY))*180/Math.PI;
  }
  /* Apple's projection: exponential decay, not v²/2a */
  function project(v,d){ d=d||0.997; return (v/1000)*d/(1-d); }

  var drag=null, hist=[];
  svg.addEventListener("pointerdown",function(e){
    if(e.target.closest(".rr-dot")&&e.pointerType==="mouse") return;
    svg.setPointerCapture(e.pointerId);
    spin.v=0; spin.t=spin.x;                 /* interrupt: hold the live value */
    drag={a0:angleAt(e),r0:spin.x}; hist=[{a:0,t:performance.now()}];
    svg.classList.add("drag"); hideTip();
  });
  svg.addEventListener("pointermove",function(e){
    if(!drag) return;
    var d=angleAt(e)-drag.a0;
    if(d>180) d-=360; else if(d<-180) d+=360;
    spin.x=spin.t=drag.r0+d;                  /* 1:1 with the pointer */
    hist.push({a:spin.x,t:performance.now()}); if(hist.length>6) hist.shift();
    paint();
  });
  function release(){
    if(!drag) return;
    drag=null; svg.classList.remove("drag");
    var a=hist[0], b=hist[hist.length-1], dt=(b.t-a.t)/1000;
    var vel=dt>0.004?(b.a-a.a)/dt:0;          /* deg/s at release */
    var landed=spin.x+project(vel);
    var snap=Math.round(landed/STEP)*STEP;    /* nearest axis to the projected point */
    var flick=Math.abs(vel)>90;
    spin.z=flick?0.8:1; spin.r=flick?0.34:0.42;
    spin.set(snap,vel);                       /* velocity handoff — no seam */
    kick();
  }
  svg.addEventListener("pointerup",release);
  svg.addEventListener("pointercancel",release);

  /* ---- hover a dot: instant highlight, glass readout ---- */
  function showTip(c){
    var r=c._r, a=r._axis, b=c.getBoundingClientRect(), s=stage.getBoundingClientRect();
    tip.innerHTML='<div class="rr-t-k" style="color:'+a.color+'">'+esc(a.label)+'</div>'+
      '<div class="rr-t-n">'+esc(r.n)+(r.f?' <span style="color:#C49A45">\u2605</span>':'')+'</div>'+
      '<div class="rr-t-m"><span>'+esc(r.lang)+'</span><span>'+fmt(r.s)+'</span><span>\u2019'+(""+r.y).slice(2)+'</span></div>'+
      (r.desc?'<div class="rr-t-d">'+esc(r.desc)+'</div>':'');
    var st=stage.getBoundingClientRect();
    var cx0=b.left+b.width/2-st.left;
    cx0=Math.max(110,Math.min(st.width-110,cx0));
    var below=(b.top-st.top)<200;   /* not enough room above: flip under the dot */
    tip.style.left=cx0+"px";
    tip.style.top=(below?(b.bottom-st.top+10):(b.top-st.top-8))+"px";
    tip.style.transform=below?"translate(-50%,0)":"translate(-50%,-100%)";
    tip.classList.add("on");
  }
  function hideTip(){ tip.classList.remove("on"); }
  dotEls.forEach(function(c){
    c.addEventListener("pointerenter",function(){
      c.setAttribute("r",(c._base*1.9).toFixed(1));   /* feedback on enter, not on click */
      lift[c._r._axis.key].set(1); kick(); showTip(c);
    });
    c.addEventListener("pointerleave",function(){
      c.setAttribute("r",c._base.toFixed(1));
      lift[c._r._axis.key].set(0); kick(); hideTip();
    });
    c.addEventListener("click",function(e){ e.stopPropagation(); if(c._r.u) window.open(c._r.u,"_blank","noopener"); });
  });

  /* ---- legend: isolate one field ---- */
  var legend=document.getElementById("rr-legend"), iso=null;
  AXES.forEach(function(a){
    var A=byAxis[a.key];
    var b=document.createElement("button");
    b.type="button"; b.className="rr-l-row";
    b.innerHTML='<span class="rr-l-sw" style="background:'+a.color+'"></span><span class="rr-l-nm">'+esc(a.label)+'</span><span class="rr-l-ct">'+A.list.length+'</span>';
    b.addEventListener("click",function(){
      iso=(iso===a.key)?null:a.key;
      svg.classList.toggle("iso",!!iso);
      AXES.forEach(function(x){ byAxis[x.key].g.classList.toggle("on",iso===x.key); lift[x.key].set(iso===x.key?1:0); });
      [].forEach.call(legend.children,function(el,i){ el.classList.toggle("on",AXES[i].key===iso); });
      if(iso){ spin.z=1; spin.r=0.42; spin.set(-A.base); }   /* bring it to the top */
      kick();
    });
    legend.appendChild(b);
  });

  /* portrait containers crop to the radar's square core so phones aren't letterboxed */
  function updateVB(){ var r=stage.getBoundingClientRect(), narrow=r.width/Math.max(1,r.height)<1.15; svg.setAttribute("viewBox", narrow ? "208 8 704 704" : "0 0 1180 720"); svg.classList.toggle("narrow",narrow&&r.width<560); }
  window.addEventListener("resize",updateVB); updateVB();

  /* entrance: dots ease out from the centre when first seen — additive, never hides anything */
  if(!REDUCED&&window.requestAnimationFrame){
    var t0=document.timeline&&document.timeline.currentTime||0, clockOk=false, played=false, tries=0;
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ clockOk=!!(document.timeline&&document.timeline.currentTime>t0); }); });
    var play=function(){
      if(played) return;
      if(!clockOk){ if(++tries<6) setTimeout(play,160); return; }
      played=true;
      dotEls.forEach(function(c,i){
        try{ c.animate([{transform:"scale(.5)"},{transform:"scale(1)"}],
          {duration:520,delay:Math.min(i*9,320),easing:"cubic-bezier(.23,1,.32,1)",fill:"backwards"}); }catch(e){}
      });
      try{ poly.animate([{opacity:0},{opacity:1}],{duration:620,delay:260,easing:"cubic-bezier(.23,1,.32,1)",fill:"backwards"}); }catch(e){}
      spin.x-=14; spin.set(spin.t); kick();   /* a settle-in swing on the same spring the hand uses */
    };
    if("IntersectionObserver" in window){
      var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ play(); io.disconnect(); } }); },{threshold:.3});
      io.observe(stage);
    } else play();
  }
})();
