// Datos de la empresa que salen en los textos legales (aviso legal, privacidad, condiciones...).
// Se cambian aquí, en un único sitio, y se actualizan todas las páginas.
// Las líneas que dejes vacías ("") no se muestran.
export const EMPRESA = {
  nombre: "Laminereviews LTD",
  marca: "Lamine Resell",

  // Único canal de contacto de la web: menú, pie, preguntas frecuentes, avisos de error y textos legales.
  email: "strikepicksup@gmail.com",

  // PENDIENTE: datos del registro de la sociedad. La normativa de comercio electrónico pide que
  // el aviso legal los incluya. Rellénalos tal como constan en el registro mercantil de la empresa,
  // escribiéndolos entre las comillas. Los que dejes vacíos no se muestran.
  numeroRegistro: "", // número de la sociedad en su registro (company number)
  paisRegistro: "", // país donde está registrada, p. ej. "Reino Unido (Inglaterra y Gales)"
  domicilio: "", // domicilio social completo (registered office)
  identificacionFiscal: "", // número de identificación fiscal o de IVA de la empresa, si lo tiene

  // Fecha de la última revisión de los textos legales
  actualizado: "14 de octubre de 2026",
};

// Enlace para abrir el correo del visitante con el destinatario ya puesto
export const MAILTO_URL = `mailto:${EMPRESA.email}`;
