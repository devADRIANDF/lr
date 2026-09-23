import { useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import Footer from "../components/Footer";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    if (router.query.ref) {
      localStorage.setItem("rv_ref", router.query.ref);
    }
  }, [router.query.ref]);

  const esAdmin = router.pathname.startsWith("/admin");

  return (
    <>
      <Component {...pageProps} />
      {!esAdmin && <Footer />}
    </>
  );
}
