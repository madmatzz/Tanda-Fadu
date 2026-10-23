import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { MapPin, Upload } from "lucide-react";
import { Screen } from "../../shell/Screen";
import { useDemo } from "../../demo/DemoProvider";
import { localById, userOrders } from "../../demo/selectors";
import { statusLabels } from "../../demo/pricing";
import { Button } from "../../components/Button";
import { Chip } from "../../components/Chip";
import { Divider } from "../../components/Divider";
import { InfoCard } from "../../components/InfoCard";
import { LinkText } from "../../components/LinkText";
import { PageTitle } from "../../components/PageTitle";

export function PrintIntroScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch } = useDemo();
  const orders = userOrders(state);
  const lastOrder = orders[0];
  const requestedLocal = searchParams.get("local");
  const selectedLocal = requestedLocal ? localById(state, requestedLocal) : undefined;

  useEffect(() => {
    if (selectedLocal) {
      dispatch({ type: "SELECT_LOCAL", localId: selectedLocal.id });
    }
  }, [selectedLocal, dispatch]);

  return (
    <Screen
      title="Imprimir FADU"
      leading="back"
      backTo="/"
      trailing="Inicio"
      footer={
        <Button
          variant="accent"
          size="lg"
          fullWidth
          icon={<Upload aria-hidden className="size-icon" />}
          onClick={() => navigate("/imprimir/archivo")}
        >
          Subir archivo
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <PageTitle
          title="Nueva impresión"
          subtitle="Prepará tus archivos y elegí dónde imprimir."
        />

        {selectedLocal && (
          <Chip tone="accent" icon={<MapPin aria-hidden className="size-icon" />}>
            {selectedLocal.name} · {selectedLocal.floorLabel}
          </Chip>
        )}

        <InfoCard
          title="Imprimí sin vueltas"
          steps={[
            "Subí un PDF, Word o JPG",
            "Configurá papel y tipo de impresión",
            "Compará precios y tiempos de espera",
          ]}
        >
          Validá el archivo, compará las colas y retiralo en el local que elijas.
        </InfoCard>

        <div className="flex justify-center">
          <LinkText size="small" onClick={() => navigate("/locales")}>
            Buscar local
          </LinkText>
        </div>

        <Divider />

        <div className="flex flex-col gap-2">
          <p className="text-small text-text-secondary">Locales en FADU · Ciudad Universitaria</p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-body text-text-secondary">Tu último pedido</span>
            {lastOrder ? (
              <LinkText size="small" onClick={() => navigate(`/pedido/${lastOrder.id}`)}>
                #{lastOrder.ticket} · {statusLabels[lastOrder.status]}
              </LinkText>
            ) : (
              <span className="text-body-strong text-ink">Sin pedidos todavía</span>
            )}
          </div>
        </div>
      </div>
    </Screen>
  );
}
