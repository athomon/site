/* O nome: ATHOMON se abre em ATOM e HOMO, e o O compartilhado vira o núcleo do símbolo.
   As letras são as curvas do próprio logo (nada redigitado com a fonte). */
(() => {
  const { svgEl, reduce } = window.Athomon;
  const host = document.querySelector("[data-word]");
  if (!host) return;

  const GLYPHS = {
    A: "M474 180 554 0H688L345 739L3 0H136L216 180ZM345 502 441 280H250Z",
    T: "M8 591H193V0H311V591H496V700H8Z",
    H: "M548 700V430H196V700H78V0H196V321H548V0H666V700Z",
    O: "M163 350Q163 422 194.0 478.5Q225 535 278.5 567.0Q332 599 401 599Q472 599 525.5 567.0Q579 535 609.0 478.5Q639 422 639 350Q639 278 608.5 222.0Q578 166 524.5 133.5Q471 101 401 101Q332 101 278.5 133.5Q225 166 194.0 222.0Q163 278 163 350ZM38 350Q38 272 65.0 205.0Q92 138 141.0 89.0Q190 40 256.5 12.5Q323 -15 401 -15Q481 -15 547.0 12.5Q613 40 662.0 89.0Q711 138 738.0 205.0Q765 272 765 350Q765 429 738.0 495.0Q711 561 661.5 609.5Q612 658 546.0 685.5Q480 713 401 713Q324 713 257.5 685.5Q191 658 141.5 609.5Q92 561 65.0 495.0Q38 429 38 350Z",
    M: "M208 426 421 65 635 426 683 0H805L709 735L421 260L134 735L38 0H160Z",
    N: "M589 700V230L78 735V0H194V470L705 -35V700Z"
  };
  // mesmas posições do logo horizontal (unidades da fonte)
  const LETTERS = [["A", 0], ["T", 850], ["H", 1514], ["O", 2418], ["M", 3381], ["O", 4384], ["N", 5347]];

  const svg = svgEl("svg", { class: "word", viewBox: "-40 -820 6140 940", role: "img", "aria-label": "ATHOMON" });
  const defs = svgEl("defs");
  const mask = svgEl("mask", { id: "nome-gap", maskUnits: "userSpaceOnUse", x: -2000, y: -3000, width: 10000, height: 6000 });
  mask.appendChild(svgEl("rect", { x: -2000, y: -3000, width: 10000, height: 6000, fill: "#fff" }));
  // centro do primeiro O (o compartilhado)
  const OX = 2418 + 401, OY = -350;
  mask.appendChild(svgEl("circle", { cx: OX, cy: OY, r: 300, fill: "#000" }));
  defs.appendChild(mask);
  svg.appendChild(defs);

  const flip = svgEl("g", { transform: "scale(1 -1)" });
  const letters = LETTERS.map(([ch, x], i) => {
    const g = svgEl("g", { class: "ltr", "data-i": i });
    g.appendChild(svgEl("path", { d: GLYPHS[ch], transform: `translate(${x} 0)` }));
    flip.appendChild(g);
    return g;
  });
  svg.appendChild(flip);

  // símbolo que nasce no lugar do O: núcleo + órbita com corte, inclinação de -20 graus
  const sym = svgEl("g", { class: "sym", style: "opacity:0" });
  const ring = svgEl("ellipse", {
    class: "sym-ring", cx: OX, cy: OY, rx: 514, ry: 157, transform: `rotate(-20 ${OX} ${OY})`,
    mask: "url(#nome-gap)", pathLength: 1, "stroke-width": 89
  });
  const core = svgEl("circle", { class: "sym-core", cx: OX, cy: OY, r: 0 });
  sym.append(ring, core);
  svg.appendChild(sym);
  host.appendChild(svg);

  const ON = 1, OFF = 0.1;
  const STATES = [
    [ON, ON, ON, ON, ON, ON, ON],        // ATHOMON
    [ON, ON, OFF, ON, ON, OFF, OFF],     // ATOM
    [OFF, OFF, ON, ON, ON, ON, OFF],     // HOMO
    [0.06, 0.06, 0.06, 0, 0.06, 0.06, 0.06] // o O vira núcleo
  ];
  const captions = document.querySelectorAll(".caption");
  const dots = document.querySelectorAll(".progress i");
  let current = -1;

  const easeOut = (p) => 1 - Math.pow(1 - p, 3);
  let symAnim = null;
  function animateSymbol(show) {
    cancelAnimationFrame(symAnim);
    const from = parseFloat(sym.style.opacity) || 0;
    const t0 = performance.now(), D = show ? 1400 : 500;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / D), e = easeOut(p);
      const v = show ? from + (1 - from) * e : from * (1 - e);
      sym.style.opacity = v.toFixed(3);
      core.setAttribute("r", Math.max(0, 300 * (show ? Math.min(1, e * 1.25) : v) * 0.82).toFixed(1));
      ring.style.strokeDasharray = "1";
      ring.style.strokeDashoffset = (1 - (show ? Math.max(0, (e - .15) / .85) : v)).toFixed(3);
      if (p < 1) symAnim = requestAnimationFrame(step);
    };
    symAnim = requestAnimationFrame(step);
  }

  function setState(s) {
    if (s === current) return;
    current = s;
    STATES[s].forEach((o, i) => { letters[i].style.opacity = o; letters[i].style.transform = o < .5 ? "scale(.9)" : ""; });
    captions.forEach((c, i) => c.classList.toggle("is-on", i === s));
    dots.forEach((d, i) => d.classList.toggle("is-on", i === s));
    animateSymbol(s === 3);
  }

  if (reduce) {
    setState(0);
    captions.forEach((c) => c.classList.add("is-on"));
    return;
  }

  const story = document.querySelector(".story");
  const onScroll = () => {
    const r = story.getBoundingClientRect();
    const total = story.offsetHeight - window.innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / total));
    setState(p < .18 ? 0 : p < .42 ? 1 : p < .64 ? 2 : 3);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* Prancha: a colagem desliza mais devagar que a página */
  const plateImg = document.querySelector(".plate-media img");
  if (plateImg) {
    const box = plateImg.parentElement;
    const par = () => {
      const r = box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const p = (r.top + r.height) / (window.innerHeight + r.height); // 1 → 0
      plateImg.style.transform = `translate3d(0, ${((p - .5) * 18).toFixed(2)}%, 0) scale(1.04)`;
    };
    window.addEventListener("scroll", par, { passive: true });
    par();
  }
})();
