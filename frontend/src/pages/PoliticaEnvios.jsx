import RoughDivider from "../components/RoughDivider";
import "./legal.css";

export default function PoliticaEnvios() {
  return (
    <section className="section zz-legal">
      <div className="container">
        <p className="eyebrow">Zazu Shop</p>
        <h1>Política de envíos y devoluciones</h1>
        <p className="lead zz-legal__intro">
          Última actualización: {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long" })}.
        </p>

        <RoughDivider />

        <h2>Métodos de envío</h2>
        <p>Al finalizar tu compra puedes elegir entre tres formas de recibir tu pedido:</p>
        <ul className="zz-legal__lista">
          <li>
            <strong>Delivery a domicilio</strong> — disponible para Pueblo Libre y alrededores, con un
            costo fijo de S/ 10.00. Te pedimos DNI, dirección exacta, una referencia y tu rango
            horario preferido para coordinar la entrega.
          </li>
          <li>
            <strong>Recojo en tienda</strong> — sin costo. Te contactamos por WhatsApp para coordinar
            el día y la hora de recojo una vez confirmado tu pago.
          </li>
          <li>
            <strong>Otros</strong> — si estás fuera de nuestra zona de delivery, coordinamos contigo
            la mejor forma de hacerte llegar tu pedido (encomienda, punto de encuentro, etc.) después
            de confirmada la compra, sin costo adicional por nuestra parte salvo que acordemos algo
            distinto entre ambos.
          </li>
        </ul>

        <h2>Tiempos de entrega</h2>
        <p>
          Como cada pieza es trabajada en tiradas pequeñas, el tiempo de preparación puede variar.
          Una vez confirmado tu pago, te damos un estimado de entrega según el método elegido y la
          disponibilidad de la pieza.
        </p>

        <h2>Confirmación de pago</h2>
        <p>
          Los pagos por Yape se verifican de forma manual: tras enviarnos tu comprobante por
          WhatsApp, confirmamos tu pedido en un plazo breve. Mientras el pedido figure como
          "pendiente de verificación", la pieza queda reservada pero no se considera confirmada.
        </p>

        <h2>Cambios y devoluciones</h2>
        <p>
          Por ser productos artesanales hechos en tiradas pequeñas, no aceptamos devoluciones por
          simple cambio de opinión. Sí aceptamos cambio o reembolso en estos casos:
        </p>
        <ul className="zz-legal__lista">
          <li>La pieza llega con un defecto de fabricación no descrito en la publicación.</li>
          <li>Se te envió un producto distinto al que compraste.</li>
          <li>La pieza llega dañada por el transporte (con evidencia fotográfica al recibir).</li>
        </ul>
        <p>
          En cualquiera de estos casos, escríbenos por WhatsApp dentro de las 48 horas de recibido
          el pedido, adjuntando fotos, y coordinamos la solución (cambio, reparación o reembolso
          según corresponda).
        </p>

        <h2>Contacto</h2>
        <p>
          Para cualquier duda sobre tu pedido, envío o esta política, puedes escribirnos desde
          nuestra página de <a href="/contacto">Contacto</a> o por WhatsApp usando el número que
          te compartimos al finalizar tu compra.
        </p>
      </div>
    </section>
  );
}