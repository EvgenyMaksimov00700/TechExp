/* Mobile nav */
const header = document.querySelector('[data-elevate]');
const navBtn = document.querySelector('.navBtn');
const nav = document.getElementById('nav');

function setNav(open) {
  if (!navBtn || !nav) return;
  nav.dataset.open = open ? 'true' : 'false';
  navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.style.overflow = open ? 'hidden' : '';
}

if (navBtn && nav) {
  navBtn.addEventListener('click', () => setNav(nav.dataset.open !== 'true'));
  nav.addEventListener('click', (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && (t.matches('a[href^="#"]') || t.hasAttribute('data-open-modal'))) {
      setNav(false);
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 760) setNav(false);
  });
}

/* Header shadow on scroll */
function onScroll() {
  const y = window.scrollY || 0;
  if (header) header.dataset.shadow = y > 6 ? 'true' : 'false';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* “Chips” interactive panel */
const chipMap = {
  industrial: {
    title: 'Промоборудование',
    desc: 'Оценка состояния, причин отказа и соответствия. Заключение с расчётами и фиксацией.',
  },
  auto: {
    title: 'Автотехническая',
    desc: 'Повреждения, методики расчёта, стоимость ремонта. Проверка документов и фото.',
  },
  dtp: {
    title: 'Обстоятельства ДТП',
    desc: 'Сценарии, траектории, скорости, видимость. Причинно‑следственная связь и расчёты.',
  },
  eng: {
    title: 'Инженерно‑техническая',
    desc: 'Инженерные причины событий: нагрузки, материалы, регламенты. Доказательно и аккуратно.',
  },
  review: {
    title: 'Рецензирование',
    desc: 'Контроль качества заключения: ошибки методик/данных/логики, которые меняют вывод.',
  },
  '44fz': {
    title: 'Контрактная (44‑ФЗ)',
    desc: 'Приёмка результатов, подтверждение объёмов/качества и оформление актов по регламенту.',
  },
};

const chips = Array.from(document.querySelectorAll('.chip'));
const cardTitle = document.querySelector('[data-card-title]');
const cardDesc = document.querySelector('[data-card-desc]');

function selectChip(key) {
  const data = chipMap[key];
  if (!data) return;
  chips.forEach((c) => c.setAttribute('aria-pressed', c.dataset.chip === key ? 'true' : 'false'));
  if (cardTitle) cardTitle.textContent = data.title;
  if (cardDesc) cardDesc.textContent = data.desc;
}

chips.forEach((c) => {
  c.setAttribute('aria-pressed', 'false');
  c.addEventListener('click', () => selectChip(String(c.dataset.chip || '')));
});

