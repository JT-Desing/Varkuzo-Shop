import Link from 'next/link';
import './footer.css';

export function Footer() {
  return <footer className="site-footer footer-v2" id="historia">
    <div className="footer-v2-top"><div><span className="footer-kicker">VARKUZO / MEDELLÍN, COLOMBIA</span><h2>LA CALLE<br /><em>TIENE PORTE.</em></h2></div><div className="footer-statement"><p>El barrio tiene historias, sueños y una forma propia de vestirlos. Desde Medellín, hacemos espacio para quienes llevan su origen con orgullo.</p><Link href="/nosotros" className="footer-story-link">CONOCE LA MARCA <span>↗</span></Link></div></div>
    <div className="footer-v2-links">
      <div><h3>EXPLORA</h3><Link href="/shop">Todo el catálogo</Link><Link href="/shop?categoria=Buzos">Buzos</Link><Link href="/shop?categoria=Camisetas">Camisetas</Link><Link href="/shop?categoria=Pantalones">Pantalones</Link><Link href="/favoritos">Mis favoritos</Link></div>
      <div><h3>TE AYUDAMOS</h3><Link href="/ayuda">Preguntas frecuentes</Link><Link href="/ayuda#envios">Entregas en Medellín</Link><Link href="/ayuda#retracto">Retracto y devoluciones</Link><Link href="/ayuda#garantia">Garantía legal</Link><Link href="/ayuda#pagos">Pagos y seguridad</Link></div>
      <div><h3>LA MARCA</h3><Link href="/nosotros">Nosotros</Link><Link href="/nosotros#mision">Misión</Link><Link href="/nosotros#vision">Visión</Link><Link href="/nosotros#origen">De Medellín</Link></div>
      <div className="footer-service"><h3>ANTES DE COMPRAR</h3><p>Estamos construyendo la tienda. Los precios, cobertura, tiempos de entrega y canal de atención se confirmarán antes de habilitar pedidos.</p><Link href="/ayuda">LEE LA GUÍA DE AYUDA ↗</Link></div>
    </div>
    <div className="footer-v2-bottom"><span>© {new Date().getFullYear()} VARKUZO · HECHO DESDE MEDELLÍN</span><span>Ropa con origen. Porte sin permiso.</span><a href="https://www.sic.gov.co/" target="_blank" rel="noopener noreferrer">AUTORIDAD DE PROTECCIÓN AL CONSUMIDOR ↗</a></div>
  </footer>;
}
