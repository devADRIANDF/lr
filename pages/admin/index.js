import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const ESTADOS = ["pendiente", "entregado", "cancelado"];
const ESTADO_COLOR = {
  pendiente: "border-2 border-ink bg-paper text-ink",
  entregado: "border-2 border-ink bg-ink text-paper",
  cancelado: "border-2 border-ash bg-paper text-ash line-through",
};
const ESTADO_FLECHA = { pendiente: "text-ink", entregado: "text-paper", cancelado: "text-ash" };

// Formatos que se repiten en las tablas y en las tarjetas del móvil
const euros = (cents) => `${((cents || 0) / 100).toFixed(2)} €`;
const fechaHora = (d) => (d ? new Date(d).toLocaleString("es-ES") : "—");
const fecha = (d) => (d ? new Date(d).toLocaleDateString("es-ES") : "—");
const tipoDe = (t) => (t === "cuenta" ? "Cuenta lista" : "A su ID");
// Abre el correo con el cliente ya puesto: así se le entrega el pedido a mano desde el móvil
const correo = (email, asunto) => `mailto:${email}?subject=${encodeURIComponent(asunto)}`;

// Contraseñas largas sin caracteres que se confunden (0/O, 1/l/I)
const ALFABETO_CLAVE = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function generarClave(largo = 16) {
  const a = new Uint32Array(largo);
  crypto.getRandomValues(a);
  return Array.from(a, (x) => ALFABETO_CLAVE[x % ALFABETO_CLAVE.length]).join("");
}
// Los administradores necesitan una contraseña más larga (el servidor lo exige igual)
const minimoClave = (esAdmin) => (esAdmin ? 10 : 6);

// Pide datos al servidor y, si falla, devuelve el texto del error (503 = base de datos sin conectar, etc.)
async function pedir(url) {
  try {
    const r = await fetch(url);
    const d = await r.json().catch(() => null);
    if (!r.ok) return { ok: false, error: d?.error || `El servidor respondió con un error (${r.status}).` };
    return { ok: true, data: d };
  } catch {
    return { ok: false, error: "No se pudo conectar con el servidor." };
  }
}

