// Selección de pago: MercadoPago, efectivo o tarjeta (guardada o nueva).

const BRAND_LABELS = { visa: "VISA", mastercard: "Mastercard", otra: "Tarjeta" };

// Datos de la tarjeta nueva mientras se escriben. No se guardan: al pagar solo se recuerdan
// la marca, el tipo y los últimos 4 dígitos.
const view = {
  addingCard: !Store.state.savedCard,
  number: "",
  expiry: "",
  code: "",
  holder: "",
  kind: "Débito",
};

function cardBrand(digits) {
  if (digits.startsWith("4")) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  return "otra";
}

/** Volver: a la tanda, a la comparación (si el local se eligió ahí) o a la validación. */
function backHref() {
  if (isTandaFlow()) return "tanda.html?flujo=tanda";
  return App.params.get("desde") === "comparar" ? "comparar.html?desde=validacion" : "validacion.html";
}

/** Método elegido. Si hay una tarjeta guardada, se ofrece primero. */
function currentPayment(state) {
  return state.draft.payment || (state.savedCard ? "tarjeta" : "mercado-pago");
}

function newCardState(state) {
  const digits = view.number.replace(/\D/g, "");
  const usingNewCard = currentPayment(state) === "tarjeta" && (!state.savedCard || view.addingCard);
  const ready = digits.length >= 13 && view.expiry.trim() !== "" && view.code.trim() !== "";
  return { digits, usingNewCard, ready };
}

