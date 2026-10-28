import Link from 'next/link';

export const metadata = { title: 'Datos y newsletter | Varkuzo' };

export default function PrivacidadPage() {
  return <main style={{ background: '#f1eee8', minHeight: '70svh', padding: 'clamp(80px,10vw,150px) clamp(24px,8vw,140px)' }}>
    <p className="eyebrow red">VARKUZO / TUS DATOS</p>
    <h1 style={{ fontFamily: "'Varkuzo Gestual R03', var(--font-display), sans-serif", fontSize: 'clamp(65px,10vw,145px)', lineHeight: '.9', margin: '24px 0 38px' }}>TU CORREO,<br />TU DECISIÓN.</h1>
    <div style={{ maxWidth: 700, lineHeight: 1.7, fontSize: 16 }}>
      <p>Si te suscribes, guardamos el correo que escribes, la fecha de autorización y el lugar desde donde te registraste. Lo usamos para preparar el newsletter de Varkuzo y reservar un beneficio del 10 % para tu primera compra cuando abramos ventas.</p>
      <p>El envío de campañas y el uso del descuento todavía no están activos. Antes de publicarlos definiremos sus condiciones, el responsable del tratamiento y un canal de atención para consultar, corregir o eliminar tus datos y retirar tu autorización.</p>
      <p>La autorización para recibir novedades es voluntaria. El registro del prototipo no crea una cuenta de cliente ni realiza una compra.</p>
      <Link href="/ayuda" style={{ fontWeight: 800, textDecoration: 'underline' }}>VER PREGUNTAS FRECUENTES ↗</Link>
    </div>
  </main>;
}
