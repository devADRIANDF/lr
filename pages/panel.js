import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import Meta from "../components/Meta";
import { eur, eurExacto } from "../lib/catalogo";

function Estado({ s }) {
  const base = "inline-block border-2 px-2 py-0.5 text-[13px] font-semibold capitalize leading-5";
  if (s === "entregado") return <span className={`${base} border-ink bg-ink text-paper`}>{s}</span>;
  if (s === "cancelado") return <span className={`${base} border-ash text-ash line-through`}>{s}</span>;
  return <span className={`${base} border-ink text-ink`}>{s}</span>;
}

export default function Panel() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [copiado, setCopiado] = useState(false);
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
        <Meta title="Mi cuenta | Lamine Resell" path="/panel" />
        <Nav />
        <main className="wrap py-16 text-[17px] text-ash">Cargando tu cuenta…</main>
      </>
    );
  }

  // Variables seguras con valores por defecto
  const referralCode = stats?.referral_code || stats?.referralCode || stats?.code || "";
  const referralLink =
    typeof window !== "undefined" && referralCode ? `${window.location.origin}/registro?ref=${referralCode}` : "";

  const totalReferidos = stats?.total_referidos ?? stats?.totalReferrals ?? stats?.referralsCount ?? 0;
  const totalGanadoCents = stats?.total_ganado_cents ?? (stats?.totalEarnings ? stats.totalEarnings * 100 : 0);
  const walletBalance = user?.wallet_balance ?? user?.balance ?? 0;
  const comisionPct = stats?.comision_pct ?? 10;

  // El historial siempre es una lista (evita fallos al hacer .length)
  const historial = Array.isArray(stats?.historial)
    ? stats.historial
    : Array.isArray(stats?.earnings)
    ? stats.earnings
    : Array.isArray(stats?.history)
    ? stats.history
    : [];

  const userEmail = user?.email || "Usuario";

  async function copiar() {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {}
  }

  return (
    <>
      <Meta title="Mi cuenta | Lamine Resell" path="/panel" />
      <Nav />
      <main>
        <div className="wrap py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="min-w-0">
              <h1 className="cond text-[length:clamp(4rem,9vw,8rem)]">Tu cuenta</h1>
              <p className="mt-4 break-all text-[17px] text-ink/75">{userEmail}</p>
            </div>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/");
              }}
              className="btn btn-line !h-11 !px-5 !text-lg"
            >
              Cerrar sesión
            </button>
          </div>

          {/* Saldo y cifras */}
          <div className="mt-10 grid border-[3px] border-ink lg:grid-cols-12">
            <div className="bg-ink p-6 text-paper md:p-8 lg:col-span-6">
              <p className="text-[15px] text-paper/70">Saldo del monedero</p>
              <p className="cond mt-3 text-[length:clamp(56px,20vw,88px)] leading-[0.8] md:text-[120px] lg:text-[88px] xl:text-[120px]">{eurExacto(walletBalance)}</p>
              <Link href="/saldo" className="btn btn-paper mt-8">Recargar saldo</Link>
            </div>
            <div className="border-t-[3px] border-ink p-6 md:p-8 lg:col-span-3 lg:border-l-[3px] lg:border-t-0">
              <p className="text-[15px] text-ink/75">Personas invitadas</p>
              <p className="cond mt-3 text-[length:clamp(56px,20vw,88px)] leading-[0.8] md:text-[120px] lg:text-[88px] xl:text-[120px]">{totalReferidos}</p>
            </div>
            <div className="border-t-[3px] border-ink p-6 md:p-8 lg:col-span-3 lg:border-l-[3px] lg:border-t-0">
              <p className="text-[15px] text-ink/75">Ganado en comisiones</p>
              <p className="cond mt-3 text-[56px] leading-[0.85] md:text-[72px] lg:text-[48px] xl:text-[72px]">{eurExacto(totalGanadoCents)}</p>
            </div>
          </div>

          {/* Enlace de invitación */}
          <section className="mt-14 md:mt-20">
            <h2 className="cond text-[44px] md:text-[56px]">Tu enlace para invitar</h2>
            <p className="mt-3 max-w-xl text-[17px] text-ink/75">
              Ganas el {comisionPct}% de cada compra que se haga a través de tu enlace. La comisión se acredita en tu monedero.
            </p>
            <div className="mt-6 flex flex-col gap-3 md:flex-row">
              <input
                readOnly
                value={referralLink || "No disponible"}
                aria-label="Tu enlace de invitación"
                onFocus={(e) => e.target.select()}
                className="field min-w-0 !text-base md:flex-1"
              />
              <button onClick={copiar} className="btn btn-ink md:min-w-[200px]" disabled={!referralLink}>
                {copiado ? "Copiado" : "Copiar enlace"}
              </button>
            </div>
            {referralCode && <p className="mt-3 text-[14px] text-ink/70">Tu código: <span className="font-semibold text-ink">{referralCode}</span></p>}
          </section>

          {/* Pedidos */}
          <section className="mt-14 md:mt-20">
            <h2 className="cond text-[44px] md:text-[56px]">Tus pedidos</h2>
            <div className="mt-6 border-t-[3px] border-ink">
              {pedidos.length === 0 ? (
                <div className="border-b-[3px] border-ink py-8">
                  <p className="text-[17px] text-ink/75">Aún no has hecho ningún pedido.</p>
                  <Link href="/producto" className="mt-4 inline-block text-[17px] font-semibold underline underline-offset-4">Ver el catálogo</Link>
                </div>
              ) : (
                pedidos.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b-[3px] border-ink py-5">
                    <div>
                      <p className="cond-mid text-[28px]">
                        {p.type === "cuenta" ? `Cuenta de ${p.package} valoraciones` : `${p.package} valoraciones`}
                      </p>
                      <p className="mt-1 text-[14px] text-ink/70">{new Date(p.created_at).toLocaleString("es-ES")}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="cond text-[34px]">{eur(p.amount_cents)}</p>
                      <Estado s={p.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Comisiones */}
          <section className="mt-14 md:mt-20">
            <h2 className="cond text-[44px] md:text-[56px]">Historial de comisiones</h2>
            <div className="mt-6 border-t-[3px] border-ink">
              {historial.length === 0 ? (
                <p className="border-b-[3px] border-ink py-8 text-[17px] text-ink/75">
                  Aún no tienes comisiones. Comparte tu enlace para empezar a ganar.
                </p>
              ) : (
                historial.map((h, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 border-b-[3px] border-ink py-4">
                    <span className="min-w-0 break-all text-[17px]">{h.from_email || h.email || "Usuario invitado"}</span>
                    <span className="cond shrink-0 text-[30px]">+{eurExacto(h.amount_cents || h.amount || 0)}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <CambiarPassword />
        </div>
      </main>
    </>
  );
}

function CambiarPassword() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [msg, setMsg] = useState(null); // { ok, texto }
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (enviando) return;
    setMsg(null);
    setEnviando(true);
    try {
      const r = await fetch("/api/auth/cambiar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: actual, new_password: nueva }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        setMsg({ ok: true, texto: "Contraseña actualizada." });
        setActual("");
        setNueva("");
      } else {
        setMsg({ ok: false, texto: data.error || "No se pudo cambiar la contraseña." });
      }
    } catch {
      setMsg({ ok: false, texto: "No se pudo conectar. Inténtalo de nuevo." });
    }
    setEnviando(false);
  }

  return (
    <section className="mt-14 md:mt-20">
      <h2 className="cond text-[44px] md:text-[56px]">Cambiar contraseña</h2>
      <form onSubmit={onSubmit} className="mt-6 grid max-w-3xl gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="actual" className="field-label">Contraseña actual</label>
          <input id="actual" type="password" autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} required className="field" />
        </div>
        <div>
          <label htmlFor="nueva" className="field-label">Nueva contraseña (mínimo 6 caracteres)</label>
          <input id="nueva" type="password" autoComplete="new-password" minLength={6} value={nueva} onChange={(e) => setNueva(e.target.value)} required className="field" />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={enviando} className="btn btn-ink w-full md:w-auto">
            {enviando ? "Guardando…" : "Guardar contraseña"}
          </button>
          {msg && (
            <p role={msg.ok ? "status" : "alert"} className={`mt-4 text-[15px] font-medium ${msg.ok ? "border-l-[6px] border-ink pl-3" : "border-l-[6px] border-alert pl-3 text-alert"}`}>
              {msg.texto}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
