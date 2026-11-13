/* ATHOMON — movimento
   Quase tudo responde à rolagem ou ao cursor; o único movimento contínuo é o sinal de "em produção". */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  /* ---------- Quebra de texto em palavras (sem perder acessibilidade) ---------- */
  function splitWords(el) {
    if (el.dataset.split) return [];
    el.dataset.split = "1";
    const words = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement("span");
            w.className = "w";
            const inner = document.createElement("span");
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
            words.push(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.matches("br")) walk(n);
      });
    };
    walk(el);
    return words;
  }

  /* ---------- Títulos: palavras sobem de dentro de uma máscara ---------- */
  const risers = document.querySelectorAll("[data-rise]");
  risers.forEach((el) => {
    const words = splitWords(el);
    words.forEach((w, i) => w.style.setProperty("--i", i));
  });

  /* ---------- Parágrafos de abertura: a tinta acompanha a leitura ---------- */
  const inkers = [...document.querySelectorAll("[data-ink]")].map((el) => ({ el, words: splitWords(el) }));


  /* ---------- Instrumento da abertura: o símbolo no centro de um astrolábio ---------- */
  const instHost = document.querySelector("[data-instrument]");
  let inst = null;
  if (instHost) {
    const NS = "http://www.w3.org/2000/svg";
    const el = (t, a = {}, parent) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };
    const svg = el("svg", { viewBox: "0 0 1000 1000" });
    const defs = el("defs", {}, svg);
    const mask = el("mask", { id: "inst-gap", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: 1000, height: 1000 }, defs);
    el("rect", { width: 1000, height: 1000, fill: "#fff" }, mask);
    el("circle", { cx: 500, cy: 500, r: 79, fill: "#000" }, mask);

    const scale = el("g", { class: "i-scale" }, svg);
    el("circle", { cx: 500, cy: 500, r: 470, fill: "none", stroke: "currentColor", "stroke-width": 1, opacity: .5 }, scale);
    el("circle", { cx: 500, cy: 500, r: 430, fill: "none", stroke: "currentColor", "stroke-width": 1, opacity: .18 }, scale);
    for (let i = 0; i < 120; i++) {
      const a = i * 3 * Math.PI / 180, long = i % 10 === 0;
      const r1 = 470, r2 = long ? 448 : 460;
      el("line", { x1: 500 + r1 * Math.cos(a), y1: 500 + r1 * Math.sin(a), x2: 500 + r2 * Math.cos(a), y2: 500 + r2 * Math.sin(a), stroke: "currentColor", "stroke-width": long ? 1.4 : .8, opacity: long ? .7 : .4 }, scale);
      if (long) {
        const t = el("text", { x: 500 + 492 * Math.cos(a), y: 500 + 492 * Math.sin(a) + 5, "text-anchor": "middle", "font-size": 14, fill: "currentColor", opacity: .55, "font-family": "Jost, sans-serif" }, scale);
        t.textContent = String(i * 3);
      }
    }
    el("line", { x1: 30, y1: 500, x2: 970, y2: 500, stroke: "currentColor", "stroke-width": .8, opacity: .14 }, svg);
    el("line", { x1: 500, y1: 30, x2: 500, y2: 970, stroke: "currentColor", "stroke-width": .8, opacity: .14 }, svg);

    const orbitG = el("g", { class: "i-orbits" }, svg);
    const radii = [190, 280, 370];
    const orbits = radii.map((rx) => el("ellipse", { cx: 500, cy: 500, rx, ry: rx * .3, transform: "rotate(-20 500 500)", fill: "none", stroke: "currentColor", "stroke-width": 1, opacity: .55, pathLength: 1, mask: "url(#inst-gap)" }, orbitG));
    const ring = el("ellipse", { cx: 500, cy: 500, rx: 134, ry: 41, transform: "rotate(-20 500 500)", fill: "none", stroke: "currentColor", "stroke-width": 23, pathLength: 1, mask: "url(#inst-gap)" }, orbitG);
    const core = el("circle", { cx: 500, cy: 500, r: 64, fill: "currentColor", class: "i-core" }, svg);
    const point = el("circle", { r: 7, fill: "currentColor", opacity: 0 }, orbitG);
    instHost.appendChild(svg);
    inst = { svg, scale, orbitG, orbits, ring, core, point, t: -0.6, born: performance.now() };
    if (reduce) {
      point.setAttribute("opacity", 1);
      point.setAttribute("cx", 500 + 370 * Math.cos(-.6)); point.setAttribute("cy", 500 + 111 * Math.sin(-.6));
    } else {
      [...orbits, ring].forEach((o) => { o.style.strokeDasharray = 1; o.style.strokeDashoffset = 1; });
      core.style.transformOrigin = "500px 500px"; core.style.transform = "scale(0)";
      scale.style.opacity = 0;
    }
  }

  if (reduce) {
    document.documentElement.classList.add("no-motion");
    return;
  }
  document.documentElement.classList.add("motion");

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -12% 0px" });
  document.querySelectorAll("[data-rise], [data-stagger], [data-curtain]").forEach((el) => io.observe(el));

  /* ---------- Estado de rolagem compartilhado ---------- */
  const hero = document.querySelector(".hero");
  const heroTitle = hero && hero.querySelector(".headline");
  const heroToc = hero && hero.querySelector(".toc");
  const heroEyebrow = hero && hero.querySelector(".eyebrow");
  const planet = hero && hero.querySelector(".planet-wrap");
  const flare = hero && hero.querySelector(".flare-move");
  const dome = document.querySelector("[data-dome]");
  const card = document.querySelector("[data-grow]");
  const cardMedia = card && card.querySelector("video, img");
  const pageTop = document.querySelector(".page-top");
  const pageTopInner = pageTop && pageTop.querySelector("[data-drift]");
  const figures = [...document.querySelectorAll("[data-parallax]")];

  let mx = 0, my = 0, smx = 0, smy = 0;
  if (fine) {
    window.addEventListener("pointermove", (e) => {
      mx = e.clientX / window.innerWidth - .5;
      my = e.clientY / window.innerHeight - .5;
    }, { passive: true });
  }

  function frame() {
    const vh = window.innerHeight;
    smx = lerp(smx, mx, .06); smy = lerp(smy, my, .06);

    /* Abertura: o título sobe e some, o planeta afunda, a luz cresce */
    if (hero) {
      const h = hero.offsetHeight;
      const p = clamp(window.scrollY / (h * .9));
      if (heroTitle) {
        heroTitle.style.transform = `translate3d(${(smx * -10).toFixed(2)}px, ${(-p * 90).toFixed(1)}px, 0)`;
        heroTitle.style.opacity = (1 - p * 1.35).toFixed(3);
        heroTitle.style.filter = p > .01 ? `blur(${(p * 8).toFixed(2)}px)` : "";
      }
      if (heroEyebrow) heroEyebrow.style.opacity = (1 - p * 2).toFixed(3);
      if (heroToc) { heroToc.style.opacity = (1 - p * 1.6).toFixed(3); heroToc.style.transform = `translate3d(0, ${(-p * 40).toFixed(1)}px, 0)`; }
      if (planet) planet.style.transform = `translate3d(${(smx * 18).toFixed(2)}px, ${(p * 14).toFixed(2)}vh, 0)`;
      if (flare) flare.style.transform = `translate3d(${(smx * 46).toFixed(2)}px, ${(smy * 14).toFixed(2)}px, 0) scale(${(1 + p * .5).toFixed(3)})`;
    }

    /* Página clara nasce como um horizonte e se aplaina */
    if (dome) {
      const r = dome.getBoundingClientRect();
      const t = clamp(1 - (r.top - vh * .15) / (vh * .85));
      const R = lerp(window.innerWidth < 760 ? 70 : 220, 0, easeOut(t));
      dome.style.borderRadius = `50% 50% 0 0 / ${R.toFixed(1)}px ${R.toFixed(1)}px 0 0`;
    }

    /* Topo das páginas internas: afasta devagar */
    if (pageTopInner) {
      const p = clamp(window.scrollY / (pageTop.offsetHeight * .9));
      pageTopInner.style.transform = `translate3d(0, ${(-p * 70).toFixed(1)}px, 0)`;
      pageTopInner.style.opacity = (1 - p * 1.1).toFixed(3);
    }

    /* Cartão de vídeo cresce até ocupar a largura */
    if (card) {
      const r = card.getBoundingClientRect();
      const t = easeOut(clamp(1 - (r.top - vh * .2) / (vh * .8)));
      card.style.transform = `scale(${lerp(.86, 1, t).toFixed(4)})`;
      card.style.borderRadius = `${lerp(44, 18, t).toFixed(1)}px`;
      if (cardMedia) cardMedia.style.transform = `scale(${lerp(1.18, 1, t).toFixed(4)})`;
    }

    /* Tinta acompanha a leitura */
    for (const { el, words } of inkers) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const t = clamp((vh * .82 - r.top) / (r.height + vh * .38));
      const lit = Math.round(t * words.length * 1.15);
      for (let i = 0; i < words.length; i++) words[i].classList.toggle("lit", i < lit);
    }

    /* Figuras: a imagem anda mais devagar que a moldura */
    for (const f of figures) {
      const r = f.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      const t = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
      const img = f.querySelector("img, video");
      if (img) img.style.transform = `translate3d(0, ${(t * -7).toFixed(2)}%, 0) scale(1.14)`;
    }


    /* Instrumento: nasce desenhado, depois o ponto orbita; a escala gira com a rolagem */
    if (inst) {
      const age = (performance.now() - inst.born) / 1000;
      const ease = (a, d) => easeOut(clamp((age - a) / d));
      inst.scale.style.opacity = ease(.1, 1.2).toFixed(3);
      inst.core.style.transform = `scale(${ease(.2, .9).toFixed(3)})`;
      inst.ring.style.strokeDashoffset = (1 - ease(.5, 1.3)).toFixed(4);
      inst.orbits.forEach((o, i) => { o.style.strokeDashoffset = (1 - ease(.7 + i * .18, 1.6)).toFixed(4); });
      const live = ease(2, .8);
      inst.point.setAttribute("opacity", live.toFixed(3));
      inst.t += .0045 + live * .002;
      const tilt = -20 * Math.PI / 180, rx = 370, ry = 111;
      const ex = rx * Math.cos(inst.t), ey = ry * Math.sin(inst.t);
      inst.point.setAttribute("cx", (500 + ex * Math.cos(tilt) - ey * Math.sin(tilt)).toFixed(2));
      inst.point.setAttribute("cy", (500 + ex * Math.sin(tilt) + ey * Math.cos(tilt)).toFixed(2));
      inst.scale.style.transform = `rotate(${(window.scrollY * .05 + smx * 4).toFixed(2)}deg)`;
      inst.scale.style.transformOrigin = "500px 500px";
      inst.orbitG.style.transformOrigin = "500px 500px";
      inst.orbitG.style.transform = `rotate(${(smx * 5).toFixed(2)}deg) translate(${(smx * 8).toFixed(2)}px, ${(smy * 8).toFixed(2)}px)`;
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- Destaque que desliza entre as pílulas do menu ---------- */
  document.querySelectorAll(".pills.left").forEach((list) => {
    const hl = document.createElement("span");
    hl.className = "pill-hl"; hl.setAttribute("aria-hidden", "true");
    list.appendChild(hl);
    const move = (a) => {
      const lr = list.getBoundingClientRect(), r = a.getBoundingClientRect();
      hl.style.width = r.width + "px";
      hl.style.transform = `translateX(${r.left - lr.left}px)`;
      hl.classList.add("on");
    };
    list.querySelectorAll(".pill").forEach((a) => {
      a.addEventListener("pointerenter", () => move(a));
      a.addEventListener("focus", () => move(a));
    });
    list.addEventListener("pointerleave", () => hl.classList.remove("on"));
  });

  /* ---------- Botões com leve atração do cursor ---------- */
  if (fine) {
    document.querySelectorAll(".btn, .nav-cta").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.transform = `translate(${(x * 8).toFixed(1)}px, ${(y * 6).toFixed(1)}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  /* ---------- Sumário: o pontilhado se desenha da esquerda ---------- */
  const toc = document.querySelector(".toc");
  if (toc) requestAnimationFrame(() => setTimeout(() => toc.classList.add("is-drawn"), 900));
})();
