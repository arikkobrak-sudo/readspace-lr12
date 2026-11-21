// Планувальник читання ReadSpace (Vanilla JS, ізольований модуль)
(() => {
  "use strict";

  // Бізнес-правила
  const RULES = {
    pages: { min: 1, max: 5000 },
    minutes: { min: 5, max: 600 },
  };
  // Темп, сторінок за годину (білий список значень select)
  const PACE = { slow: 20, medium: 30, fast: 45 };

  const ERROR_BORDER = "border-red-500";
  const DEFAULT_BORDER = "border-line";

  const numberFormat = new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 1,
  });
  const dateFormat = new Intl.DateTimeFormat("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // { value } або { error } для цілого числа в межах rule
  function parseInteger(input, rule, labels) {
    if (input.validity.badInput)
      return { error: "Введи число цифрами." };
    const raw = input.value.trim();
    if (raw === "") return { error: labels.empty };
    // Лише цифри: відсікає експоненту (1e3), знаки та пробіли
    if (/^-/.test(raw)) {
      return { error: `Допустимо від ${rule.min} до ${rule.max}.` };
    }
    if (/^\d+[.,]\d+$/.test(raw)) return { error: labels.integer };
    if (!/^\d+$/.test(raw)) return { error: "Введи число цифрами." };
    const value = Number(raw);
    if (!Number.isFinite(value))
      return { error: "Введи число цифрами." };
    if (!Number.isInteger(value))
      return { error: labels.integer };
    if (value < rule.min || value > rule.max) {
      return {
        error: `Допустимо від ${rule.min} до ${rule.max}.`,
      };
    }
    return { value };
  }

  // Дата останньої сторінки (старт — сьогодні)
  function getFinishDate(readingDays, withWeekends) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    let counted = 0;
    for (;;) {
      const day = date.getDay();
      if (withWeekends || (day !== 0 && day !== 6)) counted += 1;
      if (counted === readingDays) return date;
      date.setDate(date.getDate() + 1);
    }
  }

  function calculatePlan({
    pages,
    minutes,
    pagesPerHour,
    withWeekends,
  }) {
    const perDay = (minutes / 60) * pagesPerHour;
    const days = Math.ceil(pages / perDay);
    return {
      perDay,
      days,
      finishDate: getFinishDate(days, withWeekends),
    };
  }

  function initPlanner(root) {
    const el = {
      pages: root.querySelector('[data-planner-field="pages"]'),
      minutes: root.querySelector(
        '[data-planner-field="minutes"]',
      ),
      pace: root.querySelector('[data-planner-field="pace"]'),
      weekends: root.querySelector(
        '[data-planner-field="weekends"]',
      ),
      perDay: root.querySelector('[data-planner-out="perDay"]'),
      days: root.querySelector('[data-planner-out="days"]'),
      date: root.querySelector('[data-planner-out="date"]'),
      status: root.querySelector("[data-planner-status]"),
    };

    const missing = Object.keys(el).filter((key) => !el[key]);
    if (missing.length > 0) {
      const list = missing.join(", ");
      console.warn(
        `Планувальник читання не запущено, бракує: ${list}`,
      );
      return;
    }

    function setFieldState(key, message) {
      const field = el[key];
      const errorBox = root.querySelector(
        `[data-planner-error="${key}"]`,
      );
      field.classList.toggle(ERROR_BORDER, Boolean(message));
      field.classList.toggle(DEFAULT_BORDER, !message);
      field.setAttribute(
        "aria-invalid",
        String(Boolean(message)),
      );
      if (errorBox) errorBox.textContent = message;
    }

    function renderEmpty(message) {
      el.perDay.textContent = "—";
      el.days.textContent = "—";
      el.date.textContent = "—";
      el.status.textContent = message;
    }

    function update() {
      const pages = parseInteger(el.pages, RULES.pages, {
        empty: "Вкажи кількість сторінок.",
        integer: "Кількість сторінок — ціле число.",
      });
      const minutes = parseInteger(el.minutes, RULES.minutes, {
        empty: "Вкажи, скільки хвилин на день читаєш.",
        integer: "Кількість хвилин — ціле число.",
      });
      const pagesPerHour = Object.hasOwn(PACE, el.pace.value)
        ? PACE[el.pace.value]
        : null;

      setFieldState("pages", pages.error || "");
      setFieldState("minutes", minutes.error || "");
      setFieldState(
        "pace",
        pagesPerHour ? "" : "Обери темп зі списку.",
      );

      if (pages.error || minutes.error || !pagesPerHour) {
        renderEmpty("Виправ виділені поля, щоб побачити план.");
        return;
      }

      const plan = calculatePlan({
        pages: pages.value,
        minutes: minutes.value,
        pagesPerHour,
        withWeekends: el.weekends.checked,
      });

      el.perDay.textContent = numberFormat.format(plan.perDay);
      el.days.textContent = String(plan.days);
      el.date.textContent = dateFormat.format(plan.finishDate);
      el.status.textContent = el.weekends.checked
        ? "Читаєш щодня, починаючи з сьогодні."
        : "Читаєш лише в будні, вихідні не враховано.";
    }

    el.pages.addEventListener("input", update);
    el.minutes.addEventListener("input", update);
    el.pace.addEventListener("change", update);
    el.weekends.addEventListener("change", update);
    root
      .querySelector("form")
      ?.addEventListener("submit", (event) =>
        event.preventDefault(),
      );

    update();
  }

  const start = () =>
    document
      .querySelectorAll("[data-planner]")
      .forEach(initPlanner);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
