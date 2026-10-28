import Link from 'next/link';
import './footer.css';

export function Footer() {
  return <footer className="site-footer footer-v2" id="historia">
    <div className="footer-v2-top"><div><span className="footer-kicker">VARKUZO / MEDELLÍN, COLOMBIA</span><h2>LA CALLE<br /><em>TIENE PORTE.</em></h2></div><div className="footer-statement"><p>Hay estilo en cada cuadra de Medellín. Varkuzo nace para darle forma propia: prendas para salir con el origen bien puesto y la mirada más lejos.</p><Link href="/nosotros" className="footer-story-link">CONOCE NUESTRA HISTORIA <span>↗</span></Link></div></div>
    <div className="footer-v2-links">
      <div><h3>EXPLORA</h3><Link href="/shop">Todo el catálogo</Link><Link href="/descuentos">Descuentos</Link><Link href="/shop?categoria=Buzos">Buzos</Link><Link href="/shop?categoria=Camisetas">Camisetas</Link><Link href="/shop?categoria=Pantalones">Pantalones</Link><Link href="/favoritos">Mis favoritos</Link></div>
      <div><h3>TE AYUDAMOS</h3><Link href="/ayuda">Preguntas frecuentes</Link><Link href="/ayuda#envios">Entregas en Medellín</Link><Link href="/ayuda#retracto">Retracto y devoluciones</Link><Link href="/ayuda#garantia">Garantía legal</Link><Link href="/ayuda#pagos">Pagos y seguridad</Link></div>
      <div><h3>LA MARCA</h3><Link href="/nosotros">Nosotros</Link><Link href="/nosotros#mision">Misión</Link><Link href="/nosotros#vision">Visión</Link><Link href="/nosotros#origen">De Medellín</Link><Link href="/privacidad">Tus datos</Link></div>
      <div className="footer-service"><h3>ANTES DE COMPRAR</h3><p>Estamos preparando las primeras piezas. Antes de abrir ventas publicaremos precios, medidas, entregas y un canal de atención confirmado.</p><Link href="/ayuda">REVISA LAS PREGUNTAS FRECUENTES ↗</Link></div>
    </div>
    <div className="footer-v2-bottom"><span>© {new Date().getFullYear()} VARKUZO · HECHO DESDE MEDELLÍN</span><span>El origen se lleva puesto.</span><a href="https://www.sic.gov.co/" target="_blank" rel="noopener noreferrer">AUTORIDAD DE PROTECCIÓN AL CONSUMIDOR ↗</a></div>
  </footer>;
}
