import { EMPRESA, MAILTO_URL } from "../lib/empresa";

// Trozos que se repiten en los textos legales, para que los datos de contacto salgan siempre iguales.

export function Email() {
  return <a href={MAILTO_URL}>{EMPRESA.email}</a>;
}

// "por email a x@y.com"
export function Contacto() {
  return (
    <>
      por email a <Email />
    </>
  );
}

// Lista con los datos que identifican a la empresa. Las líneas sin dato no se muestran.
export function DatosEmpresa({ extra = [] }) {
  return (
    <ul>
      <li>
        Titular: <strong>{EMPRESA.nombre}</strong> (marca comercial: {EMPRESA.marca})
      </li>
      {EMPRESA.numeroRegistro && (
        <li>
          Número de registro: <strong>{EMPRESA.numeroRegistro}</strong>
        </li>
      )}
      {EMPRESA.paisRegistro && (
        <li>
          País de registro: <strong>{EMPRESA.paisRegistro}</strong>
        </li>
      )}
      {EMPRESA.domicilio && (
        <li>
          Domicilio social: <strong>{EMPRESA.domicilio}</strong>
        </li>
      )}
      {EMPRESA.identificacionFiscal && (
        <li>
          Identificación fiscal: <strong>{EMPRESA.identificacionFiscal}</strong>
        </li>
      )}
      <li>
        Email de contacto: <Email />
      </li>
      {extra.map((e, i) => (
        <li key={i}>{e}</li>
      ))}
    </ul>
  );
}
