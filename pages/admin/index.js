import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const ESTADOS = ["pendiente", "entregado", "cancelado"];
const ESTADO_COLOR = {
  pendiente: "bg-amber-100 text-amber-700",
  entregado: "bg-neutral-100 text-ink",
  cancelado: "bg-red-100 text-red-600",
};

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
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <h1 className="font-display text-lg font-700 text-ink">Lamine Resell · Admin</h1>
            <button
              onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.push("/admin/login"); }}
              className="text-xs font-500 text-mist hover:text-ink"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-5 py-8">
          {/* TARJETAS SUPERIORES */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Pedidos totales" value={stats ? (stats.totalPedidos || 0) : "—"} />
            <Stat label="Pendientes" value={stats ? (stats.pendientes || 0) : "—"} highlight={stats && stats.pendientes > 0} />
            <Stat label="Facturado" value={stats ? `${((stats.facturado_cents || 0) / 100).toFixed(2)} €` : "—"} />
            <Stat label="Usuarios" value={stats ? (stats.totalUsuarios || users.length) : users.length} />
            <Stat label="Comisiones pagadas" value={stats ? `${((stats.comisiones_cents || 0) / 100).toFixed(2)} €` : "—"} />
          </div>

          <div className="mt-8 flex gap-2 border-b border-line">
            {["pedidos", "suscripciones", "usuarios"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-600 capitalize ${
                  tab === t ? "border-ink text-ink" : "border-transparent text-mist hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "pedidos" && (
            <div className="mt-6">
              <div className="mb-3 flex gap-2">
                {["todos", ...ESTADOS].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    className={`rounded-none border px-3 py-1.5 text-xs font-500 capitalize transition ${
                      filtro === f ? "border-ink bg-neutral-100 text-ink" : "border-line text-mist hover:border-ink/60"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto rounded-none border border-line bg-surface">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-mist">
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
                    {pedidosVisibles.map((o) => (
                      <tr key={o.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-3 text-mist">{o.id}</td>
                        <td className="px-4 py-3 text-ink">{o.type === "cuenta" ? "Cuenta lista" : "A su ID"}</td>
                        <td className="px-4 py-3 text-ink">{o.package}</td>
                        <td className="px-4 py-3 font-mono text-xs text-mist">{o.target_id || "—"}</td>
                        <td className="px-4 py-3 text-ink">{o.user_email || o.guest_email}</td>
                        <td className="px-4 py-3 font-600 text-ink">{((o.amount_cents || 0) / 100).toFixed(2)} €</td>
                        <td className="px-4 py-3 text-xs text-mist">{o.referred_by_code || "—"}</td>
                        <td className="px-4 py-3 text-xs text-mist">{o.created_at ? new Date(o.created_at).toLocaleString("es-ES") : "—"}</td>
                        <td className="px-4 py-3">
                          <select
                            value={o.status}
                            onChange={(e) => cambiarEstado(o.id, e.target.value)}
                            className={`rounded-none border-0 px-2 py-1 text-xs font-600 capitalize outline-none ${ESTADO_COLOR[o.status] || ""}`}
                          >
                            {ESTADOS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                    {pedidosVisibles.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-8 text-center text-mist">No hay pedidos con este filtro.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "suscripciones" && (
            <div className="mt-6 overflow-x-auto rounded-none border border-line bg-surface">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-mist">
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
                      <td className="px-4 py-3 text-ink">{s.email}</td>
                      <td className="px-4 py-3 text-ink">{s.type === "cuenta" ? "Cuenta lista" : "A su ID"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-mist">{s.target_id || "—"}</td>
                      <td className="px-4 py-3 text-ink">{s.reviews_per_month}</td>
                      <td className="px-4 py-3 font-600 text-ink">{((s.monthly_amount_cents || 0) / 100).toFixed(2)} €</td>
                      <td className="px-4 py-3 text-xs text-mist">{s.referred_by_code || "—"}</td>
                      <td className="px-4 py-3 text-xs text-mist">{s.created_at ? new Date(s.created_at).toLocaleDateString("es-ES") : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-none px-2 py-1 text-xs font-600 capitalize ${
                          s.status === "activa" ? "bg-neutral-100 text-ink" : s.status === "impago" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.status === "activa" && (
                          <button
                            onClick={() => cancelarSuscripcion(s.stripe_subscription_id)}
                            className="text-xs font-500 text-coral hover:underline"
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
          )}

          {tab === "usuarios" && (
            <div className="mt-6 overflow-x-auto rounded-none border border-line bg-surface">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-mist">
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Saldo</th>
                    <th className="px-4 py-3">Referidos</th>
                    <th className="px-4 py-3">Comisiones ganadas</th>
                    <th className="px-4 py-3">% Comisión</th>
                    <th className="px-4 py-3">Alta</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-line last:border-0">
                      <td className="px-4 py-3 text-ink">{u.email}</td>
                      <td className="px-4 py-3 font-mono text-xs text-mist">{u.referral_code || "—"}</td>
                      <td className="px-4 py-3 text-ink">{((u.wallet_balance || 0) / 100).toFixed(2)} €</td>
                      <td className="px-4 py-3 text-ink">{u.referidos || 0}</td>
                      <td className="px-4 py-3 text-ink">{((u.comisiones_cents || 0) / 100).toFixed(2)} €</td>
                      <td className="px-4 py-3">
                        <ComisionInput usuario={u} onGuardado={cargarTodo} />
                      </td>
                      <td className="px-4 py-3 text-xs text-mist">{u.created_at ? new Date(u.created_at).toLocaleDateString("es-ES") : "—"}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-mist">Aún no hay usuarios registrados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className={`rounded-none border p-4 ${highlight ? "border-amber-300 bg-amber-50" : "border-line bg-surface"}`}>
      <p className="text-xs font-500 text-mist">{label}</p>
      <p className="mt-1 font-display text-xl font-700 text-ink">{value}</p>
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
        min={0}
        max={100}
        step="0.1"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="10 (def.)"
        className="w-20 rounded-none border border-line bg-page px-2 py-1 text-xs text-ink outline-none focus:border-ink"
      />
      <span className="text-xs text-mist">%</span>
      <button
        onClick={guardar}
        disabled={estado === "guardando"}
        className="rounded-none border border-line px-2 py-1 text-[11px] font-500 text-ink hover:border-ink hover:text-ink disabled:opacity-50"
      >
        {estado === "guardando" ? "..." : estado === "ok" ? "✓" : "Guardar"}
      </button>
      {estado === "error" && <span className="text-[11px] text-coral">Error</span>}
    </div>
  );
}