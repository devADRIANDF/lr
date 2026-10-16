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

export default function Admin() {
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [tab, setTab] = useState("pedidos");
  const [filtro, setFiltro] = useState("todos");
  const router = useRouter();

  async function cargarTodo() {
    // Peticiones independientes para garantizar que las tarjetas de métricas no desaparezcan
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch((e) => console.error("Error stats:", e));

    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((o) => setOrders(Array.isArray(o) ? o : o?.orders || []))
      .catch((e) => console.error("Error orders:", e));

    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((u) => setUsers(Array.isArray(u) ? u : u?.users || u?.data || []))
      .catch((e) => console.error("Error users:", e));

    fetch("/api/admin/subscriptions")
      .then((r) => r.json())
      .then((s) => setSubs(Array.isArray(s) ? s : s?.subscriptions || []))
      .catch((e) => console.error("Error subs:", e));
  }

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.isAdmin) return router.replace("/admin/login");
        setChecked(true);
        cargarTodo();
      });
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

  return (
    <>
      <Head><title>Admin — Lamine Resell</title></Head>
      <main className="min-h-screen bg-page pb-16">
        <header className="border-b-[3px] border-ink bg-paper">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3 md:py-4">
            <h1 className="cond text-2xl text-ink md:text-3xl">Lamine Resell Admin</h1>
            <button
              onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); }}
              className="min-h-11 text-sm font-semibold text-ink underline underline-offset-4"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-5 py-6 md:py-8">
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
              <ul className="space-y-3 lg:hidden">
                {users.map((u) => (
                  <UsuarioTarjeta key={u.id} u={u} onGuardado={cargarTodo} />
                ))}
                {users.length === 0 && (
                  <li className="border-[3px] border-ink bg-paper px-4 py-8 text-center text-mist">Aún no hay usuarios registrados.</li>
                )}
              </ul>

              <div className="hidden overflow-x-auto border-[3px] border-ink bg-paper lg:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-[3px] border-ink bg-bone text-xs font-semibold text-ink">
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3">Saldo</th>
                      <th className="px-4 py-3">Referidos</th>
                      <th className="px-4 py-3">Comisiones ganadas</th>
                      <th className="px-4 py-3">% Comisión</th>
                      <th className="px-4 py-3">Contraseña</th>
                      <th className="px-4 py-3">Alta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-3 text-ink">{u.email}</td>
                        <td className="px-4 py-3 font-mono text-xs text-mist">{u.referral_code || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink">{euros(u.wallet_balance)}</td>
                        <td className="px-4 py-3 text-ink">{u.referidos || 0}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-ink">{euros(u.comisiones_cents)}</td>
                        <td className="px-4 py-3">
                          <ComisionInput usuario={u} onGuardado={cargarTodo} />
                        </td>
                        <td className="px-4 py-3">
                          <ResetPassword usuario={u} />
                        </td>
                        <td className="px-4 py-3 text-xs text-mist">{fecha(u.created_at)}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-mist">Aún no hay usuarios registrados.</td></tr>
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

function UsuarioTarjeta({ u, onGuardado }) {
  return (
    <li className="border-[3px] border-ink bg-paper p-4">
      <a href={`mailto:${u.email}`} className="flex min-h-11 items-center break-all text-[15px] font-semibold text-ink underline underline-offset-4">
        {u.email}
      </a>
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
    </li>
  );
}

function ResetPassword({ usuario }) {
  const [abierto, setAbierto] = useState(false);
  const [pw, setPw] = useState("");
  const [estado, setEstado] = useState(null);

  async function guardar() {
    if (pw.length < 6) return setEstado("corta");
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
      {estado === "corta" && <span className="text-[11px] text-red-600">Mín. 6</span>}
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
