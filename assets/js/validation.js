'use strict';

// ===== Регулярні вирази =====
// Ім'я: слова з літер будь-якої абетки, між ними один пробіл, апостроф або дефіс.
const NAME_REGEX = /^\p{L}+(?:[ '’ʼ-]\p{L}+)*$/u;
// Email: локальна частина @ домен . зона з 2+ літер.
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;
// Телефон: +380 і рівно 9 цифр, нічого більше.
const PHONE_REGEX = /^\+380\d{9}$/;

const NAME_MIN = 2;
const NAME_MAX = 50;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1000;

const ERROR_CLASS = 'border-red-500';
const SUCCESS_CLASS = 'border-green-500';
const DEFAULT_CLASS = 'border-line';

// Кількість символів з урахуванням emoji (сурогатних пар).
function charCount(value) {
  return Array.from(value).length;
}

// ===== Валідатори: повертають текст помилки або '' =====
function validateName(value) {
  const name = value.trim();
  if (name === '') return "Введіть ім'я.";
  if (charCount(name) < NAME_MIN) return `Ім'я має містити щонайменше ${NAME_MIN} символи.`;
  if (charCount(name) > NAME_MAX) return `Ім'я не може бути довшим за ${NAME_MAX} символів.`;
  if (!NAME_REGEX.test(name)) return "Ім'я може містити лише літери, пробіл, апостроф або дефіс.";
  return '';
}

function validateEmail(value) {
  const email = value.trim();
  if (email === '') return 'Введіть email.';
  if (!EMAIL_REGEX.test(email)) return 'Введіть email у форматі name@example.com.';
  return '';
}

function validatePhone(value) {
  const phone = value.trim();
  if (phone === '') return 'Введіть номер телефону.';
  if (PHONE_REGEX.test(phone)) return '';
  if (!phone.startsWith('+380')) return 'Номер має починатися з +380.';
  if (/\D/.test(phone.slice(1))) return 'Після «+» дозволені лише цифри — без пробілів, дужок і дефісів.';
  return `Після +380 має бути рівно 9 цифр (зараз ${phone.length - 4}).`;
}

function validateMessage(value) {
  const message = value.trim();
  const length = charCount(message);
  if (length === 0) return 'Напишіть повідомлення.';
  if (length < MESSAGE_MIN) return `Повідомлення має містити щонайменше ${MESSAGE_MIN} символів (зараз ${length}).`;
  if (length > MESSAGE_MAX) return `Повідомлення не може бути довшим за ${MESSAGE_MAX} символів.`;
  return '';
}

function validateAgreement(checked) {
  return checked ? '' : 'Потрібна ваша згода з політикою конфіденційності.';
}

// ===== UI-хелпери =====
// Для чекбокса рамка малюється на обгортці, для решти полів — на самому полі.
function getBorderTarget(field) {
  return field.type === 'checkbox' ? field.closest('[data-field-box]') : field;
}

function getErrorElement(field) {
  return document.getElementById(`${field.id}-error`);
}

function showError(field, message) {
  const target = getBorderTarget(field);
  target.classList.remove(DEFAULT_CLASS, SUCCESS_CLASS);
  target.classList.add(ERROR_CLASS);
  getErrorElement(field).textContent = message;
  field.setAttribute('aria-invalid', 'true');
}

function showSuccess(field) {
  const target = getBorderTarget(field);
  target.classList.remove(DEFAULT_CLASS, ERROR_CLASS);
  target.classList.add(SUCCESS_CLASS);
  getErrorElement(field).textContent = '';
  field.setAttribute('aria-invalid', 'false');
}

function clearError(field) {
  const target = getBorderTarget(field);
  target.classList.remove(ERROR_CLASS, SUCCESS_CLASS);
  target.classList.add(DEFAULT_CLASS);
  getErrorElement(field).textContent = '';
  field.setAttribute('aria-invalid', 'false');
}

// ===== Логіка форми =====
const form = document.getElementById('feedback-form');
const fields = {
  name: form.elements.name,
  email: form.elements.email,
  phone: form.elements.phone,
  message: form.elements.message,
  agreement: form.elements.agreement,
};

const validators = {
  name: () => validateName(fields.name.value),
  email: () => validateEmail(fields.email.value),
  phone: () => validatePhone(fields.phone.value),
  message: () => validateMessage(fields.message.value),
  agreement: () => validateAgreement(fields.agreement.checked),
};

// dirty — користувач щось увів; touched — після цього вийшов із поля (або натиснув «Надіслати»).
const dirty = new Set();
const touched = new Set();

function validateField(key) {
  const message = validators[key]();
  if (message) {
    showError(fields[key], message);
    return false;
  }
  showSuccess(fields[key]);
  return true;
}

['name', 'email', 'phone', 'message'].forEach((key) => {
  const field = fields[key];

  field.addEventListener('input', () => {
    dirty.add(key);
    if (touched.has(key)) validateField(key);
  });

  field.addEventListener('blur', () => {
    if (!dirty.has(key)) return; // поле лише пройшли Tab-ом — помилку не показуємо
    touched.add(key);
    validateField(key);
  });
});

fields.agreement.addEventListener('change', () => {
  touched.add('agreement');
  validateField('agreement');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (isModalOpen()) return;

  const keys = Object.keys(fields);
  keys.forEach((key) => touched.add(key));
  const results = keys.map((key) => validateField(key));
  const firstInvalidIndex = results.indexOf(false);

  if (firstInvalidIndex !== -1) {
    fields[keys[firstInvalidIndex]].focus();
    return;
  }

  form.reset();
  keys.forEach((key) => clearError(fields[key]));
  dirty.clear();
  touched.clear();
  openModal();
});

// ===== Модальне вікно =====
const modal = document.getElementById('success-modal');
const pageRegions = document.querySelectorAll('body > header, body > main, body > footer');
const FOCUSABLE = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';
let lastFocused = null;

function isModalOpen() {
  return !modal.classList.contains('hidden');
}

function openModal() {
  lastFocused = document.activeElement;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  pageRegions.forEach((el) => { el.inert = true; });
  document.body.classList.add('overflow-hidden');
  modal.querySelector('[data-modal-close]').focus();
}

function closeModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  pageRegions.forEach((el) => { el.inert = false; });
  document.body.classList.remove('overflow-hidden');
  (lastFocused instanceof HTMLElement ? lastFocused : fields.name).focus();
}

modal.querySelectorAll('[data-modal-close]').forEach((button) => {
  button.addEventListener('click', closeModal);
});

// Клік по затемненню закриває вікно, клік усередині білої картки — ні.
modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (!isModalOpen()) return;

  if (event.key === 'Escape') {
    closeModal();
    return;
  }

  // Утримання фокусу всередині модалки.
  if (event.key === 'Tab') {
    const focusable = Array.from(modal.querySelectorAll(FOCUSABLE));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
