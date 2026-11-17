(() => {
  const menu=document.querySelector('.menu-button');
  const drawer=document.getElementById('mobile-menu');
  if(menu&&drawer){menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu');drawer.hidden=!open;document.body.classList.toggle('menu-open',open);});}
  const header=document.querySelector('.site-header');
  const update=()=>header?.classList.toggle('scrolled',scrollY>24);
  window.addEventListener('scroll',update,{passive:true});update();
  document.querySelectorAll('form.ajax-form').forEach(form=>form.addEventListener('submit',async event=>{
    event.preventDefault();const btn=form.querySelector('button[type=submit]');const box=form.querySelector('.form-status');
    if(!form.reportValidity())return;const original=btn.textContent;btn.disabled=true;btn.textContent='Submitting…';box.textContent='';box.className='form-status';
    try{const payload=Object.fromEntries(new FormData(form).entries());const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);let response;try{response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});}finally{clearTimeout(timeout);}const data=await response.json();if(!response.ok)throw new Error(data.error||'Could not submit your request.');box.textContent=data.message+(data.reference?` Reference: ${data.reference}.`:'');box.classList.add('success');form.reset();}catch(err){box.textContent=err.name==='AbortError'?'Request timed out. Please try again.':err.message;box.classList.add('error');}finally{btn.disabled=false;btn.textContent=original;}
  }));
  const video=document.querySelector('.hero-video');if(video){video.addEventListener('error',()=>video.classList.add('video-missing'));video.querySelector('source')?.addEventListener('error',()=>video.classList.add('video-missing'));}
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('entered');observer.unobserve(e.target);}}),{threshold:0.08});document.querySelectorAll('.service-card,.sector,.journey article,.editorial-panel').forEach(x=>{x.classList.add('reveal');observer.observe(x);});}
})();
