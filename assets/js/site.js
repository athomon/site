/* ATHOMON — comportamento compartilhado */
(() => {
  const doc = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  if ("PageRevealEvent" in window || "onpagereveal" in window) doc.classList.add("vt");

  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };
  window.Athomon = { svgEl, reduce };

  /* Header: troca de tom conforme a seção que está por baixo, some ao descer */
  const header = document.querySelector(".site-header");
  const darks = [...document.querySelectorAll(".dark")];
  if (header) {
    let lastY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const probe = header.offsetHeight / 2;
      const onDark = darks.some((s) => { const r = s.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe; });
      header.dataset.tone = onDark ? "dark" : "light";
      header.classList.toggle("is-solid", y > 30);
      if (y > lastY + 6 && y > window.innerHeight * .7) header.classList.add("is-hidden");
      else if (y < lastY - 6 || y < 80) header.classList.remove("is-hidden");
      lastY = y;
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    header.addEventListener("focusin", () => header.classList.remove("is-hidden"));
    update();
  }

  /* Entradas discretas */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -10% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add("is-in"));

  /* Marcadores laterais do artigo */
  const ticks = document.querySelector(".ticks");
  const article = document.querySelector(".article");
  if (ticks && article) {
    const links = [...ticks.querySelectorAll("a")];
    const targets = links.map((a) => document.querySelector(a.getAttribute("href")));
    const onScroll = () => {
      const r = article.getBoundingClientRect();
      ticks.classList.toggle("is-on", r.top < window.innerHeight * .5 && r.bottom > window.innerHeight * .5);
      let idx = 0;
      targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top < window.innerHeight * .4) idx = i; });
      links.forEach((a, i) => a.classList.toggle("is-active", i === idx));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mídia: arquivo local primeiro, CDN do Higgsfield como reserva */
  document.querySelectorAll("img[data-fallback]").forEach((img) => {
    const swap = () => { if (img.dataset.fallback) { img.src = img.dataset.fallback; img.removeAttribute("data-fallback"); } };
    img.addEventListener("error", swap, { once: true });
    if (img.complete && img.naturalWidth === 0) swap();
  });
  document.querySelectorAll("[data-media]").forEach((box) => {
    const m = box.querySelector("video, img");
    if (!m) return;
    const ready = () => box.classList.add("is-ready");
    if (m.tagName === "VIDEO") {
      if (m.readyState >= 2) ready(); else m.addEventListener("loadeddata", ready, { once: true });
      if (reduce) { m.removeAttribute("autoplay"); m.pause(); }
      else if ("IntersectionObserver" in window) {
        new IntersectionObserver(([e]) => { e.isIntersecting ? m.play().catch(() => {}) : m.pause(); }).observe(box);
      }
    } else if (m.complete && m.naturalWidth) ready(); else m.addEventListener("load", ready);
  });

  /* Copiar e-mail */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const toast = document.getElementById(btn.getAttribute("aria-describedby") || "");
    const label = btn.textContent;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Copiado";
        if (toast) toast.textContent = btn.dataset.copy + " está na sua área de transferência.";
      } catch {
        if (toast) toast.textContent = "Não deu para copiar automaticamente. Selecione o endereço acima.";
      }
      setTimeout(() => { btn.textContent = label; }, 2600);
    });
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
