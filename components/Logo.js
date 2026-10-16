import { MARCA } from "./Tally";
import { TEXTO_MARCA, TINTA, ALTURA_MAYUSCULA } from "./marca";

// Logotipo dibujado como vector: el grupo de cinco trazos + el nombre en letras ya convertidas a trazados.
// Al no ser texto, se ve idéntico en cualquier móvil y navegador, no salta cuando carga la fuente
// y no se rompe en dos líneas ni se desborda aunque el sistema agrande la letra.
// Medidas en unidades de la tipografía (1000 = tamaño de letra); y crece hacia abajo.

const ESC = 7.86; // el icono (100 de alto) queda algo más alto que las letras
const ICONO_ALTO = MARCA.alto * ESC;
const ICONO_ARRIBA = -ALTURA_MAYUSCULA / 2 - ICONO_ALTO / 2; // centrado en la altura de las mayúsculas
const TINTA_IZQ = 0.87; // lo que sobresale por la izquierda el extremo de la diagonal (unidades del icono)
const TINTA_DER = 101.87; // y hasta dónde llega por la derecha
const HUECO = 400; // espacio visible entre el icono y la primera letra
const ICONO_ANCHO = (TINTA_IZQ + TINTA_DER) * ESC;
const TEXTO_X = ICONO_ANCHO + HUECO - TINTA.x; // dónde empieza a dibujarse el texto
const ANCHO = TEXTO_X + TINTA.x + TINTA.w; // el dibujo termina justo donde acaba la última letra

// Proporción ancho/alto del logotipo completo
export const PROPORCION_LOGO = ANCHO / ICONO_ALTO;

export default function Logo({ className = "" }) {
  const alto = 22;
  return (
    <svg
      viewBox={`0 ${ICONO_ARRIBA.toFixed(1)} ${ANCHO.toFixed(1)} ${ICONO_ALTO.toFixed(1)}`}
      width={Math.round(alto * PROPORCION_LOGO)}
      height={alto}
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      preserveAspectRatio="xMinYMid meet"
    >
      <g
        transform={`translate(${(TINTA_IZQ * ESC).toFixed(2)} ${ICONO_ARRIBA.toFixed(1)}) scale(${ESC})`}
        fill="none"
        stroke="currentColor"
        strokeWidth={MARCA.grosor}
        strokeLinecap="butt"
      >
        {MARCA.trazos.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path transform={`translate(${TEXTO_X.toFixed(1)} 0)`} d={TEXTO_MARCA} />
    </svg>
  );
}

// Solo el nombre, a todo el ancho que tenga disponible (el pie de página). Sin márgenes sobrantes:
// el dibujo empieza y acaba exactamente en el borde de la primera y la última letra.
export function Wordmark({ className = "" }) {
  return (
    <svg
      viewBox={`${TINTA.x} ${TINTA.y} ${TINTA.w} ${TINTA.h}`}
      width={Math.round(TINTA.w / 4)}
      height={Math.round(TINTA.h / 4)}
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
    >
      <path d={TEXTO_MARCA} />
    </svg>
  );
}
