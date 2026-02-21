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

/* Modal */
const modal = document.getElementById('modal');
const modalService = document.getElementById('modalService');
const openModalBtns = Array.from(document.querySelectorAll('[data-open-modal]'));

function closeModal() {
  if (!(modal instanceof HTMLDialogElement)) return;
  if (modal.open) modal.close();
}

function openModal(serviceText) {
  if (!(modal instanceof HTMLDialogElement)) return;
  if (modalService && typeof serviceText === 'string' && serviceText.trim()) {
    modalService.value = serviceText.trim();
  } else if (modalService) {
    modalService.value = '';
  }
  document.body.style.overflow = 'hidden';
  modal.showModal();
}

openModalBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const service = btn.getAttribute('data-service') || '';
    openModal(service);
  });
});

/* CTA buttons in cards set modal service */
document.addEventListener('click', (e) => {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return;
  if (t.matches('a[href^="#"]')) {
    // close modal if someone navigates using anchors from within it
    if (modal instanceof HTMLDialogElement && modal.open) modal.close();
  }
});

/* Forms: simulate submit + store locally */
function normalizePhone(raw) {
  return raw.replace(/[^\d+]/g, '');
}

function saveLead(payload) {
  try {
    const key = 'vector_leads_v1';
    const prev = JSON.parse(localStorage.getItem(key) || '[]');
    prev.unshift(payload);
    localStorage.setItem(key, JSON.stringify(prev.slice(0, 50)));
  } catch {
    // ignore
  }
}

function flashMessage(text) {
  const el = document.createElement('div');
  el.style.position = 'fixed';
  el.style.left = '18px';
  el.style.right = '18px';
  el.style.bottom = '18px';
  el.style.zIndex = '9999';
  el.style.padding = '12px 14px';
  el.style.borderRadius = '16px';
  el.style.border = '1px solid rgba(255,255,255,.14)';
  el.style.background = 'rgba(10,14,26,.92)';
  el.style.backdropFilter = 'blur(10px)';
  el.style.boxShadow = '0 18px 60px rgba(0,0,0,.35)';
  el.style.color = 'rgba(255,255,255,.92)';
  el.style.fontWeight = '800';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function handleForm(form, source) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      source,
      name: String(fd.get('name') || '').trim(),
      phone: normalizePhone(String(fd.get('phone') || '')).trim(),
      service: String(fd.get('service') || '').trim(),
      message: String(fd.get('message') || '').trim(),
      createdAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    saveLead(payload);
    form.reset();
    flashMessage('Заявка отправлена. Мы свяжемся с вами в ближайшее время.');
    if (modal instanceof HTMLDialogElement && modal.open) modal.close();
  });
}

const leadForm = document.getElementById('leadForm');
if (leadForm instanceof HTMLFormElement) handleForm(leadForm, 'page_form');

if (modal instanceof HTMLDialogElement) {
  modal.addEventListener('click', (e) => {
    // click on backdrop closes
    if (e.target === modal) closeModal();
  });
  modal.addEventListener('close', () => {
    document.body.style.overflow = '';
  });
  modal.addEventListener('cancel', () => {
    // ESC closes by default; ensure scroll unlock via "close" event too
    // (keep handler to be explicit and future-safe)
  });

  modal.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', closeModal);
  });

  const modalForm = modal.querySelector('form');
  if (modalForm instanceof HTMLFormElement) handleForm(modalForm, 'modal_form');
}

/* Improve tel input a bit */
document.querySelectorAll('input[inputmode="tel"]').forEach((input) => {
  input.addEventListener('input', () => {
    const v = input.value;
    // Keep it user-friendly; don't hard-mask, just normalize obvious duplicates
    if (v.includes('..')) input.value = v.replace(/\.+/g, '.');
  });
});

