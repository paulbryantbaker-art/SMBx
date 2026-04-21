/* Glass Grok · shared journey scripts
   Expects on the page:
     - window.SCRIPT = { 1:[{who,text},...], 2:[...], ... }
     - #chat (rail scroll container)
     - .dr-step[data-step="N"] sections
     - .dr-nav button[data-jump="sN"]
     - #chatForm / #chatInput (and optional #chatFormBottom / #chatInputBottom)
     - .dr-rail__chips button[data-prompt]
     - optional window.OPENING (HTML for the first Yulia message)
*/
(function () {
  const chat = document.getElementById('chat');
  if (!chat) return;
  const played = new Set();

  function append(who, text, { animate = true } = {}) {
    const el = document.createElement('div');
    el.className = 'dr-msg dr-msg--' + who;
    el.innerHTML = `<div class="dr-msg__meta">${who === 'y' ? 'YULIA' : 'YOU'}</div><div class="dr-msg__bubble">${text}</div>`;
    if (!animate) el.style.animation = 'none';
    chat.appendChild(el);
    chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
  }
  function typing() {
    const el = document.createElement('div');
    el.className = 'dr-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    chat.appendChild(el);
    chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
    return el;
  }
  const opening = window.OPENING || "Hi — I'm <strong>Yulia</strong>. Scroll to follow along.";
  append('y', opening, { animate: false });

  function play(n) {
    if (played.has(n)) return;
    played.add(n);
    const bench = document.querySelector(`[data-step="${n}"] .dr-bench`);
    if (bench) { bench.classList.remove('flash'); void bench.offsetWidth; bench.classList.add('flash'); }
    const msgs = (window.SCRIPT && window.SCRIPT[n]) || [];
    let t = 280;
    msgs.forEach((m, i) => {
      setTimeout(() => {
        if (m.who === 'y' && i > 0) {
          const tp = typing();
          setTimeout(() => { tp.remove(); append(m.who, m.text); }, 500);
        } else {
          append(m.who, m.text);
        }
      }, t);
      t += 800 + m.text.length * 2.6;
    });
  }

  const steps = document.querySelectorAll('.dr-step');
  const navBtns = document.querySelectorAll('.dr-nav button');
  const obs = new IntersectionObserver((entries) => {
    const vis = entries.filter(e => e.isIntersecting)
                      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (!vis.length) return;
    const top = vis[0].target;
    const n = parseInt(top.dataset.step, 10);
    if (n) play(n);
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.jump === top.id));
    steps.forEach(s => s.classList.toggle('active', s === top));
  }, { rootMargin: '-18% 0px -55% 0px', threshold: 0 });
  steps.forEach(s => obs.observe(s));

  navBtns.forEach(b => b.addEventListener('click', () => {
    const el = document.getElementById(b.dataset.jump);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }));

  function handle(text) {
    if (!text.trim()) return;
    append('me', text);
    const tp = typing();
    setTimeout(() => {
      tp.remove();
      const reply = window.REPLY || "Drop your <strong>industry</strong>, <strong>revenue</strong>, and <strong>EBITDA</strong> and I'll return a preliminary range in about 20 minutes.";
      append('y', reply);
    }, 900);
  }
  const form = document.getElementById('chatForm');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const i = document.getElementById('chatInput');
    handle(i.value); i.value = '';
  });
  const formB = document.getElementById('chatFormBottom');
  if (formB) formB.addEventListener('submit', (e) => {
    e.preventDefault();
    const i = document.getElementById('chatInputBottom');
    handle(i.value); i.value = '';
    document.querySelector('.dr-rail')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  });
  document.querySelectorAll('.dr-rail__chips button').forEach(b => {
    b.addEventListener('click', () => handle(b.dataset.prompt));
  });
})();
