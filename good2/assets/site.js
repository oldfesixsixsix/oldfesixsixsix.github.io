// Site content lives in data/content.json and is edited from /good2/manage/.
const BASE=new URL('../',document.currentScript.src);
const DRAFT_KEY='good2-draft';
const PREVIEW=new URLSearchParams(location.search).has('preview');

const header=document.getElementById('top');
const onScroll=()=>header.classList.toggle('solid',scrollY>40);
addEventListener('scroll',onScroll);onScroll();

const menu=document.getElementById('menu');
document.getElementById('burger').onclick=()=>{menu.classList.toggle('open');header.classList.add('solid')};

// ---- helpers ----
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const src=p=>!p?'':/^(https?:|data:|blob:|\/)/.test(p)?p:new URL(p,BASE).href;
const get=(o,path)=>path.split('.').reduce((a,k)=>a==null?a:a[k],o);
function h(tag,props={},...kids){
  const el=document.createElement(tag);
  for(const[k,v]of Object.entries(props)){
    if(k==='class')el.className=v;
    else if(k==='text')setText(el,v);
    else if(k.startsWith('on'))el[k]=v;
    else el.setAttribute(k,v);
  }
  kids.flat().forEach(c=>c!=null&&c!==false&&el.append(c));
  return el;
}
// text with "\n" rendered as line breaks
function setText(el,str){
  el.replaceChildren();
  String(str??'').split('\n').forEach((line,i)=>{if(i)el.append(h('br'));el.append(line)});
}
const img=(p,alt='')=>h('img',{src:src(p),alt,loading:'lazy'});

async function loadContent(){
  if(PREVIEW){
    try{const d=localStorage.getItem(DRAFT_KEY);if(d)return JSON.parse(d)}catch(e){}
  }
  const r=await fetch(new URL('data/content.json',BASE),{cache:'no-store'});
  if(!r.ok)throw new Error('content.json '+r.status);
  return r.json();
}

// ---- renderers ----
function renderCommon(c){
  $$('[data-logo]').forEach(a=>{
    a.replaceChildren();
    if(c.brand.logo)a.append(h('img',{src:src(c.brand.logo),alt:c.brand.name}));
    else a.append(h('b',{text:c.brand.name}),h('span',{text:c.brand.en}));
  });
  $$('[data-bind]').forEach(el=>setText(el,get(c,el.dataset.bind)));
  $$('[data-banner]').forEach(el=>el.src=src(c.pages[el.dataset.banner]));
  $$('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  const t=document.body.dataset.pageTitle;
  document.title=(t?t+'｜':'')+c.brand.name;
}

function renderHome(c){
  const hero=$('#hero');if(!hero)return;
  const slides=c.home.slides.map((s,i)=>h('div',{class:'slide'+(i?'':' on')},h('img',{src:src(s.image),alt:''})));
  hero.prepend(...slides);
  const dots=slides.map((_,i)=>h('button',{class:i?'':'on','aria-label':`第 ${i+1} 張`}));
  $('#dots').replaceChildren(...dots);
  if(slides.length>1){
    let cur=0,timer;
    const go=i=>{slides[cur].classList.remove('on');dots[cur].classList.remove('on');cur=i;slides[cur].classList.add('on');dots[cur].classList.add('on')};
    const auto=()=>{clearInterval(timer);timer=setInterval(()=>go((cur+1)%slides.length),6000)};
    dots.forEach((d,i)=>d.onclick=()=>{go(i);auto()});auto();
  }
}

function renderWorks(c){
  const grid=$('#grid');if(!grid)return;
  const cats=[...new Set(c.works.map(w=>w.category).filter(Boolean))];
  const cards=c.works.map(w=>{
    const card=h('div',{class:'card reveal','data-c':w.category||''},h('div',{class:'img'},img(w.image)),h('h3',{text:w.title}),h('small',{text:[w.category,w.info].filter(Boolean).join('｜')}));
    card.onclick=()=>openModal(w);
    return card;
  });
  grid.replaceChildren(...cards);
  const btns=['全部',...cats].map((n,i)=>h('button',{class:i?'':'on',text:n}));
  btns.forEach((b,i)=>b.onclick=()=>{
    btns.forEach(x=>x.classList.toggle('on',x===b));
    cards.forEach(cd=>cd.classList.toggle('hide',i>0&&cd.dataset.c!==cats[i-1]));
  });
  $('#filters').replaceChildren(...btns);
}

const modal=$('#modal');
function openModal(w){
  $('img',modal).src=src(w.image).replace('w=1000','w=1800');
  $('b',modal).textContent=w.title;
  $('span',modal).textContent=[w.category,w.info].filter(Boolean).join('｜');
  modal.classList.add('on');
}
if(modal){
  modal.onclick=e=>{if(e.target===modal||e.target.classList.contains('x'))modal.classList.remove('on')};
  addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('on')});
}

