// Límite sencillo de intentos fallidos de acceso al panel, por dirección IP.
// Vive en la memoria de cada instancia del servidor: no es un escudo total (en Vercel pueden
// existir varias instancias a la vez), pero frena los intentos seguidos desde un mismo sitio.

const VENTANA_MS = 15 * 60 * 1000;
const MAX_FALLOS = 10;
const fallos = new Map(); // ip -> { n, desde }

export function ipDe(req) {
  const xff = req.headers["x-forwarded-for"];
  const primera = typeof xff === "string" ? xff.split(",")[0].trim() : "";
  return primera || req.socket?.remoteAddress || "desconocida";
}

function vigente(clave, ahora) {
  const f = fallos.get(clave);
  if (!f) return null;
  if (ahora - f.desde > VENTANA_MS) {
    fallos.delete(clave);
    return null;
  }
  return f;
}

export function demasiadosIntentos(clave) {
  const f = vigente(clave, Date.now());
  return !!f && f.n >= MAX_FALLOS;
}

export function anotarFallo(clave) {
  const ahora = Date.now();
  const f = vigente(clave, ahora);
  if (f) f.n += 1;
  else fallos.set(clave, { n: 1, desde: ahora });
  // Evita que el mapa crezca sin límite
  if (fallos.size > 5000) {
    for (const [k, v] of fallos) if (ahora - v.desde > VENTANA_MS) fallos.delete(k);
  }
}

export function olvidarFallos(clave) {
  fallos.delete(clave);
}
