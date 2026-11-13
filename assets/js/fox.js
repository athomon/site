/* FOX — selo animado e demonstração de atendimento */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  // Símbolo oficial da FOX (selo hexagonal com a raposa recortada)
  const PATH = "M96,5.07A8,8 0 0 1 104,5.07L180.21,49.07A8,8 0 0 1 184.21,56L184.21,144A8,8 0 0 1 180.21,150.93L104,194.93A8,8 0 0 1 96,194.93L19.79,150.93A8,8 0 0 1 15.79,144L15.79,56A8,8 0 0 1 19.79,49.07Z M104,194.93L103.25,195.31L102.47,195.61L101.66,195.83L100.84,195.96L100,196L99.16,195.96L98.34,195.83L97.53,195.61L96.75,195.31L96,194.93L56.32,172.02L58.48,98.48L70.72,49.52L82.96,71.28L93.84,44.08L114.24,76.72L145.52,94.4L167.28,110.72L142.8,122.96L114.24,129.76L117.86,186.93Z M114.24,95.76L123.76,89.64L136,93.04L125.12,98.48Z";
  const COLORS = { laranja: "#E4631F", grafite: "#201E1D", creme: "#FFF6EC" };

  /* <span data-fox-mark="laranja" data-draw></span>
     Com data-draw, o contorno se desenha e depois o selo se preenche, quando entra na tela. */
  const marks = document.querySelectorAll("[data-fox-mark]");
  const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add("is-drawn"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -10% 0px" }) : null;

  marks.forEach((host) => {
    const color = COLORS[host.dataset.foxMark] || COLORS.laranja;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 200 200");
    svg.setAttribute("aria-hidden", "true");
    const fill = document.createElementNS(NS, "path");
    fill.setAttribute("d", PATH); fill.setAttribute("fill", color); fill.setAttribute("fill-rule", "evenodd");
    fill.setAttribute("class", "fm-fill");
    svg.appendChild(fill);
    if (host.hasAttribute("data-draw")) {
      const line = document.createElementNS(NS, "path");
      line.setAttribute("d", PATH); line.setAttribute("fill", "none"); line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", "2.2"); line.setAttribute("pathLength", "1"); line.setAttribute("class", "fm-line");
      line.setAttribute("stroke-linejoin", "round");
      svg.appendChild(line);
      host.classList.add("fm-draw");
      if (reduce || !io) host.classList.add("is-drawn"); else io.observe(host);
    }
    host.appendChild(svg);
  });

  /* ---------- Demonstração de atendimento (exemplo com dados fictícios) ---------- */
  const demo = document.querySelector("[data-chat]");
  if (!demo) return;
  const log = demo.querySelector(".chat-log");
  const steps = [
    { who: "me", text: "Preciso liberar o MAC do contrato 4821." },
    { who: "fox", text: "Encontrei o contrato 4821: Maria S., plano 300 Mega. Vou limpar o MAC vinculado ao cadastro." },
    { who: "action" },
    { who: "fox", text: "Pronto. MAC liberado às 14:32 e ação registrada no histórico." },
  ];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const bubble = (who, html) => {
    const el = document.createElement("div");
    el.className = `msg msg--${who}`;
    el.innerHTML = html;
    log.appendChild(el);
    requestAnimationFrame(() => el.classList.add("in"));
    return el;
  };
  const avatar = `<span class="msg-av" data-fox-mark="creme"></span>`;
  const renderMark = (root) => root.querySelectorAll("[data-fox-mark]:empty").forEach((h) => {
    const svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 200 200");
    const p = document.createElementNS(NS, "path"); p.setAttribute("d", PATH); p.setAttribute("fill", COLORS[h.dataset.foxMark]); p.setAttribute("fill-rule", "evenodd");
    svg.appendChild(p); h.appendChild(svg);
  });

  async function typing(ms) {
    const t = bubble("fox", `${avatar}<span class="typing"><i></i><i></i><i></i></span>`);
    renderMark(t);
    await sleep(ms);
    t.remove();
  }

  async function play() {
    log.innerHTML = "";
    for (const s of steps) {
      if (s.who === "me") { await sleep(700); bubble("me", `<p>${s.text}</p>`); await sleep(500); }
      else if (s.who === "fox") { await typing(1200); const b = bubble("fox", `${avatar}<p>${s.text}</p>`); renderMark(b); await sleep(900); }
      else if (s.who === "action") {
        await typing(900);
        const card = bubble("fox action", `${avatar}<div class="act"><div class="act-head"><b>Limpar MAC</b><span>contrato 4821</span></div><div class="act-meta">Risco baixo · expira em <span class="ttl">0:45</span></div><div class="act-btns"><span class="act-ok">Confirmar</span><span class="act-no">Cancelar</span></div></div>`);
        renderMark(card);
        await sleep(1600);
        card.querySelector(".act-ok").classList.add("pressed");
        await sleep(450);
        card.classList.add("done");
        card.querySelector(".act-meta").textContent = "Confirmado por você";
        await sleep(700);
      }
    }
    await sleep(5200);
    if (!reduce) play();
  }

  if (reduce) {
    steps.forEach((s) => {
      if (s.who === "me") bubble("me", `<p>${s.text}</p>`);
      else if (s.who === "fox") renderMark(bubble("fox", `${avatar}<p>${s.text}</p>`));
    });
    log.querySelectorAll(".msg").forEach((m) => m.classList.add("in"));
    return;
  }
  const once = new IntersectionObserver(([e]) => { if (e.isIntersecting) { once.disconnect(); play(); } }, { threshold: .35 });
  once.observe(demo);
})();
