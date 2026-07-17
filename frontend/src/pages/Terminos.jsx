import RoughDivider from "../components/RoughDivider";
import "./legal.css";

export default function Terminos() {
  return (
    <section className="section zz-legal">
      <div className="container">
        <p className="eyebrow">Zazu Shop</p>
        <h1>Términos y condiciones</h1>
        <p className="lead zz-legal__intro">
          Última actualización: {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long" })}.
        </p>

        <RoughDivider />

        <h2>1. Sobre esta tienda</h2>
        <p>
          Zazu Shop es un taller artesanal que ofrece objetos de temática esotérica, medieval y de
          fantasía, hechos a mano en tiradas pequeñas. Al comprar en este sitio, aceptas los
          términos descritos a continuación.
        </p>

        <h2>2. Precios y disponibilidad</h2>
        <p>
          Los precios se muestran en soles peruanos (S/) e incluyen todos los costos del producto,
          salvo el envío, que se calcula según el método elegido en el checkout. Al ser piezas
          hechas en tiradas pequeñas, el stock mostrado puede variar y, en casos excepcionales, una
          pieza puede agotarse entre que la agregas al carrito y confirmas tu pedido.
        </p>

        <h2>3. Proceso de compra</h2>
        <p>
          Al confirmar tu pedido se genera un número único de seguimiento. El pedido queda en
          estado "pendiente de verificación" hasta que confirmamos tu pago por Yape a través del
          comprobante que nos envías por WhatsApp. Puedes revisar el estado de tu pedido en
          cualquier momento desde la página de <a href="/seguimiento">Seguimiento de pedido</a>.
        </p>

        <h2>4. Métodos de pago</h2>
        <p>
          Actualmente aceptamos pagos por Yape mediante verificación manual del comprobante. No
          almacenamos ni procesamos datos de tarjetas ni cuentas bancarias en este sitio.
        </p>

        <h2>5. Envíos</h2>
        <p>
          Los detalles de costos, zonas de cobertura y tiempos de entrega están descritos en
          nuestra <a href="/politica-envios">Política de envíos y devoluciones</a>.
        </p>

        <h2>6. Uso del sitio</h2>
        <p>
          Al usar este sitio te comprometes a proporcionar información real y actualizada al
          momento de generar un pedido (nombre, correo, celular y, de elegir delivery, dirección y
          DNI), ya que son necesarios para procesar y entregar tu compra correctamente.
        </p>

        <h2>7. Propiedad de los diseños</h2>
        <p>
          Todas las piezas, ilustraciones, el logo y los textos de Zazu Shop son de autoría propia
          o de nuestros talleres colaboradores. Su reproducción o venta sin autorización no está
          permitida.
        </p>

        <h2>8. Cambios en estos términos</h2>
        <p>
          Podemos actualizar estos términos ocasionalmente para reflejar cambios en cómo operamos.
          La fecha de la última actualización siempre estará visible en la parte superior de esta
          página.
        </p>

        <h2>9. Contacto</h2>
        <p>
          Si tienes dudas sobre estos términos, escríbenos desde nuestra página de{" "}
          <a href="/contacto">Contacto</a>.
        </p>
      </div>
    </section>
  );
}