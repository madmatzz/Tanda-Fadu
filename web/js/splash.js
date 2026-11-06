// Pantalla de carga: video del logo sobre un fondo que se aclara.
//
// Corre como una capa encima de la pantalla que sigue (Inicio u Onboarding), que ya está dibujada
// debajo. Al terminar la capa se desvanece, sin cambiar de página: nada se vuelve a armar y no hay
// parpadeos. js/entrada.js decide si se muestra, antes de que se pinte nada.
//
// El video tiene fondo negro: con mix-blend-mode: screen (screens.css) el negro desaparece y se ve
// el fondo de CSS. La v2, dibujada con SVG y sin video, está en docs/versiones/carga-v2-splash.js.

const Splash = (() => {
  const FPS = 30;
  /** Lo que tarda el logo en desvanecerse (igual a la transición de .splash-art en screens.css). */
  const FADE_MS = 450;
  /** Si el video no llega a arrancar en este tiempo, la app sigue sin él. */
  const START_TIMEOUT_MS = 2500;

  /** Capa negra sobre el fondo: [cuadro, opacidad]. Se aclara de a poco y termina rápido, cuando las hojas pasan a ser la T. */
  const BACKDROP = [
    [0, 1], [6, 0.96], [12, 0.88], [18, 0.85], [24, 0.81], [30, 0.73], [36, 0.65], [42, 0.62], [48, 0.54],
    [54, 0.5], [60, 0.46], [66, 0.38], [72, 0.31], [80, 0.27], [82, 0.15], [84, 0.12], [86, 0],
  ];

  const view = { started: false, done: false };
  const root = document.documentElement;

  function backdropAt(frame) {
    const nextIndex = BACKDROP.findIndex((row) => row[0] > frame);
    if (nextIndex === -1) return 0;
    const [fromFrame, from] = BACKDROP[nextIndex - 1];
    const [toFrame, to] = BACKDROP[nextIndex];
    return from + (to - from) * ((frame - fromFrame) / (toFrame - fromFrame));
  }

  /** Desvanece el logo y después la capa entera, que descubre la pantalla que ya estaba debajo. */
  function leave() {
    if (view.done) return;
    view.done = true;
    const layer = document.querySelector(".splash-layer");
    layer.classList.add("is-leaving");
    window.setTimeout(() => {
      root.classList.remove("splash-active", "splash-mounted");
      App.screenEl.inert = false;
      layer.addEventListener("animationend", () => layer.remove());
      layer.classList.add("is-revealing");
    }, FADE_MS);
  }

  /** El fondo sigue al video, y no a un reloj aparte: si el video se traba, los dos se esperan. */
  function tick() {
    const video = document.getElementById("splash-video");
    document.getElementById("splash-backdrop").style.opacity = backdropAt(video.currentTime * FPS);
    if (video.ended) leave();
    else if (!view.done) requestAnimationFrame(tick);
  }

  function play(video) {
    window.setTimeout(() => {
      if (!view.started) leave();
    }, START_TIMEOUT_MS);
    video.addEventListener("error", leave);
    video.addEventListener("playing", () => {
      view.started = true;
    }, { once: true });
    video.play().catch(leave);
    requestAnimationFrame(tick);
  }

  /** Con la animación desactivada en el sistema, se ve el logo quieto un momento. */
  function showStill(video) {
    document.getElementById("splash-backdrop").style.opacity = 0;
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = video.duration;
    }, { once: true });
    window.setTimeout(leave, 900);
  }

  function start() {
    // Si se pidió desde el menú demo, se saca el pedido de la dirección para que recargar no la repita.
    if (App.params.has("carga")) {
      App.params.delete("carga");
      const query = App.params.toString();
      history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    }
    markSplashSeen();
    App.screenEl.inert = true;
    App.screenEl.parentElement.insertAdjacentHTML("beforeend", `
      <div class="splash-layer" role="img" aria-label="Tanda">
        ${UI.statusBar()}
        <span class="splash-backdrop" id="splash-backdrop"></span>
        <video class="splash-art" id="splash-video" src="video/logo-carga.mp4" width="600" height="600" muted playsinline preload="auto" aria-hidden="true"></video>
      </div>`);
    root.classList.add("splash-mounted");

    const video = document.getElementById("splash-video");
    video.muted = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) showStill(video);
    else play(video);
  }

  return { start };
})();
