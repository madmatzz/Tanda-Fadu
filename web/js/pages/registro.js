// Registro: crea la cuenta y lleva a iniciar sesión con el usuario ya cargado.

const form = { username: "", name: "", mail: "", password: "" };
const view = { errors: {}, showPassword: false };

function registerErrors() {
  const errors = {};
  const username = form.username.trim();
  if (!username) errors.username = "Elegí un nombre de usuario.";
  else if (/\s/.test(username)) errors.username = "El nombre de usuario no puede tener espacios.";
  if (!form.name.trim()) errors.name = "Escribí tu nombre y apellido.";
  if (!form.mail.trim()) errors.mail = "Escribí tu mail.";
  else if (!isEmail(form.mail)) errors.mail = "Revisá el mail: tiene que ser como nombre@mail.com.";
  if (form.password.length < 8) errors.password = "La contraseña necesita al menos 8 caracteres.";
  return errors;
}

App.start({
  init() {
    submitOnEnter("register");
  },

  render() {
    const role = accessRole();
    const { errors } = view;

    return UI.screen({
      title: "",
      back: role.access,
      content: `
        <div class="stack gap-6">
          ${UI.pageTitle(role.registerTitle, role.registerText)}
          <div class="stack gap-4">
            ${UI.textField({ id: "username", label: "Nombre de usuario", value: form.username, error: errors.username, autocomplete: "username", maxlength: 30, input: "setField" })}
            ${UI.textField({ id: "name", label: "Nombre y apellido", value: form.name, error: errors.name, autocomplete: "name", maxlength: 60, input: "setField" })}
            ${UI.textField({ id: "mail", label: "Mail", value: form.mail, error: errors.mail, inputmode: "email", autocomplete: "email", maxlength: 80, input: "setField" })}
            ${UI.passwordField({ id: "password", label: "Contraseña", value: form.password, hint: "Al menos 8 caracteres.", error: errors.password, shown: view.showPassword, autocomplete: "new-password", input: "setField", toggle: "togglePassword" })}
          </div>
          ${UI.button({ label: "Registrarme", variant: "accent", block: true, action: "register" })}
        </div>`,
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

    register() {
      view.errors = registerErrors();
      if (Object.keys(view.errors).length) {
        App.render();
        focusFirstError(view.errors);
        return;
      }
      App.go(`${accessRole().login}?registrado=1`);
      actions.registerAccount({ username: form.username.trim(), name: form.name.trim(), mail: form.mail.trim() });
    },
  },
});