function renderList(sel,items,fn){const el=$(sel);if(el)el.replaceChildren(...items.map(fn))}
const pad=i=>String(i+1).padStart(2,'0');

function renderSections(c){
  renderList('#services',c.services,(s,i)=>h('div',{},h('span',{class:'num',text:pad(i)}),h('h3',{text:s.title}),h('p',{text:s.desc})));
  const about=$('#about-img');
  if(about)about.replaceChildren(img(c.about.image));
  renderList('#about-text',c.about.text.split(/\n\s*\n/).filter(Boolean),p=>h('p',{text:p}));
  renderList('#stats',c.about.stats,s=>h('div',{},h('b',{text:s.value}),h('span',{text:s.label})));
  const steps=$('#steps');
  if(steps){steps.style.setProperty('--n',c.process.length);renderList('#steps',c.process,(s,i)=>h('div',{class:'step'},h('i',{text:pad(i)}),h('h4',{text:s.title}),h('p',{text:s.desc})))}
  renderList('#team',c.about.team,m=>h('div',{class:'member reveal'},h('div',{class:'img'},img(m.image)),h('h3',{text:m.name}),h('small',{text:m.role}),h('p',{text:m.bio})));
  renderList('#news',c.news,n=>h('article',{class:'reveal'},h('time',{text:n.date}),h('span',{class:'tag',text:n.tag}),h('div',{},h('h3',{text:n.title}),h('p',{text:n.text}))));
  renderList('#posts',c.blog,p=>h('article',{class:'post reveal'},
    h('div',{class:'img'},img(p.image)),
    h('span',{class:'meta',text:[p.category,p.date].filter(Boolean).join('　·　')}),
    h('h3',{text:p.title}),h('p',{text:p.excerpt}),
    p.body?h('details',{},h('summary',{text:'閱讀更多'}),h('div',{text:p.body})):null));
  $$('[data-teaser]').forEach(el=>el.prepend(img(c.pages[el.dataset.teaser])));
}

// keep ?preview on internal links so the whole site can be browsed in preview mode
function markPreview(){
  document.body.append(h('div',{class:'preview-badge',text:'預覽模式（草稿，尚未發佈）'}));
  $$('a[href]').forEach(a=>{
    const u=new URL(a.href,location.href);
    if(u.origin===location.origin&&!u.hash){u.searchParams.set('preview','1');a.href=u.href}
  });
}

// reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});

loadContent().then(c=>{
  renderCommon(c);renderHome(c);renderWorks(c);renderSections(c);
  if(PREVIEW)markPreview();
}).catch(err=>{
  console.error(err);
  document.body.append(h('div',{class:'preview-badge',text:'內容載入失敗，請稍後重新整理'}));
}).finally(()=>{
  $$('.reveal').forEach(el=>io.observe(el));
});

// contact form (demo only)
const form=$('#form');
if(form)form.onsubmit=e=>{
  e.preventDefault();
  if(!form.checkValidity()){form.reportValidity();return}
  $('#ok').style.display='block';
  $('button[type=submit]',form).disabled=true;
};
