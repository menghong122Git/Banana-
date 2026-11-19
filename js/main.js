// =========================================
// Helpers
// =========================================
const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];

// =========================================
// 1. Mobile navigation
// =========================================
const navToggle = $('#navToggle');
const navLinks = $('#navLinks');

function setMenu(open) {
  navLinks.classList.toggle('is-open', open);
  navToggle.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', open);
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
$$('.nav__link').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

// =========================================
// 2. Dark / light theme (saved in localStorage)
// =========================================
const themeToggle = $('#themeToggle');
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme') ||
  (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}
applyTheme(savedTheme);
themeToggle.addEventListener('click', () =>
  applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark')
);

// =========================================
// 3. Header shadow + back-to-top button
// =========================================
const header = $('#header');
const toTop = $('#toTop');

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', scrollY > 20);
  toTop.classList.toggle('is-visible', scrollY > 500);
});
toTop.addEventListener('click', () => scrollTo({ top: 0 }));

// =========================================
// 4. Active link on scroll
// =========================================
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    $$('.nav__link').forEach(link =>
      link.classList.toggle('is-active', link.hash === `#${entry.target.id}`)
    );
  });
}, { rootMargin: '-45% 0px -55% 0px' });
$$('main section').forEach(sec => sectionObserver.observe(sec));

// =========================================
// 5. Typing effect
// =========================================
const roles = ['Front-End Developer', 'Web Designer', 'Problem Solver'];
const typedEl = $('#typed');
let roleIndex = 0, charIndex = 0, deleting = false;

function type() {
  const word = roles[roleIndex];
  typedEl.textContent = word.slice(0, charIndex);

  if (!deleting && charIndex < word.length) charIndex++;
  else if (deleting && charIndex > 0) charIndex--;
  else {
    deleting = !deleting;
    if (!deleting) roleIndex = (roleIndex + 1) % roles.length;
    return setTimeout(type, deleting ? 1500 : 300);
  }
  setTimeout(type, deleting ? 50 : 100);
}
type();

// =========================================
// 6. Reveal on scroll + skill bars + counters
// =========================================
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('is-visible');

    const fill = $('.skill__fill', el);
    if (fill) fill.style.width = fill.dataset.width + '%';

    $$('[data-count]', el).forEach(animateCount);
    obs.unobserve(el);
  });
}, { threshold: 0.2 });
$$('.reveal').forEach(el => revealObserver.observe(el));

function animateCount(el) {
  const target = +el.dataset.count;
  const duration = 1500;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(progress * target) + (progress === 1 ? '+' : '');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// =========================================
// 7. Project filter
// =========================================
const filters = $$('.filter');
const projects = $$('.project');

filters.forEach(btn => btn.addEventListener('click', () => {
  filters.forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  const cat = btn.dataset.filter;
  projects.forEach(p =>
    p.classList.toggle('is-hidden', cat !== 'all' && p.dataset.category !== cat)
  );
}));

// =========================================
// 8. Contact form validation
// =========================================
const form = $('#contactForm');
const status = $('#formStatus');

function validateField(input) {
  const field = input.closest('.field');
  const error = $('.error', field);
  let msg = '';

  if (input.validity.valueMissing) msg = 'This field is required.';
  else if (input.validity.typeMismatch) msg = 'Please enter a valid email.';
  else if (input.validity.tooShort) msg = `Please write at least ${input.minLength} characters.`;

  error.textContent = msg;
  field.classList.toggle('has-error', !!msg);
  return !msg;
}

$$('input, textarea', form).forEach(input =>
  input.addEventListener('input', () => validateField(input))
);

form.addEventListener('submit', e => {
  e.preventDefault();
  const valid = $$('input, textarea', form).map(validateField).every(Boolean);
  if (!valid) { status.textContent = ''; return; }

  status.textContent = '✅ Thanks! Your message has been sent.';
  form.reset();
  setTimeout(() => (status.textContent = ''), 4000);
});

// =========================================
// 9. Footer year
// =========================================
$('#year').textContent = new Date().getFullYear();
