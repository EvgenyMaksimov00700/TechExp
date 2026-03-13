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

/* Request modal */
const requestModal = document.getElementById('request-modal');
const formService = document.getElementById('form-service');

function openRequestModal(service) {
  if (!requestModal) return;
  if (typeof setNav === 'function') setNav(false);
  if (formService) formService.value = service || '';
  requestModal.showModal();
}

function closeRequestModal() {
  if (requestModal) requestModal.close();
}

document.querySelectorAll('[data-open-modal]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const service = btn.getAttribute('data-service') || '';
    openRequestModal(service);
  });
});

requestModal?.addEventListener('click', (e) => {
  if (e.target === requestModal) closeRequestModal();
});

document.querySelectorAll('[data-close-modal]').forEach((btn) => {
  btn.addEventListener('click', closeRequestModal);
});

requestModal?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeRequestModal();
});

function handleLeadSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn?.textContent;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка…';
  }
  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' },
  })
    .then((res) => res.json().catch(() => ({})))
    .then((data) => {
      if (data.success === 'true' || data.success === true) {
        window.location.href = 'thank-you.html';
        return;
      }
      alert(data.message || data.error || 'Не удалось отправить. Попробуйте позже или напишите нам в мессенджер.');
    })
    .catch(() => alert('Ошибка сети. Попробуйте позже или напишите нам в мессенджер.'))
    .finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
}

document.querySelectorAll('.js-lead-form').forEach((form) => {
  form.addEventListener('submit', handleLeadSubmit);
});
