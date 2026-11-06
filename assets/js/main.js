/* ==========================================================================
   NYPARFUM — interações e animações
   ========================================================================== */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const WA = '5567998287393';
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  let currentView = null;
  const PRODUTOS = window.NY_PRODUTOS || [];
  const COLECOES = window.NY_COLECOES || [];
  const byId = id => PRODUTOS.find(p => p.id === id);
  const brl = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const norm = s => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const waLink = msg => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;

  $('#year').textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     Divide títulos em palavras para a animação de entrada
     ------------------------------------------------------------------ */
  $$('.reveal-lines').forEach(el => {
    let i = 0;
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach(p => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const outer = document.createElement('span');
            outer.className = 'rl';
            const inner = document.createElement('span');
            inner.textContent = p;
            inner.style.transitionDelay = `${(i++ * 0.06).toFixed(2)}s`;
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
  });

  /* ------------------------------------------------------------------
     Loader
     ------------------------------------------------------------------ */
  const loader = $('#loader');
  const bar = $('#loaderBar');
  const t0 = performance.now();
  let loaded = false;
  const minTime = reduce ? 0 : 1500;
  const finishLoading = () => {
    if (loaded) return;
    loaded = true;
    bar.style.transform = 'scaleX(1)';
    const wait = Math.max(0, minTime - (performance.now() - t0));
    setTimeout(() => {
      loader.classList.add('done');
      body.classList.remove('is-loading');
      body.classList.add('ready');
      if (currentView === 'catalogo') body.classList.add('cat-shown');
      setTimeout(() => loader.remove(), 1200);
    }, wait);
  };
  let fake = 0;
  const tick = setInterval(() => {
    fake = Math.min(.9, fake + Math.random() * .18);
    bar.style.transform = `scaleX(${fake})`;
    if (loaded) clearInterval(tick);
  }, 180);
  if (document.readyState === 'complete') finishLoading();
  else window.addEventListener('load', finishLoading);
  setTimeout(finishLoading, 3500); // nunca prender o usuário

  /* ------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------ */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: .14, rootMargin: '0px 0px -6% 0px' });
  const observeReveals = (root = document) =>
    $$('.reveal, .reveal-lines, .reveal-img', root).forEach(el => { if (!el.classList.contains('in')) io.observe(el); });
  observeReveals();

  /* ------------------------------------------------------------------
     Contadores
     ------------------------------------------------------------------ */
  const fmt = (v, dec, sep) => {
    const s = v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: !!sep });
    return s;
  };
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target;
      const end = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const sep = el.dataset.sep;
      if (reduce) { el.textContent = fmt(end, dec, sep); return; }
      const dur = 2000, start = performance.now();
      const step = now => {
        const p = clamp((now - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(end * eased, dec, sep);
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = fmt(0, dec, sep);
      requestAnimationFrame(step);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ------------------------------------------------------------------
     Header, progresso, parallax, linha dos passos
     ------------------------------------------------------------------ */
  const header = $('#header');
  const progress = $('#progress');
  const parallaxEls = $$('.parallax');
  const stepsEl = $('#steps');
  const stepsLine = stepsEl && $('.steps-line', stepsEl);
  let lastY = window.scrollY;
  let menuOpen = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('scrolled', y > 30);
    if (!menuOpen && currentView !== 'catalogo') header.classList.toggle('hide', y > 400 && y > lastY + 2);
    if (currentView === 'catalogo') header.classList.remove('hide');
    if (y < lastY - 2) header.classList.remove('hide');
    lastY = y;

    if (!reduce) {
      parallaxEls.forEach(el => {
        if (!el.offsetParent) return;
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - innerHeight / 2;
        el.style.translate = `0 ${(center * parseFloat(el.dataset.speed || 0)).toFixed(1)}px`;
      });
    }
    if (stepsLine && stepsEl.offsetParent) {
      const r = stepsEl.getBoundingClientRect();
      stepsLine.style.setProperty('--p', clamp((innerHeight * .8 - r.top) / (r.height + innerHeight * .2), 0, 1).toFixed(3));
    }
  };
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     Menu mobile
     ------------------------------------------------------------------ */
  const burger = $('#burger');
  const menu = $('#menu');
  const setMenu = open => {
    menuOpen = open;
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    body.classList.toggle('lock', open);
    if (open) header.classList.remove('hide');
  };
  burger.addEventListener('click', () => setMenu(!menuOpen));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* ------------------------------------------------------------------
     Abas (Maison / Catálogo) com cortina
     ------------------------------------------------------------------ */
  const views = { home: $('#view-home'), catalogo: $('#view-catalogo') };
  const tabs = $$('.tab');
  const indicator = $('#tabIndicator');
  const curtain = $('#curtain');
  const curtainWord = $('#curtainWord');
  let busy = false;

  const moveIndicator = () => {
    const active = tabs.find(t => t.dataset.tab === currentView) || tabs[0];
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.transform = `translateX(${active.offsetLeft - 4}px)`;
  };
  window.addEventListener('resize', moveIndicator);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);

  const parseHash = () => {
    const h = decodeURIComponent(location.hash || '');
    if (h.startsWith('#catalogo')) return { view: 'catalogo', filter: h.split('/')[1] || null };
    return { view: 'home', target: h && h !== '#' ? h : null };
  };

  const showView = name => {
    Object.entries(views).forEach(([k, el]) => { el.hidden = k !== name; });
    currentView = name;
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.tab === name));
    moveIndicator();
    body.classList.toggle('cat-shown', name === 'catalogo' && body.classList.contains('ready'));
    if (name === 'home') window.dispatchEvent(new Event('resize'));
    if (name === 'catalogo') document.title = 'Catálogo | NYPARFUM — Perfumes em Corumbá - MS';
    else document.title = 'NYPARFUM | Perfumaria em Corumbá - MS | Perfumes Árabes e Originais';
  };

  const jumpTo = target => {
    const el = target && document.querySelector(target);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 8);
      window.scrollTo({ top: target === '#inicio' ? 0 : y, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    onScroll();
  };

  const route = (first = false) => {
    const r = parseHash();
    if (r.view === 'catalogo' && r.filter) setFilter(r.filter, false);
    if (r.view === 'catalogo' && !r.filter && !first && currentView !== 'catalogo') setFilter('todos', false);

    if (r.view === currentView) {
      if (r.view === 'home' && r.target && !first) {
        const el = document.querySelector(r.target);
        if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      }
      if (r.view === 'catalogo' && !r.filter && state.filter !== 'todos') setFilter('todos');
      if (r.view === 'catalogo') {
        const tb = $('#catToolbar');
        if (r.filter && window.scrollY > tb.offsetTop) window.scrollTo({ top: tb.offsetTop - header.offsetHeight, behavior: 'smooth' });
      }
      return;
    }

    if (first || reduce) {
      showView(r.view);
      if (!first) jumpTo(r.target);
      else if (r.target) requestAnimationFrame(() => jumpTo(r.target));
      return;
    }
    if (busy) return;
    busy = true;
    curtainWord.textContent = r.view === 'catalogo' ? 'Catálogo' : 'Maison';
    curtain.classList.remove('out');
    curtain.classList.add('in');
    setTimeout(() => {
      body.classList.remove('cat-shown');
      showView(r.view);
      jumpTo(r.target);
      observeReveals(views[r.view]);
      curtain.classList.remove('in');
      curtain.classList.add('out');
      setTimeout(() => { curtain.classList.remove('out'); busy = false; }, 850);
    }, 800);
  };
  window.addEventListener('hashchange', () => { setMenu(false); route(); });

  /* ------------------------------------------------------------------
     Catálogo
     ------------------------------------------------------------------ */
  const grid = $('#grid');
  const chipsEl = $('#chips');
  const searchEl = $('#search');
  const sortEl = $('#sort');
  const countEl = $('#catCount');
  const emptyEl = $('#empty');
  const state = { filter: 'todos', q: '', sort: 'destaque' };

  const bottleSVG = (p, uid) => {
    const [a, b] = p.tons || ['#c9a96e', '#2a1a0a'];
    return `<div class="bottle-art" style="--t1:${a}">
      <svg viewBox="0 0 120 200" aria-hidden="true">
        <defs>
          <linearGradient id="g${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
          <linearGradient id="c${uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a7146"/><stop offset=".5" stop-color="#f3e2bb"/><stop offset="1" stop-color="#8a7146"/></linearGradient>
          <linearGradient id="h${uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".25" stop-color="#fff" stop-opacity=".35"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>
        </defs>
        <rect x="44" y="8" width="32" height="34" rx="3" fill="url(#c${uid})"/>
        <rect x="50" y="42" width="20" height="12" fill="url(#c${uid})" opacity=".85"/>
        <path d="M22 70c0-9 7-16 16-16h44c9 0 16 7 16 16v104c0 9-7 16-16 16H38c-9 0-16-7-16-16z" fill="url(#g${uid})"/>
        <path d="M22 70c0-9 7-16 16-16h44c9 0 16 7 16 16v104c0 9-7 16-16 16H38c-9 0-16-7-16-16z" fill="url(#h${uid})"/>
        <rect x="36" y="110" width="48" height="34" rx="1" fill="rgba(10,9,8,.55)" stroke="rgba(243,226,187,.6)" stroke-width=".6"/>
        <text x="60" y="124" text-anchor="middle" font-family="Cormorant Garamond, serif" font-size="9" fill="#f3e2bb" letter-spacing="1.5">NY</text>
        <text x="60" y="136" text-anchor="middle" font-family="Jost, sans-serif" font-size="4.2" fill="#f3e2bb" letter-spacing="1.2">PARFUM</text>
      </svg></div>`;
  };
  const mediaHTML = (p, uid) => p.imagem
    ? `<img src="${p.imagem}" alt="${p.nome} — ${p.marca}" loading="lazy">`
    : bottleSVG(p, uid);
  const priceText = p => p.preco != null ? brl(p.preco) : (p.consulta ? 'Sob consulta' : 'Consulte o valor');
  const plusIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 5v14M5 12h14"/></svg>';

  const renderChips = () => {
    chipsEl.innerHTML = COLECOES.map(c => {
      const n = c.id === 'todos' ? PRODUTOS.length : PRODUTOS.filter(p => p.colecoes.includes(c.id)).length;
      return `<button class="chip${c.id === state.filter ? ' is-active' : ''}" role="tab" aria-selected="${c.id === state.filter}" data-filter="${c.id}">${c.nome}<sup>${n}</sup></button>`;
    }).join('');
  };

  const getList = () => {
    const q = norm(state.q);
    let list = PRODUTOS.filter(p =>
      (state.filter === 'todos' || p.colecoes.includes(state.filter)) &&
      (!q || norm([p.nome, p.marca, p.tipo, p.descricao, ...(p.colecoes || []),
        ...Object.values(p.notas || {}).flat()].join(' ')).includes(q)));
    const rank = p => (p.consulta ? 2 : p.destaque ? 0 : 1);
    const price = (p, dir) => p.preco == null ? (dir > 0 ? Infinity : -Infinity) : p.preco;
    if (state.sort === 'destaque') list.sort((a, b) => rank(a) - rank(b));
    if (state.sort === 'az') list.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    if (state.sort === 'preco-asc') list.sort((a, b) => price(a, 1) - price(b, 1));
    if (state.sort === 'preco-desc') list.sort((a, b) => price(b, -1) - price(a, -1));
    return list;
  };

  const renderGrid = () => {
    const list = getList();
    countEl.textContent = `${list.length} ${list.length === 1 ? 'fragrância' : 'fragrâncias'}`;
    emptyEl.hidden = list.length > 0;
    grid.innerHTML = list.map((p, i) => `
      <article class="card" style="--i:${i}" data-id="${p.id}">
        <div class="card-media" data-open="${p.id}" role="button" tabindex="0" aria-label="Ver detalhes de ${p.nome}" data-cursor="Ver">
          ${p.consulta ? '<span class="card-tag">Sob consulta</span>' : p.destaque ? '<span class="card-tag">Destaque</span>' : ''}
          ${mediaHTML(p, 'c' + i)}
          <span class="shine"></span>
          <div class="card-quick">
            <button type="button" data-open="${p.id}">Detalhes</button>
            <button type="button" class="add" data-add="${p.id}">${p.consulta ? 'Consultar' : 'Adicionar'}</button>
          </div>
        </div>
        <div class="card-body">
          <span class="card-brand">${p.marca}</span>
          <h3 class="card-name">${p.nome}</h3>
          <span class="card-meta">${p.tipo} · ${p.volume}</span>
          <div class="card-price"><span>${priceText(p)}</span>
            <button type="button" class="add-mini" data-add="${p.id}" aria-label="Adicionar ${p.nome} à sacola">${plusIcon}</button>
          </div>
        </div>
      </article>`).join('');
    if (finePointer && !reduce) $$('.card-media', grid).forEach(attachTilt);
  };

  function setFilter(f, scroll = true) {
    if (!COLECOES.some(c => c.id === f)) f = 'todos';
    state.filter = f;
    renderChips();
    renderGrid();
    const active = $('.chip.is-active', chipsEl);
    if (active && scroll) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }

  chipsEl.addEventListener('click', e => {
    const c = e.target.closest('[data-filter]');
    if (!c) return;
    const f = c.dataset.filter;
    history.replaceState(null, '', f === 'todos' ? '#catalogo' : `#catalogo/${f}`);
    setFilter(f);
  });
  let searchT;
  searchEl.addEventListener('input', () => {
    clearTimeout(searchT);
    searchT = setTimeout(() => { state.q = searchEl.value; renderGrid(); }, 160);
  });
  sortEl.addEventListener('change', () => { state.sort = sortEl.value; renderGrid(); });

  grid.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { e.stopPropagation(); addToBag(add.dataset.add, add); return; }
    const open = e.target.closest('[data-open]');
    if (open) openModal(open.dataset.open, open);
  });
  grid.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.card-media')) {
      e.preventDefault(); openModal(e.target.dataset.open, e.target);
    }
  });

  renderChips();
  renderGrid();

  /* ------------------------------------------------------------------
     Modal de produto
     ------------------------------------------------------------------ */
  const modal = $('#modal');
  let lastFocus = null;
  let modalId = null;

  function openModal(id, from) {
    const p = byId(id);
    if (!p) return;
    modalId = id;
    lastFocus = from || document.activeElement;
    $('#modalMedia').innerHTML = mediaHTML(p, 'm');
    $('#modalBrand').textContent = p.marca;
    $('#modalTitle').textContent = p.nome;
    $('#modalMeta').textContent = `${p.tipo} · ${p.volume}`;
    $('#modalDesc').textContent = p.descricao || '';
    const n = p.notas || {};
    const rows = [['Topo', n.topo], ['Coração', n.coracao], ['Fundo', n.fundo]].filter(r => r[1] && r[1].length);
    $('#modalNotes').innerHTML = rows.map(r => `<div><span>${r[0]}</span><span>${r[1].join(' · ')}</span></div>`).join('');
    $('#modalPrice').textContent = priceText(p);
    $('#modalAdd').textContent = p.consulta ? 'Adicionar à consulta' : 'Adicionar à sacola';
    $('#modalAsk').href = waLink(`Olá, NYPARFUM! Vi no site e quero saber mais sobre: ${p.nome} — ${p.marca} (${p.volume}). Está disponível?`);
    modal.hidden = false;
    body.classList.add('lock');
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('open')));
    setTimeout(() => $('.modal-close', modal).focus(), 50);
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.classList.remove('open');
    body.classList.remove('lock');
    setTimeout(() => { modal.hidden = true; }, 500);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  modal.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
  $('#modalAdd').addEventListener('click', e => { addToBag(modalId, e.currentTarget); setTimeout(closeModal, 350); });
  $$('[data-product]').forEach(el => {
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.addEventListener('click', () => openModal(el.dataset.product, el));
    el.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(el.dataset.product, el); });
  });

  /* ------------------------------------------------------------------
     Sacola
     ------------------------------------------------------------------ */
  const KEY = 'nyparfum-sacola';
  let bag = [];
  try { bag = JSON.parse(localStorage.getItem(KEY) || '[]').filter(i => byId(i.id)); } catch (e) { bag = []; }
  const saveBag = () => { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {} };
  const drawer = $('#drawer');
  const bagBtn = $('#bagBtn');
  const bagCount = $('#bagCount');

  const renderBag = () => {
    const qty = bag.reduce((s, i) => s + i.qty, 0);
    bagCount.textContent = qty;
    bagCount.classList.toggle('show', qty > 0);
    $('#bagEmpty').hidden = bag.length > 0;
    $('#bagFoot').hidden = bag.length === 0;
    $('#bagList').innerHTML = bag.map(({ id, qty: q }, i) => {
      const p = byId(id);
      return `<li class="bag-item" style="animation-delay:${i * 60}ms">
        <div class="bag-thumb">${mediaHTML(p, 'b' + i)}</div>
        <div><small>${p.marca}</small><h4>${p.nome}</h4><span class="price">${priceText(p)}</span></div>
        <div class="qty"><button type="button" data-dec="${id}" aria-label="Diminuir">−</button><span>${q}</span><button type="button" data-inc="${id}" aria-label="Aumentar">+</button></div>
      </li>`;
    }).join('');
    const priced = bag.filter(i => byId(i.id).preco != null);
    const total = priced.reduce((s, i) => s + byId(i.id).preco * i.qty, 0);
    const pending = bag.length - priced.length;
    $('#bagTotal').textContent = priced.length ? brl(total) + (pending ? ' + consulta' : '') : 'A confirmar';
    const lines = bag.map(({ id, qty: q }) => {
      const p = byId(id);
      return `• ${q}x ${p.nome} — ${p.marca} (${p.volume})${p.preco != null ? ' — ' + brl(p.preco) : ''}`;
    });
    $('#bagCheckout').href = waLink(`Olá, NYPARFUM! Montei esta sacola no site:\n\n${lines.join('\n')}\n\nPode me confirmar valores, disponibilidade e entrega? Obrigado(a)!`);
  };

  const toast = $('#toast');
  let toastT;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('show'), 2400);
  };

  function addToBag(id, fromEl) {
    const p = byId(id);
    if (!p) return;
    const item = bag.find(i => i.id === id);
    if (item) item.qty++; else bag.push({ id, qty: 1 });
    saveBag();
    renderBag();
    showToast(`${p.nome} foi para a sacola`);
    bagCount.classList.remove('bump'); void bagCount.offsetWidth; bagCount.classList.add('bump');
    if (fromEl && !reduce) {
      const a = fromEl.getBoundingClientRect();
      const b = bagBtn.getBoundingClientRect();
      const dot = document.createElement('span');
      dot.className = 'fly';
      document.body.appendChild(dot);
      const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
      const x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
      dot.animate([
        { transform: `translate(${x0 - 7}px, ${y0 - 7}px) scale(1)`, opacity: 1 },
        { transform: `translate(${(x0 + x1) / 2 - 7}px, ${Math.min(y0, y1) - 120}px) scale(1.4)`, opacity: 1, offset: .5 },
        { transform: `translate(${x1 - 7}px, ${y1 - 7}px) scale(.3)`, opacity: .2 }
      ], { duration: 900, easing: 'cubic-bezier(.22,1,.36,1)' }).onfinish = () => dot.remove();
    }
  }

  const setDrawer = open => {
    drawer.classList.toggle('open', open);
    drawer.setAttribute('aria-hidden', !open);
    body.classList.toggle('lock', open);
    if (open) setTimeout(() => $('.modal-close', drawer).focus(), 300);
  };
  bagBtn.addEventListener('click', () => setDrawer(true));
  drawer.addEventListener('click', e => {
    if (e.target.closest('[data-close-bag]')) { setDrawer(false); return; }
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    if (inc) { bag.find(i => i.id === inc.dataset.inc).qty++; }
    if (dec) {
      const it = bag.find(i => i.id === dec.dataset.dec);
      it.qty--;
      if (it.qty <= 0) bag = bag.filter(i => i !== it);
    }
    if (inc || dec) { saveBag(); renderBag(); }
  });
  renderBag();

  /* ------------------------------------------------------------------
     Lightbox dos feedbacks
     ------------------------------------------------------------------ */
  const lb = $('#lightbox');
  const lbImg = $('#lightboxImg');
  $$('.fb-card').forEach(c => c.addEventListener('click', () => {
    lbImg.src = c.dataset.full;
    lb.hidden = false;
    body.classList.add('lock');
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add('open')));
  }));
  const closeLb = () => {
    if (lb.hidden) return;
    lb.classList.remove('open');
    body.classList.remove('lock');
    setTimeout(() => { lb.hidden = true; }, 400);
  };
  lb.addEventListener('click', closeLb);

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeModal(); closeLb(); setDrawer(false); setMenu(false);
  });

  /* ------------------------------------------------------------------
     Coleções: imagem flutuante seguindo o cursor
     ------------------------------------------------------------------ */
  const colFloat = $('#colFloat');
  if (finePointer && colFloat) {
    const img = $('img', colFloat);
    let fx = 0, fy = 0, tx = 0, ty = 0, raf = null;
    const loop = () => {
      fx = lerp(fx, tx, .14); fy = lerp(fy, ty, .14);
      colFloat.style.translate = `${fx - 120}px ${fy - 160}px`;
      colFloat.style.rotate = `${clamp((tx - fx) * .05, -10, 10)}deg`;
      raf = requestAnimationFrame(loop);
    };
    $$('.col-row').forEach(row => {
      row.addEventListener('mouseenter', e => {
        img.src = row.dataset.img;
        if (!raf) { fx = tx = e.clientX; fy = ty = e.clientY; loop(); }
        colFloat.classList.add('show');
      });
      row.addEventListener('mouseleave', () => colFloat.classList.remove('show'));
    });
    $('#colList').addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    $('#colList').addEventListener('mouseleave', () => { cancelAnimationFrame(raf); raf = null; });
  }

  /* ------------------------------------------------------------------
     Cursor, botões magnéticos, tilt
     ------------------------------------------------------------------ */
  function attachTilt(el) {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(900px) rotateY(${(px - .5) * 8}deg) rotateX(${(.5 - py) * 8}deg)`;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  }

  if (finePointer && !reduce) {
    body.classList.add('has-cursor');
    const cur = $('#cursor'), dot = $('#cursorDot'), label = $('#cursorLabel');
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    }, { passive: true });
    const loop = () => {
      cx = lerp(cx, mx, .18); cy = lerp(cy, my, .18);
      cur.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('[data-cursor], a, button, .chip, select, input');
      const text = t && t.closest('[data-cursor]') ? t.closest('[data-cursor]').dataset.cursor : '';
      cur.classList.toggle('label', !!text);
      cur.classList.toggle('hover', !!t && !text);
      label.textContent = text;
    });
    document.addEventListener('mouseleave', () => { cur.style.opacity = 0; dot.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { cur.style.opacity = 1; dot.style.opacity = 1; });

    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
        el.style.translate = `${x * .28}px ${y * .38}px`;
      });
      el.addEventListener('mouseleave', () => { el.style.translate = ''; });
    });

    $$('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateY(${(px - .5) * 10}deg) rotateX(${(.5 - py) * 10}deg) translateY(-4px)`;
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ------------------------------------------------------------------
     Poeira dourada no hero (canvas)
     ------------------------------------------------------------------ */
  const canvas = $('#dust');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr, parts = [], visible = true, mouse = { x: -999, y: -999 };
    const resize = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(clamp(w * h / 14000, 30, 110));
      parts = Array.from({ length: n }, () => spawn(true));
    };
    const spawn = (any) => ({
      x: Math.random() * w,
      y: any ? Math.random() * h : h + 10,
      r: Math.random() * 1.6 + .3,
      vy: -(Math.random() * .35 + .08),
      vx: (Math.random() - .5) * .15,
      a: Math.random() * .6 + .2,
      ph: Math.random() * Math.PI * 2
    });
    const draw = t => {
      if (visible && currentView === 'home') {
        ctx.clearRect(0, 0, w, h);
        parts.forEach((p, i) => {
          p.ph += .01;
          p.x += p.vx + Math.sin(p.ph) * .2;
          p.y += p.vy;
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
          if (d < 110) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
          if (p.y < -10 || p.x < -10 || p.x > w + 10) parts[i] = spawn(false);
          const tw = .55 + Math.sin(t / 600 + p.ph * 3) * .45;
          ctx.beginPath();
          ctx.fillStyle = `rgba(232,211,166,${p.a * tw})`;
          ctx.shadowColor = 'rgba(232,211,166,.8)';
          ctx.shadowBlur = p.r * 6;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      requestAnimationFrame(draw);
    };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
    canvas.parentElement.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -999; });
    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------------
     Início
     ------------------------------------------------------------------ */
  route(true);
  observeReveals();
})();
