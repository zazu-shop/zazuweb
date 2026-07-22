import "./footer.css";

export default function Footer() {
  return (
    <footer className="zz-footer">
      <div className="container zz-footer__inner">
        <div className="zz-footer__brand">
          <img src="/logo/icon-white.png" alt="" className="zz-footer__mark" />
          <div>
            <p className="zz-footer__name">ZAZU SHOP</p>
            <p className="zz-footer__tag">Objetos con memoria, hechos a mano</p>
          </div>
        </div>

        <nav className="zz-footer__links">
          <a href="/grimorio">El Grimorio</a>
          <a href="/bazar">Bazar</a>
          <a href="/baul">El Baúl</a>
          <a href="/seguimiento">Mi pedido</a>
          <a href="/faq">Preguntas frecuentes</a>
          <a href="/cuidados">Cuidados de tu pieza</a>
          <a href="/sorteos">Sorteos</a>
          <a href="/instagram">Instagram</a>
          <a href="/pedido-personalizado">Pedido personalizado</a>
        </nav>

        <nav className="zz-footer__links zz-footer__links--legal">
          <a href="/politica-envios">Envíos y devoluciones</a>
          <a href="/terminos">Términos y condiciones</a>
        </nav>

        <p className="zz-footer__copy">
          © <a href="/admin/login" className="zz-footer__admin-link">{new Date().getFullYear()}</a> Zazu. Todos los sigilos reservados.
        </p>
      </div>
    </footer>
  );
}