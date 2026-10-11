# Lamine Resell

Tienda de cuentas con valoraciones. Next.js (Pages Router) + Tailwind, base de datos Postgres en Supabase,
pagos con Stripe y despliegue en Vercel.

## Qué incluye

- Catálogo de cuentas por tramos (5, 10, 15 y 20 valoraciones) y valoraciones extra a 9 € cada una.
- Compra sin crear cuenta (email + Stripe), en pago único o en suscripción mensual.
- Cuentas de usuario opcionales: historial de pedidos, monedero y enlace de referido. El monedero se recarga con
  Stripe (o con las comisiones de referidos) y se gasta al comprar una cuenta en pago único ("Pagar con el monedero").
- Programa de referidos con comisión del 10% por defecto, personalizable por usuario desde el admin.
- Panel de administración en `/admin`: pedidos, suscripciones, usuarios, comisiones y restablecer contraseñas.
- Páginas legales (aviso legal, privacidad, condiciones de venta) y preguntas frecuentes.

## Puesta en marcha

1. **Supabase**: crea un proyecto, abre *SQL Editor* → *New query*, pega el contenido de `schema.sql` y pulsa *Run*.
   Se puede ejecutar más de una vez sin borrar nada.
2. **Vercel**: importa este repositorio de GitHub. En *Settings → Environment Variables* añade todas las variables
   de `.env.example` (las seis obligatorias son `DATABASE_URL`, `JWT_SECRET`, `ADMIN_SECRET`, `ADMIN_PASSWORD`,
   `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`). Después de cambiar variables hay que volver a desplegar.
3. **Stripe**: en *Developers → Webhooks* crea un endpoint en modo **Live** que apunte a
   `https://tudominio.com/api/stripe/webhook` con los eventos `checkout.session.completed`, `invoice.paid`,
   `customer.subscription.deleted` e `invoice.payment_failed`. Copia el *signing secret* (`whsec_...`) en
   `STRIPE_WEBHOOK_SECRET`.
4. **Dominio**: en Vercel → *Settings → Domains* añade el dominio y pon en tu proveedor los registros DNS que te indica.

`JWT_SECRET`, `ADMIN_SECRET` y `ADMIN_PASSWORD` no tienen valor por defecto: si faltan, nadie puede iniciar sesión
y el panel de admin queda cerrado. Usa cadenas largas y aleatorias.

## Día a día en el admin

- **Pedidos**: cambia el estado (pendiente, entregado, cancelado) desde la tabla.
- **Usuarios → % Comisión**: porcentaje de referido propio de cada usuario; vacío = 10%.
- **Usuarios → Contraseña → Restablecer**: pon una contraseña nueva a quien la haya olvidado y envíasela por Telegram.
  Cada usuario puede cambiarla después desde *Mi cuenta*.

## Arrancar en local

```bash
npm install
cp .env.example .env.local   # rellena DATABASE_URL y los secretos
npm run dev
```

Abre http://localhost:3000.

## Diseño

Blanco y negro, tipografía Archivo (condensada) y Geist, alojadas en `public/fonts`. El motivo gráfico es el contador
de valoraciones a trazos (`components/Tally.js`): cada trazo es una valoración. Los precios y tramos están en
`lib/catalogo.js` y las preguntas frecuentes en `lib/faq.js`.
