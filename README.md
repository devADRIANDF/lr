# Lamine Resell — Marketplace de cuentas y reviews

Web en Next.js (código propio, pensada para tu servidor). Usa SQLite local
(`data.sqlite`, se crea sola al arrancar) así que no necesitas montar
un servidor de base de datos aparte para empezar. Si el volumen crece mucho,
migra a Postgres cambiando solo `lib/db.js`.

## Arrancar en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000. En local no necesitas Turso: sin las variables
`TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` definidas, se crea solo un archivo
`local.db` en la carpeta del proyecto, igual que antes.

## Desplegar gratis en Netlify o Vercel (recomendado)

Esta web usa Next.js con rutas de API (`pages/api/*`), compatibles con
ambos. La base de datos vive en **Turso** (SQLite en la nube, capa
gratuita de sobra para empezar) en vez de en un archivo local, porque
Netlify/Vercel son *serverless*: el disco de cada función se borra en
cada petición, así que un archivo SQLite local ahí no sirve.

1. Crea una cuenta gratis en [turso.tech](https://turso.tech)
2. Instala su CLI y crea la base de datos:
   ```bash
   turso db create lamine-resell
   turso db show lamine-resell --url        # → TURSO_DATABASE_URL
   turso db tokens create lamine-resell     # → TURSO_AUTH_TOKEN
   ```
3. Sube el proyecto a un repositorio (GitHub/GitLab) y conéctalo desde
   el dashboard de Netlify o Vercel — detectan Next.js solos, no hace
   falta configurar nada de build
4. En la configuración del proyecto (Environment variables), añade
   todas las de `.env.example`: `TURSO_DATABASE_URL`,
   `TURSO_AUTH_TOKEN`, `JWT_SECRET`, `ADMIN_SECRET`, `ADMIN_PASSWORD`,
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
5. Conecta tu dominio desde el propio dashboard (Netlify/Vercel te dan
   los registros DNS exactos a poner) — el HTTPS lo gestionan ellos solos
6. En Stripe, el webhook apunta a `https://tudominio.com/api/stripe/webhook`
   igual que en cualquier otro despliegue

## Desplegar en tu propio servidor (alternativa)

Si prefieres un VPS en vez de Netlify/Vercel, también funciona —
Turso es opcional en ese caso, puedes seguir usando el archivo local
si el servidor tiene disco persistente (que un VPS normal sí tiene):

```bash
npm install
npm run build
npm run start   # sirve en el puerto 3000 por defecto
```

Ponlo detrás de Nginx/Caddy con HTTPS, y usa PM2 o systemd para mantenerlo
vivo (`pm2 start npm --name lamine-resell -- start`).

## Antes de ponerlo en producción — pendiente de tu parte

1. **`JWT_SECRET`**: define esta variable de entorno con un valor largo y
   aleatorio. Ahora mismo usa un valor por defecto solo válido para pruebas.

2. **`ADMIN_PASSWORD` y `ADMIN_SECRET`**: el panel de administración
   (`/admin`) usa una contraseña propia, separada de las cuentas de
   usuario. Por defecto es `admin123` — cámbiala antes de desplegar
   definiendo `ADMIN_PASSWORD` (la contraseña) y `ADMIN_SECRET` (para
   firmar la sesión) como variables de entorno.

2. **Stripe** (`pages/api/stripe/*.js`): ya está integrado con Checkout +
   webhook. El pedido/saldo solo se crea cuando Stripe confirma el pago,
   nunca desde el navegador. Para activarlo:

   a. Crea una cuenta de Stripe (o usa la que ya tengas) y consulta con
      ellos si tu caso de uso concreto está permitido — ver la
      conversación sobre riesgo de procesador de pago.

   b. Copia `.env.example` a `.env.local` y rellena `STRIPE_SECRET_KEY`
      con tu clave secreta (Dashboard → Developers → API keys).

   c. Configura el webhook en el Dashboard de Stripe apuntando a
      `https://tudominio.com/api/stripe/webhook`, escuchando estos eventos:
      `checkout.session.completed`, `invoice.paid`,
      `customer.subscription.deleted`, `invoice.payment_failed`.
      Copia el "Signing secret" que te da a `STRIPE_WEBHOOK_SECRET`.

   d. Para probarlo en local antes de desplegar, usa la Stripe CLI:
      ```
      stripe listen --forward-to localhost:3000/api/stripe/webhook
      ```
      Te dará un `whsec_...` de prueba para tu `.env.local`.

3. **Email automático** (`pages/api/compra/reviews-id.js`): el pedido se
   crea en la tabla `orders` con estado `pendiente`, pero el envío del email
   con instrucciones está marcado como TODO. Conéctalo con Resend, Postmark
   o SES.

4. **Inventario del producto A**: ahora mismo no comprueba stock real de
   cuentas premontadas antes de vender. Si quieres evitar vender una cuenta
   que ya no existe, añade una tabla `cuentas_stock` y descuenta de ahí.

5. **Panel de administración** (`/admin`): ya está incluido. Entra con la
   contraseña que definas en `ADMIN_PASSWORD` (por defecto `admin123` en
   desarrollo). Desde ahí ves todos los pedidos (con quién los hizo, el
   código de referido aplicado si lo hay, y puedes cambiar su estado a
   entregado/cancelado) y el listado de usuarios registrados con su saldo
   y comisiones ganadas.

## Estructura

- `pages/` — rutas visibles (home, producto, reviews-a-tu-id, saldo, login, registro, panel)
- `pages/api/` — lógica de servidor (auth, cartera, compras, referidos)
- `lib/db.js` — esquema SQLite (users, orders, wallet_topups, referral_earnings)
- `lib/auth.js` — sesión por cookie firmada con JWT

## Reviews recurrentes (suscripción mensual)

En `/producto` y `/reviews-a-tu-id` hay un selector "Pago único /
Suscripción mensual". Con suscripción:

- Se cobra una **cuota de alta** el primer día (mismo precio que el pago único)
- Y luego una **cuota mensual** de 6 €/review, cobrada automáticamente por
  Stripe cada mes mientras la suscripción esté activa
- Cada cobro mensual genera un pedido nuevo en `/admin` (pestaña Pedidos)
  para que sepas que toca entregar esas reviews ese mes — la web no las
  reparte sola a lo largo del mes, eso lo gestionas tú
- Desde `/admin` → pestaña "Suscripciones" ves todas las activas y puedes
  cancelarlas (cancela en Stripe; el cliente deja de pagar y de recibir)

El precio de 6 €/review al mes es una asunción mía a partir de tu ejemplo
(5 reviews/mes = 30 €/mes). Si quieres otro precio, está en una única
constante `PRECIO_MENSUAL_UNIDAD` en `pages/api/stripe/checkout-suscripcion.js`.


Cada usuario tiene un `referral_code` único desde que se registra. El enlace
de referido es `/registro?ref=CODIGO`. Al comprar, si el comprador fue
referido por alguien, ese alguien recibe automáticamente el 10% del importe
como saldo (`pages/api/compra/*.js`, función `registrarComision`). Puedes
cambiar el porcentaje editando esa constante.