export default function Admin() {
  const [checked, setChecked] = useState(false);
  const [yo, setYo] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [config, setConfig] = useState(null);
  const [errorDatos, setErrorDatos] = useState(null);
  const [tab, setTab] = useState("pedidos");
  const [filtro, setFiltro] = useState("todos");
  const [filtroUsuarios, setFiltroUsuarios] = useState("todos");
  const [nuevoUsuario, setNuevoUsuario] = useState(false);
  const router = useRouter();

  async function cargarTodo() {
    // Peticiones independientes: si una falla, las demás se muestran igual
    const [st, pe, us, su, es] = await Promise.all([
      pedir("/api/admin/stats"),
      pedir("/api/admin/orders"),
      pedir("/api/admin/users"),
      pedir("/api/admin/subscriptions"),
      pedir("/api/admin/estado"),
    ]);
    if (st.ok) setStats(st.data);
    if (pe.ok) setOrders(pe.data?.orders || []);
    if (us.ok) setUsers(us.data?.users || []);
    if (su.ok) setSubs(su.data?.subscriptions || []);
    if (es.ok) setConfig(es.data);
    // Un solo aviso, con el texto del primer fallo (casi siempre es el mismo: la base de datos)
    const fallo = [st, pe, us, su].find((x) => !x.ok);
    setErrorDatos(fallo ? fallo.error : null);
  }

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.isAdmin) return router.replace("/admin/login");
        setYo(d);
        setChecked(true);
        cargarTodo();
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  async function cambiarEstado(id, status) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  async function cancelarSuscripcion(stripeSubscriptionId) {
    if (!confirm("¿Cancelar esta suscripción?")) return;
    setSubs((prev) => prev.map((s) => (s.stripe_subscription_id === stripeSubscriptionId ? { ...s, status: "cancelada" } : s)));
    await fetch("/api/admin/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stripeSubscriptionId }),
    });
  }

  if (!checked) {
    return <main className="min-h-screen bg-page px-6 py-16 text-sm text-mist">Comprobando acceso…</main>;
  }

  const pedidosVisibles = filtro === "todos" ? orders : orders.filter((o) => o.status === filtro);
  const administradores = users.filter((u) => u.is_admin);
  const usuariosVisibles = filtroUsuarios === "admins" ? administradores : users;
  // Si ya hay un aviso de configuración, no se repite el error de datos
  const hayProblemasConfig = !!config?.checks?.some((c) => !c.ok);

  return (
    <>
      <Head><title>Admin — Lamine Resell</title></Head>
      <main className="min-h-screen bg-page pb-16">
        <header className="border-b-[3px] border-ink bg-paper">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3 md:py-4">
            <h1 className="cond text-2xl text-ink md:text-3xl">Lamine Resell Admin</h1>
            <div className="flex items-center gap-4">
              {yo && (
                <span className="hidden max-w-[16rem] truncate text-xs text-ash sm:inline" title={yo.email || "Clave general"}>
                  {yo.email || "Clave general"}
                </span>
              )}
              <button
                onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); }}
                className="min-h-11 text-sm font-semibold text-ink underline underline-offset-4"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-5 py-6 md:py-8">
          <Configuracion config={config} />
          {errorDatos && !hayProblemasConfig && (
            <p role="alert" className="mb-6 border-[3px] border-ink border-l-[10px] border-l-alert bg-paper px-4 py-3 text-[15px] font-medium text-ink">
              No se pudieron cargar los datos: {errorDatos}
            </p>
          )}

          {/* TARJETAS SUPERIORES: en el móvil, los contadores en una fila y los importes debajo */}
          <div className="grid grid-cols-6 gap-3 lg:grid-cols-5">
            <Stat label="Pedidos totales" value={stats ? (stats.totalPedidos || 0) : "—"} className="col-span-2 lg:col-span-1" />
            <Stat label="Pendientes" value={stats ? (stats.pendientes || 0) : "—"} highlight={stats && stats.pendientes > 0} className="col-span-2 lg:col-span-1" />
            <Stat label="Usuarios" value={stats ? (stats.totalUsuarios || users.length) : users.length} className="col-span-2 lg:order-4 lg:col-span-1" />
            <Stat label="Facturado" value={stats ? euros(stats.facturado_cents) : "—"} dinero className="col-span-3 lg:order-3 lg:col-span-1" />
            <Stat label="Comisiones pagadas" value={stats ? euros(stats.comisiones_cents) : "—"} dinero className="col-span-3 lg:order-5 lg:col-span-1" />
          </div>

          <div className="mt-8 flex gap-1 border-b-[3px] border-ink sm:gap-2">
            {["pedidos", "suscripciones", "usuarios"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`-mb-[3px] min-h-11 border-b-[3px] px-3 text-[13px] font-semibold capitalize sm:px-4 sm:text-sm ${
                  tab === t ? "border-ink bg-ink text-paper" : "border-transparent text-ash hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "pedidos" && (
            <div className="mt-6">
              <div className="mb-3 flex flex-wrap gap-2">
                {["todos", ...ESTADOS].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    className={`min-h-11 rounded-none border-2 px-3 text-[13px] font-semibold capitalize transition lg:min-h-0 lg:py-1.5 lg:text-xs ${
                      filtro === f ? "border-ink bg-ink text-paper" : "border-ink text-ink hover:bg-bone"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Móvil y tableta: una tarjeta por pedido */}
              <ul className="space-y-3 lg:hidden">
                {pedidosVisibles.map((o) => (
                  <PedidoTarjeta key={o.id} o={o} onEstado={cambiarEstado} />
                ))}
                {pedidosVisibles.length === 0 && (
                  <li className="border-[3px] border-ink bg-paper px-4 py-8 text-center text-mist">No hay pedidos con este filtro.</li>
                )}
              </ul>

              {/* Escritorio: tabla */}
              <div className="hidden overflow-x-auto border-[3px] border-ink bg-paper lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-[3px] border-ink bg-bone text-xs font-semibold text-ink">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Reviews</th>
                      <th className="px-4 py-3">ID destino</th>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Importe</th>
                      <th className="px-4 py-3">Referido por</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosVisibles.map((o) => {
                      const email = o.user_email || o.guest_email;
                      return (
                        <tr key={o.id} className="border-b border-line last:border-0">
                          <td className="px-4 py-3 text-mist">{o.id}</td>
                          <td className="px-4 py-3 text-ink">{tipoDe(o.type)}</td>
                          <td className="px-4 py-3 text-ink">{o.package}</td>
                          <td className="px-4 py-3 font-mono text-xs text-mist">{o.target_id || "—"}</td>
                          <td className="px-4 py-3 text-ink">
                            {email ? <a href={correo(email, "Tu pedido de Lamine Resell")} className="underline underline-offset-4">{email}</a> : "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-600 text-ink">{euros(o.amount_cents)}</td>
                          <td className="px-4 py-3 text-xs text-mist">{o.referred_by_code || "—"}</td>
                          <td className="px-4 py-3 text-xs text-mist">{fechaHora(o.created_at)}</td>
                          <td className="px-4 py-3">
                            <select
                              value={o.status}
                              onChange={(e) => cambiarEstado(o.id, e.target.value)}
                              className={`rounded-none px-2 py-1 text-xs font-600 capitalize outline-none ${ESTADO_COLOR[o.status] || ""}`}
                            >
                              {ESTADOS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                    {pedidosVisibles.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-8 text-center text-mist">No hay pedidos con este filtro.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "suscripciones" && (
            <div className="mt-6">
              <ul className="space-y-3 lg:hidden">
                {subs.map((s) => (
                  <SuscripcionTarjeta key={s.id} s={s} onCancelar={cancelarSuscripcion} />
                ))}
                {subs.length === 0 && (
                  <li className="border-[3px] border-ink bg-paper px-4 py-8 text-center text-mist">Aún no hay suscripciones activas.</li>
                )}
              </ul>

              <div className="hidden overflow-x-auto border-[3px] border-ink bg-paper lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-[3px] border-ink bg-bone text-xs font-semibold text-ink">
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">ID destino</th>
                      <th className="px-4 py-3">Reviews/mes</th>
                      <th className="px-4 py-3">Cuota mensual</th>
                      <th className="px-4 py-3">Referido por</th>
                      <th className="px-4 py-3">Desde</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map((s) => (
                      <tr key={s.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-3 text-ink">
                          {s.email ? <a href={correo(s.email, "Tu suscripción de Lamine Resell")} className="underline underline-offset-4">{s.email}</a> : "—"}
                        </td>
                        <td className="px-4 py-3 text-ink">{tipoDe(s.type)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-mist">{s.target_id || "—"}</td>
                        <td className="px-4 py-3 text-ink">{s.reviews_per_month}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-600 text-ink">{euros(s.monthly_amount_cents)}</td>
                        <td className="px-4 py-3 text-xs text-mist">{s.referred_by_code || "—"}</td>
                        <td className="px-4 py-3 text-xs text-mist">{fecha(s.created_at)}</td>
                        <td className="px-4 py-3"><EstadoSuscripcion status={s.status} /></td>
                        <td className="px-4 py-3">
                          {s.status === "activa" && (
                            <button
                              onClick={() => cancelarSuscripcion(s.stripe_subscription_id)}
                              className="text-xs font-semibold text-alert hover:underline"
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {subs.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-8 text-center text-mist">Aún no hay suscripciones activas.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "usuarios" && (
            <div className="mt-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNuevoUsuario((v) => !v)}
                  aria-expanded={nuevoUsuario}
                  className="order-first min-h-11 w-full border-2 border-ink bg-ink px-4 text-[13px] font-semibold text-paper hover:bg-paper hover:text-ink sm:order-none sm:ml-auto sm:w-auto lg:min-h-0 lg:py-1.5 lg:text-xs"
                >
                  {nuevoUsuario ? "Cerrar" : "+ Añadir usuario o administrador"}
                </button>
                {[
                  ["todos", `Todos (${users.length})`],
                  ["admins", `Administradores (${administradores.length})`],
                ].map(([valor, etiqueta]) => (
                  <button
                    key={valor}
                    onClick={() => setFiltroUsuarios(valor)}
                    className={`min-h-11 rounded-none border-2 px-3 text-[13px] font-semibold transition lg:min-h-0 lg:py-1.5 lg:text-xs ${
                      filtroUsuarios === valor ? "border-ink bg-ink text-paper" : "border-ink text-ink hover:bg-bone"
                    }`}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>

              {nuevoUsuario && <NuevoUsuario onCreado={cargarTodo} onCerrar={() => setNuevoUsuario(false)} />}

              <ul className="space-y-3 lg:hidden">
                {usuariosVisibles.map((u) => (
                  <UsuarioTarjeta key={u.id} u={u} yoId={yo?.id} onGuardado={cargarTodo} />
                ))}
                {usuariosVisibles.length === 0 && (
                  <li className="border-[3px] border-ink bg-paper px-4 py-8 text-center text-mist">
                    {filtroUsuarios === "admins"
                      ? "Aún no hay cuentas de administrador. Tú entras con la clave general."
                      : "Aún no hay usuarios registrados."}
                  </li>
                )}
              </ul>

              <div className="hidden overflow-x-auto border-[3px] border-ink bg-paper lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-[3px] border-ink bg-bone text-xs font-semibold text-ink">
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Saldo</th>
                      <th className="px-4 py-3">Referidos</th>
                      <th className="px-4 py-3">Comisiones ganadas</th>
                      <th className="px-4 py-3">% Comisión</th>
                      <th className="px-4 py-3">Contraseña</th>
                      <th className="px-4 py-3">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosVisibles.map((u) => (
                      <tr key={u.id} className="border-b border-line align-top last:border-0">
                        <td className="px-4 py-3 text-ink">
                          {u.email}
                          <p className="mt-0.5 text-xs text-mist">
                            Código <span className="font-mono">{u.referral_code || "—"}</span> · Alta {fecha(u.created_at)}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink">{euros(u.wallet_balance)}</td>
                        <td className="px-4 py-3 text-ink">{u.referidos || 0}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink">{euros(u.comisiones_cents)}</td>
                        <td className="px-4 py-3">
                          <ComisionInput usuario={u} onGuardado={cargarTodo} />
                        </td>
                        <td className="px-4 py-3">
                          <ResetPassword usuario={u} />
                        </td>
                        <td className="px-4 py-3">
                          <RolUsuario u={u} yoId={yo?.id} onGuardado={cargarTodo} />
                        </td>
                      </tr>
                    ))}
                    {usuariosVisibles.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-mist">
                          {filtroUsuarios === "admins"
                            ? "Aún no hay cuentas de administrador. Tú entras con la clave general."
                            : "Aún no hay usuarios registrados."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// Aviso de lo que falta por configurar. Solo aparece si hay algo pendiente.
function Configuracion({ config }) {
  if (!config?.checks) return null;
  const pendientes = config.checks.filter((c) => !c.ok);
  const avisos = config.checks.filter((c) => c.ok && c.aviso);
  if (pendientes.length === 0 && avisos.length === 0) return null;

  return (
    <section aria-label="Configuración" className="mb-6 border-[3px] border-ink bg-paper p-4 md:p-5">
      <h2 className="cond text-[26px] md:text-[32px]">
        {pendientes.length === 0 ? "Aviso" : pendientes.length === 1 ? "Falta configurar 1 cosa" : `Faltan por configurar ${pendientes.length} cosas`}
      </h2>
      <ul className="mt-3 space-y-3">
        {pendientes.map((c) => (
          <li key={c.id} className="border-l-[6px] border-alert pl-3">
            <p className="text-[15px] font-semibold text-ink">{c.titulo}</p>
            <p className="text-[14px] leading-snug text-ink">{c.mensaje}</p>
            {c.arreglo && (
              <p className="mt-1 text-[13px] leading-snug text-ash">
                <span className="font-semibold text-ink">Cómo arreglarlo: </span>
                {c.arreglo}
              </p>
            )}
          </li>
        ))}
        {avisos.map((c) => (
          <li key={c.id} className="border-l-[6px] border-ink pl-3">
            <p className="text-[15px] font-semibold text-ink">{c.titulo}</p>
            <p className="text-[14px] leading-snug text-ink">{c.aviso}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const BOTON_CHICO =
  "min-h-11 border-2 border-ink px-3 text-[13px] font-semibold text-ink hover:bg-ink hover:text-paper disabled:opacity-50 lg:min-h-0 lg:px-2 lg:py-1 lg:text-[11px]";
const CAMPO_CHICO =
  "h-11 min-w-0 flex-1 border-2 border-ink bg-paper px-2 text-base text-ink outline-none focus:bg-bone lg:h-auto lg:w-40 lg:flex-none lg:py-1 lg:text-xs";

function CopiarBoton({ texto, etiqueta = "Copiar" }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // Navegadores sin portapapeles: se copia desde un campo temporal
      const t = document.createElement("textarea");
      t.value = texto;
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      try { document.execCommand("copy"); } catch {}
      document.body.removeChild(t);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <button type="button" onClick={copiar} className={BOTON_CHICO}>
      {copiado ? "✓ Copiado" : etiqueta}
    </button>
  );
}

// Formulario para dar de alta a alguien (cliente o administrador) sin que tenga que registrarse
function NuevoUsuario({ onCreado, onCerrar }) {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [admin, setAdmin] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [creado, setCreado] = useState(null);
  const minimo = minimoClave(admin);

  async function crear(e) {
    e.preventDefault();
    setError(null);
    if (clave.length < minimo) return setError(`La contraseña necesita al menos ${minimo} caracteres.`);
    setGuardando(true);
    try {
      const r = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: clave, admin }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return setError(d.error || "No se pudo crear el usuario.");
      setCreado({ email: d.user.email, clave, admin: !!d.user.is_admin });
      onCreado();
    } catch {
      setError("No se pudo conectar. Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  if (creado) {
    const enlace = `${window.location.origin}${creado.admin ? "/admin/login" : "/login"}`;
    const mensaje = `Acceso a Lamine Resell\nEntra en: ${enlace}\nEmail: ${creado.email}\nContraseña: ${creado.clave}`;
    return (
      <div role="status" className="mb-4 border-[3px] border-ink bg-paper p-4">
        <p className="cond text-[26px]">{creado.admin ? "Administrador creado" : "Usuario creado"}</p>
        <dl className="mt-3 space-y-1 text-[15px]">
          <div className="flex flex-wrap gap-x-2"><dt className="text-ash">Entra en</dt><dd className="break-all font-medium text-ink">{enlace}</dd></div>
          <div className="flex flex-wrap gap-x-2"><dt className="text-ash">Email</dt><dd className="break-all font-medium text-ink">{creado.email}</dd></div>
          <div className="flex flex-wrap gap-x-2"><dt className="text-ash">Contraseña</dt><dd className="break-all font-mono font-medium text-ink">{creado.clave}</dd></div>
        </dl>
        <p className="mt-3 text-[13px] leading-snug text-ash">
          Guarda la contraseña ahora: no se puede volver a ver. Si se pierde, se restablece desde la lista.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopiarBoton texto={mensaje} etiqueta="Copiar mensaje para enviárselo" />
          <button type="button" className={BOTON_CHICO} onClick={() => { setCreado(null); setEmail(""); setClave(""); setAdmin(false); }}>
            Crear otro
          </button>
          <button type="button" className={BOTON_CHICO} onClick={onCerrar}>Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={crear} className="mb-4 border-[3px] border-ink bg-paper p-4">
      <p className="cond text-[26px]">Nuevo usuario</p>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="nu-email" className="mb-1 block text-xs font-semibold text-ink">Email</label>
          <input
            id="nu-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="h-11 w-full border-2 border-ink bg-paper px-3 text-base text-ink outline-none focus:bg-bone"
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="nu-clave" className="mb-1 block text-xs font-semibold text-ink">
            Contraseña <span className="font-normal text-ash">(mínimo {minimo})</span>
          </label>
          <div className="flex gap-2">
            <input
              id="nu-clave"
              type="text"
              required
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className="h-11 min-w-0 flex-1 border-2 border-ink bg-paper px-3 font-mono text-base text-ink outline-none focus:bg-bone"
            />
            <button type="button" onClick={() => setClave(generarClave())} className="h-11 shrink-0 border-2 border-ink px-3 text-[13px] font-semibold text-ink hover:bg-ink hover:text-paper">
              Generar
            </button>
          </div>
        </div>
      </div>

      <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 text-[15px] leading-snug">
        <input type="checkbox" checked={admin} onChange={(e) => setAdmin(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-black" />
        <span>
          <span className="font-semibold text-ink">Administrador</span>{" "}
          <span className="text-ash">— entra a este panel con su email y contraseña: ve pedidos, cambia estados y restablece contraseñas.</span>
        </span>
      </label>

      {error && <p role="alert" className="mt-3 border-l-[6px] border-alert pl-3 text-[14px] font-medium text-alert">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" disabled={guardando} className="min-h-11 border-2 border-ink bg-ink px-5 text-[13px] font-semibold text-paper hover:bg-paper hover:text-ink disabled:opacity-50">
          {guardando ? "Creando…" : "Crear"}
        </button>
        <button type="button" onClick={onCerrar} className="min-h-11 border-2 border-ink px-5 text-[13px] font-semibold text-ink hover:bg-bone">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// Rol de una cuenta: cliente o administrador, y el botón para cambiarlo
function RolUsuario({ u, yoId, onGuardado }) {
  const [abierto, setAbierto] = useState(false);
  const [clave, setClave] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [hecho, setHecho] = useState(null); // contraseña fijada al hacerlo admin: se enseña una sola vez
  const esYo = yoId !== undefined && yoId !== null && Number(yoId) === Number(u.id);

  async function enviar(cuerpo) {
    setError(null);
    setGuardando(true);
    try {
      const r = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u.id, ...cuerpo }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error || "No se pudo cambiar el rol.");
        return false;
      }
      return true;
    } catch {
      setError("No se pudo conectar.");
      return false;
    } finally {
      setGuardando(false);
    }
  }

  async function quitar() {
    if (!confirm(`¿Quitar el acceso de administrador a ${u.email}? Ya no podrá entrar al panel.`)) return;
    if (await enviar({ admin: false })) onGuardado();
  }

  async function promover(e) {
    e.preventDefault();
    const min = minimoClave(true);
    if (clave.length < min) return setError(`Mínimo ${min} caracteres.`);
    if (await enviar({ admin: true, new_password: clave })) {
      setHecho(clave);
      setAbierto(false);
      setClave("");
      onGuardado();
    }
  }

  if (hecho) {
    return (
      <div role="status" className="text-[13px] leading-snug">
        <p className="font-semibold text-ink">✓ Ya es administrador</p>
        <p className="mt-1 text-ash">Su contraseña nueva (guárdala ahora):</p>
        <p className="break-all font-mono text-ink">{hecho}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <CopiarBoton texto={hecho} />
          <button type="button" className={BOTON_CHICO} onClick={() => setHecho(null)}>Listo</button>
        </div>
      </div>
    );
  }

  if (u.is_admin) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-block border-2 border-ink bg-ink px-2 py-1 text-xs font-600 text-paper">Administrador</span>
        {esYo ? (
          <span className="text-[11px] text-mist">(eres tú)</span>
        ) : (
          <button type="button" onClick={quitar} disabled={guardando} className={BOTON_CHICO}>
            {guardando ? "..." : "Quitar admin"}
          </button>
        )}
        {error && <span role="alert" className="w-full text-[11px] text-alert">{error}</span>}
      </div>
    );
  }

  if (!abierto) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-mist">Cliente</span>
        <button type="button" onClick={() => setAbierto(true)} className={BOTON_CHICO}>Hacer administrador</button>
      </div>
    );
  }

  return (
    <form onSubmit={promover} className="space-y-2">
      <p className="text-[12px] leading-snug text-ash">
        Entrará al panel con este email. Se le fija una contraseña nueva (mínimo {minimoClave(true)}) y sustituye a la de su cuenta.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="Contraseña"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-label="Contraseña nueva del administrador"
          className={`${CAMPO_CHICO} font-mono`}
        />
        <button type="button" onClick={() => setClave(generarClave())} className={BOTON_CHICO}>Generar</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={guardando} className={BOTON_CHICO}>{guardando ? "..." : "Hacer admin"}</button>
        <button type="button" onClick={() => { setAbierto(false); setError(null); setClave(""); }} className={BOTON_CHICO}>Cancelar</button>
      </div>
      {error && <p role="alert" className="text-[11px] text-alert">{error}</p>}
    </form>
  );
}

function Stat({ label, value, highlight, dinero, className = "" }) {
  return (
    <div className={`min-w-0 border-[3px] border-ink p-3 sm:p-4 ${highlight ? "bg-ink text-paper" : "bg-paper text-ink"} ${className}`}>
      <p className={`text-xs font-semibold ${highlight ? "text-paper/70" : "text-ash"}`}>{label}</p>
      <p className={`cond mt-2 ${dinero ? "text-[26px] md:text-4xl" : "text-[32px] md:text-4xl"}`}>{value}</p>
    </div>
  );
}

function EstadoSuscripcion({ status }) {
  return (
    <span
      className={`inline-block rounded-none px-2 py-1 text-xs font-600 capitalize ${
        status === "activa" ? "border-2 border-ink bg-ink text-paper" : status === "impago" ? "border-2 border-ink text-ink" : "border-2 border-ash text-ash line-through"
      }`}
    >
      {status}
    </span>
  );
}

// ---- Tarjetas para el móvil: lo mismo que las tablas, apilado y con botones grandes ----

function PedidoTarjeta({ o, onEstado }) {
  const email = o.user_email || o.guest_email;
  return (
    <li className="border-[3px] border-ink bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-mist">#{o.id} · {fechaHora(o.created_at)}</p>
          <p className="mt-1 font-semibold text-ink">{tipoDe(o.type)} · {o.package} reviews</p>
        </div>
        <p className="cond shrink-0 text-[28px] leading-none text-ink">{euros(o.amount_cents)}</p>
      </div>

      {email && (
        <a
          href={correo(email, "Tu pedido de Lamine Resell")}
          className="mt-2 flex min-h-11 items-center break-all text-[15px] font-medium text-ink underline underline-offset-4"
        >
          {email}
        </a>
      )}
      {o.target_id && <p className="break-all font-mono text-xs text-mist">ID destino: {o.target_id}</p>}
      {o.referred_by_code && <p className="mt-1 text-xs text-mist">Referido por: {o.referred_by_code}</p>}

      <div className={`relative mt-3 ${ESTADO_FLECHA[o.status] || "text-ink"}`}>
        <select
          value={o.status}
          onChange={(e) => onEstado(o.id, e.target.value)}
          aria-label={`Estado del pedido ${o.id}`}
          className={`h-11 w-full appearance-none rounded-none px-3 pr-10 text-base font-600 capitalize outline-none ${ESTADO_COLOR[o.status] || ""}`}
        >
          {ESTADOS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-0 w-0 -translate-y-1/2 border-x-[6px] border-t-[7px] border-x-transparent border-t-current" />
      </div>
    </li>
  );
}

function SuscripcionTarjeta({ s, onCancelar }) {
  return (
    <li className="border-[3px] border-ink bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {s.email ? (
            <a href={correo(s.email, "Tu suscripción de Lamine Resell")} className="flex min-h-11 items-center break-all text-[15px] font-semibold text-ink underline underline-offset-4">
              {s.email}
            </a>
          ) : (
            <p className="font-semibold text-ink">—</p>
          )}
          <p className="text-xs text-mist">{tipoDe(s.type)} · {s.reviews_per_month} reviews/mes</p>
        </div>
        <p className="cond shrink-0 text-[28px] leading-none text-ink">{euros(s.monthly_amount_cents)}</p>
      </div>
      {s.target_id && <p className="mt-2 break-all font-mono text-xs text-mist">ID destino: {s.target_id}</p>}
      <p className="mt-1 text-xs text-mist">
        Desde {fecha(s.created_at)}
        {s.referred_by_code ? ` · Referido por ${s.referred_by_code}` : ""}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <EstadoSuscripcion status={s.status} />
        {s.status === "activa" && (
          <button
            onClick={() => onCancelar(s.stripe_subscription_id)}
            className="min-h-11 border-2 border-alert px-4 text-sm font-semibold text-alert"
          >
            Cancelar
          </button>
        )}
      </div>
    </li>
  );
}

function UsuarioTarjeta({ u, yoId, onGuardado }) {
  return (
    <li className="border-[3px] border-ink bg-paper p-4">
      <div className="flex flex-wrap items-center gap-x-2">
        <a href={`mailto:${u.email}`} className="flex min-h-11 min-w-0 items-center break-all text-[15px] font-semibold text-ink underline underline-offset-4">
          {u.email}
        </a>
        {u.is_admin && <span className="border-2 border-ink bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-paper">ADMIN</span>}
      </div>
      <p className="text-xs text-mist">
        Código {u.referral_code || "—"} · Alta {fecha(u.created_at)}
      </p>

      <dl className="mt-3 border-y-2 border-ink py-2">
        {[
          ["Saldo", euros(u.wallet_balance)],
          ["Referidos", u.referidos || 0],
          ["Comisiones", euros(u.comisiones_cents)],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 py-1">
            <dt className="text-sm text-ash">{k}</dt>
            <dd className="cond text-[24px]">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mb-1 mt-4 text-xs font-semibold text-ink">% de comisión</p>
      <ComisionInput usuario={u} onGuardado={onGuardado} />
      <p className="mb-1 mt-4 text-xs font-semibold text-ink">Contraseña</p>
      <ResetPassword usuario={u} />
      <p className="mb-1 mt-4 text-xs font-semibold text-ink">Rol</p>
      <RolUsuario u={u} yoId={yoId} onGuardado={onGuardado} />
    </li>
  );
}

function ResetPassword({ usuario }) {
  const [abierto, setAbierto] = useState(false);
  const [pw, setPw] = useState("");
  const [estado, setEstado] = useState(null);
  const minimo = minimoClave(usuario.is_admin);

  async function guardar() {
    if (pw.length < minimo) return setEstado("corta");
    setEstado("guardando");
    const r = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: usuario.id, new_password: pw }),
    });
    if (r.ok) {
      setEstado("ok");
      setPw("");
      setTimeout(() => { setEstado(null); setAbierto(false); }, 2500);
    } else setEstado("error");
  }

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)} className="min-h-11 border-2 border-ink px-3 text-[13px] font-semibold text-ink hover:bg-ink hover:text-paper lg:min-h-0 lg:px-2 lg:py-1 lg:text-[11px]">
        Restablecer
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="text"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Nueva contraseña"
        className="h-11 min-w-0 flex-1 border-2 border-ink bg-paper px-2 text-base text-ink outline-none focus:bg-bone lg:h-auto lg:w-36 lg:flex-none lg:py-1 lg:text-xs"
      />
      <button onClick={guardar} disabled={estado === "guardando"} className="min-h-11 border-2 border-ink px-3 text-[13px] font-semibold text-ink hover:bg-ink hover:text-paper disabled:opacity-50 lg:min-h-0 lg:px-2 lg:py-1 lg:text-[11px]">
        {estado === "guardando" ? "..." : estado === "ok" ? "✓ Cambiada" : "Guardar"}
      </button>
      {estado === "corta" && <span className="text-[11px] text-red-600">Mín. {minimo}</span>}
      {estado === "error" && <span className="text-[11px] text-red-600">Error</span>}
    </div>
  );
}

function ComisionInput({ usuario, onGuardado }) {
  const [valor, setValor] = useState(
    usuario.commission_rate !== null && usuario.commission_rate !== undefined
      ? String(usuario.commission_rate)
      : ""
  );
  const [estado, setEstado] = useState(null); // null | "guardando" | "ok" | "error"

  async function guardar() {
    setEstado("guardando");
    const r = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: usuario.id, commission_rate: valor === "" ? null : valor }),
    });
    if (r.ok) {
      setEstado("ok");
      onGuardado();
      setTimeout(() => setEstado(null), 1500);
    } else {
      setEstado("error");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="decimal"
        min={0}
        max={100}
        step="0.1"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="10 (def.)"
        aria-label="Porcentaje de comisión"
        className="h-11 w-24 border-2 border-ink bg-paper px-2 text-base text-ink outline-none focus:bg-bone lg:h-auto lg:w-20 lg:py-1 lg:text-xs"
      />
      <span className="text-xs text-mist">%</span>
      <button
        onClick={guardar}
        disabled={estado === "guardando"}
        className="min-h-11 border-2 border-ink px-3 text-[13px] font-semibold text-ink hover:bg-ink hover:text-paper disabled:opacity-50 lg:min-h-0 lg:px-2 lg:py-1 lg:text-[11px]"
      >
        {estado === "guardando" ? "..." : estado === "ok" ? "✓" : "Guardar"}
      </button>
      {estado === "error" && <span className="text-[11px] text-alert">Error</span>}
    </div>
  );
}
