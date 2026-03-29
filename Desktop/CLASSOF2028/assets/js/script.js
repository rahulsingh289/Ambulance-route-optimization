'use strict';

/* ============================================================
   SKILL TABS
============================================================ */
document.querySelectorAll('.skill-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.skill-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.skill-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById('tab-' + tab.dataset.tab);
    if (panel) panel.classList.add('active');
  });
});

/* ============================================================
   VISIT COUNTER — backend API with localStorage fallback
============================================================ */
const visitKey = 'rs_portfolio_visits';
async function initVisits() {
  try {
    const res = await fetch('/api/visits', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      const el = document.getElementById('visitCount');
      if (el) el.textContent = Number(data.visits).toLocaleString();
      localStorage.setItem(visitKey, data.visits);
      return;
    }
  } catch (_) { /* offline — fall through to localStorage */ }
  // localStorage fallback
  const count = parseInt(localStorage.getItem(visitKey) || '0') + 1;
  localStorage.setItem(visitKey, count);
  const el = document.getElementById('visitCount');
  if (el) el.textContent = count.toLocaleString();
}
document.addEventListener('DOMContentLoaded', initVisits);

/* ============================================================
   DARK MODE TOGGLE
============================================================ */
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('rs_theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
if (themeToggle) themeToggle.checked = savedTheme === 'dark';

themeToggle?.addEventListener('change', () => {
  const theme = themeToggle.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('rs_theme', theme);
});

/* ============================================================
   MOBILE MENU
============================================================ */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');

mobileMenuBtn?.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  mobileMenuBtn.classList.toggle('open', isOpen);
  mobileMenuBtn.setAttribute('aria-expanded', isOpen);
});

mobileNav?.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    mobileMenuBtn.classList.remove('open');
  });
});

/* ============================================================
   HEADER SCROLL SHADOW
============================================================ */
const topHeader = document.getElementById('topHeader');
window.addEventListener('scroll', () => {
  topHeader?.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

/* ============================================================
   ACTIVE NAV ON SCROLL
============================================================ */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-section]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        const matches = link.dataset.section === id || link.getAttribute('href') === '#' + id;
        link.classList.toggle('active', matches);
      });
    }
  });
}, { rootMargin: '-35% 0px -60% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ============================================================
   QUICK ACCESS TABS
============================================================ */
document.querySelectorAll('.qa-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.qa-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = document.getElementById(tab.dataset.qa);
    if (target) {
      const header = document.getElementById('topHeader');
      const offset = header ? header.offsetHeight + 8 : 120;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ============================================================
   SCROLL TO TOP
============================================================ */
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  scrollTopBtn?.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ============================================================
   GALLERY LIGHTBOX
============================================================ */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let galleryImages = [];
let currentLightboxIndex = 0;

function openLightbox(index) {
  currentLightboxIndex = index;
  const item = galleryImages[index];
  lightboxImg.src = item.src;
  lightboxImg.alt = item.alt;
  lightboxCaption.textContent = item.caption;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxImg.src = ''; }, 300);
}

function navigateLightbox(dir) {
  currentLightboxIndex = (currentLightboxIndex + dir + galleryImages.length) % galleryImages.length;
  const item = galleryImages[currentLightboxIndex];
  lightboxImg.style.opacity = '0';
  setTimeout(() => {
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCaption.textContent = item.caption;
    lightboxImg.style.opacity = '1';
  }, 150);
}

lightboxImg.style.transition = 'opacity 0.15s ease';

document.querySelectorAll('.gallery-card').forEach((card, i) => {
  const img = card.querySelector('img');
  const title = card.querySelector('.gallery-title')?.textContent || '';
  const tag = card.querySelector('.gallery-tag')?.textContent || '';
  galleryImages.push({ src: img.src, alt: img.alt, caption: `${tag} — ${title}` });

  card.addEventListener('click', () => openLightbox(i));
  card.setAttribute('tabindex', '0');
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(i); });
});

lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', () => navigateLightbox(-1));
lightboxNext?.addEventListener('click', () => navigateLightbox(1));
lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (!lightbox?.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});

/* ============================================================
   CV DOWNLOAD TRACKER
============================================================ */
document.querySelectorAll('a[href*="rahulsingh50.pdf"]').forEach(link => {
  link.addEventListener('click', () => {
    fetch('/api/cv-download', { method: 'POST' }).catch(() => {});
  });
});

