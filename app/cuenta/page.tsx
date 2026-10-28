import type { Metadata } from 'next';
import Link from 'next/link';
import './account.css';

export const metadata: Metadata = { title: 'Mi cuenta | Varkuzo', description: 'Crea tu cuenta de cliente Varkuzo o administra tus pedidos y datos.' };

export default function AccountPage() {
  const accountUrl = `${process.env.WORDPRESS_PUBLIC_URL || 'http://localhost:8080'}/my-account/`;
  return <main className="account-page"><div className="account-copy"><p className="eyebrow red">VARKUZO / TU ESPACIO</p><h1>TU CUENTA.<br /><em>A TU RITMO.</em></h1><p>Crea tu cuenta de cliente o entra para revisar pedidos y actualizar tus datos. El acceso seguro se abre en nuestro panel de tienda.</p><div className="account-actions"><a className="button button-solid" href={accountUrl}>CREAR CUENTA O ENTRAR <span>↗</span></a><Link className="account-secondary" href="/favoritos">VER MIS FAVORITOS →</Link></div><small>Al entrar vas al panel de WooCommerce de Varkuzo.</small></div><div className="account-art"><img src="/images/vkz-monogram-approved.png" alt="Monograma VKZ de pincel aprobado para Varkuzo" width="777" height="492" /><p>DE MEDELLÍN PA’ CUALQUIER LADO.</p></div></main>;
}
