(() => {
  'use strict';
  const panel = document.getElementById('futurePanel');
  const buttons = [...document.querySelectorAll('[data-future]')];
  const qlik = 'https://qlik.tattelecom.ru/sense/app/fce36db1-40ed-4136-a313-f73d3b78739d/sheet/6b063caa-0d3c-43e6-952d-3df3a939ff05/state/analysis';
  const paths = {
    car:'M3 15v-4l3-5h12l3 5v4M3 11h18M7 11l1-5m9 5-1-5M3 15h18M6 15v3m12-3v3',
    person:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-3a8 8 0 0 1 16 0v3',
    file:'M6 2h8l5 5v15H6zM14 2v6h5M9 12h7M9 16h7',
    pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    database:'M4 6c0-5 16-5 16 0s-16 5-16 0v12c0 5 16 5 16 0V6M4 12c0 5 16 5 16 0',
    message:'M3 3h18v14H9l-6 4zM7 8h10M7 12h7',
    chart:'M3 3v18h19M7 17v-5m5 5V7m5 10V4',
    check:'M4 12l5 5L20 6'
  };
  const icon = kind => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[kind]}"></path></svg>`;
  const links = value => `<svg class="concept-lines" viewBox="0 0 600 210" aria-hidden="true"><defs><marker id="futureArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#789064" stroke="none"></path></marker></defs>${value.map(d=>`<path class="concept-path signal" d="${d}" marker-end="url(#futureArrow)"></path>`).join('')}</svg>`;
  const views = {
    catalog:{kicker:'01 / ТРАНСПОРТ В ОДНОМ КАТАЛОГЕ',title:'Выбирать автомобиль по задаче',copy:'Витрина доступного транспорта с фотографиями конкретных машин, назначением и фильтрами по подразделениям.',visual:`<div class="catalog-concept"><div class="catalog-illustration"><img src="assets/vehicles-catalog.svg" alt="Иллюстрация легкового автомобиля и фургона"></div><div class="catalog-filters"><span>Фото ТС</span><span>Вид работ</span><span>Подразделение</span></div></div>`,note:'Витрина и фотографии — направление развития.'},
    ratings:{kicker:'02 / ОБРАТНАЯ СВЯЗЬ ПО ПОЕЗДКЕ',title:'Оценка водителя и заказчика',copy:'Развивать рейтинги обеих сторон. Согласовать критерии и собирать обратную связь после выполнения заявки.',visual:`<div class="rating-concept"><div class="rating-person"><i>${icon('person')}</i><b>Водитель</b><div class="concept-stars" aria-hidden="true">${'<span>☆</span>'.repeat(5)}</div></div><div class="rating-connect">↔<small>Обратная связь</small></div><div class="rating-person"><i>${icon('person')}</i><b>Заказчик</b><div class="concept-stars" aria-hidden="true">${'<span>☆</span>'.repeat(5)}</div></div></div>`,note:'Критерии рейтингов предстоит согласовать.'},
    analytics:{kicker:'03 / КОРПОРАТИВНАЯ АНАЛИТИКА',title:'Быстрый переход к дашборду',copy:'Использовать существующую аналитику в Qlik Sense и сделать переход к ней удобным из процесса работы с транспортом.',visual:`<div class="analytics-concept"><div class="concept-browser"><div class="concept-browser-bar"><i></i><i></i><i></i><span>Qlik Sense</span></div><div class="concept-dashboard"><div class="dashboard-lines"><i></i><i></i><i></i></div><div class="dashboard-bars">${[42,70,52,90,64,78,96].map(h=>`<i style="--height:${h}%"></i>`).join('')}</div><div class="dashboard-ring"></div></div></div></div>`,note:`<a href="${qlik}" target="_blank" rel="noopener">Открыть корпоративный дашборд Qlik ↗</a>`},
    mileage:{kicker:'04 / УЧЁТНЫЕ ДАННЫЕ И ТЕЛЕМАТИКА',title:'Пробеги из путевого листа и Wialon',copy:'Подтягивать данные о пробегах автомобилей из двух источников и сопоставлять их в заявочной системе.',visual:`<div class="concept-flow mileage-flow">${links(['M164 47H250V105H300','M164 164H250V105H300','M430 105H515'])}<div class="flow-source source-top">${icon('file')}<b>Путевой лист</b></div><div class="flow-source source-bottom">${icon('pin')}<b>Wialon</b></div><div class="flow-core"><span>Заявочная система</span><b>PLTTK</b></div><div class="flow-result">${icon('car')}<b>Пробеги ТС</b></div></div>`,note:'План интеграции источников пробега.'},
    axapta:{kicker:'05 / СОСТОЯНИЕ И УЧЁТ ТРАНСПОРТА',title:'Передавать данные из PLTTK в Axapta',copy:'Передавать сведения о состоянии ТС, видеть ремонт и эксплуатацию. Получать от водителей обратную связь по автомобилю.',visual:`<div class="concept-flow axapta-flow">${links(['M174 80H398','M300 180V126H174'])}<div class="axapta-site flow-source"><b>PLTTK</b><span>Данные сайта</span></div><div class="axapta-database flow-source">${icon('database')}<b>Axapta</b></div><div class="driver-feedback">${icon('message')}<b>Обратная связь водителя</b></div><div class="concept-statuses"><span>В эксплуатации</span><span>В ремонте</span></div></div>`,note:'План обмена данными и сбора обратной связи.'},
    notify:{kicker:'06 / ПОНЯТНОЕ НАЗНАЧЕНИЕ ВОДИТЕЛЮ',title:'Заявитель и контакт в каждом сообщении',copy:'Настроить единый состав уведомлений: ФИО заявителя и контакты для связи вместе с автомобилем, адресом и временем.',visual:`<div class="notification-concept"><div class="concept-notification"><div class="notice-header"><i>${icon('message')}</i><div><span>Назначение транспорта</span><b>Информация о поездке</b></div><em>${icon('check')}</em></div><div class="notice-row"><span>Заявитель</span><b>ФИО сотрудника</b></div><div class="notice-row"><span>Контакт</span><b>Телефон для связи</b></div><div class="notice-footer">Автомобиль · адрес · дата и время</div></div></div>`,note:'Состав будущего уведомления показан как схема.'}
  };
  let selected = 'catalog';
  function render(key,animate=true){
    selected=key;
    const v=views[key];
    buttons.forEach(b=>{const active=b.dataset.future===key;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
    panel.dataset.view=key;
    panel.innerHTML=`<div class="future-copy"><p class="future-kicker">${v.kicker}</p><h3>${v.title}</h3><p>${v.copy}</p></div><div class="future-diagram">${v.visual}</div><div class="future-note">${v.note}</div>`;
    if(animate)document.dispatchEvent(new CustomEvent('presentation:reveal',{detail:{root:panel}}));
  }
  buttons.forEach((b,i)=>{
    b.addEventListener('click',()=>render(b.dataset.future));
    b.addEventListener('keydown',e=>{
      const offsets={ArrowRight:1,ArrowLeft:-1,ArrowDown:2,ArrowUp:-2};
      if(!(e.key in offsets))return;
      e.preventDefault();e.stopPropagation();
      const target=buttons[(i+offsets[e.key]+buttons.length)%buttons.length];
      target.focus();render(target.dataset.future);
    });
  });
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>render(selected,false));
  document.querySelectorAll('[data-order-page]').forEach(button=>button.addEventListener('click',()=>{
    const page=button.dataset.orderPage;
    const img=document.getElementById('orderPageImage');
    img.src=`assets/order-50201215-page-${page}.jpg`;
    img.alt=`Приказ о закреплении ТС от 01.07.2025, страница ${page}`;
    img.setAttribute('aria-label',`Увеличить: ${img.alt}`);
    img.parentElement.scrollTop=0;
    document.querySelectorAll('[data-order-page]').forEach(b=>{const active=b===button;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
    document.dispatchEvent(new CustomEvent('presentation:reveal',{detail:{root:img.parentElement}}));
  }));
  render(selected,false);
})();
