/* 책피바라 · 두 번째 책 (v10)
   책을 터치하면 이야기 속으로 확대되고, 이후는 장면형 전시로 이어집니다.
   모든 활동 기록 및 편지 내용은 data.js에서 수정하세요. */
(() => {
  'use strict';
  const $ = (q) => document.querySelector(q);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g,(ch)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const wrap = (v) => `<span class="user-text">${esc(v)}</span>`;
  const book = DATA.books[1];
  const tr = DATA.trial, mailbox=DATA.mailbox, letters=DATA.letters;
  const bg=book.backgrounds || {};
  const record=DATA.timeline.filter((r)=>r.book==='book2'||r.book==='both');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const realForm=/^https?:\/\//i.test(mailbox.formUrl||'');
  const entrance=$('#entrance'), exhibition=$('#exhibition'), content=$('#scene-content');
  const view=$('#letter-viewer'), sheet=$('#viewer-sheet');
  let entered=false, entering=false, index=0, transitioning=false, bgSlot=0, bgValue='', lastFocus=null;
  let selectedVerdict='ours', openEnvelopeTimer=null, letterRevealTimer=null, openingEnvelope=null, openingTrigger=null;
  const chapters=[
    {key:'intro',label:'책의 시작',sub:'01 · PROLOGUE',background:bg.intro},
    {key:'journal',label:'독서 기록',sub:'02 · READING LOG',background:bg.timeline},
    {key:'case',label:'사건 파일',sub:'03 · CASE FILE',background:bg.case},
    {key:'court',label:'모의재판',sub:'04 · THE COURT',background:bg.court},
    {key:'verdict',label:'판결 비교',sub:'05 · JUDGEMENT',background:bg.verdict},
    {key:'mail',label:'호의 우체통',sub:'06 · KINDNESS',background:bg.mailbox},
    {key:'letters',label:'감사 편지',sub:'07 · LETTERS',background:bg.letters},
    {key:'end',label:'우리의 문장',sub:'08 · EPILOGUE',background:bg.end}
  ];
  const vignette=(eyebrow,title,body,extra='')=>`<div class="chapter-content"><p class="kicker">${eyebrow}</p><h2 class="chapter-title">${title}</h2>${body}${extra}</div>`;
  const note=(v)=>`<p class="chapter-note">${wrap(v)}</p>`;
  const stamp=(s,klass='')=>`<span class="inkstamp ${klass}" aria-hidden="true">${s}</span>`;
  const shortText=(str)=>esc(String(str||'').length>72 ? String(str).slice(0,72)+'…' : str);
  const roleIcons=['⚖','✒','◇','●'];

  const scenes = {
    intro:()=>`<article class="chapter chapter--intro" data-key="intro">
      <div class="chapter__overline">THE STORY BEGINS</div>
      ${vignette('첫 번째 장면 · 서문','어떤 마음을 남길 것인가', `<p class="chapter-lead">${wrap(book.summary)}</p><div class="editorial-line"></div><p class="chapter-prose">책에서 출발한 질문을 따라, 우리가 함께 고민한 사건과 전하고 싶은 마음을 만나봅니다.</p>`)}
      <div class="floating-mark floating-mark--olive" aria-hidden="true">✦</div>
    </article>`,
    journal:()=>`<article class="chapter chapter--journal" data-key="journal">
      ${vignette('함께 읽은 기록','책 밖에서 이어진 시간', `<p class="chapter-lead">날짜를 누르면 활동 요약과 사진을 펼쳐 볼 수 있어요.</p><div class="journal-items">${record.map((r,i)=>`<button type="button" class="journal-entry" data-activity="${i}"><span class="journal-entry__date">${esc(r.date)}</span><span class="journal-entry__title">${esc(r.title)}</span><span class="journal-entry__arrow">↗</span></button>`).join('')}</div>`)}
      ${stamp('독서<br>기록','inkstamp--quiet')}
    </article>`,
    case:()=>`<article class="chapter chapter--case" data-key="case">
      <div class="case-folder"><div class="case-folder__clip" aria-hidden="true"></div><div class="case-folder__file-number">CASE FILE / 01</div><div class="case-folder__bar"></div><span class="case-folder__legal">§</span><p class="kicker kicker--dark">모의재판 · 사건 선정</p><h2>${wrap(tr.caseTitle)}</h2><p class="case-folder__source">${wrap(tr.caseSource)}</p><div class="case-folder__summary">${wrap(tr.overview)}</div>${stamp('사건<br>접수','inkstamp--red')}<button type="button" class="mini-cta" data-open-case>사건 파일 자세히 열기 <span aria-hidden="true">↗</span></button></div>
      <div class="case-caption">한 사건을 여러 시선으로 읽어보는 기록</div>
    </article>`,
    court:()=>`<article class="chapter chapter--court" data-key="court">
      ${vignette('모의재판 · 각자의 자리','같은 사건, 다른 목소리',`<p class="chapter-lead">${wrap(tr.courtNote)}</p><p class="chapter-hint">역할을 누르면 모의재판에서 발표한 주장을 읽을 수 있어요.</p><div class="roles-grid">${tr.roles.map((r,i)=>`<button type="button" class="role-chip" data-open-role="${i}" aria-label="${esc(r.role)} 발언 읽기"><span class="role-chip__icon">${roleIcons[i%4]}</span><span class="role-chip__role">${esc(r.role)}</span><span class="role-chip__nickname">${wrap(r.nickname)}</span></button>`).join('')}</div>`)}
      ${stamp('MOCK<br>TRIAL','inkstamp--court')}
    </article>`,
    verdict:()=>`<article class="chapter chapter--verdict" data-key="verdict">
      ${vignette('모의재판 · 판결 비교','판단이 갈라지는 순간',`<p class="chapter-lead">같은 사건을 읽고 우리는 어떤 결론에 도달했을까요?</p><div class="verdict-tabs" role="group" aria-label="판결 선택"><button type="button" data-verdict="ours" aria-pressed="${selectedVerdict==='ours'}">우리의 판결</button><button type="button" data-verdict="author" aria-pressed="${selectedVerdict==='author'}">저자의 판단</button></div><div class="verdict-sheet" id="verdict-sheet">${renderVerdict()}</div><button type="button" class="mini-cta mini-cta--soft" data-compare>두 판단 나란히 비교하기 ↗</button>`)}
    </article>`,
    mail:()=>`<article class="chapter chapter--mail" data-key="mail">
      ${vignette('어떤 마음은 편지가 되어','호의 우체통',`<p class="chapter-lead">${wrap(mailbox.intro)}</p><div class="mail-block"><button type="button" class="envelope" id="mail-envelope" data-open-message="0" aria-label="봉투를 열어 첫 번째 메시지 읽기"><span class="envelope__back"></span><span class="envelope__paper" aria-hidden="true"></span><span class="envelope__front"></span><span class="envelope__flap"></span><span class="envelope__seal">✿</span></button><p class="mail-block__hint">봉투를 누르면 편지를 꺼내 읽을 수 있어요</p></div><div class="tiny-messages">${(mailbox.messages||[]).map((m,i)=>`<button type="button" data-open-message="${i}" aria-label="받은 메시지 ${i+1} 읽기">${String(i+1).padStart(2,'0')}<span>↗</span></button>`).join('')}</div>${realForm?`<a class="mini-cta mini-cta--soft" target="_blank" rel="noopener noreferrer" href="${esc(mailbox.formUrl)}">${esc(mailbox.buttonText)} ↗</a>`:`<p class="chapter-hint">구글 폼 링크는 data.js의 mailbox.formUrl에서 연결할 수 있어요.</p>`}`)}
    </article>`,
    letters:()=>`<article class="chapter chapter--letters" data-key="letters">
      ${vignette('감사의 말을 펼치면','전하고 싶은 마음',`<p class="chapter-lead">${wrap(letters.intro)}</p><div class="letter-tray">${letters.items.map((l,i)=>`<button type="button" class="sealed-letter" data-open-letter="${i}"><span class="sealed-letter__paper" aria-hidden="true"></span><span class="sealed-letter__fold" aria-hidden="true"></span><span class="sealed-letter__flap" aria-hidden="true"></span><span class="sealed-letter__top"><b>THANK YOU</b><i>${String(i+1).padStart(2,'0')}</i></span><span class="sealed-letter__to">To. ${esc(l.to)}</span><span class="sealed-letter__seal">✿</span><span class="sealed-letter__from">From. ${esc(l.writer)}</span></button>`).join('')}</div><p class="chapter-hint">봉투를 선택하면 감사 편지를 한 장씩 펼쳐 읽을 수 있어요.</p>`)}
    </article>`,
    end:()=>`<article class="chapter chapter--end" data-key="end">
      <div class="ending-ornament" aria-hidden="true">✦</div>${vignette('우리의 마지막 문장','호의가 남긴 것',`<p class="chapter-ending">${wrap(DATA.kindness.title)}</p><p class="chapter-lead">${wrap(DATA.kindness.text)}</p><p class="chapter-sign">— ${esc(DATA.kindness.by)}</p><div class="ending-divider"></div><p class="chapter-bridge">${wrap(DATA.footsteps.endPrompt)}</p><div class="ending-more"><button type="button" data-open-debate>독서토의 의견 보기 ↗</button><button type="button" data-open-review>다섯 번의 활동 돌아보기 ↗</button></div><div class="ending-links"><a class="ending-links__primary" href="footsteps.html">${esc(DATA.footsteps.cta)} ↗</a><a href="book1.html">첫 번째 책 돌아보기</a><a href="index.html">책피바라 홈</a></div><p class="chapter-credit">${esc(DATA.footer.notice)}</p>`)}
    </article>`
  };
  function renderVerdict(){const v=selectedVerdict==='ours'?tr.ourVerdict:tr.authorVerdict;return `<div class="verdict-sheet__label">${esc(v.label)}</div><p class="verdict-sheet__result">${wrap(v.result)}</p><p class="verdict-sheet__reason">${wrap(v.reasoning)}</p>${stamp(selectedVerdict==='ours'?'우리의<br>판결':'저자의<br>판단','inkstamp--verdict')}`;}
  function updateBackground(src){
    if(!src||bgValue===src)return;
    bgValue=src;
    const active=$('#scene-bg-'+(bgSlot===0?'a':'b'));
    const next=$('#scene-bg-'+(bgSlot===0?'b':'a'));
    next.style.backgroundImage=`url("${String(src).replaceAll('"','%22')}")`;
    next.classList.add('is-current');active.classList.remove('is-current');bgSlot=1-bgSlot;
  }
  let updateTimer=null;
  function go(n,{instant=false}={}){
    if(!entered||transitioning||!view.hidden||n<0||n>=chapters.length||(!instant&&n===index))return;
    resetEnvelope();
    if(updateTimer){clearTimeout(updateTimer);updateTimer=null;}
    transitioning=true;
    const stage=$('#scene-stage');
    stage.classList.remove('is-visible');stage.classList.add('is-leaving');
    const delay=(instant||reduced)?0:180;
    updateTimer=setTimeout(()=>{
      index=n;const scene=chapters[index];
      document.body.dataset.chapter=scene.key;
      content.innerHTML=scenes[scene.key]();
      $('#scene-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(chapters.length).padStart(2,'0')}`;
      $('#scene-subtitle').textContent=scene.sub;
      $('#story-prev').disabled=index===0;
      $('#story-next').disabled=index===chapters.length-1;
      $('#story-next').innerHTML=index===chapters.length-1?'마지막 장면 <span aria-hidden="true">✦</span>':'다음 <span aria-hidden="true">→</span>';
      $$('#story-nav-dots [data-chapter-index]').forEach((b,i)=>{b.setAttribute('aria-current',String(i===index));});
      updateBackground(scene.background||bg.cover);
      content.scrollTop=0;
      stage.classList.remove('is-leaving');requestAnimationFrame(()=>stage.classList.add('is-visible'));
      updateTimer=setTimeout(()=>{transitioning=false;},(instant||reduced)?20:380);
    },delay);
  }
  function $$(q){return Array.from(document.querySelectorAll(q));}
  function enter(){
    if(entered||entering)return;
    entering=true;
    document.body.classList.add('is-entering');
    const openDelay=reduced?0:930;
    const totalDelay=reduced?40:1530;
    setTimeout(()=>document.body.classList.add('is-zooming'),openDelay);
    setTimeout(()=>{
      entered=true;entering=false;entrance.hidden=true;exhibition.hidden=false;
      document.body.classList.remove('is-entering','is-zooming','at-entrance');
      document.body.classList.add('in-story');
      go(0,{instant:true});
      $('#story-next').focus({preventScroll:true});
    },totalDelay);
  }
  function viewerHTML(kicker,title,body,foot=''){
    return `<div class="viewer__letterhead"><span>책피바라</span><span>✦</span></div><p class="viewer__eyebrow">${kicker}</p><h2>${title}</h2><div class="viewer__content">${body}</div><div class="viewer__footer">${foot}</div>`;
  }
  function resetEnvelope(){
    clearTimeout(openEnvelopeTimer);openEnvelopeTimer=null;
    if(openingEnvelope){openingEnvelope.classList.remove('is-open','is-opening');}
    openingEnvelope=null;openingTrigger=null;
  }
  function animateEnvelope(envelope,trigger,show){
    if(!envelope||openingEnvelope||!view.hidden||transitioning)return;
    openingEnvelope=envelope;openingTrigger=trigger;
    envelope.classList.add(envelope.id==='mail-envelope'?'is-open':'is-opening');
    openEnvelopeTimer=setTimeout(()=>{
      openEnvelopeTimer=null;
      if(envelope.isConnected&&openingEnvelope===envelope)show();
    },reduced?0:900);
  }
  function openViewer(html,kind='paper'){
    clearTimeout(letterRevealTimer);letterRevealTimer=null;
    lastFocus=openingTrigger||document.activeElement;
    sheet.className='viewer__sheet viewer__sheet--'+kind;
    sheet.innerHTML=html;
    sheet.scrollTop=0;
    view.classList.remove('is-open','is-readable','is-letter');
    view.classList.toggle('is-letter',kind==='letter');
    view.hidden=false;
    document.body.classList.add('viewing');
    requestAnimationFrame(()=>{
      if(view.hidden)return;
      view.classList.add('is-open');
      if(kind==='letter'){
        letterRevealTimer=setTimeout(()=>{if(!view.hidden)view.classList.add('is-readable');},reduced?0:570);
      }
    });
    $('#viewer-close').focus({preventScroll:true});
  }
  function closeViewer(){
    clearTimeout(letterRevealTimer);letterRevealTimer=null;
    if(view.hidden){resetEnvelope();return;}
    view.classList.remove('is-open','is-readable','is-letter');
    view.hidden=true;
    document.body.classList.remove('viewing');
    resetEnvelope();
    lastFocus?.focus?.({preventScroll:true});
  }
  const photoList=(r)=>`<div class="viewer__photos">${(r.photos||[]).slice(0,2).map((src,i)=>`<div class="viewer__photo"><img src="${esc(src)}" alt="${esc(r.title)} ${r.photoType==='illustration'?'주제 일러스트 (실제 활동 사진 아님)':'활동 사진'} ${i+1}" onerror="this.parentNode.textContent='이미지를 불러오지 못했습니다.'">${r.photoType==='illustration'?'<small>주제 일러스트 · 실제 활동 사진 아님</small>':''}</div>`).join('')}</div>`;
  function showActivity(i){const a=record[i];if(!a)return;openViewer(viewerHTML(esc(a.date),esc(a.title),`<p>${wrap(a.summary)}</p>${photoList(a)}`,'책피바라 · 활동 기록'),'dossier');}
  function showCase(){openViewer(viewerHTML('CASE FILE · 사건 기록',wrap(tr.caseTitle),`<p><b>출처</b> ${wrap(tr.caseSource)}</p><div class="viewer__divider"></div><p>${wrap(tr.overview)}</p><p class="viewer__small">${wrap(tr.courtNote)}</p>`,'모의재판 · 사건 접수'),'dossier');}
  function showCompare(){openViewer(viewerHTML('VERDICT · 두 판단','우리의 판결과 저자의 판단',`<div class="viewer__compare"><section><h3>${esc(tr.ourVerdict.label)}</h3><strong>${wrap(tr.ourVerdict.result)}</strong><p>${wrap(tr.ourVerdict.reasoning)}</p></section><section><h3>${esc(tr.authorVerdict.label)}</h3><strong>${wrap(tr.authorVerdict.result)}</strong><p>${wrap(tr.authorVerdict.reasoning)}</p></section></div><p>${wrap(tr.reflection)}</p>`,'책피바라 · 모의재판'),'dossier');}
  function showMessage(i){const m=(mailbox.messages||[])[i];if(!m)return;openViewer(viewerHTML('POSTBOX · 받은 호의',`To. ${esc(m.to)}`,`<p class="viewer__message">${wrap(m.text)}</p>`,`From. ${esc(m.from)} · ${esc(m.date||'')}`),'letter');}
  function showLetter(i){const l=(letters.items||[])[i];if(!l)return;openViewer(viewerHTML('THANK YOU LETTER · 감사 편지',`To. ${esc(l.to)}`,`<p class="viewer__message">${wrap(l.body)}</p>`,`From. ${esc(l.writer)}`),'letter');}

  function showRole(i){const r=tr.roles[i];if(!r)return;openViewer(viewerHTML('모의재판 · 역할별 주장',esc(r.role),`<p>${wrap(r.argument||'[실제 발언을 입력해 주세요]')}</p>`,`책피바라 · ${esc(r.nickname)}`),'dossier');}
  function showDebate(){openViewer(viewerHTML('2026.11.21 · 독서토의',esc(tr.debateQuestion||''),`<ul class="viewer__bullet">${(tr.debateIdeas||[]).map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p><strong>종합 의견</strong> ${wrap(tr.debateConclusion||'')}</p>`,'책피바라 · 토의 기록'),'dossier');}
  function showReview(){const r=DATA.review;if(!r)return;const list=(a)=>`<ul class="viewer__bullet">${a.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>`;openViewer(viewerHTML('2026.11.22 · 전체 활동 회고','우리가 남긴 발자국',`<h3>잘한 점</h3>${list(r.strengths)}<h3>아쉬운 점</h3>${list(r.limitations)}<h3>다음에 한다면</h3>${list(r.next)}`,'책피바라 · 마지막 모임'),'dossier');}

  // 첫 화면은 책이나 별도 버튼을 찾을 필요 없이 화면 한 번 터치로 진입합니다.
  entrance.addEventListener('click',enter);
  entrance.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enter();}});
  $('#hero-title').innerHTML=esc(book.title).replace('대하여','<br>대하여');
  $('#hero-author').textContent=book.author;
  $('#portal-title').textContent=book.title;
  $('#portal-author').textContent=book.author;
  if(book.cover){const img=new Image();img.onload=()=>{
    const src=`url("${String(book.cover).replaceAll('"','%22')}")`;
    $('#cover-front').style.backgroundImage=src;
    $('#cover-front').classList.add('has-cover');
    $('#portal-flip-cover').style.setProperty('--portal-cover-image',src);
    };img.src=book.cover;}
  updateBackground(bg.cover||bg.intro);
  $('#story-nav-dots').innerHTML=chapters.map((s,i)=>`<button type="button" data-chapter-index="${i}" aria-label="${s.label} 바로가기" title="${s.label}" aria-current="${i===0}"><i></i><span>${s.label}</span></button>`).join('');
  $('#story-nav-dots').addEventListener('click',e=>{const b=e.target.closest('[data-chapter-index]');if(b)go(Number(b.dataset.chapterIndex));});
  $('#story-prev').addEventListener('click',()=>go(index-1));
  $('#story-next').addEventListener('click',()=>go(index+1));
  content.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-activity'))showActivity(Number(b.dataset.activity));
    else if(b.hasAttribute('data-open-role'))showRole(Number(b.dataset.openRole));
    else if(b.hasAttribute('data-open-debate'))showDebate();
    else if(b.hasAttribute('data-open-review'))showReview();
    else if(b.hasAttribute('data-open-case'))showCase();
    else if(b.hasAttribute('data-verdict')){
      selectedVerdict=b.dataset.verdict;
      $$('.verdict-tabs [data-verdict]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.verdict===selectedVerdict)));
      $('#verdict-sheet').innerHTML=renderVerdict();
      $('#verdict-sheet').classList.remove('is-stamped');requestAnimationFrame(()=>$('#verdict-sheet')?.classList.add('is-stamped'));
    }
    else if(b.hasAttribute('data-compare'))showCompare();
    else if(b.hasAttribute('data-open-message')){
      const i=Number(b.dataset.openMessage);
      if((mailbox.messages||[])[i])animateEnvelope($('#mail-envelope'),b,()=>showMessage(i));
    }
    else if(b.hasAttribute('data-open-letter')){
      const i=Number(b.dataset.openLetter);
      if((letters.items||[])[i])animateEnvelope(b,b,()=>showLetter(i));
    }
  });
  $('#viewer-close').addEventListener('click',closeViewer);
  view.addEventListener('click',e=>{if(e.target.closest('[data-close-viewer]'))closeViewer();});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeViewer();return;}
    if(!entered||!view.hidden||e.target.closest('input,textarea'))return;
    if(['ArrowDown','ArrowRight','PageDown'].includes(e.key)){e.preventDefault();go(index+1);}
    if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(index-1);}
  });
  let wheelLock=0;
  exhibition.addEventListener('wheel',e=>{
    if(!entered||!view.hidden||openingEnvelope)return;
    if(e.target.closest('.viewer__sheet'))return;
    if(content.scrollHeight>content.clientHeight+8 && ((e.deltaY>0 && content.scrollTop+content.clientHeight<content.scrollHeight-3)||(e.deltaY<0 && content.scrollTop>3)))return;
    if(Math.abs(e.deltaY)<12||Date.now()-wheelLock<650)return;
    e.preventDefault();wheelLock=Date.now();go(index+(e.deltaY>0?1:-1));
  },{passive:false});
  let downY=null,downX=null;
  exhibition.addEventListener('touchstart',e=>{
    downY=null;downX=null;
    if(e.touches.length!==1||e.target.closest('button,a,.journal-items'))return;
    if(content.scrollHeight>content.clientHeight+8 && content.contains(e.target))return;
    downY=e.touches[0].clientY;downX=e.touches[0].clientX;
  },{passive:true});
  exhibition.addEventListener('touchend',e=>{
    if(downY===null||!entered||!view.hidden)return;
    const dy=e.changedTouches[0].clientY-downY, dx=e.changedTouches[0].clientX-downX;
    downY=null;downX=null;
    if(Math.abs(dy)>40 && Math.abs(dy)>Math.abs(dx)*1.1)go(index+(dy<0?1:-1));
  },{passive:true});
  document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('is-paused',document.hidden);});
})();
