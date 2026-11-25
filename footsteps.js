/* 책피바라 · 우리의 발자취, 모든 활동 기록은 data.js에서 관리합니다. */
(()=>{'use strict';
 const $=(id)=>document.getElementById(id);
 const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const f=DATA.footsteps;
 [['foot-eyebrow',f.eyebrow],['foot-title',f.title],['foot-subtitle',f.subtitle],['foot-intro',f.intro],['foot-card-label',f.cardLabel],['foot-ending-label',f.startLabel],['foot-theme',DATA.site.theme],['foot-final-note',f.finalNote],['foot-back',f.backHome],['foot-footer',DATA.footer.notice]].forEach(([id,t])=>$(id).textContent=t);
 $('foot-covers').innerHTML=DATA.books.map((b,i)=>`<a href="${i===0?'book1.html':'book2.html'}"><img src="${esc(b.cover)}" alt="${esc(b.title)} 책 표지"><span>${esc(b.title)}</span></a>`).join('');
 $('foot-record-list').innerHTML=DATA.timeline.map((r,i)=>{
   const pics=(r.photos||[]).filter(Boolean);
   return `<article class="foot-record foot-record--${esc(r.book)}" id="record-${i+1}"><div class="foot-record__copy"><span class="foot-record__count">${String(i+1).padStart(2,'0')} / 06</span><p class="foot-record__date">${esc(r.date)}</p><h3>${esc(r.title)}</h3><p class="foot-record__description">${esc(r.summary)}</p><div class="foot-record__book"><span>${r.book==='book1'?'『하늘과 바람과 별과 인간』':r.book==='book2'?'『호의에 대하여』':'두 권을 함께'}</span></div></div><div class="foot-record__photos ${pics.length===1?'foot-record__photos--single':''}">${pics.map((url,j)=>`<button class="foot-photo" type="button" data-src="${esc(url)}" data-caption="${esc(f.photoNotes[i])}"><img loading="lazy" src="${esc(url)}" alt="${esc(f.photoNotes[i])}"><span>${esc(f.photoNotes[i])}</span></button>`).join('')}</div></article>`;
 }).join('');
 const light=$('foot-lightbox');
 document.addEventListener('click',e=>{const b=e.target.closest('.foot-photo');if(!b)return;$('foot-lightbox-image').src=b.dataset.src;$('foot-lightbox-image').alt=b.dataset.caption;$('foot-lightbox-caption').textContent=b.dataset.caption;light.hidden=false;document.body.classList.add('light-open');$('foot-lightbox-close').focus();});
 function close(){light.hidden=true;$('foot-lightbox-image').removeAttribute('src');document.body.classList.remove('light-open');}
 $('foot-lightbox-close').addEventListener('click',close);
 light.addEventListener('click',e=>{if(e.target===light)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!light.hidden)close()});
 const obs=new IntersectionObserver(e=>e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('is-visible');obs.unobserve(x.target)}}),{threshold:.08});
 document.querySelectorAll('.foot-record').forEach(el=>obs.observe(el));
})();