import { useEffect, useRef } from "react";

// Contador de valoraciones: un trazo vertical por valoración y, cada cinco,
// un trazo diagonal que cierra el grupo (la marca de recuento de toda la vida).

const H = 100; // alto de los trazos
const SW = 10; // grosor
const STEP = 25; // separación entre trazos verticales
const PAD = 13; // lo que sobresale la diagonal a cada lado
const GW = PAD * 2 + STEP * 3; // ancho de un grupo de cinco
const GAP = 34; // espacio entre grupos
const ROWGAP = 36; // espacio entre filas de grupos

function trazo(i, perRow) {
  const g = Math.floor(i / 5);
  const j = i % 5;
  const col = g % perRow;
  const row = Math.floor(g / perRow);
  const ox = col * (GW + GAP);
  const oy = row * (H + ROWGAP);
  if (j < 4) {
    const x = ox + PAD + j * STEP;
    return `M${x} ${oy} V${oy + H}`;
  }
  // diagonal: de abajo-izquierda a arriba-derecha, cruzando los cuatro trazos
  return `M${ox + 2} ${oy + H - 16} L${ox + GW - 2} ${oy + 16}`;
}

export default function Tally({ count, capacity, perRow = 4, className = "", ghost = true, label }) {
  const total = Math.max(count, capacity || 0);
  const groups = Math.max(1, Math.ceil(total / 5));
  const cols = Math.min(perRow, groups);
  const rows = Math.ceil(groups / perRow);
  const vbW = cols * GW + (cols - 1) * GAP;
  const vbH = rows * H + (rows - 1) * ROWGAP;

  // Los trazos nuevos se dibujan en cadena; los que ya estaban no se repiten.
  const prev = useRef(0);
  const desde = prev.current;
  useEffect(() => {
    prev.current = count;
  });

  const fondo = [];
  for (let i = 0; i < (capacity || 0); i++) fondo.push(i);
  const activos = [];
  for (let i = 0; i < count; i++) activos.push(i);

  return (
    <svg
      viewBox={`${-SW / 2} 0 ${vbW + SW} ${vbH}`}
      className={className}
      role="img"
      aria-label={label || `${count} valoraciones`}
      fill="none"
      stroke="currentColor"
      strokeWidth={SW}
      strokeLinecap="butt"
      preserveAspectRatio="xMinYMid meet"
    >
      {ghost && fondo.length > 0 && (
        <g opacity="0.16">
          {fondo.map((i) => (
            <path key={`g${i}`} d={trazo(i, perRow)} />
          ))}
        </g>
      )}
      {activos.map((i) => (
        <path
          key={`a${i}`}
          d={trazo(i, perRow)}
          pathLength="1"
          className="tally-draw"
          style={{ "--delay": `${Math.max(0, i - desde) * 55}ms` }}
        />
      ))}
    </svg>
  );
}

// Medidas del grupo de cinco, para dibujar el logotipo (Logo.js) con exactamente los mismos trazos.
export const MARCA = {
  alto: H,
  grosor: SW,
  trazos: [0, 1, 2, 3, 4].map((i) => trazo(i, 1)),
};
