/* =========================================================
   책피바라 — 화면 그리기
   (내용을 바꿀 때는 이 파일이 아니라 data.js 를 수정하세요)

   화면 구조
   - #home   : 팀 소개 → 책 선택 → 전체 활동 기록 → 우리의 한 문장
   - #book1  : 1권 화면 (우주 테마) — 활동 기록, 층위 전시관
   - #book2  : 2권 화면 (서재 테마) — 활동 기록, 모의재판, 호의 우체통, 감사 편지
   ========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const isPlaceholder = (s) => /^\s*\[.*\]\s*$|\[여기에 입력\]|\[닉네임\]|\[쪽수\]|\[날짜 입력\]/.test(String(s ?? ""));

  function setText(id, text) {
    const el = $(id);
    if (!el) return;
    el.textContent = text ?? "";
    el.classList.toggle("placeholder", isPlaceholder(text));
  }
  const t = (s, cls = "") => `<span class="${cls} ${isPlaceholder(s) ? "placeholder" : ""}">${esc(s)}</span>`;

  /* 사진 (없으면 자리표시 상자) */
  function photo(src, alt = "", caption = "") {
    if (!src) return emptyPhoto("");
    return `
      <figure class="photo" data-full="${esc(src)}" data-caption="${esc(caption || alt)}">
        <img src="${esc(src)}" alt="${esc(alt)}"
             onerror="this.parentNode.outerHTML = window.__emptyPhoto(this.getAttribute('src'))">
      </figure>`;
  }
  function emptyPhoto(src) {
    return `<div class="photo photo--empty"><span class="photo__icon">🖼</span><span>사진을 넣어 주세요</span>${src ? `<code>${esc(src)}</code>` : ""}</div>`;
  }
  window.__emptyPhoto = emptyPhoto;

  const BOOK_NAME = { book1: "1권", book2: "2권", both: "공통" };

  /* ---- 타임라인 (filter: "book1" | "book2" | null=전체) ---- */
  function timelineHTML(filter) {
    const items = DATA.timeline.filter((it) => !filter || it.book === filter || it.book === "both");
    return items.map((item) => {
      const photos = (item.photos || []).filter(Boolean);
      const badge = !filter && item.book ? `<span class="tl-badge tl-badge--${esc(item.book)}">${BOOK_NAME[item.book] || ""}</span>` : "";
      return `
        <li class="tl-item tl-item--${esc(item.book || "none")} reveal">
          <p class="tl-date">${t(item.date)}</p>
          <h3 class="tl-title">${esc(item.title)}${badge}</h3>
          <p class="tl-summary">${t(item.summary)}</p>
          ${photos.length ? `<div class="tl-photos ${photos.length === 1 ? "one" : ""}">${photos.map((p) => photo(p, item.title)).join("")}</div>` : ""}
        </li>`;
    }).join("");
  }

  /* ---- 홈 ---- */
  function renderHome() {
    const s = DATA.site;
    setText("home-subtitle", s.subtitle);
    setText("home-team", s.team);
    setText("home-theme", s.theme);
    setText("home-period", s.period);
    setText("home-intro", s.intro);

    $("home-books").innerHTML = DATA.books.map((b, i) => `
      <a class="pick pick--${esc(b.id)}" style="--pick-bg:url('${esc(b.backgrounds?.cover || '')}')" href="${b.id === "book1" ? "book1.html" : "book2.html"}">
        ${b.id === "book1" ? '<div class="sky" aria-hidden="true"></div>' : ""}
        <div class="pick__display"><img class="pick__cover" src="${esc(b.cover)}" alt="${esc(b.title)} 실제 책 표지" onerror="this.hidden=true"></div>
        <span class="pick__label">${i === 0 ? "첫 번째 책" : "두 번째 책"}</span>
        <h2 class="pick__title">${esc(b.title)}</h2>
        <p class="pick__author">${esc(b.author)}</p>
        <p class="pick__tag">${esc(b.tag)}</p>
        <span class="pick__cta">${b.id === "book1" ? "밤하늘로 들어가기" : "서재로 들어가기"}</span>
      </a>`).join("");

    const f = DATA.footsteps;
    setText('path-portal-label', f.eyebrow);
    setText('path-portal-title', f.title);
    setText('path-portal-description', f.ctaDetail);
    setText('path-portal-button', f.cta);
  }

  /* ---- 1권 ---- */
  function renderBook1() {
    const b = DATA.books[0];
    setText("b1-title", b.title);
    setText("b1-author", b.author);
    setText("b1-tag", b.tag);
    setText("b1-summary", b.summary);
    $("b1-timeline-list").innerHTML = timelineHTML("book1");
    $("b1-next").textContent = `『${DATA.books[1].title}』 →`;

    const g = DATA.gallery;
    setText("gallery-title", g.title);
    setText("gallery-intro", g.intro);
    $("gallery-panels").innerHTML = g.panels.map((p, i) => `
      <article class="layer reveal" data-index="0${i + 1}">
        <div class="layer__head">
          <h3 class="layer__name"><span class="layer__icon">${esc(p.icon || "")}</span>${esc(p.layer)}</h3>
          <span class="layer__owner">${t(p.owner)}</span>
        </div>
        <blockquote class="layer__quote">
          ${t(p.quote)}
          <cite>${esc(b.title)}, ${t(p.page)}</cite>
        </blockquote>
        ${photo(p.photo, p.layer + " 전시", p.photoCaption)}
        ${p.photoCaption ? `<p class="layer__caption">${t(p.photoCaption)}</p>` : ""}
        <div>
          <p class="layer__essay-label">이 층위에서 나는 무엇인가</p>
          <p class="layer__essay">${t(p.essay)}</p>
        </div>
      </article>`).join("");
  }

  /* ---- 2권 ---- */
  function renderBook2() {
    const b = DATA.books[1];
    setText("b2-title", b.title);
    setText("b2-author", b.author);
    setText("b2-tag", b.tag);
    setText("b2-summary", b.summary);
    $("b2-timeline-list").innerHTML = timelineHTML("book2");

    // 모의재판
    const tr = DATA.trial;
    setText("trial-title", tr.title);
    $("trial-body").innerHTML = `
      <article class="trial__case reveal">
        <p class="trial__label">사건 개요</p>
        <h3>${t(tr.caseTitle)}</h3>
        <p class="trial__source">${t(tr.caseSource)}</p>
        <p class="trial__overview">${t(tr.overview)}</p>
      </article>
      <div class="reveal">
        <p class="trial__label" style="text-align:center;margin-bottom:12px">역할 분담</p>
        <div class="trial__roles">
          ${tr.roles.map((r) => `<div class="role"><p class="role__name">${esc(r.role)}</p><p class="role__nick">${t(r.nickname)}</p></div>`).join("")}
        </div>
      </div>
      <div class="verdicts reveal">
        <article class="verdict verdict--ours">
          <p class="verdict__label">${esc(tr.ourVerdict.label)}</p>
          <p class="verdict__result">${t(tr.ourVerdict.result)}</p>
          <p class="verdict__reason">${t(tr.ourVerdict.reasoning)}</p>
        </article>
        <div class="verdicts__vs">vs</div>
        <article class="verdict verdict--author">
          <p class="verdict__label">${esc(tr.authorVerdict.label)}</p>
          <p class="verdict__result">${t(tr.authorVerdict.result)}</p>
          <p class="verdict__reason">${t(tr.authorVerdict.reasoning)}</p>
        </article>
      </div>
      ${tr.reflection ? `<div class="trial__reflection reveal"><p class="trial__label">비교하며 느낀 점</p><p>${t(tr.reflection)}</p></div>` : ""}
    `;

    // 호의 우체통
    const m = DATA.mailbox;
    setText("mailbox-title", m.title);
    setText("mailbox-intro", m.intro);
    setText("mailbox-button-text", m.buttonText);
    const btn = $("mailbox-button");
    if (m.formUrl && /^https?:\/\//.test(m.formUrl)) {
      btn.href = m.formUrl;
    } else {
      btn.href = "#book2"; btn.classList.add("is-disabled");
      btn.title = "data.js 의 formUrl 에 구글 폼 링크를 넣어 주세요";
    }
    const tilts = ["-1.2deg", "0.8deg", "-0.5deg", "1.1deg", "0.3deg", "-0.9deg"];
    const msgs = (m.messages || []).filter((x) => x && x.text);
    $("mailbox-messages").innerHTML = msgs.length
      ? msgs.map((x, i) => `
          <article class="mail reveal" style="--tilt:${tilts[i % tilts.length]}">
            <p class="mail__to">To. ${t(x.to)}</p>
            <p class="mail__text">${t(x.text)}</p>
            <div class="mail__meta"><span>From. ${t(x.from)}</span><span>${esc(x.date || "")}</span></div>
          </article>`).join("")
      : `<p class="mail-empty">아직 받은 메시지가 없습니다. 첫 메시지를 남겨 주세요.</p>`;

    // 감사 편지
    const L = DATA.letters;
    setText("letters-title", L.title);
    setText("letters-intro", L.intro);
    $("letters-list").innerHTML = L.items.map((x) => `
      <article class="letter reveal">
        <p class="letter__to">${esc(x.to)}</p>
        <p class="letter__body">${t(x.body)}</p>
        <p class="letter__from">— ${t(x.writer)}</p>
      </article>`).join("");
  }

  function renderFooter() {
    setText("footer-notice", DATA.footer.notice);
    setText("footer-credit", DATA.footer.credit);
  }

  /* ---- 상단 메뉴 (화면마다 다름) ---- */
  const NAV = {
    home: {
      brand: () => DATA.site.team,
      links: [
        { href: "book1.html", label: "1권 · 하늘과 바람과 별과 인간" },
        { href: "book2.html", label: "2권 · 호의에 대하여" },
        { href: "footsteps.html", label: "우리의 발자취" }
      ]
    },
    book1: {
      brand: () => `${DATA.site.team} <small>『${esc(DATA.books[0].title)}』</small>`,
      links: [
        { scroll: "b1-timeline", label: "활동 기록" },
        { scroll: "b1-gallery", label: "층위 전시관" },
        { href: "#book2", label: "2권으로 →" },
        { href: "#home", label: "홈", home: true }
      ]
    },
    book2: {
      brand: () => `${DATA.site.team} <small>『${esc(DATA.books[1].title)}』</small>`,
      links: [
        { scroll: "b2-timeline", label: "활동 기록" },
        { scroll: "b2-trial", label: "모의재판" },
        { scroll: "b2-mailbox", label: "호의 우체통" },
        { scroll: "b2-letters", label: "감사 편지" },
        { href: "book1.html", label: "← 1권으로" },
        { href: "#home", label: "홈", home: true }
      ]
    }
  };

  function renderNav(view) {
    const cfg = NAV[view];
    const nav = $("nav");
    nav.className = `nav nav--${view}`;
    $("nav-brand").innerHTML = cfg.brand();
    $("nav-links").innerHTML = cfg.links.map((l) =>
      l.scroll
        ? `<button data-scroll="${l.scroll}">${esc(l.label)}</button>`
        : `<a href="${l.href}" class="${l.home ? "nav__home" : ""}">${esc(l.label)}</a>`
    ).join("");
    closeMenu();
  }

  function closeMenu() {
    $("nav-links").classList.remove("is-open");
    $("nav-toggle").setAttribute("aria-expanded", "false");
  }

  /* ---- 화면 전환 (주소의 #home / #book1 / #book2) ---- */
  const VIEWS = ["home", "book1", "book2"];
  let current = null;

  function route() {
    const hash = (location.hash || "#home").slice(1);
    let view = VIEWS.includes(hash) ? hash : null;
    let scrollTo = null;
    if (!view) {
      // #home-conclusion 처럼 특정 위치로 가는 주소
      const target = document.getElementById(hash);
      if (target) {
        const parent = target.closest(".view");
        view = parent ? parent.id.replace("view-", "") : "home";
        scrollTo = target;
      } else {
        view = "home";
      }
    }

    if (view !== current) {
      VIEWS.forEach((v) => { $("view-" + v).hidden = v !== view; });
      current = view;
      document.documentElement.classList.toggle('home-snap', view === 'home');
      document.body.dataset.view = view;
      const footer = document.querySelector('.footer');
      if (footer) {
        if (view === 'home') $('home-footsteps').append(footer);
        else document.body.insertBefore(footer, $('lightbox'));
      }
      renderNav(view);
      document.title = view === "home"
        ? `${DATA.site.team} — ${DATA.site.theme.split("—")[0].trim()}`
        : `${DATA.books[view === "book1" ? 0 : 1].title} — ${DATA.site.team}`;
      setupReveal();
    }
    if (scrollTo) {
      requestAnimationFrame(() => scrollTo.scrollIntoView({ behavior: "smooth", block: "start" }));
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  /* ---- 공통 동작 ---- */
  function setupInteractions() {
    $("nav-toggle").addEventListener("click", () => {
      const links = $("nav-links");
      const open = links.classList.toggle("is-open");
      $("nav-toggle").setAttribute("aria-expanded", String(open));
    });

    // 화면 안에서 특정 섹션으로 이동하는 버튼
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-scroll]");
      if (!btn) return;
      const el = document.getElementById(btn.dataset.scroll);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      closeMenu();
    });

    // 사진 크게 보기
    const box = $("lightbox"), img = $("lightbox-img"), cap = $("lightbox-caption");
    document.addEventListener("click", (e) => {
      const fig = e.target.closest(".photo:not(.photo--empty)");
      if (!fig) return;
      img.src = fig.dataset.full; img.alt = fig.dataset.caption || "";
      cap.textContent = fig.dataset.caption || "";
      box.hidden = false; document.body.style.overflow = "hidden";
    });
    const close = () => { box.hidden = true; img.src = ""; document.body.style.overflow = ""; };
    $("lightbox-close").addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });

    window.addEventListener("hashchange", route);
  }

  /* ---- 스크롤 등장 효과 ---- */
  let io = null;
  function setupReveal() {
    const els = document.querySelectorAll(".view:not([hidden]) .reveal:not(.is-visible)");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-visible")); return; }
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
      }, { threshold: 0.1 });
    }
    els.forEach((el) => io.observe(el));
  }

  /* 홈에서 한 번의 휠/짧은 스와이프로 다음 전체 화면에 정렬. */
  function setupHomeSnap() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canMove = () => current === 'home' && !$('nav-links').classList.contains('is-open') && $('lightbox').hidden;
    const interactive = target => target instanceof Element && !!target.closest('button, input, textarea, select, .nav');
    const sections = () => Array.from(document.querySelectorAll('#view-home > .home-scene'));
    let locked = false, timer = 0, touch = null;
    function go(direction) {
      if (!canMove() || locked) return;
      const list = sections();
      const nearest = list.reduce((a,b)=>Math.abs(a.getBoundingClientRect().top)<Math.abs(b.getBoundingClientRect().top)?a:b);
      const next = list[list.indexOf(nearest)+direction];
      if (!next) return;
      locked = true;
      next.scrollIntoView({behavior:reduce?'instant':'smooth',block:'start'});
      clearTimeout(timer); timer=setTimeout(()=>locked=false,reduce?80:720);
    }
    window.addEventListener('wheel',e=>{
      if(!canMove() || interactive(e.target) || Math.abs(e.deltaY)<9 || Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;
      const section=sections().find(s=>s.getBoundingClientRect().top<=15&&s.getBoundingClientRect().bottom>15);
      // 작은 화면/확대 설정에서 내용이 화면보다 길 경우 실제 세로 스크롤을 허용.
      if(section && section.offsetHeight>innerHeight+50){const r=section.getBoundingClientRect();if((e.deltaY>0&&r.bottom>innerHeight+10)||(e.deltaY<0&&r.top<-10))return;}
      e.preventDefault();go(e.deltaY>0?1:-1);
    },{passive:false});
    window.addEventListener('touchstart',e=>{
      if(!canMove()||interactive(e.target)||e.touches.length!==1){touch=null;return;}
      const section=sections().find(s=>s.getBoundingClientRect().top<=15&&s.getBoundingClientRect().bottom>15);
      if(section&&section.offsetHeight>innerHeight+50){touch=null;return;}
      touch={x:e.touches[0].clientX,y:e.touches[0].clientY};
    },{passive:true});
    window.addEventListener('touchmove',e=>{if(!touch||e.touches.length!==1)return;const dx=e.touches[0].clientX-touch.x,dy=e.touches[0].clientY-touch.y;if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)*1.15&&e.cancelable)e.preventDefault();},{passive:false});
    window.addEventListener('touchend',e=>{if(!touch||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;if(Math.abs(dy)>=32&&Math.abs(dy)>Math.abs(dx)*1.15)go(dy<0?1:-1);},{passive:true});
    window.addEventListener('touchcancel',()=>touch=null,{passive:true});
  }

  /* ---- 시작 ---- */
  document.addEventListener("DOMContentLoaded", () => {
    renderHome();
    renderBook1();
    renderBook2();
    renderFooter();
    setupInteractions();
    route();
    setupHomeSnap();
  });
})();
