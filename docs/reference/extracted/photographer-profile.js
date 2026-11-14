{"@context":"https://schema.org","@type":"ProfessionalService","name":"Wedding Bells","description":"Wedding photography and films","address":{"@type":"PostalAddress","addressLocality":"Bengaluru","addressCountry":"IN"},"priceRange":"From ₹1,50,000","aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"126"}}


/* PH: the photographs (swap any entry for another image URL). ALBUMS and HI list photo numbers from PH. */
var PH=[/* PHOTO_PLACEHOLDER x N */];
var PHL=[/* PHOTO_PLACEHOLDER x N */];
var ALBUMS=[
 {t:"The morning",l:"Getting ready",n:[0,2,9,4]},
 {t:"The first look",l:"Courtyard and stairs",n:[3,1,7]},
 {t:"Close together",l:"Portraits of the couple",n:[8,4,7,1]},
 {t:"The groom",l:"Portraits",n:[5,6]}
];
var HI=[0,3,7,4,1,8,6];
var IMG={};
function paint(el,p,k){el.dataset.k=k||"";var u=IMG[k]||PH[p];if(el.tagName=="IMG")el.src=u||"";else el.style.backgroundImage=u?"url("+u+")":"none"}
document.querySelectorAll("[data-p]").forEach(function(e){paint(e,+e.dataset.p,e.dataset.s)});
var car=document.getElementById("car");
HI.forEach(function(p,k){var d=document.createElement("div");d.className="ph";d.setAttribute("role","img");paint(d,p,"hi"+k);d.onclick=function(){openLb(0,k)};car.appendChild(d)});
function step(s){car.scrollBy({left:s*car.clientWidth*.6,behavior:"smooth"})}
document.getElementById("prev").onclick=function(){step(-1)};document.getElementById("next").onclick=function(){step(1)};
car.onkeydown=function(e){if(e.key=="ArrowRight")step(1);if(e.key=="ArrowLeft")step(-1)};
var g=document.getElementById("albums-grid");
ALBUMS.forEach(function(a,i){var b=document.createElement("button");b.className="al";b.setAttribute("aria-label","Open story "+a.t);
 b.innerHTML='<div class="ph"></div><h3></h3><span></span>';paint(b.firstChild,a.n[0],"al"+i+"-0");
 b.children[1].textContent=a.t;b.children[2].textContent=a.l;b.onclick=function(){openLb(i)};g.appendChild(b)});
var lb=document.getElementById("lb"),idx=0,list=[],keys=[],title="",sub="";
function show(){var pg=document.getElementById("pg");pg.innerHTML="";var h=document.createElement("div");h.className="pt";h.innerHTML="<h3></h3><p></p>";h.firstChild.textContent=title;h.lastChild.textContent=sub;pg.appendChild(h);var j=0,n=list.length;while(j<n){var two=j>0&&j+1<n,row=document.createElement("div");row.className="row"+(two?" two":"");for(var q=0;q<(two?2:1);q++){var im=document.createElement("img");im.className="pic";im.width=1080;im.height=1350;im.decoding="async";im.loading="lazy";im.alt=title+", photo "+(j+1);paint(im,list[j],keys[j]);row.appendChild(im);j++}pg.appendChild(row)}document.getElementById("lt").textContent=title;document.getElementById("lc").textContent=n+" photographs";var els=pg.querySelectorAll(".pic,.pt");if("IntersectionObserver" in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{root:pg,threshold:.1});els.forEach(function(e){io.observe(e)})}else els.forEach(function(e){e.classList.add("in")});var pb=document.getElementById("pb");pg.onscroll=function(){pb.style.width=(pg.scrollTop/Math.max(1,pg.scrollHeight-pg.clientHeight)*100)+"%"};pb.style.width="0";pg.scrollTop=0;var t=pg.querySelectorAll(".pic")[idx];if(t&&idx)t.scrollIntoView()}
function openLb(i,p){if(p!==undefined){list=HI;keys=HI.map(function(h,j){return "hi"+j});idx=p;title="Portfolio highlights";sub="A selection of our favourite frames"}else{list=ALBUMS[i].n;keys=list.map(function(x,j){return "al"+i+"-"+j});idx=0;title=ALBUMS[i].t;sub=ALBUMS[i].l}lb.classList.add("on");show();document.getElementById("lx").focus()}
function mv(s){idx=(idx+s+list.length)%list.length;show()}
function shut(){lb.classList.remove("on")}
document.getElementById("lx").onclick=shut;
document.addEventListener("keydown",function(e){if(!lb.classList.contains("on"))return;if(e.key=="Escape")shut();if(e.key=="ArrowRight")mv(1);if(e.key=="ArrowLeft")mv(-1)});
document.getElementById("send").onclick=function(){var n=document.getElementById("n").value.trim(),p=document.getElementById("ph").value.replace(/[^\d+]/g,""),o=document.getElementById("ok");
 if(!n){o.textContent="Please add your names.";return}
 if(p.length<8){o.textContent="Please add a phone or WhatsApp number so the studio can reply.";return}
 this.disabled=true;o.textContent="Thank you, "+n+". The Wedding Bells team will reply within 4 hours."};
