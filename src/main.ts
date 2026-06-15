import { translations, type Locale } from "./i18n";

// ── i18n ─────────────────────────────────────────────────────────────────────

function getStoredLocale(): Locale | null {
  return localStorage.getItem("locale") as Locale | null;
}

function getBrowserLocale(): Locale {
  return navigator.language.startsWith("es") ? "es" : "en";
}

function applyLocale(locale: Locale): void {
  const t = translations[locale];
  document.documentElement.setAttribute("lang", locale);
  localStorage.setItem("locale", locale);

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n!;
    if (key in t) el.textContent = t[key as keyof typeof t];
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-html]").forEach((el) => {
    const key = el.dataset.i18nHtml!;
    if (key in t) el.innerHTML = t[key as keyof typeof t];
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((el) => {
    const key = el.dataset.i18nAria!;
    if (key in t) el.setAttribute("aria-label", t[key as keyof typeof t]);
  });

  const langToggle = document.getElementById("langToggle");
  if (langToggle) langToggle.textContent = locale === "en" ? "ES" : "EN";

  // Keep typed effect in sync with active locale
  const typedEl = document.getElementById("typed");
  if (typedEl) {
    typedEl.textContent = "";
    runTyped(typedEl, locale);
  }
}

function initLocale(): void {
  const locale = getStoredLocale() ?? getBrowserLocale();
  applyLocale(locale);
}

function toggleLocale(): void {
  const current = (localStorage.getItem("locale") ?? getBrowserLocale()) as Locale;
  applyLocale(current === "en" ? "es" : "en");
}

// ── Theme toggle ──────────────────────────────────────────────────────────────

type Theme = "light" | "dark";

function getStoredTheme(): Theme | null {
  return localStorage.getItem("theme") as Theme | null;
}

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function initTheme(): void {
  applyTheme(getStoredTheme() ?? getSystemTheme());
}

function toggleTheme(): void {
  const current = document.documentElement.getAttribute("data-theme") as Theme;
  applyTheme(current === "dark" ? "light" : "dark");
}

initTheme();
document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);

// ── Mobile nav ────────────────────────────────────────────────────────────────

const burger = document.getElementById("navBurger") as HTMLButtonElement | null;
const navLinks = document.querySelector(".nav__links") as HTMLElement | null;

burger?.addEventListener("click", () => {
  const expanded = burger.getAttribute("aria-expanded") === "true";
  burger.setAttribute("aria-expanded", String(!expanded));
  navLinks?.classList.toggle("is-open");
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    burger?.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
  });
});

// ── Typed effect ──────────────────────────────────────────────────────────────

const phrasesByLocale: Record<Locale, string[]> = {
  en: [
    "Backend Developer",
    "Java + Spring Boot",
    "Banking systems (T24)",
    "Based in La Plata, Argentina",
  ],
  es: [
    "Desarrollador Backend",
    "Java + Spring Boot",
    "Sistemas bancarios (T24)",
    "La Plata, Argentina",
  ],
};

let currentTypedCancel: (() => void) | null = null;

function runTyped(el: HTMLElement, locale: Locale): void {
  if (currentTypedCancel) currentTypedCancel();

  const phrases = phrasesByLocale[locale];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let cancelled = false;

  const TYPING_SPEED = 80;
  const DELETING_SPEED = 40;
  const PAUSE_END = 1800;
  const PAUSE_START = 300;

  currentTypedCancel = () => { cancelled = true; };

  function tick(): void {
    if (cancelled) return;
    const phrase = phrases[phraseIndex];

    if (deleting) {
      charIndex--;
      el.textContent = phrase.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
    } else {
      charIndex++;
      el.textContent = phrase.slice(0, charIndex);
      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
    }

    setTimeout(tick, deleting ? DELETING_SPEED : TYPING_SPEED);
  }

  setTimeout(tick, 600);
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
  revealObserver.observe(el);
});

// ── Skill bars (reveal on scroll) ────────────────────────────────────────────

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll<HTMLElement>(".skill-item__fill").forEach((bar) => {
  skillObserver.observe(bar);
});

// ── Active nav link on scroll ─────────────────────────────────────────────────

const sections = document.querySelectorAll<HTMLElement>("section[id]");
const navAnchors = document.querySelectorAll<HTMLAnchorElement>(".nav__links a");

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navAnchors.forEach((a) => {
          a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach((s) => navObserver.observe(s));

// ── Footer year ───────────────────────────────────────────────────────────────

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// ── Download CV (print to PDF) ────────────────────────────────────────────────

document.getElementById("downloadCV")?.addEventListener("click", () => {
  // Force all scroll-animated elements and skill bars to their final state
  document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
    el.classList.add("is-visible");
  });
  document.querySelectorAll<HTMLElement>(".skill-item__fill").forEach((el) => {
    el.classList.add("is-visible");
  });
  window.print();
});

// ── Init (order matters: theme first, then locale which kicks off typed) ──────

document.getElementById("langToggle")?.addEventListener("click", toggleLocale);
initLocale();