/* ============================================================
   PROJECTS — load from DB, render cards with reactions
============================================================ */
async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error();
    const { projects } = await res.json();
    if (!projects?.length) return;

    grid.innerHTML = projects.map(p => `
      <div class="card project-db-card" data-id="${p.id}">
        ${p.featured ? '<span class="proj-featured-badge">Featured</span>' : ''}
        <p class="card-heading">${p.title}</p>
        <p class="card-text">${p.description}</p>
        <div class="proj-tech-row">
          ${p.tech_stack.map(t => `<span class="tag-outline">${t}</span>`).join('')}
        </div>
        <div class="proj-links">
          ${p.github_url ? `<a href="${p.github_url}" target="_blank" class="btn-secondary proj-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </a>` : ''}
          ${p.live_url ? `<a href="${p.live_url}" target="_blank" class="btn-primary proj-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Live Demo
          </a>` : ''}
        </div>
        <div class="proj-reactions">
          <button class="reaction-btn" data-pid="${p.id}" data-type="fire">🔥 <span>${p.reactions.fire}</span></button>
          <button class="reaction-btn" data-pid="${p.id}" data-type="like">👍 <span>${p.reactions.like}</span></button>
          <button class="reaction-btn" data-pid="${p.id}" data-type="idea">💡 <span>${p.reactions.idea}</span></button>
        </div>
      </div>
    `).join('');

    // bind reaction buttons
    grid.querySelectorAll('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pid  = btn.dataset.pid;
        const type = btn.dataset.type;
        try {
          const r = await fetch('/api/reactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project_id: pid, type }),
          });
          const data = await r.json();
          if (data.reactions) {
            const card = grid.querySelector(`[data-id="${pid}"]`);
            card.querySelectorAll('.reaction-btn').forEach(b => {
              b.querySelector('span').textContent = data.reactions[b.dataset.type] ?? 0;
            });
          }
        } catch (_) {}
      });
    });

  } catch (_) { /* backend offline — static HTML fallback stays */ }
}

document.addEventListener('DOMContentLoaded', loadProjects);

/* ============================================================
   CONTACT FORM — CLIENT-SIDE VALIDATION + EMAILJS / FORMSPREE
============================================================ */
const contactForm = document.getElementById('contactForm');

function validateField(id, errId, msg) {
  const el = document.getElementById(id);
  const err = document.getElementById(errId);
  const val = el?.value.trim();
  if (!val) {
    el?.classList.add('error');
    if (err) err.textContent = msg;
    return false;
  }
  if (id === 'cf-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    el?.classList.add('error');
    if (err) err.textContent = 'Please enter a valid email address.';
    return false;
  }
  el?.classList.remove('error');
  if (err) err.textContent = '';
  return true;
}

['cf-name', 'cf-email', 'cf-subject', 'cf-message'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => {
    document.getElementById(id)?.classList.remove('error');
    const errId = 'err-' + id.replace('cf-', '');
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = '';
  });
});

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const v1 = validateField('cf-name',    'err-name',    'Name is required.');
  const v2 = validateField('cf-email',   'err-email',   'Email is required.');
  const v3 = validateField('cf-subject', 'err-subject', 'Subject is required.');
  const v4 = validateField('cf-message', 'err-message', 'Message is required.');
  if (!v1 || !v2 || !v3 || !v4) return;

  const btn = document.getElementById('cfSubmit');
  const btnText = btn.querySelector('.btn-text');
  const btnLoader = btn.querySelector('.btn-loader');
  const successEl = document.getElementById('formSuccess');

  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline';

  // Try backend API first, fall back to localStorage
  let sent = false;
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    document.getElementById('cf-name').value.trim(),
        email:   document.getElementById('cf-email').value.trim(),
        subject: document.getElementById('cf-subject').value.trim(),
        message: document.getElementById('cf-message').value.trim(),
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) sent = true;
    else throw new Error(data.error || 'Server error');
  } catch (err) {
    // localStorage fallback
    const messages = JSON.parse(localStorage.getItem('rs_messages') || '[]');
    messages.push({
      name:    document.getElementById('cf-name').value.trim(),
      email:   document.getElementById('cf-email').value.trim(),
      subject: document.getElementById('cf-subject').value.trim(),
      message: document.getElementById('cf-message').value.trim(),
      date:    new Date().toISOString(),
    });
    localStorage.setItem('rs_messages', JSON.stringify(messages));
    sent = true;
  }

  btn.disabled = false;
  btnText.style.display = 'inline';
  btnLoader.style.display = 'none';
  if (sent) {
    contactForm.reset();
    successEl.style.display = 'flex';
    setTimeout(() => { successEl.style.display = 'none'; }, 5000);
  }
});

/* ============================================================
   QR CODE GENERATION (using qrcode.js CDN)
============================================================ */
function loadQRCode() {
  const qrEl = document.getElementById('qrCode');
  const qrUrlEl = document.getElementById('qrUrl');
  const dlBtn = document.getElementById('qrDownload');
  if (!qrEl) return;

  const url = window.location.href;
  if (qrUrlEl) qrUrlEl.textContent = url;

  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  script.onload = () => {
    qrEl.innerHTML = '';
    const qr = new QRCode(qrEl, {
      text: url,
      width: 180,
      height: 180,
      colorDark: '#111827',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    // Download button
    dlBtn?.addEventListener('click', () => {
      const canvas = qrEl.querySelector('canvas');
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = 'rahulsingh-portfolio-qr.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };
  document.head.appendChild(script);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadQRCode);
} else {
  loadQRCode();
}

/* ============================================================
   EVENTS FILTER
============================================================ */
document.querySelectorAll('.ev-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ev-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('#eventsGrid .gallery-card').forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !match);
    });
  });
});

/* ============================================================
   SMOOTH SCROLL FOR ALL ANCHOR LINKS
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const header = document.getElementById('topHeader');
    const offset = header ? header.offsetHeight + 8 : 120;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