/* full-screen story slides */
var sl=document.getElementById("sl"),dt=document.getElementById("dots"),cs=0,tm;
ALBUMS.forEach(function(a,i){var s=document.createElement("div");s.className="slide";
 s.innerHTML='<div class="bk"></div><div class="fg ph" role="img"></div><div class="sh"></div><div class="lab"><small>Inside</small><h3></h3><button class="go" aria-label="Open story">→</button></div>';
 var k="al"+i+"-0";s.children[0].style.backgroundImage="url("+PHL[a.n[0]]+")";paint(s.children[1],a.n[0],k);
 s.children[1].setAttribute("aria-label",a.t+", "+a.l);s.querySelector("h3").textContent=a.t;s.querySelector(".go").onclick=function(){openLb(i)};
 sl.appendChild(s);var d=document.createElement("button");d.setAttribute("aria-label","Show story "+(i+1));d.onclick=function(){go(i,1)};dt.appendChild(d)});
function go(i,u){cs=(i+ALBUMS.length)%ALBUMS.length;[].forEach.call(sl.children,function(s,j){s.classList.toggle("on",j==cs)});[].forEach.call(dt.children,function(d,j){d.classList.toggle("on",j==cs)});if(u){ustop=1;clearInterval(tm)}}
go(0);
document.getElementById("ip").onclick=function(){go(cs-1,1)};document.getElementById("ix").onclick=function(){go(cs+1,1)};
var ustop=0,inV=0;function ap(){clearInterval(tm);if(inV&&!document.hidden&&!ustop&&!matchMedia("(prefers-reduced-motion:reduce)").matches)tm=setInterval(function(){go(cs+1)},6500)}
if("IntersectionObserver" in window)new IntersectionObserver(function(es){inV=es[0].isIntersecting;ap()},{threshold:.3}).observe(document.getElementById("inside"));
document.addEventListener("visibilitychange",ap);
/* founder video: plays while in view. FV / FILMS src: put a video URL or data URI here once you have the files */
var RM=matchMedia("(prefers-reduced-motion:reduce)").matches,VID={},FV="",vi=0,vt;
var FILMS=[{t:"The highlight film",w:"A Wedding Bells film",l:"3 min",p:7,o:"50% 36%",k:"v-film0",src:""},{t:"The first look",w:"A Wedding Bells film",l:"90 sec",p:3,o:"50% 55%",k:"v-film1",src:""},{t:"The teaser",w:"A Wedding Bells film",l:"30 sec",p:8,o:"50% 42%",k:"v-film2",src:""},{t:"The details",w:"A Wedding Bells film",l:"60 sec",p:9,o:"50% 58%",k:"v-film3",src:""}];
var fvid=document.getElementById("fvid"),vph=document.getElementById("vph"),snd=document.getElementById("snd");
[6,5,8].forEach(function(p){var s=document.createElement("div");s.className="s";s.style.backgroundImage="url("+PH[p]+")";vph.appendChild(s)});
function fsrc(){return VID["v-founder"]||FV}
function fset(){var s=fsrc();if(s){fvid.src=s;fvid.style.display="block";vph.style.display="none";snd.style.display="block";if(RM)fvid.controls=true}}
function setVid(k,b){VID[k]=URL.createObjectURL(b);if(k=="v-founder")fset();else reelAttach(k)}
fset();
function cyc(){var a=vph.children;[].forEach.call(a,function(e,j){e.classList.toggle("on",j==vi)});vi=(vi+1)%a.length}
function vplay(on){if(fsrc()){if(RM)return;on?fvid.play().catch(function(){}):fvid.pause()}else{clearInterval(vt);if(on){cyc();if(!RM)vt=setInterval(cyc,3400)}}}
if("IntersectionObserver" in window)new IntersectionObserver(function(es){es.forEach(function(e){vplay(e.isIntersecting)})},{threshold:.55}).observe(document.getElementById("fv"));
snd.onclick=function(){fvid.muted=!fvid.muted;snd.textContent=fvid.muted?"Sound on":"Sound off"};
var fp=document.getElementById("fp"),fpv=document.getElementById("fpv"),fn=document.getElementById("fn"),fgd=document.getElementById("films-grid");
FILMS.forEach(function(f){var b=document.createElement("button");b.className="fc";b.dataset.v=f.k;b.setAttribute("aria-label","Play film: "+f.t);b.innerHTML='<div class="th"><i class="pl">▶</i></div><h3></h3><span></span>';b.firstChild.style.backgroundImage="url("+PH[f.p]+")";b.children[1].textContent=f.t;b.children[2].textContent=f.l;b.onclick=function(){openFilm(f)};fgd.appendChild(b)});
function openFilm(f){var s=VID[f.k]||f.src;document.getElementById("ft").textContent=f.t+"  ·  "+f.l;fp.classList.add("on");if(s){fn.style.display="none";fpv.style.display="block";fpv.src=s;fpv.play().catch(function(){})}else{fpv.style.display="none";fn.style.display="grid";fn.style.backgroundImage="url("+PH[f.p]+")"}document.getElementById("fx").focus()}
function closeFilm(){fp.classList.remove("on");fpv.pause();fpv.removeAttribute("src");fpv.load()}
document.getElementById("fx").onclick=closeFilm;document.addEventListener("keydown",function(e){if(e.key=="Escape")closeFilm()});
var fv2=document.createElement("input");fv2.type="file";fv2.accept="video/*";var vk="";
fv2.onchange=function(){var f=fv2.files[0];if(!f)return;var k=vk;setVid(k,f);idb(function(d){try{d.transaction("i","readwrite").objectStore("i").put(f,k)}catch(e){}});fv2.value=""};
document.addEventListener("click",function(e){if(!document.body.classList.contains("ed"))return;var v=e.target.closest("[data-v]");if(v){e.preventDefault();e.stopImmediatePropagation();vk=v.dataset.v;fv2.click()}},true);
/* film reels: full screen, they play as you scroll */
var rl=document.getElementById("reels");
FILMS.forEach(function(f,i){var r=document.createElement("article");r.className="reel";r.dataset.v=f.k;r.setAttribute("aria-label",f.t);r.innerHTML='<div class="rb"></div><div class="sh"></div><div class="rn"></div><div class="rt"><div><h3></h3><p></p></div><button class="wt" type="button" aria-label="Watch the film"><span>Watch film</span><i>▶</i></button></div>';
 var b=r.firstChild;b.style.backgroundImage="url("+PH[f.p]+")";b.style.setProperty("--pos",f.o||"50% 40%");
 r.querySelector(".rn").textContent="Film "+("0"+(i+1)).slice(-2)+" / "+("0"+FILMS.length).slice(-2);
 r.querySelector("h3").textContent=f.t;r.querySelector("p").textContent=f.w+"  ·  "+f.l;
 r.querySelector(".wt").onclick=function(){openFilm(f)};rl.appendChild(r);if(VID[f.k]||f.src)reelAttach(f.k)});
