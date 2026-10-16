// Código de referido (?ref=ABC1234) en el navegador del visitante.
//
// - Mientras dura la visita (hasta que recarga la página) el código vive solo en memoria: no se guarda nada.
// - Se guarda en el navegador durante 30 días únicamente si el visitante lo acepta en el aviso (AvisoRef).
// - Si dice que no, solo se usa mientras tenga la página abierta.
//
// Claves de localStorage: "rv_ref" (código y caducidad) y "rv_ref_ok" (la elección, "si" o "no").
// Esto se explica en /legal/cookies; si cambias algo aquí, cambia también ese texto.

const CLAVE_CODIGO = "rv_ref";
const CLAVE_ELECCION = "rv_ref_ok";
const DIAS_CODIGO = 30;
const DIAS_ELECCION = 365;
const DIA = 24 * 60 * 60 * 1000;

let enMemoria = null;
const oyentes = new Set();

function leer(clave) {
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}
function escribir(clave, valor) {
  try {
    window.localStorage.setItem(clave, valor);
  } catch {}
}
function borrar(clave) {
  try {
    window.localStorage.removeItem(clave);
  } catch {}
}
function leerJson(clave) {
  const v = leer(clave);
  if (!v) return null;
  try {
    const o = JSON.parse(v);
    return o && typeof o === "object" ? o : null;
  } catch {
    return null;
  }
}
function avisar() {
  oyentes.forEach((f) => f());
}

export function codigoValido(c) {
  return typeof c === "string" && /^[A-Za-z0-9]{3,32}$/.test(c);
}

// Elección del visitante: "si", "no" o null si todavía no ha elegido (o la elección caducó).
export function eleccion() {
  if (typeof window === "undefined") return null;
  const e = leerJson(CLAVE_ELECCION);
  if (!e || (e.v !== "si" && e.v !== "no") || !(Date.now() < e.hasta)) {
    if (leer(CLAVE_ELECCION) !== null) borrar(CLAVE_ELECCION);
    return null;
  }
  return e.v;
}

function guardarCodigo(c) {
  escribir(CLAVE_CODIGO, JSON.stringify({ c, hasta: Date.now() + DIAS_CODIGO * DIA }));
}

function codigoGuardado() {
  if (typeof window === "undefined") return null;
  const g = leerJson(CLAVE_CODIGO);
  if (!g || !codigoValido(g.c) || !(Date.now() < g.hasta)) {
    if (leer(CLAVE_CODIGO) !== null) borrar(CLAVE_CODIGO);
    return null;
  }
  return g.c;
}

// Se llama una vez al arrancar la web: borra lo que se guardó con la versión anterior (sin pedir permiso)
// y lo que haya caducado.
export function limpiarAntiguo() {
  if (typeof window === "undefined") return;
  if (leer(CLAVE_CODIGO) !== null && (eleccion() !== "si" || !codigoGuardado())) borrar(CLAVE_CODIGO);
  avisar();
}

// El visitante llega con ?ref=CODIGO
export function recibirCodigo(c) {
  if (!codigoValido(c)) return;
  enMemoria = c;
  if (eleccion() === "si") guardarCodigo(c);
  avisar();
}

// Código que hay que aplicar ahora mismo (el de esta visita o, si lo aceptó, el guardado).
export function codigoActual() {
  if (enMemoria) return enMemoria;
  if (typeof window === "undefined") return null;
  return eleccion() === "si" ? codigoGuardado() : null;
}

// Código que se envía al comprar o al registrarse: el de la dirección actual, si lo hay, y si no el recordado.
export function refParaEnviar(delaUrl) {
  return (codigoValido(delaUrl) ? delaUrl : null) || codigoActual();
}

// Conviene preguntar: hay un código de invitación en esta visita y el visitante aún no ha elegido.
export function hayQuePreguntar() {
  return !!enMemoria && eleccion() === null;
}

export function elegir(valor) {
  const v = valor === "si" ? "si" : "no";
  escribir(CLAVE_ELECCION, JSON.stringify({ v, hasta: Date.now() + DIAS_ELECCION * DIA }));
  if (v === "si") {
    if (enMemoria) guardarCodigo(enMemoria);
  } else {
    borrar(CLAVE_CODIGO);
  }
  avisar();
}

// Retirar el permiso: borra el código guardado y no vuelve a guardar ninguno.
export function olvidar() {
  borrar(CLAVE_CODIGO);
  escribir(CLAVE_ELECCION, JSON.stringify({ v: "no", hasta: Date.now() + DIAS_ELECCION * DIA }));
  avisar();
}

export function estado() {
  return { eleccion: eleccion(), guardado: !!codigoGuardado() };
}

export function suscribir(f) {
  oyentes.add(f);
  return () => oyentes.delete(f);
}
