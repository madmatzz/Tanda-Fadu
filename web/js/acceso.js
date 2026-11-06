// Piezas compartidas del ingreso: elegir opción, registrarse e iniciar sesión.
// Cada pantalla existe dos veces (web/ clara, web/imprenta/ oscura) y usa el mismo script:
// el rol sale de la clase theme-imprenta del <html>. Los links se escriben desde web/,
// porque las páginas de imprenta tienen <base href="../">.

const ACCESS_ROLES = {
  estudiante: {
    label: "Estudiante",
    title: "Imprimí en FADU sin perder tiempo",
    registerLabel: "Registrar nuevo usuario",
    registerTitle: "Creá tu cuenta",
    registerText: "Completá tus datos para empezar a imprimir.",
    access: "ingresar.html",
    register: "registro.html",
    login: "login.html",
    home: "index.html",
  },
  imprenta: {
    label: "Imprenta",
    title: "Organizá los pedidos de tu local",
    registerLabel: "Registrar nuevo local",
    registerTitle: "Registrá tu local",
    registerText: "Más adelante podrás cargar y editar la información de tu local.",
    access: "imprenta/ingresar.html",
    register: "imprenta/registro.html",
    login: "imprenta/login.html",
    home: "imprenta/index.html?nueva-tanda=1",
  },
};

/** Logo de Tanda dibujado acá, y no como imagen, para que tome el color de cada tema. */
const ACCESS_LOGO = `
  <svg class="access-logo" viewBox="0 0 216 183" role="img" aria-label="Tanda">
    <path d="M204 51H126.972L126.868 182.538L75.8682 182.498L75.9717 51H0V0H204V51Z" fill="currentColor"/>
    <ellipse cx="188.5" cy="156" rx="27.5" ry="27" fill="var(--color-tanda)"/>
  </svg>`;

function accessRole() {
  const shop = document.documentElement.classList.contains("theme-imprenta");
  return ACCESS_ROLES[shop ? "imprenta" : "estudiante"];
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Enfoca el primer campo con error después de intentar enviar un formulario. */
function focusFirstError(errors) {
  const [id] = Object.keys(errors);
  if (id) document.getElementById(id).focus();
}

/** Enter dentro de un campo de la pantalla hace lo mismo que su botón principal. */
function submitOnEnter(actionName) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target.closest(".screen .input")) App.page.actions[actionName]();
  });
}
