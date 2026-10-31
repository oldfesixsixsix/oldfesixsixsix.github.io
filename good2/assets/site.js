const header=document.getElementById('top');
const onScroll=()=>header.classList.toggle('solid',scrollY>40);
addEventListener('scroll',onScroll);onScroll();

const menu=document.getElementById('menu');
document.getElementById('burger').onclick=()=>{menu.classList.toggle('open');header.classList.add('solid')};

// hero slider (home only)
const slides=[...document.querySelectorAll('.hero .slide')],dots=[...document.querySelectorAll('#dots button')];
if(slides.length){
  let cur=0,timer;
  const go=i=>{slides[cur].classList.remove('on');dots[cur].classList.remove('on');cur=i;slides[cur].classList.add('on');dots[cur].classList.add('on')};
  const auto=()=>{clearInterval(timer);timer=setInterval(()=>go((cur+1)%slides.length),6000)};
  dots.forEach((d,i)=>d.onclick=()=>{go(i);auto()});auto();
}

// reveal on scroll
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// portfolio filter + lightbox (product page)
const fb=[...document.querySelectorAll('#filters button')],cards=[...document.querySelectorAll('.card')];
fb.forEach(b=>b.onclick=()=>{fb.forEach(x=>x.classList.toggle('on',x===b));cards.forEach(c=>c.classList.toggle('hide',b.dataset.f!=='all'&&c.dataset.c!==b.dataset.f))});
const modal=document.getElementById('modal');
if(modal){
  cards.forEach(c=>c.onclick=()=>{
    modal.querySelector('img').src=c.querySelector('img').src.replace('w=1000','w=1800');
    modal.querySelector('b').textContent=c.querySelector('h3').textContent;
    modal.querySelector('span').textContent=c.querySelector('small').textContent;
    modal.classList.add('on');
  });
  modal.onclick=e=>{if(e.target===modal||e.target.classList.contains('x'))modal.classList.remove('on')};
  addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('on')});
}

// contact form (demo only)
const form=document.getElementById('form');
if(form)form.onsubmit=e=>{
  e.preventDefault();
  if(!form.checkValidity()){form.reportValidity();return}
  document.getElementById('ok').style.display='block';
  form.querySelector('button[type=submit]').disabled=true;
};
