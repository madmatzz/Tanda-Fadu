import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CreditCard, Wallet } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById, tandaById } from "../../demo/selectors";
import {
  estimateTotal,
  modeLabel,
  paperDisplay,
  paymentLabels,
} from "../../demo/pricing";
import type { PaymentMethod } from "../../demo/types";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Chip } from "../../components/Chip";
import { EmptyState } from "../../components/EmptyState";
import { KeyValueRow } from "../../components/KeyValueRow";
import { LocalLogo } from "../../components/LocalLogo";
import { PageTitle } from "../../components/PageTitle";
import { RadioCard } from "../../components/RadioCard";
import { TextInput } from "../../components/TextInput";

const paymentOptions: Array<{ value: PaymentMethod; title: string; description: string }> = [
  {
    value: "mercado-pago",
    title: "MercadoPago",
    description: "Pagás desde la app. En la demo no se cobra nada.",
  },
  {
    value: "efectivo",
    title: "Efectivo",
    description: "Pagás al retirar en el local.",
  },
  {
    value: "tarjeta",
    title: "Tarjeta",
    description: "Débito o crédito. Cargá los datos de prueba.",
  },
];

export function PaymentScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useDemo();
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCode, setCardCode] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const flow = searchParams.get("flujo") === "tanda" ? "tanda" : "print";
  const file = state.draft.file;
  const specs = state.draft.specs;
  const local = state.draft.localId ? localById(state, state.draft.localId) : undefined;
  const tanda = state.draft.tandaId ? tandaById(state, state.draft.tandaId) : undefined;
  const payment: PaymentMethod = state.draft.payment ?? "mercado-pago";
  const total = local ? estimateTotal(specs, local) : 0;
  const backTo = flow === "tanda" ? "/imprimir/tanda" : "/comparar?desde=carrito";

  if (!file) {
    return (
      <Screen title="Pago" leading="back" backTo="/imprimir" trailing="Pago">
        <EmptyState
          title="Falta el archivo del pedido"
          description="Volvé al carrito y subí un archivo para pagar."
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
            <Button variant="primary" size="md" onClick={() => navigate("/comparar?desde=carrito")}>
              Comparar locales
            </Button>
          }
        />
      </Screen>
    );
  }

  const confirm = () => {
    const orderId = `order-${state.nextTicket}`;
    dispatch({ type: "SET_PAYMENT", payment });
    if (flow === "tanda" && tanda) {
      dispatch({ type: "SELECT_TANDA", tandaId: tanda.id });
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
          <Button variant="primary" size="lg" fullWidth onClick={confirm}>
            {payment === "efectivo" ? "Confirmar pedido" : "Pagar y confirmar"}
          </Button>
          <p className="text-center text-caption text-text-muted">
            Demo sin cobro real · el pedido se confirma al instante.
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
          <Chip tone="accent" icon={<Wallet aria-hidden className="size-icon" />}>
            {tanda.label} · {tanda.userTitle}
          </Chip>
        )}

        <Card tone="glass">
          <div className="flex items-center gap-3">
            <LocalLogo local={local} size="md" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-h3 text-ink">{local.name}</span>
              <span className="text-small text-text-secondary">
                {local.floorLabel} · espera {local.queue.waitVirtual} min
              </span>
            </div>
            <Chip tone="success">Abierto</Chip>
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
                aside={<CreditCard aria-hidden className="size-icon text-text-muted" />}
              />
            ))}
          </div>
        </div>

        {payment === "tarjeta" && (
          <Card>
            <div className="flex flex-col gap-3">
              <p className="text-h3 text-ink">Datos de la tarjeta</p>
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
                Datos de demo. No se guardan ni se envían a ningún servicio.
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
