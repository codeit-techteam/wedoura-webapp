var PH=[/* PHOTO_PLACEHOLDER x N */];
function bg(e,i,o){e.style.backgroundImage="url("+PH[i]+")";if(o)e.style.backgroundPosition=o}
document.querySelectorAll("[data-p]").forEach(function(e){bg(e,+e.dataset.p,e.dataset.o)});
var V=[["Wedding Bells","Bengaluru","Photographers","4.9","₹1.5L",7,"50% 40%"],["Frame and Fable","Mumbai","Photographers","4.8","₹2.2L",3,"40% 50%"],["Lumière Studio","Delhi","Photographers","4.9","₹3L",8,"50% 50%"],
["Reel Vows","Jaipur","Videographers","4.8","₹1.2L",1,"50% 35%"],["Saffron Films","Udaipur","Videographers","4.9","₹2L",4,"50% 40%"],["Kalyana Events","Bengaluru","Planners","4.9","₹8L",0,"50% 30%"],
["The Courtyard House","Udaipur","Venues","4.7","₹12L",3,"50% 60%"],["Mehr Beauty","Mumbai","Makeup","4.9","₹45K",9,"50% 60%"],["Petal and Thread","Jaipur","Decor","4.8","₹4L",2,"50% 50%"]];
var T=["All","Photographers","Videographers","Planners","Venues","Makeup","Decor"],cur="All",tb=document.getElementById("tabs"),gr=document.getElementById("grid");
T.forEach(function(t){var b=document.createElement("button");b.textContent=t;b.setAttribute("role","tab");b.onclick=function(){cur=t;draw()};tb.appendChild(b)});
function draw(){[].forEach.call(tb.children,function(b){b.classList.toggle("on",b.textContent==cur)});gr.innerHTML="";
 V.filter(function(v){return cur=="All"||v[2]==cur}).forEach(function(v){var a=document.createElement("a");a.className="vc";a.href="#";
  a.innerHTML='<div class="ph"><button class="sv" aria-label="Save vendor">Save</button></div><h3></h3><div class="ty cap"></div><div class="pr"><span>From <b>'+v[4]+'</b></span><span><b>★ '+v[3]+'</b> Verified</span></div>';
  bg(a.firstChild,v[5],v[6]);a.children[1].textContent=v[0];a.children[2].textContent=v[1]+"  ·  "+v[2];
  a.querySelector(".sv").onclick=function(e){e.preventDefault();this.textContent=this.textContent=="Save"?"Saved":"Save"};gr.appendChild(a)})}
draw();
document.getElementById("go").onclick=function(){var s=document.getElementById("sv").value;cur=T.indexOf(s)>0?s:"All";draw();document.getElementById("vendors").scrollIntoView()};
var C=[["Udaipur",3,"40% 50%"],["Jaipur",0,"50% 40%"],["Bengaluru",7,"50% 40%"],["Goa",8,"50% 50%"],["Kerala",1,"50% 40%"],["Delhi",4,"50% 40%"]],st=document.getElementById("cities");
C.forEach(function(c){var a=document.createElement("a");a.className="city rv";a.href="#";a.innerHTML='<div class="ph"></div><span class="cap"></span>';bg(a.firstChild,c[1],c[2]);a.lastChild.textContent=c[0];st.appendChild(a)});
var pl=document.getElementById("pills");["Ahmedabad","Bengaluru","Chandigarh","Chennai","Delhi","Goa","Hyderabad","Jaipur","Jodhpur","Kochi","Kolkata","Mumbai","Pune","Udaipur"].forEach(function(n){var a=document.createElement("a");a.href="#";a.textContent=n;pl.appendChild(a)});
if("IntersectionObserver" in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.12});document.querySelectorAll(".rv").forEach(function(e,i){e.style.transitionDelay=(i%3*90)+"ms";io.observe(e)})}else document.querySelectorAll(".rv").forEach(function(e){e.classList.add("in")});
