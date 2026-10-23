import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Layers, MapPin, Plus } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { findCompatibleTanda, localById, tandaById } from "../../demo/selectors";
import {
  estimateTotal,
  modeLabel,
  paperDisplay,
  paymentLabels,
} from "../../demo/pricing";
import type { PaymentMethod, SavedCard } from "../../demo/types";
import { cardsIconUrl, cashIconUrl, mercadoPagoIconUrl, visaIconUrl } from "../../lib/assets";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { KeyValueRow } from "../../components/KeyValueRow";
import { LinkText } from "../../components/LinkText";
import { LocalLogo } from "../../components/LocalLogo";
import { PageTitle } from "../../components/PageTitle";
import { RadioCard } from "../../components/RadioCard";
import { SegmentedControl } from "../../components/SegmentedControl";
import { TextInput } from "../../components/TextInput";

const brandLabels: Record<SavedCard["brand"], string> = {
  visa: "VISA",
  mastercard: "Mastercard",
  otra: "Tarjeta",
};

function cardBrand(digits: string): SavedCard["brand"] {
  if (digits.startsWith("4")) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  return "otra";
}

function PaymentIcon({ src }: { src: string }) {
  return <img src={src} alt="" className="size-14 shrink-0 object-contain" />;
}

export function PaymentScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useDemo();
  const savedCard = state.savedCard ?? null;
  const [addingCard, setAddingCard] = useState(!savedCard);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCode, setCardCode] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardKind, setCardKind] = useState<SavedCard["kind"]>("Débito");
  const flow = searchParams.get("flujo") === "tanda" ? "tanda" : "print";
  const file = state.draft.file;
  const specs = state.draft.specs;
  const local = state.draft.localId ? localById(state, state.draft.localId) : undefined;
  const tanda = state.draft.tandaId ? tandaById(state, state.draft.tandaId) : undefined;
  // Si ya hay una tarjeta guardada, se ofrece primero.
  const payment: PaymentMethod = state.draft.payment ?? (savedCard ? "tarjeta" : "mercado-pago");
  const total = local ? estimateTotal(specs, local) : 0;
  const backTo = flow === "tanda" ? "/imprimir/tanda?flujo=tanda" : "/comparar?desde=validacion";
  const digits = cardNumber.replace(/\D/g, "");
  const usingNewCard = payment === "tarjeta" && (!savedCard || addingCard);
  const newCardReady = digits.length >= 13 && cardExpiry.trim() !== "" && cardCode.trim() !== "";

  if (!file) {
    return (
      <Screen title="Pago" leading="back" backTo="/imprimir" trailing="Pago">
        <EmptyState
          title="Falta el archivo del pedido"
          description="Volvé a imprimir y subí un archivo para pagar."
          action={
            <Button variant="outline" size="md" onClick={() => navigate("/imprimir")}>
              Volver a imprimir
            </Button>
          }
        />
      </Screen>
    );
  }

  if (!local) {
    return (
      <Screen title="Pago" leading="back" backTo={backTo} trailing="Pago">
        <EmptyState
          title="Elegí un local primero"
          description="Necesitamos saber dónde vas a retirar el pedido."
          action={
            <Button variant="primary" size="md" onClick={() => navigate("/comparar?desde=validacion")}>
              Comparar locales
            </Button>
          }
        />
      </Screen>
    );
  }

  const paymentOptions: Array<{ value: PaymentMethod; title: string; description: string; icon: string }> = [
    {
      value: "mercado-pago",
      title: "MercadoPago",
      description: "Pagá con tu cuenta o billetera",
      icon: mercadoPagoIconUrl,
    },
    {
      value: "efectivo",
      title: "Efectivo",
      description: "Pagás al retirar en el local",
      icon: cashIconUrl,
    },
    {
      value: "tarjeta",
      title: "Tarjeta",
      description: savedCard
        ? `${brandLabels[savedCard.brand]} ${savedCard.kind} que termina en ${savedCard.last4}`
        : "Débito o crédito",
      icon: savedCard?.brand === "visa" ? visaIconUrl : cardsIconUrl,
    },
  ];

  const confirm = () => {
    const orderId = `order-${state.nextTicket}`;
    dispatch({ type: "SET_PAYMENT", payment });
    if (usingNewCard) {
      // Solo se recuerdan marca, tipo y últimos 4 dígitos.
      dispatch({
        type: "SAVE_CARD",
        card: { brand: cardBrand(digits), kind: cardKind, last4: digits.slice(-4) },
      });
    }
    // Si el local elegido tiene una tanda compatible, el pedido entra en ella.
    const joinedTanda = flow === "tanda" ? tanda : findCompatibleTanda(state, specs, local.id);
    if (joinedTanda) {
      dispatch({ type: "SELECT_TANDA", tandaId: joinedTanda.id });
    }
    dispatch({ type: "CONFIRM_ORDER", id: orderId });
    navigate(`/pedido/${orderId}/confirmado`);
  };

  return (
    <Screen
      title={flow === "tanda" ? "Tandas" : "Imprimir FADU"}
      leading="back"
      backTo={backTo}
      trailing="Pago"
      footer={
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 text-small text-text-secondary">
            <span>Total</span>
            <span className="text-body-strong text-ink">${total}</span>
          </div>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={usingNewCard && !newCardReady}
            onClick={confirm}
          >
            {payment === "efectivo" ? "Confirmar pedido" : "Pagar y confirmar"}
          </Button>
          <p className="text-center text-caption text-text-muted">
            {usingNewCard && !newCardReady
              ? "Completá los datos de la tarjeta para pagar."
              : "Demo sin cobro real · el pedido se confirma al instante."}
          </p>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle
          title="Selección de pago"
          subtitle="Elegí cómo querés pagar y revisá el resumen."
        />

        {tanda && (
          <Chip tone="tanda" icon={<Layers aria-hidden className="size-icon" />}>
            {tanda.label} · {tanda.userTitle}
          </Chip>
        )}

        <Card tone="glass">
          <div className="flex items-center gap-3">
            <LocalLogo local={local} size="md" />
            <span className="min-w-0 flex-1 text-h3 text-ink">{local.name}</span>
            <Chip tone="neutral" variant="outline" icon={<MapPin aria-hidden className="size-3" />}>
              {local.floorLabel}
            </Chip>
          </div>
        </Card>

        <div className="flex flex-col gap-2">
          <span className="text-small font-semibold text-ink">Método de pago</span>
          <div className="flex flex-col gap-2">
            {paymentOptions.map((option) => (
              <RadioCard
                key={option.value}
                name="payment"
                value={option.value}
                checked={payment === option.value}
                onChange={() => dispatch({ type: "SET_PAYMENT", payment: option.value })}
                title={option.title}
                description={option.description}
                aside={<PaymentIcon src={option.icon} />}
              />
            ))}
          </div>

          {payment === "tarjeta" && savedCard && !addingCard && (
            <Button
              variant="outline"
              size="md"
              fullWidth
              icon={<Plus aria-hidden className="size-icon" />}
              onClick={() => setAddingCard(true)}
            >
              Añadir nueva tarjeta
            </Button>
          )}
        </div>

        {usingNewCard && (
          <Card>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-h3 text-ink">{savedCard ? "Nueva tarjeta" : "Datos de la tarjeta"}</p>
                {savedCard && (
                  <LinkText size="small" onClick={() => setAddingCard(false)}>
                    Usar la guardada
                  </LinkText>
                )}
              </div>
              <SegmentedControl
                label="Tipo de tarjeta"
                value={cardKind}
                onChange={(value) => setCardKind(value as SavedCard["kind"])}
                options={[
                  { value: "Débito", label: "Débito" },
                  { value: "Crédito", label: "Crédito" },
                ]}
              />
              <TextInput
                label="Número de tarjeta"
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
                placeholder="4509 0000 0000 0000"
                inputMode="numeric"
                autoComplete="cc-number"
              />
              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Vencimiento"
                  value={cardExpiry}
                  onChange={(event) => setCardExpiry(event.target.value)}
                  placeholder="MM/AA"
                  autoComplete="cc-exp"
                />
                <TextInput
                  label="Código"
                  value={cardCode}
                  onChange={(event) => setCardCode(event.target.value)}
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                />
              </div>
              <TextInput
                label="Titular"
                value={cardHolder}
                onChange={(event) => setCardHolder(event.target.value)}
                placeholder="Lucía Pérez"
                autoComplete="cc-name"
              />
              <p className="text-caption text-text-muted">
                Datos de demo. Para tu próximo pedido solo recordamos la marca y los últimos 4 dígitos.
              </p>
            </div>
          </Card>
        )}

        <Card>
          <div className="flex flex-col gap-2">
            <p className="text-h3 text-ink">Resumen</p>
            <KeyValueRow label="Archivo" value={file.name} />
            <KeyValueRow
              label="Impresión"
              value={`${specs.pages} páginas · ${specs.copies} ${specs.copies === 1 ? "copia" : "copias"}`}
            />
            <KeyValueRow label="Papel" value={`${specs.size} · ${paperDisplay(specs)}`} />
            <KeyValueRow label="Color" value={modeLabel(specs.mode)} />
            <KeyValueRow label="Pago" value={paymentLabels[payment]} />
            <KeyValueRow label="Total" value={`$${total}`} emphasis="strong" />
          </div>
        </Card>
      </div>
    </Screen>
  );
}
