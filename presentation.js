(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const dialogs = [...document.querySelectorAll('dialog')];
  const $ = id => document.getElementById(id);
  let current = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let firstRender = true;
  let transitionAnimations = [];
  let contentAnimations = [];
  let counterFrame;
  let restoreCounters = [];
  function stopContentMotion() {
    contentAnimations.forEach(animation => animation.cancel());
    contentAnimations = [];
    cancelAnimationFrame(counterFrame);
    restoreCounters.forEach(restore => restore());
    restoreCounters = [];
  }
  function reveal(root) {
    stopContentMotion();
    if (!root || reducedMotion.matches) return;
    const visible = node => { const r = node.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const surfaces = '.problem-card,.roadmap-grid>article,.team-members article,.video-shell,.role-explanation>article,.evidence,.team-project';
    const items = [...root.querySelectorAll(`.eyebrow,h1,h2,.word-line,.cover-bottom,.cover-strip>div,.native-kpis>div,.fleet-people-row,.steps li,.workflow-node,.native-age-row,${surfaces}`)]
      .filter(visible).slice(0,30);
    items.forEach((node,i) => {
      const card = node.matches(surfaces);
      const diagram = node.matches('.workflow-node');
      contentAnimations.push(node.animate([
        {opacity:0,transform:`translateY(${card ? 26 : 16}px) scale(${card ? .975 : 1})`},
        {opacity:1,transform:'translateY(0) scale(1)'}
      ],{duration:card ? 760 : 620,delay:70+i*(diagram ? 90 : 38),easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
    });
    root.querySelectorAll('.fleet-measure i,.native-age-row i').forEach((bar,i) => {
      if (!visible(bar)) return;
      contentAnimations.push(bar.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:1050,delay:170+i*65,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
    });
    root.querySelectorAll('.workflow-links path').forEach((path,i) => {
      const length = path.getTotalLength();
      contentAnimations.push(path.animate([{strokeDasharray:`${length} ${length}`,strokeDashoffset:length,opacity:0},{strokeDasharray:`${length} ${length}`,strokeDashoffset:0,opacity:1}],{duration:800,delay:260+i*145,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
    });
    const counters = [...root.querySelectorAll('.native-kpis b[data-value]')].filter(visible).map(node => {
      const value = Number(node.dataset.value), text = node.textContent;
      restoreCounters.push(() => { node.textContent = text; });
      return {node,value,decimals:Number.isInteger(value) ? 0 : 1};
    });
    if (counters.length) {
      const start = performance.now();
      const tick = now => {
        const t = Math.min(1,Math.max(0,(now-start-120)/900)),ease = 1-Math.pow(1-t,3);
        counters.forEach(({node,value,decimals}) => { node.textContent = (value*ease).toFixed(decimals).replace('.',','); });
        if (t < 1) counterFrame = requestAnimationFrame(tick);
      };
      counterFrame = requestAnimationFrame(tick);
    }
  }
  document.addEventListener('presentation:reveal',event => reveal(event.detail?.root));
  function go(index, updateHash = true) {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    const previous = slides[current];
    const previousIndex = current;
    const changing = firstRender || next !== current;
    if (changing) {
      transitionAnimations.forEach(animation => animation.cancel());
      stopContentMotion();
      transitionAnimations = [];
      slides.forEach(slide => slide.classList.remove('leaving'));
    }
    current = next;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      if (i !== current) slide.querySelectorAll('video').forEach(video => video.pause());
    });
    if (changing && !reducedMotion.matches) {
      if (!firstRender && previousIndex !== current) {
        previous.classList.add('leaving');
        const outgoing = previous.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-12px)'}],{duration:260,easing:'ease-out'});
        outgoing.finished.then(() => previous.classList.remove('leaving')).catch(() => {});
        transitionAnimations.push(outgoing);
      }
      const direction = current >= previousIndex ? 1 : -1;
      transitionAnimations.push(slides[current].animate([{opacity:0,transform:`translateX(${direction*32}px) scale(.99)`},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:680,easing:'cubic-bezier(.16,1,.3,1)'}));
      reveal(slides[current]);
    }
    firstRender = false;
    slides[current].scrollTop = 0;
    $('slideCounter').textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    $('sectionLabel').textContent = slides[current].dataset.section || 'Заявочная система';
    $('progressFill').style.width = `${(current + 1) / slides.length * 100}%`;
    $('prevBtn').disabled = current === 0;
    $('nextBtn').disabled = current === slides.length - 1;
    $('noteTitle').textContent = `${current + 1}. ${slides[current].dataset.title}`;
    $('noteText').textContent = slides[current].dataset.notes;
    document.querySelectorAll('#overviewGrid button').forEach((button, i) => button.classList.toggle('current', i === current));
    if (updateHash && location.hash !== `#${current + 1}`) history.replaceState(null, '', `#${current + 1}`);
    document.title = `${current + 1}. ${slides[current].dataset.title} — Таттелеком`;
  }
  function openDialog(id) { dialogs.forEach(dialog => dialog.close()); $(id).showModal(); }
  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => { $('fullscreenBtn').title = 'Используйте F11 для полноэкранного режима браузера'; });
  }
  slides.forEach((slide, i) => {
    const button = document.createElement('button');
    const number = document.createElement('span');
    number.textContent = String(i + 1).padStart(2, '0');
    button.append(number, document.createTextNode(slide.dataset.title));
    button.addEventListener('click', () => { $('overviewDialog').close(); go(i); });
    $('overviewGrid').append(button);
  });
  $('prevBtn').addEventListener('click', () => go(current - 1));
  $('nextBtn').addEventListener('click', () => go(current + 1));
  $('overviewBtn').addEventListener('click', () => openDialog('overviewDialog'));
  $('notesBtn').addEventListener('click', () => openDialog('notesDialog'));
  $('fullscreenBtn').addEventListener('click', fullscreen);
  $('sourcesBtn').addEventListener('click', () => openDialog('sourcesDialog'));
  document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => go(Number(button.dataset.go) - 1)));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  dialogs.forEach(dialog => dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  }));
  document.querySelectorAll('[data-zoom]').forEach(img => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Увеличить: ${img.alt}`);
    const open = () => { $('imageDialog').classList.remove('bot-image'); $('zoomImage').src = img.src; $('zoomImage').alt = img.alt; $('zoomCaption').textContent = img.alt; openDialog('imageDialog'); };
    img.addEventListener('click', open);
    img.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); open(); } });
  });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest('video,input,textarea,select')) return;
    if (dialogs.some(dialog => dialog.open)) return;
    const key = event.key.toLowerCase();
    if (['arrowright','pagedown'].includes(key) || (key === ' ' && !event.target.closest('button,a'))) { event.preventDefault(); go(current + 1); }
    else if (['arrowleft','pageup'].includes(key)) { event.preventDefault(); go(current - 1); }
    else if (key === 'home') { event.preventDefault(); go(0); }
    else if (key === 'end') { event.preventDefault(); go(slides.length - 1); }
    else if (['f','а'].includes(key)) fullscreen();
    else if (['o','щ'].includes(key)) openDialog('overviewDialog');
    else if (['n','т'].includes(key)) openDialog('notesDialog');
  });
  let touchStart = null;
  $('deck').addEventListener('touchstart', event => {
    touchStart = event.target.closest('video,button,a,[data-zoom]') ? null : { x:event.touches[0].clientX, y:event.touches[0].clientY };
  }, {passive:true});
  $('deck').addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 75 && Math.abs(dx) > Math.abs(dy)*1.5) go(current + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, {passive:true});
  // Buttons seek within the supplied original recordings. No autoplay on slide entry.
  document.addEventListener('click', event => {
    const bot = event.target.closest('[data-bot]');
    if (bot) {
      $('zoomImage').src = bot.dataset.bot;
      $('zoomImage').alt = bot.textContent;
      $('zoomCaption').textContent = bot.textContent.replace('↗','');
      $('imageDialog').classList.add('bot-image');
      openDialog('imageDialog');
      return;
    }
    const button = event.target.closest('[data-video]');
    if (!button) return;
    const video = $(button.dataset.video);
    video.currentTime = Number(button.dataset.time);
    video.play().catch(() => {});
  });
  const words = ['Заявки','Решения','Транспорт'];
  const themes = ['lemon','peach','sage'];
  let wordIndex = 0;
  let cycleTimer;
  let switchTimer;
  function startCycle() {
    clearInterval(cycleTimer);
    clearTimeout(switchTimer);
    $('cycleWord').classList.remove('changing');
    if (reducedMotion.matches || document.hidden) return;
    cycleTimer = setInterval(() => {
      if (current !== 0) return;
      $('cycleWord').classList.add('changing');
      switchTimer = setTimeout(() => {
        wordIndex = (wordIndex + 1) % words.length;
        $('cycleWord').textContent = words[wordIndex];
        slides[0].dataset.theme = themes[wordIndex];
        $('cycleWord').classList.remove('changing');
      }, 160);
    }, 1600);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) document.querySelectorAll('video').forEach(v => v.pause()); startCycle(); });
  reducedMotion.addEventListener('change', () => {
    startCycle();
    stopContentMotion();
    transitionAnimations.forEach(animation => animation.cancel());
    slides.forEach(slide => slide.classList.remove('leaving'));
  });
  window.addEventListener('beforeprint', () => {
    stopContentMotion();
    transitionAnimations.forEach(animation => animation.cancel());
    slides.forEach(slide => slide.classList.remove('leaving'));
  });
  window.addEventListener('hashchange', () => go((Number(location.hash.slice(1)) || 1) - 1, false));
  go((Number(location.hash.slice(1)) || 1) - 1);
  startCycle();
})();
