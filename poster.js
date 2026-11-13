(() => {
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const mobile = matchMedia('(max-width:900px)');
  let off = reduced.matches;
  function mode() {
    off = reduced.matches;
    document.body.classList.toggle('motion-off', off);
  }
  reduced.addEventListener('change', mode);
  mode();

  const dlg = document.querySelector('.film-dialog');
  const film = dlg.querySelector('video');
  document.querySelector('.play-film').onclick = () => {
    dlg.showModal();
    film.play().catch(() => {});
  };
  dlg.querySelector('.close-film').onclick = () => dlg.close();
  dlg.addEventListener('close', () => film.pause());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  const scroll = document.querySelector('.poster-scroll');
  const stage = document.querySelector('.poster-stage');
  const photos = [...document.querySelectorAll('.ribbon-photo')];
  const cut = document.querySelector('.poster-cut');
  const word1 = document.querySelector('.word-one');
  const word2 = document.querySelector('.word-two');
  let sceneTop = 0, travel = 1;
  function measure() {
    const height = stage.offsetHeight;
    // svh is stable when Safari's address bar opens/closes; viewport height is
    // used only to ensure the bottom of a tall scene is reachable before pinning.
    const view = document.documentElement.clientHeight;
    sceneTop = Math.min(0, view - height);
    travel = Math.max(420, view * .95);
    scroll.style.setProperty('--scene-height', `${height}px`);
    scroll.style.setProperty('--scene-travel', `${travel}px`);
    scroll.style.setProperty('--scene-top', `${sceneTop}px`);
  }
  new ResizeObserver(measure).observe(stage);
  window.addEventListener('resize', measure);
  measure();
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => x * x * (3 - 2 * x);
  let mx = 0, my = 0, last = 0;
  const started = performance.now();
  stage.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || mobile.matches) return;
    mx = e.clientX / innerWidth - .5;
    my = e.clientY / innerHeight - .5;
  });
  stage.addEventListener('pointerleave', () => { mx = my = 0; });

  function tick(now) {
    requestAnimationFrame(tick);
    if (document.hidden || now - last < 32) return;
    last = now;
    const rect = scroll.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const compact = mobile.matches;
    const width = stage.clientWidth;
    const p = off ? 0 : clamp((-rect.top + sceneTop) / travel);
    const fan = ease(clamp((p - .1) / .65));
    const wipe = ease(clamp((p - .72) / .28));
    cut.style.height = `${wipe * 75}%`;
    if (compact) {
      word1.style.transform = `translateX(${-fan * 3}%) scale(${1 - fan * .12})`;
      word2.style.transform = `translateX(${fan * 3}%) scale(${1 - fan * .12})`;
    } else {
      word1.style.transform = `translateX(${-p * 28}%)`;
      word2.style.transform = `translateX(${p * 28}%)`;
    }
    stage.dataset.progress = p.toFixed(3);
    const t = off ? 0 : (now - started) / 1000;
    photos.forEach((el, i) => {
      const k = i - 2, phase = t * .45 + i * .9;
      if (compact) {
        // A compact fan opens with scroll; the wipe starts only after its motion.
        const x = k * width * (.113 + fan * .26);
        const y = Math.abs(k) * 9 + (off ? 0 : Math.sin(phase) * 4) - fan * 24;
        const angle = k * (7 + fan * 8) + (off ? 0 : Math.sin(phase) * 1.2);
        const scale = 1 - Math.abs(k) * .055 + fan * .12;
        el.style.zIndex = String(5 - Math.abs(k));
        el.style.transform = `translateX(-50%) translate(${x}px,${y}px) rotate(${angle}deg) scale(${scale})`;
      } else {
        const spread = width > 1800 ? 320 : Math.min(260, width * .19);
        const x = k * spread + Math.sin(phase) * 14 + (off ? 0 : mx * 32) + k * p * width * .55;
        const y = Math.cos(phase) * 18 + Math.abs(k) * 13 - p * 140 + (off ? 0 : my * 8);
        el.style.zIndex = String(5 - Math.abs(k));
        el.style.transform = `translate3d(${x}px,${y}px,${-Math.abs(k) * 50}px) rotateY(${-k * 13 + (off ? 0 : mx * 12)}deg) rotateZ(${k * 5 + Math.sin(phase) * 2}deg) scale(${1 + p * .3})`;
      }
    });
  }
  requestAnimationFrame(tick);
})();
