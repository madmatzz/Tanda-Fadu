// Iniciar sesión con usuario o mail. Es una demo: no hay servidor que compruebe la contraseña,
// así que alcanza con completar los dos campos para entrar.

const form = { user: Store.state.account?.username || "", password: "" };
const view = { errors: {}, showPassword: false };
// Panel "¿Olvidaste tu contraseña?"
const reset = { mail: "", error: "", sent: false };

function loginErrors() {
  const errors = {};
  if (!form.user.trim()) errors.user = "Escribí tu usuario o mail.";
  if (!form.password) errors.password = "Escribí tu contraseña.";
  return errors;
}

App.start({
  init() {
    submitOnEnter("login");
  },

  render() {
    const role = accessRole();
    const { errors } = view;
    const justRegistered = App.params.has("registrado");

    return UI.screen({
      title: "",
      back: role.access,
      content: `
        <div class="stack gap-6">
          ${UI.pageTitle("Iniciá sesión")}
          ${justRegistered ? `
            <div class="soft-box is-accent row gap-2 c-accent-ink">
              ${icon("check-circle-2")}
              <p class="t-small">Tu cuenta está lista. Ingresá para empezar.</p>
            </div>` : ""}
          <div class="stack gap-4">
            ${UI.textField({ id: "user", label: "Usuario / Mail", value: form.user, error: errors.user, autocomplete: "username", maxlength: 80, input: "setField" })}
            <div class="stack gap-2">
              ${UI.passwordField({ id: "password", label: "Contraseña", value: form.password, error: errors.password, shown: view.showPassword, autocomplete: "current-password", input: "setField", toggle: "togglePassword" })}
              <div class="access-forgot">${UI.link("¿Olvidaste tu contraseña?", { action: "openReset" })}</div>
            </div>
          </div>
          ${UI.button({ label: "Ingresar", variant: "accent", block: true, action: "login" })}
        </div>`,
    });
  },

  sheet() {
    if (reset.sent) {
      return UI.sheet({
        title: "Revisá tu mail",
        description: "Si ese mail tiene una cuenta, en unos minutos te llega el enlace para crear una contraseña nueva.",
        content: "",
        footer: UI.button({ label: "Entendido", block: true, action: "closeSheet" }),
      });
    }
    return UI.sheet({
      title: "Recuperar contraseña",
      description: "Te mandamos un enlace para crear una contraseña nueva.",
      content: UI.textField({ id: "reset-mail", label: "Mail", value: reset.mail, error: reset.error, inputmode: "email", autocomplete: "email", maxlength: 80, input: "setResetMail" }),
      footer: UI.button({ label: "Enviar enlace", variant: "accent", block: true, action: "sendReset" }),
    });
  },

  actions: {
    setField(input) {
      form[input.id] = input.value;
      if (view.errors[input.id]) {
        delete view.errors[input.id];
        App.render();
      }
    },

    togglePassword() {
      view.showPassword = !view.showPassword;
      App.render();
    },

    login() {
      view.errors = loginErrors();
      if (Object.keys(view.errors).length) {
        App.render();
        focusFirstError(view.errors);
        return;
      }
      App.go(accessRole().home);
    },

    openReset() {
      reset.mail = isEmail(form.user) ? form.user.trim() : "";
      reset.error = "";
      reset.sent = false;
      App.openSheet("reset");
    },

    setResetMail(input) {
      reset.mail = input.value;
      if (reset.error) {
        reset.error = "";
        App.render();
      }
    },

    sendReset() {
      if (isEmail(reset.mail)) reset.sent = true;
      else reset.error = "Escribí el mail de tu cuenta, como nombre@mail.com.";
      App.render();
    },
  },
});
