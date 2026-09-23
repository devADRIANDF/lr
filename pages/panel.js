import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";

export default function Panel() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) return router.replace("/login");
        setUser(d.user);
        Promise.all([
          fetch("/api/referidos/stats").then((r) => r.json()).catch(() => ({})),
          fetch("/api/pedidos/mios").then((r) => r.json()).catch(() => ({ pedidos: [] })),
        ]).then(([s, p]) => {
          setStats(s);
          setPedidos(Array.isArray(p?.pedidos) ? p.pedidos : []);
          setLoaded(true);
        });
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!loaded) {
    return (
      <>
        <Nav />
        <main className="min-h-screen bg-page px-5 py-16 text-sm text-mist">Cargando tu perfil…</main>
      </>
    );
  }

  // Variables seguras con fallbacks
  const referralCode = stats?.referral_code || stats?.referralCode || stats?.code || "";
  const referralLink =
    typeof window !== "undefined" && referralCode
      ? `${window.location.origin}/registro?ref=${referralCode}`
      : "";

  const totalReferidos = stats?.total_referidos ?? stats?.totalReferrals ?? stats?.referralsCount ?? 0;
  const totalGanadoCents = stats?.total_ganado_cents ?? (stats?.totalEarnings ? stats.totalEarnings * 100 : 0);
  const walletBalance = user?.wallet_balance ?? user?.balance ?? 0;

  // Garantizar que historial sea siempre un Array (evita el crash por .length)
  const historial = Array.isArray(stats?.historial)
    ? stats.historial
    : Array.isArray(stats?.earnings)
    ? stats.earnings
    : Array.isArray(stats?.history)
    ? stats.history
    : [];

  const userEmail = user?.email || "Usuario";
  const userInitial = userEmail[0]?.toUpperCase() || "U";

  return (
    <>
      <Head>
        <title>Tu perfil — Lamine Resell</title>
      </Head>
      <Nav />
      <main className="min-h-screen bg-page pb-28 md:pb-10">
        <div className="mx-auto max-w-4xl px-5 py-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-none bg-neutral-100 font-display text-xl font-700 text-ink">
              {userInitial}
            </span>
            <div>
              <p className="font-display text-lg font-700 text-ink">{userEmail}</p>
              <p className="text-xs text-mist">Miembro de Lamine Resell</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-none border border-line bg-surface p-5">
              <p className="text-xs font-500 text-mist">Saldo del monedero</p>
              <p className="mt-2 font-display text-2xl font-700 text-ink">
                {(walletBalance / 100).toFixed(2)} €
              </p>
            </div>
            <div className="rounded-none border border-line bg-surface p-5">
              <p className="text-xs font-500 text-mist">Personas invitadas</p>
              <p className="mt-2 font-display text-2xl font-700 text-ink">{totalReferidos}</p>
            </div>
            <div className="rounded-none border border-line bg-surface p-5">
              <p className="text-xs font-500 text-mist">Ganado en comisiones</p>
              <p className="mt-2 font-display text-2xl font-700 text-ink">
                {(totalGanadoCents / 100).toFixed(2)} €
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-none border border-line bg-surface p-5">
            <p className="text-xs font-600 uppercase tracking-wide text-mist">Tu enlace para invitar</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="flex-1 truncate rounded-none border border-line bg-page px-3 py-2 text-xs text-ink">
                {referralLink || "No disponible"}
              </code>
              <button
                onClick={() => referralLink && navigator.clipboard.writeText(referralLink)}
                className="rounded-none border border-line px-4 py-2 text-xs font-600 text-ink hover:border-ink hover:text-ink"
              >
                Copiar enlace
              </button>
            </div>
            <p className="mt-2 text-xs text-mist">
              Código {referralCode} · ganas el 10% de cada compra de quien invites
            </p>
          </div>

          <div className="mt-8">
            <p className="text-xs font-600 uppercase tracking-wide text-mist">Tus pedidos</p>
            <div className="mt-3 overflow-hidden rounded-none border border-line bg-surface">
              {pedidos.length === 0 ? (
                <p className="px-5 py-8 text-sm text-mist">Aún no has hecho ningún pedido.</p>
              ) : (
                pedidos.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border-b border-line px-5 py-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-ink">
                        {p.type === "cuenta" ? "Cuenta lista" : "Reviews a tu ID"} · {p.package} reviews
                        {p.target_id ? ` · ID ${p.target_id}` : ""}
                      </p>
                      <p className="text-xs text-mist">{new Date(p.created_at).toLocaleString("es-ES")}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-600 text-ink">{(p.amount_cents / 100).toFixed(2)} €</p>
                      <span
                        className={`rounded-none px-2 py-0.5 text-[11px] font-600 capitalize ${
                          p.status === "entregado"
                            ? "bg-neutral-100 text-ink"
                            : p.status === "cancelado"
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs font-600 uppercase tracking-wide text-mist">Historial de comisiones</p>
            <div className="mt-3 overflow-hidden rounded-none border border-line bg-surface">
              {historial.length === 0 ? (
                <p className="px-5 py-8 text-sm text-mist">
                  Aún no tienes comisiones. Comparte tu enlace para empezar a ganar.
                </p>
              ) : (
                historial.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-line px-5 py-3 last:border-0"
                  >
                    <span className="text-sm text-ink">{h.from_email || h.email || "Usuario invitado"}</span>
                    <span className="text-sm font-600 text-ink">
                      +{((h.amount_cents || h.amount || 0) / 100).toFixed(2)} €
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/");
            }}
            className="mt-8 text-xs font-500 text-mist hover:text-ink"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    </>
  );
}