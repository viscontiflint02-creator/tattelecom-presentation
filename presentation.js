(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const dialogs = [...document.querySelectorAll('dialog')];
  const $ = id => document.getElementById(id);
  let current = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function go(index, updateHash = true) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      if (i !== current) slide.querySelectorAll('video').forEach(video => video.pause());
    });
    slides[current].scrollTop = 0;
    $('slideCounter').textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    $('sectionLabel').textContent = current === 0 ? 'Введение' : current < 7 ? 'Работа филиалов' : current === 7 ? 'Данные Axapta' : current === 10 || current === 15 ? 'Демонстрация' : current === 17 ? 'Общий процесс' : 'Новая система';
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
    const open = () => { $('zoomImage').src = img.src; $('zoomImage').alt = img.alt; $('zoomCaption').textContent = img.alt; openDialog('imageDialog'); };
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
      }, 250);
    }, 3600);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) document.querySelectorAll('video').forEach(v => v.pause()); startCycle(); });
  reducedMotion.addEventListener('change', startCycle);
  window.addEventListener('hashchange', () => go((Number(location.hash.slice(1)) || 1) - 1, false));
  go((Number(location.hash.slice(1)) || 1) - 1);
  startCycle();
})();
