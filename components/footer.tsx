import Link from 'next/link';

export function Footer() {
  return <footer className="site-footer" id="historia"><div className="footer-top"><span>DISEÑADO DESDE MEDELLÍN</span><span>© {new Date().getFullYear()} VARKUZO</span></div><div className="footer-main"><h2>LA CALLE<br />TIENE VOZ.</h2><div><p>Ropa urbana de Medellín. Piezas con carácter, hechas para moverse contigo.</p><Link href="/shop" className="text-link">Explorar catálogo ↗</Link></div></div><div className="footer-bottom"><span>VARKUZO / COLOMBIA</span><span>Una propuesta en construcción</span></div></footer>;
}
