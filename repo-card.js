/* One card for both figures: name, field, language, year, size, description,
   topics, links. Pure function: returns HTML. */
(function(){
  "use strict";
  function esc(s){ return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function fmt(kb){ return kb>=1024?(kb/1024).toFixed(kb>=10240?0:1)+" MB":kb+" KB"; }
  function darken(h,t){ var n=parseInt(h.slice(1),16); return "rgb("+Math.round(((n>>16)&255)*(1-t))+","+Math.round(((n>>8)&255)*(1-t))+","+Math.round((n&255)*(1-t))+")"; }
  /* r: repo · o: {fieldLabel, fieldColor, langColor, closable} */
  window.repoCard=function(r,o){
    var topics=(r.tp&&r.tp.length)?'<div class="rn-d-topics">'+r.tp.map(function(t){ return '<span>'+esc(t)+'</span>'; }).join('')+'</div>':'';
    return (o.closable?'<button class="rn-d-close" type="button" aria-label="Back to the default repository"><svg viewBox="0 0 10 10"><path d="M1 1 L9 9 M9 1 L1 9"/></svg></button>':'')+
      '<div class="rn-d-k" style="color:'+darken(o.fieldColor,.1)+'">'+esc(o.fieldLabel.toUpperCase())+'</div>'+
      '<div class="rn-d-name">'+esc(r.n)+(r.f?' <span class="rn-d-star" title="Featured">★</span>':'')+'</div>'+
      '<div class="rn-d-rule" style="background:'+o.fieldColor+'"></div>'+
      '<div class="rn-d-tags"><span><b>LANGUAGE</b><i style="background:'+o.langColor+'"></i>'+esc(r.lang||r.l||"Other")+'</span>'+
      '<span><b>FIELD</b><i style="background:'+o.fieldColor+'"></i>'+esc(o.fieldLabel)+'</span></div>'+
      '<div class="rn-d-meta"><span>'+r.y+'</span><span>'+fmt(r.s)+'</span>'+(r.fork?'<span>fork</span>':'')+'</div>'+
      (r.desc?'<div class="rn-d-desc">'+esc(r.desc)+'</div>':'<div class="rn-d-desc rn-d-none">No description yet.</div>')+
      topics+
      '<div class="rn-d-links"><a class="rn-d-link" href="'+r.u+'" target="_blank" rel="noopener">View on GitHub <span>↗</span></a>'+
      (r.hp?'<a class="rn-d-link alt" href="'+r.hp+'" target="_blank" rel="noopener">Live <span>↗</span></a>':'')+'</div>';
  };
})();
