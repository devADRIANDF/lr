import { EMPRESA } from "./empresa";

export const PREGUNTAS = [
  {
    q: "¿Cómo se calcula el precio de una cuenta?",
    a: "Cada cuenta tiene un precio fijo según su tramo: 5 valoraciones (50 €), 10 (90 €), 15 (125 €) o 20 (160 €). Si quieres más valoraciones de las del tramo elegido, cada una extra cuesta 9 €.",
  },
  {
    q: "¿Necesito crear una cuenta para comprar?",
    a: "No. Solo necesitas tu email y el pago. La cuenta es opcional y sirve para guardar tu historial de pedidos y, si quieres, obtener tu propio enlace de referido.",
  },
  {
    q: "¿Cuánto tarda la entrega?",
    a: "Las cuentas se preparan bajo pedido y la entrega puede tardar hasta 4 semanas. Te enviamos los datos de acceso por email, de forma manual, a la dirección que indicaste al comprar.",
  },
  {
    q: "¿Y si mi pedido no llega?",
    a: `Si pasan las 4 semanas y no lo has recibido, te devolvemos el importe completo: escríbenos a ${EMPRESA.email}. Una vez entregado el pedido no hay reembolso por cambio de opinión, porque es contenido digital.`,
  },
  {
    q: "¿Qué es el programa de referidos?",
    a: "Si te registras, obtienes un enlace propio. Cualquier compra hecha a través de ese enlace, tenga o no cuenta quien compra, te da una comisión del 10% en tu monedero.",
  },
  {
    q: "¿Cómo retiro el saldo que he ganado?",
    a: `El saldo se queda en tu monedero y puedes usarlo para pagar pedidos de pago único. Si prefieres retirarlo, escríbenos a ${EMPRESA.email} y lo tramitamos manualmente.`,
  },
  {
    q: "¿Es seguro pagar en la web?",
    a: "Sí. El pago lo procesa Stripe, una de las pasarelas de pago más usadas del mundo. Nosotros nunca vemos ni guardamos los datos de tu tarjeta.",
  },
  {
    q: "Tengo una suscripción mensual, ¿puedo cancelarla?",
    a: `Sí, cuando quieras. Escríbenos a ${EMPRESA.email} y la cancelamos; dejarás de recibir cobros a partir de la siguiente fecha de renovación.`,
  },
  {
    q: "He olvidado mi contraseña, ¿qué hago?",
    a: `Escríbenos a ${EMPRESA.email} con el email de tu cuenta y te la restablecemos. Después puedes cambiarla tú mismo desde tu cuenta.`,
  },
];
