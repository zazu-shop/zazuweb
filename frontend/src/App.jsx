import { Routes, Route, useLocation } from "react-router-dom";
import SvgDefs from "./components/SvgDefs";
import Navbar from "./components/Navbar";
import AdminBar from "./components/AdminBar"; // <-- Importado aquí
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import WhatsAppFloat from "./components/WhatsAppFloat";
import BackToTop from "./components/BackToTop";
import VisitTracker from "./components/VisitTracker";
import { CartProvider } from "./lib/CartContext";
import { WishlistProvider } from "./lib/WishlistContext";
import { AuthProvider } from "./lib/AuthContext";

import Home from "./pages/Home";
import Grimorio from "./pages/Grimorio";
import Bazar from "./pages/Bazar";
import Baul from "./pages/Baul";
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
import AdminVisitas from "./pages/admin/AdminVisitas";
import NotFound from "./pages/NotFound";
import Festin from "./pages/Festin";
import AdminFestines from "./pages/admin/AdminFestines";
import AdminFestinPedidos from "./pages/admin/AdminFestinPedidos";
import Personaje from "./pages/bitacora/Personaje";
import Bitacora from "./pages/bitacora/Bitacora";
import Cronica from "./pages/bitacora/Cronica";
import AdminEditores from "./pages/admin/AdminEditores";
import EditorPanel from "./pages/bitacora/EditorPanel";
import EditarCronica from "./pages/bitacora/EditarCronica";
import EditarPersonaje from "./pages/bitacora/EditarPersonaje";

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <VisitTracker />
          <SvgDefs />
          <Navbar />
          <AdminBar /> {/* <-- Añadido aquí para que sea global */}
          
          <main>
            <div key={location.pathname} className="zz-page-fade">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/grimorio" element={<Grimorio />} />
                <Route path="/bazar" element={<Bazar />} />
                <Route path="/baul" element={<Baul />} />
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
                <Route
                  path="/admin/visitas"
                  element={
                    <ProtectedRoute>
                      <AdminVisitas />
                    </ProtectedRoute>
                  }
                />
                
                <Route path="/festin/:slug" element={<Festin />} />
                <Route
                  path="/admin/festines"
                  element={
                    <ProtectedRoute>
                      <AdminFestines />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/festines/:id/pedidos"
                  element={
                    <ProtectedRoute>
                      <AdminFestinPedidos />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/bitacora/editar"
                  element={
                    <ProtectedRoute>
                      <EditorPanel />
                    </ProtectedRoute>
                  }
                />

                {/* Panel principal de edición de la Bitácora */}
                <Route
                  path="/bitacora/editar"
                  element={
                    <ProtectedRoute>
                      <EditorPanel />
                    </ProtectedRoute>
                  }
                />

                {/* Rutas para Crónicas (Crear nueva y Editar existente) */}
                <Route
                  path="/bitacora/editar/cronica/nueva"
                  element={
                    <ProtectedRoute>
                      <EditarCronica />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bitacora/editar/cronica/:id"
                  element={
                    <ProtectedRoute>
                      <EditarCronica />
                    </ProtectedRoute>
                  }
                />

                {/* Rutas para Personajes (Crear nuevo y Editar existente) */}
                <Route
                  path="/bitacora/editar/personaje/nuevo"
                  element={
                    <ProtectedRoute>
                      <EditarPersonaje />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bitacora/editar/personaje/:id"
                  element={
                    <ProtectedRoute>
                      <EditarPersonaje />
                    </ProtectedRoute>
                  }
                />
                
                <Route path="/bitacora" element={<Bitacora />} />
                <Route path="/bitacora/personaje/:slug" element={<Personaje />} />
                <Route path="/bitacora/cronica/:slug" element={<Cronica />} />
                <Route path="/admin/editores" element={<AdminEditores />} />
                
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