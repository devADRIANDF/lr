import { useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import Footer from "../components/Footer";
import AvisoRef from "../components/AvisoRef";
import { limpiarAntiguo, recibirCodigo } from "../lib/ref";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Borra lo que la versión anterior guardó sin preguntar y lo que haya caducado
  useEffect(() => {
    limpiarAntiguo();
  }, []);

  // Si llega con el enlace de invitación de alguien (?ref=...), el código se usa en esta visita; solo se
  // guarda en el navegador si el visitante lo acepta (AvisoRef).
  const refDeLaUrl = Array.isArray(router.query.ref) ? router.query.ref[0] : router.query.ref;
  useEffect(() => {
    if (refDeLaUrl) recibirCodigo(String(refDeLaUrl));
  }, [refDeLaUrl]);

  const esAdmin = router.pathname.startsWith("/admin");

  return (
    <>
      <Component {...pageProps} />
      {!esAdmin && <Footer />}
      {!esAdmin && <AvisoRef />}
    </>
  );
}