App.start({
  render() {
    const state = Store.state;
    const file = state.draft.file;
    const specs = state.draft.specs;
    const local = state.draft.localId ? localById(state, state.draft.localId) : null;
    const tanda = state.draft.tandaId ? tandaById(state, state.draft.tandaId) : null;

    if (!file) {
      return UI.screen({
        title: "Pago",
        back: "imprimir.html",
        trailing: "Pago",
        content: UI.emptyState({
          title: "Falta el archivo del pedido",
          description: "Volvé a imprimir y subí un archivo para pagar.",
          action: UI.button({ label: "Volver a imprimir", variant: "outline", size: "md", href: "imprimir.html" }),
        }),
      });
    }

    if (!local) {
      return UI.screen({
        title: "Pago",
        back: backHref(),
        trailing: "Pago",
        content: UI.emptyState({
          title: "Elegí un local primero",
          description: "Necesitamos saber dónde vas a retirar el pedido.",
          action: UI.button({ label: "Comparar locales", size: "md", href: "comparar.html?desde=validacion" }),
        }),
      });
    }

    const savedCard = state.savedCard;
    const payment = currentPayment(state);
    const total = estimateTotal(specs, local);
    const card = newCardState(state);

    const options = [
      { value: "mercado-pago", title: "MercadoPago", description: "Pagá con tu cuenta o billetera", image: "img/mp.png" },
      { value: "efectivo", title: "Efectivo", description: "Pagás al retirar en el local", image: "img/efectivo.svg" },
      {
        value: "tarjeta",
        title: "Tarjeta",
        description: savedCard ? `${BRAND_LABELS[savedCard.brand]} ${savedCard.kind} que termina en ${savedCard.last4}` : "Débito o crédito",
        image: savedCard && savedCard.brand === "visa" ? "img/visa.png" : "img/cards.png",
      },
    ];

    const newCardForm = card.usingNewCard
      ? UI.card(`
          <div class="stack gap-3">
            <div class="row between gap-2">
              <p class="t-h3">${savedCard ? "Nueva tarjeta" : "Datos de la tarjeta"}</p>
              ${savedCard ? UI.link("Usar la guardada", { action: "useSavedCard" }) : ""}
            </div>
            ${UI.segmented({
              name: "card-kind",
              label: "Tipo de tarjeta",
              value: view.kind,
              change: "changeCardKind",
              options: [{ value: "Débito", label: "Débito" }, { value: "Crédito", label: "Crédito" }],
            })}
            ${UI.textField({ id: "card-number", label: "Número de tarjeta", value: view.number, placeholder: "4509 0000 0000 0000", inputmode: "numeric", autocomplete: "cc-number", input: "changeCardField" })}
            <div class="grid-2 gap-3">
              ${UI.textField({ id: "card-expiry", label: "Vencimiento", value: view.expiry, placeholder: "MM/AA", autocomplete: "cc-exp", input: "changeCardField" })}
              ${UI.textField({ id: "card-code", label: "Código", value: view.code, placeholder: "123", inputmode: "numeric", autocomplete: "cc-csc", input: "changeCardField" })}
            </div>
            ${UI.textField({ id: "card-holder", label: "Titular", value: view.holder, placeholder: "Lucía Pérez", autocomplete: "cc-name", input: "changeCardField" })}
            <p class="t-caption c-muted">Datos de demo. Para tu próximo pedido solo recordamos la marca y los últimos 4 dígitos.</p>
          </div>`)
      : "";

    return UI.screen({
      title: isTandaFlow() ? "Tandas" : "Imprimir FADU",
      back: backHref(),
      trailing: "Pago",
      footer: `
        <div class="stack gap-2">
          <div class="row between gap-2 t-small c-secondary">
            <span>Total</span>
            <span class="t-strong c-ink">$${total}</span>
          </div>
          ${UI.button({
            label: payment === "efectivo" ? "Confirmar pedido" : "Pagar y confirmar",
            block: true,
            disabled: card.usingNewCard && !card.ready,
            action: "confirm",
          })}
          <p class="t-caption c-muted text-center">
            ${card.usingNewCard && !card.ready ? "Completá los datos de la tarjeta para pagar." : "Demo sin cobro real · el pedido se confirma al instante."}
          </p>
        </div>`,
      content: `
        <div class="stack gap-5">
          ${UI.pageTitle("Selección de pago", "Elegí cómo querés pagar y revisá el resumen.")}

          ${tanda ? UI.chip(`${tanda.label} · ${tanda.userTitle}`, { tone: "tanda", icon: "layers" }) : ""}

          ${UI.card(`
            <div class="row gap-3">
              ${UI.localLogo(local)}
              <span class="stack gap-05 grow">
                <span class="t-h3">${local.name}</span>
                <span class="t-caption c-secondary">Retirás acá · ${local.floorLabel}</span>
              </span>
              ${isTandaFlow() ? "" : UI.link("Cambiar local", { href: "comparar.html?desde=pago" })}
            </div>`, { tone: "glass" })}

          <div class="form-field">
            <span class="form-label">Método de pago</span>
            <div class="stack gap-2">
              ${options.map((option) => UI.radioCard({
                name: "payment",
                value: option.value,
                checked: payment === option.value,
                title: option.title,
                description: option.description,
                aside: `<img class="payment-icon" src="${option.image}" alt="">`,
                change: "choosePayment",
              })).join("")}
            </div>
            ${payment === "tarjeta" && savedCard && !view.addingCard
              ? UI.button({ label: "Añadir nueva tarjeta", icon: "plus", variant: "outline", size: "md", block: true, action: "addCard" })
              : ""}
          </div>

          ${newCardForm}

          ${UI.card(`
            <div class="stack gap-2">
              <p class="t-h3">Resumen</p>
              ${UI.keyValue("Archivo", esc(file.name))}
              ${UI.keyValue("Impresión", `${plural(specs.pages, "página", "páginas")} · ${plural(specs.copies, "copia", "copias")}`)}
              ${UI.keyValue("Papel", `${specs.size} · ${paperDisplay(specs)}`)}
              ${UI.keyValue("Color", modeLabel(specs.mode))}
              ${UI.keyValue("Pago", PAYMENT_LABELS[payment])}
              ${UI.keyValue("Total", `$${total}`, true)}
            </div>`)}
        </div>`,
    });
  },

  actions: {
    choosePayment(input) {
      actions.setPayment(input.value);
    },

    addCard() {
      view.addingCard = true;
      App.render();
    },

    useSavedCard() {
      view.addingCard = false;
      App.render();
    },

    changeCardKind(input) {
      view.kind = input.value;
      App.render();
    },

    /** Cada campo guarda su valor según su id: card-number → number, etc. */
    changeCardField(input) {
      view[input.id.replace("card-", "")] = input.value;
      App.render();
    },

    confirm() {
      const state = Store.state;
      const draft = state.draft;
      const card = newCardState(state);
      const orderId = `order-${state.nextTicket}`;

      actions.setPayment(currentPayment(state));
      if (card.usingNewCard) {
        actions.saveCard({ brand: cardBrand(card.digits), kind: view.kind, last4: card.digits.slice(-4) });
      }
      // Si el local elegido tiene una tanda compatible, el pedido entra en ella.
      const tanda = isTandaFlow() ? tandaById(state, draft.tandaId) : findCompatibleTanda(state, draft.specs, draft.localId);
      if (tanda) actions.selectTanda(tanda.id);
      App.go(`confirmado.html?id=${orderId}`);
      actions.confirmOrder(orderId);
    },
  },
});
