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
    const p = off || compact ? 0 : Math.max(0, Math.min(1, -rect.top / Math.max(1, scroll.offsetHeight - stage.offsetHeight)));
    const t = off ? 0 : (now - started) / 1000;
    photos.forEach((el, i) => {
      const k = i - 2, phase = t * .45 + i * .9;
      if (compact) {
        // Keep every card inside the phone. Scroll never moves text or covers it.
        const x = k * width * .113;
        const y = Math.abs(k) * 9 + (off ? 0 : Math.sin(phase) * 4);
        const angle = k * 7 + (off ? 0 : Math.sin(phase) * 1.2);
        const scale = 1 - Math.abs(k) * .055;
        el.style.zIndex = String(5 - Math.abs(k));
        el.style.transform = `translateX(-50%) translate(${x}px,${y}px) rotate(${angle}deg) scale(${scale})`;
      } else {
        const spread = width > 1800 ? 320 : Math.min(260, width * .19);
        const x = k * spread + Math.sin(phase) * 14 + (off ? 0 : mx * 32) + k * p * width * .06;
        const y = Math.cos(phase) * 18 + Math.abs(k) * 13 - p * 55 + (off ? 0 : my * 8);
        el.style.zIndex = String(5 - Math.abs(k));
        el.style.transform = `translate3d(${x}px,${y}px,${-Math.abs(k) * 50}px) rotateY(${-k * 13 + (off ? 0 : mx * 12)}deg) rotateZ(${k * 5 + Math.sin(phase) * 2}deg) scale(${1 + p * .06})`;
      }
    });
  }
  requestAnimationFrame(tick);
})();
