import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { DemoProvider, useDemo } from "./demo/DemoProvider";
import { AppFrame } from "./shell/AppFrame";
import { DesignSystemPage } from "./pages/DesignSystemPage";
import { HomeScreen } from "./screens/student/HomeScreen";
import { PrintIntroScreen } from "./screens/student/PrintIntroScreen";
import { UploadScreen } from "./screens/student/UploadScreen";
import { ValidationScreen } from "./screens/student/ValidationScreen";
import { SpecsScreen } from "./screens/student/SpecsScreen";
import { CartScreen } from "./screens/student/CartScreen";
import { TandaMatchScreen } from "./screens/student/TandaMatchScreen";
import { PaymentScreen } from "./screens/student/PaymentScreen";
import { ConfirmationScreen } from "./screens/student/ConfirmationScreen";
import { QueueScreen } from "./screens/student/QueueScreen";
import { OrderDetailScreen } from "./screens/student/OrderDetailScreen";
import { LocalesScreen } from "./screens/student/LocalesScreen";
import { LocalProfileScreen } from "./screens/student/LocalProfileScreen";
import { CompareScreen } from "./screens/student/CompareScreen";
import { TandasScreen } from "./screens/student/TandasScreen";
import { AlertsScreen } from "./screens/student/AlertsScreen";
import { OrdersScreen } from "./screens/student/OrdersScreen";
import { StudentProfileScreen } from "./screens/student/StudentProfileScreen";
import { ShopHomeScreen } from "./screens/shop/ShopHomeScreen";
import { ShopTandasScreen } from "./screens/shop/ShopTandasScreen";
import { ShopTandaDetailScreen } from "./screens/shop/ShopTandaDetailScreen";
import { ShopStockScreen } from "./screens/shop/ShopStockScreen";
import { ShopReviewsScreen } from "./screens/shop/ShopReviewsScreen";
import { ShopProfileScreen } from "./screens/shop/ShopProfileScreen";

function AppRoutes() {
  const location = useLocation();
  const { dispatch } = useDemo();

  useEffect(() => {
    dispatch({
      type: "SET_ROLE",
      role: location.pathname.startsWith("/imprenta") ? "shop" : "student",
    });
  }, [location.pathname, dispatch]);

  return (
    <AppFrame>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/imprimir" element={<PrintIntroScreen />} />
        <Route path="/imprimir/archivo" element={<UploadScreen />} />
        <Route path="/imprimir/validacion" element={<ValidationScreen />} />
        <Route path="/imprimir/especificaciones" element={<SpecsScreen />} />
        <Route path="/imprimir/carrito" element={<CartScreen />} />
        <Route path="/imprimir/tanda" element={<TandaMatchScreen />} />
        <Route path="/imprimir/pago" element={<PaymentScreen />} />
        <Route path="/locales" element={<LocalesScreen />} />
        <Route path="/locales/:slug" element={<LocalProfileScreen />} />
        <Route path="/comparar" element={<CompareScreen />} />
        <Route path="/tandas" element={<TandasScreen />} />
        <Route path="/pedido/:id" element={<OrderDetailScreen />} />
        <Route path="/pedido/:id/cola" element={<QueueScreen />} />
        <Route path="/pedido/:id/confirmado" element={<ConfirmationScreen />} />
        <Route path="/alertas" element={<AlertsScreen />} />
        <Route path="/pedidos" element={<OrdersScreen />} />
        <Route path="/perfil" element={<StudentProfileScreen />} />
        <Route path="/imprenta" element={<ShopHomeScreen />} />
        <Route path="/imprenta/tandas" element={<ShopTandasScreen />} />
        <Route path="/imprenta/tandas/:id" element={<ShopTandaDetailScreen />} />
        <Route path="/imprenta/stock" element={<ShopStockScreen />} />
        <Route path="/imprenta/resenas" element={<ShopReviewsScreen />} />
        <Route path="/imprenta/perfil" element={<ShopProfileScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppFrame>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <DemoProvider>
        <Routes>
          <Route path="/design-system" element={<DesignSystemPage />} />
          <Route path="*" element={<AppRoutes />} />
        </Routes>
      </DemoProvider>
    </BrowserRouter>
  );
}
