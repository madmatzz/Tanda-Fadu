// Va en el <head>, antes de que se pinte nada. Resuelve qué se ve al abrir la app:
// · La pantalla de carga (una vez por sesión, o con ?carga en la dirección): deja la pantalla
//   tapada con su fondo hasta que la dibuja js/splash.js.
// · Con data-inicio, si todavía no se vio el onboarding, va directo ahí sin llegar a mostrar el Inicio.
(function () {
  try {
    const root = document.documentElement;
    const onHome = "inicio" in document.currentScript.dataset;
    const splash = sessionStorage.getItem("tanda-carga-vista") !== "1" || new URLSearchParams(window.location.search).has("carga");
    if (splash) root.classList.add("splash-active");
    if (onHome && localStorage.getItem("tanda-onboarding-visto") !== "1") {
      root.classList.add("splash-active", "is-redirecting");
      window.location.replace("onboarding.html");
    }
  } catch (error) {
    // Sin guardado, la app arranca directo, sin pantalla de carga.
  }
})();