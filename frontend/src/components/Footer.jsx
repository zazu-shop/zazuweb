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
          <a href="/contacto">Contacto</a>
        </nav>

        <p className="zz-footer__copy">
          © {new Date().getFullYear()} Zazu. Todos los sigilos reservados.
        </p>
      </div>
    </footer>
  );
}