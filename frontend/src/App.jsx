import { Routes, Route, useLocation } from "react-router-dom";
import SvgDefs from "./components/SvgDefs";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import WhatsAppFloat from "./components/WhatsAppFloat";
import BackToTop from "./components/BackToTop";
import { CartProvider } from "./lib/CartContext";
import { WishlistProvider } from "./lib/WishlistContext";
import { AuthProvider } from "./lib/AuthContext";
import Home from "./pages/Home";
import Grimorio from "./pages/Grimorio";
import Bazar from "./pages/Bazar";
import ProductoDetalle from "./pages/ProductoDetalle";
import Carrito from "./pages/Carrito";
import PedidoPersonalizado from "./pages/PedidoPersonalizado";
import Seguimiento from "./pages/Seguimiento";
import PoliticaEnvios from "./pages/PoliticaEnvios";
import Terminos from "./pages/Terminos";
import FAQ from "./pages/FAQ";
import Instagram from "./pages/Instagram";
import Sorteos from "./pages/Sorteos";
import Cuidados from "./pages/Cuidados";
import Favoritos from "./pages/Favoritos";
import CuentaLogin from "./pages/cuenta/CuentaLogin";
import CuentaPerfil from "./pages/cuenta/CuentaPerfil";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminPedidos from "./pages/admin/AdminPedidos";
import AdminPedidoDetalle from "./pages/admin/AdminPedidoDetalle";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminCupones from "./pages/admin/AdminCupones";
import NotFound from "./pages/NotFound";

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <CartProvider>
      <WishlistProvider>
        <SvgDefs />
        <Navbar />
        <main>
          <div key={location.pathname} className="zz-page-fade">
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/grimorio" element={<Grimorio />} />
            <Route path="/bazar" element={<Bazar />} />
            <Route path="/bazar/:id" element={<ProductoDetalle />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/pedido-personalizado" element={<PedidoPersonalizado />} />
            <Route path="/seguimiento" element={<Seguimiento />} />
            <Route path="/politica-envios" element={<PoliticaEnvios />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/instagram" element={<Instagram />} />
            <Route path="/sorteos" element={<Sorteos />} />
            <Route path="/cuidados" element={<Cuidados />} />
            <Route path="/cuenta/login" element={<CuentaLogin />} />
            <Route path="/cuenta" element={<CuentaPerfil />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/pedidos"
              element={
                <ProtectedRoute>
                  <AdminPedidos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pedidos/:id"
              element={
                <ProtectedRoute>
                  <AdminPedidoDetalle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/productos"
              element={
                <ProtectedRoute>
                  <AdminProductos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cupones"
              element={
                <ProtectedRoute>
                  <AdminCupones />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
        <Footer />
        <BackToTop />
        <WhatsAppFloat />
      </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}