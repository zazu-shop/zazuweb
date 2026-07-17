import { Routes, Route } from "react-router-dom";
import SvgDefs from "./components/SvgDefs";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./lib/CartContext";
import { AuthProvider } from "./lib/AuthContext";
import Home from "./pages/Home";
import Grimorio from "./pages/Grimorio";
import Bazar from "./pages/Bazar";
import ProductoDetalle from "./pages/ProductoDetalle";
import Carrito from "./pages/Carrito";
import Contacto from "./pages/Contacto";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminPedidos from "./pages/admin/AdminPedidos";
import AdminPedidoDetalle from "./pages/admin/AdminPedidoDetalle";
import AdminProductos from "./pages/admin/AdminProductos";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SvgDefs />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/grimorio" element={<Grimorio />} />
            <Route path="/bazar" element={<Bazar />} />
            <Route path="/bazar/:id" element={<ProductoDetalle />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/contacto" element={<Contacto />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}