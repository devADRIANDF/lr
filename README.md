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
- Páginas legales (aviso legal, privacidad, cookies, condiciones de venta y bases del programa de referidos) y
  preguntas frecuentes. Los datos de la empresa (nombre, email de contacto, registro, domicilio) se cambian en
  `lib/empresa.js`. El único canal de contacto de la web es ese email.
- Aviso de un clic para guardar 30 días el código de quien te invitó (si no se acepta, solo vive en memoria).

## Puesta en marcha

1. **Supabase**: crea un proyecto, abre *SQL Editor* → *New query*, pega el contenido de `schema.sql` y pulsa *Run*.
   Se puede ejecutar más de una vez sin borrar nada.
2. **Vercel**: importa este repositorio de GitHub. En *Settings → Environment Variables* añade todas las variables
   de `.env.example` (las seis obligatorias son `DATABASE_URL`, `JWT_SECRET`, `ADMIN_SECRET`, `ADMIN_PASSWORD`,
   `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`). Después de cambiar variables hay que volver a desplegar.
3. **Stripe**: usa primero el modo de pruebas (*sandbox*) y, cuando todo funcione, repite los pasos con las claves reales.
   - *Developers → API keys*: copia la clave secreta (`sk_test_...`, después `sk_live_...`) en `STRIPE_SECRET_KEY`.
   - *Developers → Webhooks* → *Create an event destination*: elige **Your account**, formato **Snapshot** (no *Thin*),
     los eventos `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted` e
     `invoice.payment_failed`, destino **Webhook endpoint** y la URL `https://tudominio.com/api/stripe/webhook`.
     Copia el *signing secret* (`whsec_...`) en `STRIPE_WEBHOOK_SECRET`. Cada modo (pruebas y real) tiene su propio
     endpoint y su propio `whsec_`.
   - La clave y el `whsec_` de un modo no sirven en el otro: si pasas de pruebas a real, cambia las dos variables.
4. **Dominio**: en Vercel → *Settings → Domains* añade el dominio y pon en tu proveedor los registros DNS que te indica.

`JWT_SECRET`, `ADMIN_SECRET` y `ADMIN_PASSWORD` no tienen valor por defecto: si faltan, nadie puede iniciar sesión
y el panel de admin queda cerrado. Usa cadenas largas y aleatorias.

## Día a día en el admin

- **Pedidos**: cambia el estado (pendiente, entregado, cancelado) desde la tabla.
- **Usuarios → % Comisión**: porcentaje de referido propio de cada usuario; vacío = 10%.
- **Usuarios → Contraseña → Restablecer**: pon una contraseña nueva a quien la haya olvidado y envíasela por email.
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
