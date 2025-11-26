import { Link } from "react-router-dom";
import styles from "../styles/layout.module.css";

export default function Navbar() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className={styles.nav}>
      <Link to="/">Inicio</Link>
      <Link to="/books">Libros</Link>
      <button onClick={logout}>Cerrar sesión</button>
    </nav>
  );
}
