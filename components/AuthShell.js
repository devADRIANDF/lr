import Tally from "./Tally";

// Estructura común de las pantallas de acceso: cartel negro a la izquierda, formulario a la derecha.
export default function AuthShell({ title, lead, children, pie }) {
  return (
    <main className="grid md:min-h-[calc(100vh-67px)] md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-ink p-12 text-paper md:flex">
        <Tally count={5} capacity={5} perRow={1} ghost={false} className="block w-full max-w-[300px]" label="Cinco valoraciones" />
        <p className="cond max-w-[11ch] text-[96px] leading-[0.86]">Cada trazo es una valoración.</p>
      </div>
      <div className="flex items-start md:items-center">
        <div className="mx-auto w-full max-w-md px-5 py-12 md:px-10 md:py-16">
          <h1 className="cond text-[56px] md:text-[72px]">{title}</h1>
          {lead && <p className="mt-4 text-[17px] text-ink/75">{lead}</p>}
          <div className="mt-8">{children}</div>
          {pie && <div className="mt-8 border-t-[3px] border-ink pt-6 text-[15px]">{pie}</div>}
        </div>
      </div>
    </main>
  );
}