function reelAttach(k){var f=FILMS.filter(function(x){return x.k==k})[0],r=document.querySelector('.reel[data-v="'+k+'"]');if(!f||!r)return;var s=VID[k]||f.src;if(!s)return;var v=r.querySelector("video");if(!v){v=document.createElement("video");v.muted=true;v.loop=true;v.playsInline=true;v.preload="metadata";r.insertBefore(v,r.querySelector(".sh"))}v.src=s;if(r.classList.contains("on")&&!RM)v.play().catch(function(){})}
if("IntersectionObserver" in window){var vio=new IntersectionObserver(function(es){es.forEach(function(e){var r=e.target,v=r.querySelector("video");r.classList.toggle("on",e.isIntersecting);if(v&&!RM){e.isIntersecting?v.play().catch(function(){}):v.pause()}})},{threshold:.55});[].forEach.call(rl.children,function(r){vio.observe(r)})}else[].forEach.call(rl.children,function(r){r.classList.add("on")});
/* sticky action bar, shortlist, owner tools via #edit */
var cta=document.getElementById("cta"),ca=0,cb=0;function cup(){cta.classList.toggle("on",!!(ca&&!cb))}
if("IntersectionObserver" in window){new IntersectionObserver(function(es){ca=!es[0].isIntersecting;cup()}).observe(document.querySelector(".hero"));new IntersectionObserver(function(es){cb=es[0].isIntersecting;cup()},{threshold:.2}).observe(document.getElementById("inquire"))}
document.getElementById("sv").onclick=function(){var on=this.getAttribute("aria-pressed")!="true";this.setAttribute("aria-pressed",on);this.textContent=on?"♥":"♡"};
function edv(){document.documentElement.classList.toggle("edon",/edit/.test(location.hash))}edv();addEventListener("hashchange",edv);
/* scroll reveals */
var RV=document.querySelectorAll(".sec h2,.sec .sub,.sec .rule,.al,.about>*,.pk>div,.rev figure,.press,details,.inq>*,.fc,.facts");
if("IntersectionObserver" in window){var rio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");rio.unobserve(e.target)}})},{threshold:.12});RV.forEach(function(e,i){e.classList.add("rv");e.style.transitionDelay=(i%3*90)+"ms";rio.observe(e)})}
/* replace-a-photo mode: choices are saved privately in this browser */
function idb(f){try{var r=indexedDB.open("wedoura-pf2",1);r.onupgradeneeded=function(){r.result.createObjectStore("i")};r.onsuccess=function(){f(r.result)}}catch(e){}}
function setBg(k,u){document.querySelectorAll("[data-k]").forEach(function(e){if(e.dataset.k==k){if(e.tagName=="IMG")e.src=u;else e.style.backgroundImage="url("+u+")"}})}
idb(function(d){try{var s=d.transaction("i").objectStore("i").openCursor();s.onsuccess=function(){var c=s.result;if(c){if(String(c.key).indexOf("v-")==0)setVid(c.key,c.value);else{IMG[c.key]=c.value;setBg(c.key,c.value)}c.continue()}}}catch(e){}});
var fi=document.createElement("input");fi.type="file";fi.accept="image/*";var tk="";
fi.onchange=function(){var f=fi.files[0];if(!f)return;var im=new Image();im.onload=function(){var s=Math.min(1,2000/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*s;c.height=im.height*s;c.getContext("2d").drawImage(im,0,0,c.width,c.height);var u=c.toDataURL("image/jpeg",.85),k=tk;IMG[k]=u;setBg(k,u);idb(function(d){try{d.transaction("i","readwrite").objectStore("i").put(u,k)}catch(e){}})};im.src=URL.createObjectURL(f);fi.value=""};
document.addEventListener("click",function(e){if(!document.body.classList.contains("ed"))return;var t=e.target.closest(".ph[data-k],img[data-k]");if(t&&t.dataset.k){e.preventDefault();e.stopPropagation();tk=t.dataset.k;fi.click()}},true);
document.getElementById("ed").onclick=function(){var on=document.body.classList.toggle("ed");this.textContent=on?"Done":"Replace photos"};
