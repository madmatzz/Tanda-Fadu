// Interacciones de la página del design system: tema, copiar tokens, demos e iconos.
// No depende de frameworks ni del estado de la app.

(() => {
  const root = document.documentElement;
  const toast = document.querySelector("[data-toast]");
  let toastTimer;

  /** Convierte el valor computado de un token de color a un formato legible. */
  function formatColor(value) {
    const raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.startsWith("#")) return raw.toUpperCase();

    const match = raw.match(/^rgba?\(([^)]+)\)$/i);
    if (!match) return raw;

    const parts = match[1].split(/[\s,/]+/).filter(Boolean);
    const [r, g, b] = parts.slice(0, 3).map(Number);
    const alpha = parts[3] === undefined ? 1 : Number(parts[3]);
    if ([r, g, b].some((channel) => Number.isNaN(channel))) return raw;
    if (alpha < 1) return `rgb(${r} ${g} ${b} / ${alpha})`;

    return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
  }

  /** Los valores de la página se leen de tokens.css, así el tema claro y oscuro siempre coinciden. */
  function updateTokenValues() {
    const styles = getComputedStyle(root);
    document.querySelectorAll("[data-token-value]").forEach((element) => {
      const token = element.getAttribute("data-token-value");
      const value = styles.getPropertyValue(token).trim();
      if (!value) return;
      element.textContent = element.getAttribute("data-format") === "color" ? formatColor(value) : value;
    });
  }

  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // Fallback para abrir el archivo directamente o navegadores sin clipboard API.
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    const short = text.length > 54 ? `${text.slice(0, 51)}…` : text;
    showToast(`Copiado: ${short}`);
  }

  function applyTheme(theme) {
    const dark = theme === "imprenta";
    root.classList.toggle("theme-imprenta", dark);
    document.querySelectorAll("[data-set-theme]").forEach((button) => {
      const active = button.getAttribute("data-set-theme") === theme;
      button.classList.toggle("is-checked", active);
      button.setAttribute("aria-pressed", String(active));
    });
    updateTokenValues();
    try {
      window.localStorage.setItem("tanda-ds-theme", theme);
    } catch (error) {
      // El navegador puede bloquear localStorage; no es crítico para la documentación.
    }
  }

  /** La barra superior cambia de alto en mobile; el índice y los saltos se ajustan a ella. */
  function syncTopbarHeight() {
    const topbar = document.querySelector(".ds-topbar");
    if (!topbar) return;
    const height = Math.round(topbar.getBoundingClientRect().height);
    root.style.setProperty("--ds-topbar-height", `${height}px`);
  }

  document.querySelectorAll("[data-set-theme]").forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.getAttribute("data-set-theme")));
  });

  const queryTheme = new URLSearchParams(window.location.search).get("tema");
  let savedTheme = "estudiante";
  try {
    savedTheme = window.localStorage.getItem("tanda-ds-theme") || "estudiante";
  } catch (error) {
    // Sin persistencia: se usa el tema claro.
  }
  if (queryTheme === "imprenta" || queryTheme === "estudiante") savedTheme = queryTheme;
  applyTheme(savedTheme === "imprenta" ? "imprenta" : "estudiante");

  syncTopbarHeight();
  window.addEventListener("resize", syncTopbarHeight);
  if (document.fonts?.ready) document.fonts.ready.then(syncTopbarHeight);

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-copy]");
    if (!target) return;
    event.preventDefault();
    copyText(target.getAttribute("data-copy"));
  });

  /** Pinta los SVG de Lucide que están marcados con data-icon. */
  function hydrateIcons(scope = document) {
    if (typeof icon !== "function") return;
    scope.querySelectorAll("[data-icon]").forEach((element) => {
      const name = element.getAttribute("data-icon");
      if (!name) return;
      element.innerHTML = icon(name, element.getAttribute("data-icon-size") || "icon");
    });
  }

  hydrateIcons();

  // ---------- Demos interactivas ----------

  document.querySelectorAll("[data-demo-segmented]").forEach((group) => {
    group.addEventListener("change", (event) => {
      if (!event.target.matches('input[type="radio"]')) return;
      group.querySelectorAll(".segmented-option").forEach((option) => {
        option.classList.toggle("is-checked", option.contains(event.target));
      });
    });
  });

  // ---------- Navegación activa ----------

  const navLinks = [...document.querySelectorAll('.ds-sidebar a[href^="#"]')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  let lastActiveId = null;

  const setActiveLink = (id) => {
    let activeLink = null;
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) {
        link.setAttribute("aria-current", "true");
        activeLink = link;
      } else {
        link.removeAttribute("aria-current");
      }
    });

    // En mobile el índice es horizontal: al cambiar de sección, acercamos el link activo.
    if (activeLink && id !== lastActiveId && window.innerWidth <= 900) {
      const scroller = activeLink.closest(".ds-sidebar");
      const linkRect = activeLink.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      if (linkRect.left < scrollerRect.left || linkRect.right > scrollerRect.right) {
        const left = scroller.scrollLeft + linkRect.left - scrollerRect.left - (scroller.clientWidth - linkRect.width) / 2;
        scroller.scrollTo({ left, behavior: "smooth" });
      }
    }
    lastActiveId = id;
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setActiveLink(link.getAttribute("href").slice(1)));
  });

  const updateActiveLink = () => {
    if (!sections.length) return;
    const topbarHeight = Number.parseFloat(getComputedStyle(root).getPropertyValue("--ds-topbar-height")) || 72;
    const offset = topbarHeight + (window.innerWidth <= 900 ? 64 : 32) + 2;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) current = section;
    });
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) current = sections[sections.length - 1];
    if (current) setActiveLink(current.id);
  };

  let scrollTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(() => {
        updateActiveLink();
        scrollTicking = false;
      });
    },
    { passive: true },
  );
  window.addEventListener("resize", updateActiveLink);

  const initialSection = window.location.hash.slice(1);
  if (initialSection && navLinks.some((link) => link.getAttribute("href") === `#${initialSection}`)) {
    setActiveLink(initialSection);
  } else {
    updateActiveLink();
  }
})();
