// Ingresar: después del onboarding, ofrece iniciar sesión o registrarse.

App.start({
  render() {
    const role = accessRole();

    return UI.screen({
      title: "",
      back: "onboarding.html?final=1",
      content: `
        <div class="access">
          <div class="access-hero">
            ${ACCESS_LOGO}
            ${UI.chip(role.label, { tone: "accent", size: "md" })}
            <h1 class="t-h1">${role.title}</h1>
          </div>
          <div class="stack gap-3">
            ${UI.button({ label: "Iniciar sesión", variant: "accent", block: true, href: role.login })}
            ${UI.button({ label: role.registerLabel, variant: "outline", block: true, href: role.register })}
          </div>
        </div>`,
    });
  },
});
