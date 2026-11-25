/* =========================================================
   1권 화면 — 그리기 + 장면 전환
   (내용을 바꿀 때는 이 파일이 아니라 data.js 를 수정하세요)
   ========================================================= */

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const isPh = (s) => /^\s*\[.*\]\s*$|\[여기에 입력\]|\[닉네임\]|\[쪽수\]|\[날짜 입력\]/.test(String(s ?? ""));
  const t = (s, cls = "") => `<span class="${cls} ${isPh(s) ? "placeholder" : ""}">${esc(s)}</span>`;
  function setText(id, s) { const el = $(id); if (!el) return; el.textContent = s ?? ""; el.classList.toggle("placeholder", isPh(s)); }

  const BOOK = DATA.books[0];
  const G = DATA.gallery;
  const COLORS = { atom: "var(--c-atom)", life: "var(--c-life)", human: "var(--c-human)", universe: "var(--c-universe)" };

  /* 사진 (없으면 자리표시) */
  function frame(src, alt, caption, extra = "") {
    if (!src) return emptyFrame("");
    return `<figure class="frame ${extra}" data-full="${esc(src)}" data-caption="${esc(caption || alt || "")}">
      <img src="${esc(src)}" alt="${esc(alt || "")}" onerror="this.parentNode.outerHTML = window.__emptyFrame(this.getAttribute('src'))"></figure>`;
  }
  function emptyFrame(src) {
    return `<div class="frame frame--empty"><span class="ic">🖼</span><span>사진을 넣어 주세요</span>${src ? `<code>${esc(src)}</code>` : ""}</div>`;
  }
  window.__emptyFrame = emptyFrame;

  /* ---------- 0. 표지 ---------- */
  function renderCover() {
    setText("top-title", BOOK.title);
    setText("cover-title", BOOK.title);
    setText("cover-author", BOOK.author + (BOOK.publisher && !isPh(BOOK.publisher) ? ` · ${BOOK.publisher}` : ""));
    setText("cover-tag", BOOK.tag);
    setText("cover-summary", BOOK.summary);
    document.title = `${BOOK.title} — ${DATA.site.team}`;

    const bookEl = $("cover-book");
    if (BOOK.cover) {
      bookEl.innerHTML = `<div class="book3d"><img src="${esc(BOOK.cover)}" alt="${esc(BOOK.title)} 표지"
        onerror="this.parentNode.outerHTML = window.__emptyBook()"></div>`;
    } else {
      bookEl.innerHTML = emptyBook();
    }

    applyLayout(BOOK.coverLayout === "center" ? "center" : "side");
    if (BOOK.showLayoutToggle) {
      const btn = $("layout-toggle");
      btn.hidden = false;
      btn.addEventListener("click", () => {
        const now = $("cover").classList.contains("cover--center") ? "side" : "center";
        applyLayout(now);
      });
    }
  }
  function emptyBook() {
    return `<div class="book3d book3d--empty">
      <div><div class="t">${esc(BOOK.title)}</div><div class="a">${esc(BOOK.author)}</div></div>
      <div class="hint">표지 사진을 넣어 주세요<code>${esc(BOOK.cover || "images/cover-book1.jpg")}</code></div>
    </div>`;
  }
  window.__emptyBook = emptyBook;
  function applyLayout(mode) {
    $("cover").classList.toggle("cover--center", mode === "center");
    const btn = $("layout-toggle");
    if (btn) btn.textContent = mode === "center" ? "배치 바꾸기 (지금: 가운데)" : "배치 바꾸기 (지금: 오른쪽 표지)";
  }

  /* ---------- 1. 목차 ---------- */
  function renderContents() {
    setText("contents-title", G.title);
    setText("contents-intro", G.intro);
    const map = $("layer-map");
    if (map && BOOK.backgrounds?.contents) map.style.setProperty("--layer-map-bg", `url("${String(BOOK.backgrounds.contents).replaceAll('"','%22')}")`);
    $("contents-list").innerHTML = G.panels.map((p, i) => `
      <li><button data-go="s-${esc(p.key)}" style="--lc:${COLORS[p.key] || "var(--gold)"}">
        <span class="no">0${i + 1}</span>
        <span class="ico">${esc(p.icon || "")}</span>
        <span class="nm">${esc(p.layer)}</span>
        <span class="ow">${t(p.owner)}</span>
      </button></li>`).join("");
  }

  /* ---------- 2~5. 층위 장면 ---------- */
  function renderLayers() {
    $("layer-scenes").innerHTML = G.panels.map((p, i) => `
      <section class="scene scene--layer" id="s-${esc(p.key)}" data-key="${esc(p.key)}" data-label="${esc(p.layer)}" style="--lc:${COLORS[p.key] || "var(--gold)"}">
        <div class="layer ${i % 2 === 1 ? "layer--flip" : ""}">
          <div class="layer__text">
            <p class="fx layer__no">층위 0${i + 1} / 04</p>
            <h2 class="fx layer__name"><span class="ico">${esc(p.icon || "")}</span>${esc(p.layer)}</h2>
            <span class="fx layer__owner">담당 · ${t(p.owner)}</span>
            <blockquote class="fx layer__quote">${t(p.quote)}<cite>${esc(BOOK.title)}, ${t(p.page)}</cite></blockquote>
            <div class="fx">
              <p class="layer__essay-label">이 층위에서 나는 무엇인가</p>
              <p class="layer__essay">${t(p.essay)}</p>
            </div>
          </div>
          <div class="layer__photo fx">
            ${frame(p.photo, p.layer + " 전시", p.photoCaption)}
            ${p.photoCaption ? `<p class="layer__caption">${t(p.photoCaption)}</p>` : ""}
          </div>
        </div>
      </section>`).join("");
  }

  /* ---------- 6. 하나로 ---------- */
  function renderConverge() {
    setText("bridge-label", DATA.uiV6.bridgeLabel);
    setText("interlude-question", DATA.site.theme);
    const c = G.conclusion || {};
    setText("conv-label", c.label || "토의로 모인 생각");
    setText("conv-title", c.title);
    setText("conv-text", c.text);
    setText("conv-by", c.by || DATA.site.team);
  }

  /* ---------- 7. 활동 기록 ---------- */
  function renderTimeline() {
    const items = DATA.timeline.filter((it) => it.book === "book1" || it.book === "both");
    $("timeline-list").innerHTML = items.map((item,i) => {
      const photos = (item.photos || []).filter(Boolean);
      const summary = String(item.summary || "");
      const longSummary = summary.length > 110;
      const preview = longSummary ? summary.slice(0,108).trimEnd() + "…" : summary;
      return `<li class="tl-item">
        <p class="tl-date">${t(item.date)}</p>
        <h3 class="tl-title">${esc(item.title)}</h3>
        <p class="tl-summary">${t(preview)}</p>
        ${longSummary ? `<button class="tl-readmore" type="button" data-activity-detail="${i}">전체 기록 읽기 ↗</button>` : ""}
        ${photos.length ? `<div class="tl-photos ${photos.length === 1 ? "one" : ""}">${photos.map((p) => frame(p, item.title)).join("")}</div>` : ""}
      </li>`;
    }).join("");
  }

  /* ---------- 결과보고서의 두 토의 질문 자세히 보기 ---------- */
  function renderDiscussion() {
    const actions = $("discussion-actions"), viewer = $("notes-viewer"), body = $("notes-body");
    if (!actions || !viewer || !body || !Array.isArray(DATA.discussions)) return;
    actions.innerHTML = DATA.discussions.map((d,i) => `<button type="button" data-discussion="${i}">토의 ${i+1} · ${esc(d.title)}</button>`).join("");
    const close = () => { viewer.hidden = true; document.body.classList.remove("reading-notes"); };
    actions.addEventListener("click", (e) => {
      const b=e.target.closest('[data-discussion]'); if(!b)return;
      const d=DATA.discussions[Number(b.dataset.discussion)]; if(!d)return;
      body.innerHTML=`<p class="eyebrow">${esc(d.date)} · 실제 독서토의 기록</p><h3>${esc(d.title)}</h3><ul>${d.ideas.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p><strong>종합 의견</strong><br>${esc(d.conclusion)}</p>`;
      viewer.hidden=false;document.body.classList.add("reading-notes");$("notes-close").focus({preventScroll:true});
    });
    $("timeline-list").addEventListener('click',(e)=>{
      const b=e.target.closest('[data-activity-detail]'); if(!b)return;
      const item=DATA.timeline.filter(it=>it.book==="book1"||it.book==="both")[Number(b.dataset.activityDetail)]; if(!item)return;
      body.innerHTML=`<p class="eyebrow">${esc(item.date)} · 활동 기록</p><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p>`;
      viewer.hidden=false;document.body.classList.add("reading-notes");$("notes-close").focus({preventScroll:true});
    });
    $("notes-close").addEventListener('click',close);
    viewer.addEventListener('click',(e)=>{if(e.target===viewer)close();});
    document.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&!viewer.hidden)close();});
  }

  /* ---------- 8. 다음 ---------- */
  function renderNext() {
    $("next-link").textContent = DATA.books[1].title;
    setText("footer-notice", DATA.footer.notice);
  }

  /* ---------- 장면 전환 (스크롤에 따라 배경이 변함) ---------- */
  function setupScenes() {
    const scenes = Array.from(document.querySelectorAll(".scene"));
    const dots = $("dots");
    dots.innerHTML = scenes.map((s) => {
      const col = COLORS[s.dataset.key];
      return `<button data-go="${s.id}" data-label="${esc(s.dataset.label)}" aria-label="${esc(s.dataset.label)}" ${col ? `data-color style="--dc:${col}"` : ""}></button>`;
    }).join("");
    const dotBtns = Array.from(dots.children);
    const jump = $("book1-jump");
    if (jump) {
      jump.innerHTML = scenes.map((scene) => `<option value="${esc(scene.id)}">${esc(scene.dataset.label)}</option>`).join("");
      jump.addEventListener("change", () => {
        const target = document.getElementById(jump.value);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    const LAYER_ORDER = ["atom", "life", "human", "universe"];
    let explosionTimers = [];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clearExplosion = () => { explosionTimers.forEach(clearTimeout); explosionTimers = []; };
    function playBigBang() {
      clearExplosion();
      document.body.classList.remove("is-merged", "is-bang", "is-resolved", "is-connected");
      LAYER_ORDER.forEach((k) => {
        document.querySelector(".light--" + k)?.classList.remove("is-pocket", "is-born");
        dots.querySelector(`[data-go="s-${k}"]`)?.classList.remove("is-lit");
      });
      if (window.__clearBurst) window.__clearBurst();
      void document.body.offsetWidth;
      document.body.classList.add("is-connected");
      if (reduce) {
        document.body.classList.add("is-bang", "is-resolved");
        return;
      }
      // 네 색은 충돌 직전까지 각각의 색을 유지합니다.
      explosionTimers.push(setTimeout(() => {
        if (document.body.dataset.scene !== "converge") return;
        document.body.classList.add("is-bang");
        if (window.__spawnBurst) window.__spawnBurst(0.5, 0.29);
      }, 2950));
      explosionTimers.push(setTimeout(() => {
        if (document.body.dataset.scene === "converge") document.body.classList.add("is-resolved");
      }, 3630));
    }
    $("bang-replay")?.addEventListener("click", playBigBang);
    const prevBtn = $("scene-prev"), nextBtn = $("scene-next"), position = $("scene-position");
    const goBy = (delta) => {
      const i = scenes.findIndex((s) => s.classList.contains("is-active"));
      scenes[i + delta]?.scrollIntoView({behavior: reduce ? "instant" : "smooth", block: "start"});
    };
    prevBtn?.addEventListener("click", () => goBy(-1));
    nextBtn?.addEventListener("click", () => goBy(1));

    /* v11 — 한 번의 휠/짧은 스와이프 = 다음/이전 전시 장면.
       native CSS scroll snap만으로는 짧은 휠 입력이 현재 장면에 되돌아갈 수 있어
       사용자의 명시적 스크롤 의도를 한 장면 이동으로 해석합니다.
       타임라인은 가로 트랙만 이동하며, 열린 기록 모달의 스크롤은 유지합니다. */
    const interactiveScroll = (target) => target instanceof Element && Boolean(target.closest(
      '.timeline, .tl-item, .notes-viewer, .lightbox, select, details, textarea, input'
    ));
    let wheelInGesture = false, wheelGestureTimer = 0;
    document.addEventListener('wheel', (event) => {
      const strip = event.target instanceof Element && event.target.closest('.timeline');
      if (strip && !document.body.classList.contains('reading-notes')) {
        if (Math.abs(event.deltaY)>Math.abs(event.deltaX) && !event.ctrlKey && strip.scrollWidth>strip.clientWidth+2) {
          event.preventDefault();
          strip.scrollLeft += event.deltaY * (event.deltaMode===1?16:event.deltaMode===2?strip.clientWidth:1);
        }
        return;
      }
      if (interactiveScroll(event.target) || document.body.classList.contains('reading-notes')) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || Math.abs(event.deltaY) < 9) return;
      event.preventDefault();
      window.clearTimeout(wheelGestureTimer);
      wheelGestureTimer = window.setTimeout(() => { wheelInGesture = false; }, 210);
      if (wheelInGesture) return;
      wheelInGesture = true;
      goBy(event.deltaY > 0 ? 1 : -1);
    }, { passive:false });
    let touchOrigin = null;
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length !== 1 || interactiveScroll(event.target) || document.body.classList.contains('reading-notes')) {
        touchOrigin = null; return;
      }
      touchOrigin = {x:event.touches[0].clientX, y:event.touches[0].clientY};
    }, {passive:true});
    document.addEventListener('touchmove', (event) => {
      if (!touchOrigin || event.touches.length !== 1) return;
      const dx = event.touches[0].clientX-touchOrigin.x;
      const dy = event.touches[0].clientY-touchOrigin.y;
      if (Math.abs(dy) > 9 && Math.abs(dy) > Math.abs(dx)*1.15) event.preventDefault();
    }, {passive:false});
    document.addEventListener('touchend', (event) => {
      if (!touchOrigin || !event.changedTouches.length) return;
      const dx = event.changedTouches[0].clientX-touchOrigin.x;
      const dy = event.changedTouches[0].clientY-touchOrigin.y;
      touchOrigin = null;
      if (Math.abs(dy) >= 34 && Math.abs(dy) > Math.abs(dx)*1.15) goBy(dy < 0 ? 1 : -1);
    }, {passive:true});
    document.addEventListener('touchcancel', () => { touchOrigin=null; }, {passive:true});
    // 각 층위의 점 위치를 재서 빛이 그 위에 앉게 함
    function measureDots() {
      LAYER_ORDER.forEach((k) => {
        const dot = dots.querySelector(`[data-go="s-${k}"]`);
        const el = document.querySelector(".light--" + k);
        if (!dot || !el) return;
        const r = dot.getBoundingClientRect();
        el.style.setProperty("--px", (r.left + r.width / 2) + "px");
        el.style.setProperty("--py", (r.top + r.height / 2) + "px");
      });
    }
    window.addEventListener("resize", measureDots);
    const activate = (scene) => {
      const key = scene.dataset.key;
      const prev = document.body.dataset.scene;
      document.body.dataset.scene = key;
      scenes.forEach((s) => s.classList.toggle("is-active", s === scene));
      dotBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.go === scene.id));
      if (jump) jump.value = scene.id;
      const sceneIndex = scenes.indexOf(scene);
      if (position) position.textContent = `${String(sceneIndex + 1).padStart(2,"0")} / ${String(scenes.length).padStart(2,"0")} · ${scene.dataset.label}`;
      if (prevBtn) prevBtn.disabled = sceneIndex === 0;
      if (nextBtn) nextBtn.disabled = sceneIndex === scenes.length - 1;
      showBackground(key);

      // 이전 장면의 빛은 오른쪽 진행 표시 옆에 남기되,
      // 결론에서는 서로 겹쳐 한 덩어리가 되지 않고 별자리로 연결됩니다.
      const idx = LAYER_ORDER.indexOf(key);
      measureDots();
      LAYER_ORDER.forEach((k, i) => {
        const el = document.querySelector(".light--" + k);
        const dot = dots.querySelector(`[data-go="s-${k}"]`);
        const docked = idx >= 0 && i < idx;
        el.classList.toggle("is-born", i === idx);
        el.classList.toggle("is-pocket", docked);
        if (dot) dot.classList.toggle("is-lit", docked);
      });
      clearExplosion();
      document.body.classList.remove("is-merged", "is-bang", "is-connected", "is-resolved");
      if (key === "converge") playBigBang();
    };

    // 장면 판정: 화면 세로 40% 지점이 어느 장면 안에 있는지 (브라우저에 상관없이 일관됨)
    let activeScene = null, ticking = false;
    function pickScene() {
      ticking = false;
      const y = window.scrollY + window.innerHeight * 0.4;
      let cur = scenes[0];
      for (const s of scenes) { if (s.getBoundingClientRect().top + window.scrollY <= y) cur = s; }
      if (cur !== activeScene) { activeScene = cur; activate(cur); }
    }
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(pickScene); } }, { passive: true });
    window.addEventListener("resize", pickScene);
    pickScene();

    // 이동 버튼
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-go]");
      if (!b) return;
      const el = document.getElementById(b.dataset.go);
      if (el) {
        $("layer-map")?.removeAttribute("open");
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    // 키보드 ↑↓ 로 장면 이동
    document.addEventListener("keydown", (e) => {
      if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(e.key)) return;
      const cur = scenes.findIndex((s) => s.classList.contains("is-active"));
      if (cur < 0) return;
      const nextIdx = e.key === "ArrowDown" || e.key === "PageDown" ? cur + 1 : cur - 1;
      if (scenes[nextIdx] && !scenes[cur].classList.contains("scene--long")) {
        e.preventDefault();
        scenes[nextIdx].scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  /* ---------- 장면별 배경 사진 (있을 때만) ---------- */
  const bgCache = {};   // 파일명 → true(있음) / false(없음)
  let bgCurrent = "", bgFlip = false;
  function showBackground(key) {
    const base = (BOOK.backgrounds || {})[key] || "";
    if (!base) { setBg("", key); return; }
    // 좁은 화면에서는 세로용 사진(파일명 끝에 -m)이 있으면 먼저 씀. 예: bg-b2-cover-m.jpg
    const mobile = window.innerWidth <= 820 ? base.replace(/(\.[a-z]+)$/i, "-m$1") : "";
    const tryLoad = (src, fallback) => {
      if (!src) { fallback(); return; }
      if (bgCache[src] === true) { setBg(src, key); return; }
      if (bgCache[src] === false) { fallback(); return; }
      const img = new Image();
      img.onload = () => { bgCache[src] = true; if (document.body.dataset.scene === key) setBg(src, key); };
      img.onerror = () => { bgCache[src] = false; if (document.body.dataset.scene === key) fallback(); };
      img.src = src;
    };
    tryLoad(mobile, () => tryLoad(base, () => setBg("", key)));
  }
  // 모든 배경을 미리 불러와서 장면 전환 때 늦게 뜨지 않게
  function preloadBackgrounds() {
    const narrow = window.innerWidth <= 820;
    [...new Set(Object.values(BOOK.backgrounds || {}))].forEach((src) => {
      if (!src) return;
      const cands = narrow ? [src.replace(/(\.[a-z]+)$/i, "-m$1"), src] : [src];
      cands.forEach((s) => { if (bgCache[s] !== undefined) return; const im = new Image(); im.onload = () => { bgCache[s] = true; }; im.onerror = () => { bgCache[s] = false; }; im.src = s; });
    });
  }
  // 좁은 화면에서 사진을 잘라 보일 때 어느 쪽을 남길지 (가로 % 세로 %)
  const BG_FOCUS = { cover: "50% 70%", contents: "50% 50%", atom: "82% 50%", life: "18% 50%", human: "88% 60%", universe: "22% 50%", converge: "50% 22%", timeline: "50% 100%" };
  function setBg(src, key) {
    if (src === bgCurrent) return;
    const a = $("bg-a"), b = $("bg-b");
    const next = bgFlip ? a : b, prev = bgFlip ? b : a;
    bgFlip = !bgFlip;
    document.body.style.setProperty("--dim", BOOK.backgroundDim ?? 0.45);
    if (src) {
      next.style.backgroundImage = `url("${src}")`;
      next.style.backgroundPosition = BG_FOCUS[key] || "center";
      next.classList.add("is-on"); prev.classList.remove("is-on");
      document.body.classList.add("has-bg");
    } else {
      a.classList.remove("is-on"); b.classList.remove("is-on");
      document.body.classList.remove("has-bg");
    }
    bgCurrent = src;
  }

  /* ---------- 별 (캔버스) ---------- */
  function setupStars() {
    const canvas = $("stars"), ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W, H, stars = [], shooting = null, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(W < 700 ? 90 : 240, Math.round((W * H) / 4800));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() < 0.85 ? Math.random() * 0.9 + 0.3 : Math.random() * 1.6 + 0.8,
        a: Math.random() * Math.PI * 2, s: Math.random() * 0.02 + 0.004,
        d: Math.random() * 0.5 + 0.5, // 깊이 (스크롤 시 움직이는 정도)
        warm: Math.random() < 0.25
      }));
    }

    const SCENE_SHIFT = { cover: 0, interlude: 1, contents: 2, atom: 3, life: 4, human: 5, universe: 6, converge: 7, timeline: 8, next: 9 };
    let shiftTarget = 0, shift = 0;

    // 빅뱅 입자
    let burst = [];
    const BURST_COLORS = ["143,232,255", "123,224,176", "255,181,122", "199,163,255"];
    window.__clearBurst = () => { burst = []; };
    window.__spawnBurst = (fx, fy) => {
      const cx = W * fx, cy = H * fy, n = W < 700 ? 168 : 340;
      burst = [];
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = (2.4 + Math.random() * 13) * (W < 700 ? .72 : 1), big = Math.random() < 0.2;
        burst.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: 0.006 + Math.random() * 0.012,
          r: big ? 2.2 + Math.random() * 2 : 0.8 + Math.random() * 1.4, c: BURST_COLORS[i % 4], tail: big });
      }
    };
    function drawBurst() {
      if (!burst.length) return;
      ctx.globalCompositeOperation = "lighter";
      for (const p of burst) {
        if (p.tail) {
          ctx.strokeStyle = `rgba(${p.c},${p.life * .6})`; ctx.lineWidth = p.r * .8; ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3); ctx.stroke();
        }
        ctx.fillStyle = `rgba(${p.c},${p.life})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.vy *= 0.985; p.life -= p.decay;
      }
      ctx.globalCompositeOperation = "source-over";
      burst = burst.filter((p) => p.life > 0);
    }

    let lastFrame = 0;
    function draw(now = 0) {
      if (!reduce) requestAnimationFrame(draw);
      if (document.hidden || (!reduce && now - lastFrame < 32)) return;
      lastFrame = now;
      const key = document.body.dataset.scene;
      shiftTarget = (SCENE_SHIFT[key] || 0) * 40;
      shift += (shiftTarget - shift) * 0.04;
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.a += s.s;
        const tw = reduce ? 0.8 : 0.55 + 0.45 * Math.sin(s.a);
        const y = ((s.y - shift * s.d) % H + H) % H;
        ctx.beginPath();
        ctx.fillStyle = s.warm ? `rgba(240,223,168,${tw})` : `rgba(230,236,255,${tw})`;
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // 가끔 별똥별
      if (!reduce) {
        if (!shooting && Math.random() < 0.004) {
          shooting = { x: Math.random() * W * 0.8, y: Math.random() * H * 0.4, vx: 9 + Math.random() * 5, vy: 4 + Math.random() * 3, life: 1 };
        }
        if (shooting) {
          const sh = shooting;
          const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 10, sh.y - sh.vy * 10);
          grad.addColorStop(0, `rgba(255,255,255,${sh.life})`); grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.beginPath();
          ctx.moveTo(sh.x, sh.y); ctx.lineTo(sh.x - sh.vx * 10, sh.y - sh.vy * 10); ctx.stroke();
          sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.02;
          if (sh.life <= 0 || sh.x > W || sh.y > H) shooting = null;
        }
      }
      if (key === "converge") drawBurst(); else if (burst.length) burst = [];
    }
    window.addEventListener("resize", resize);
    resize(); draw();
    if (reduce) { /* 움직임 줄이기 설정: 한 번만 그림 */ }
  }

  /* ---------- 사진 크게 보기 ---------- */
  function setupLightbox() {
    const box = $("lightbox"), img = $("lightbox-img"), cap = $("lightbox-caption");
    document.addEventListener("click", (e) => {
      const f = e.target.closest(".frame:not(.frame--empty)");
      if (!f) return;
      img.src = f.dataset.full; img.alt = f.dataset.caption || ""; cap.textContent = f.dataset.caption || "";
      box.hidden = false; document.body.style.overflow = "hidden";
    });
    const close = () => { box.hidden = true; img.src = ""; document.body.style.overflow = ""; };
    $("lightbox-close").addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderCover(); renderContents(); renderLayers(); renderConverge(); renderTimeline(); renderDiscussion(); renderNext();
    setupScenes(); setupStars(); setupLightbox();
    setTimeout(preloadBackgrounds, 300);
  });
})();
