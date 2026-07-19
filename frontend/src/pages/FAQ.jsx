import { useState } from "react";
import "./faq.css";

const PREGUNTAS = [
  {
    q: "¿Cómo pago mi pedido?",
    a: "Actualmente solo aceptamos Yape. Al finalizar tu compra te mostramos nuestro código QR y las instrucciones — escaneas, pagas el monto exacto y nos envías la captura por WhatsApp mencionando tu número de pedido.",
  },
  {
    q: "¿Cuánto demora en confirmarse mi pago?",
    a: "Verificamos los comprobantes de forma manual, normalmente en un plazo de pocas horas dentro del día. Puedes revisar el estado de tu pedido en cualquier momento desde \"Mi pedido\".",
  },
  {
    q: "¿Qué opciones de envío tienen?",
    a: "Delivery a domicilio en Pueblo Libre y alrededores (S/ 10), recojo en tienda (gratis), u otros destinos que coordinamos contigo después de tu compra.",
  },
  {
    q: "¿Puedo cambiar o devolver una pieza?",
    a: "Al ser piezas artesanales hechas en tiradas pequeñas, no aceptamos cambios por simple arrepentimiento, pero sí por defectos de fabricación o envíos incorrectos. Todos los detalles están en nuestra página de Envíos y devoluciones.",
  },
  {
    q: "¿Tienen tienda física?",
    a: "Por ahora operamos como taller y bazar online, con recojo coordinado en Pueblo Libre para quienes elijan esa opción al pagar.",
  },
  {
    q: "¿Cómo sé si una pieza tiene descuento?",
    a: "Las piezas con descuento muestran una insignia con el porcentaje y el precio anterior tachado, tanto en el Bazar como en su página de detalle.",
  },
  {
    q: "¿Necesito crear una cuenta para comprar?",
    a: "No es obligatorio — puedes comprar como invitado y hacer seguimiento con tu número de pedido y correo. Si prefieres, también puedes crear una cuenta para ver tu historial completo de compras.",
  },
];

export default function FAQ() {
  const [abierta, setAbierta] = useState(null);

  return (
    <section className="section container zz-faq">
      <p className="eyebrow">Ayuda</p>
      <h1>Preguntas frecuentes</h1>

      <div className="zz-faq__lista">
        {PREGUNTAS.map((item, i) => (
          <div className="zz-faq__item" key={i}>
            <button
              className="zz-faq__pregunta"
              onClick={() => setAbierta(abierta === i ? null : i)}
              aria-expanded={abierta === i}
            >
              <span>{item.q}</span>
              <span className="zz-faq__icono">{abierta === i ? "−" : "+"}</span>
            </button>
            {abierta === i && <p className="zz-faq__respuesta">{item.a}</p>}
          </div>
        ))}
      </div>

      <p className="zz-faq__nota">
        ¿No encontraste tu respuesta? Escríbenos desde <a href="/pedido-personalizado">Pedido personalizado</a>.
      </p>
    </section>
  );
}