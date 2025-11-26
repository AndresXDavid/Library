import { useMutation, gql } from "@apollo/client";
import { useState } from "react";
import styles from "../styles/form.module.css";

const REGISTER = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
    }
  }
`;

export default function Register() {
  const [register] = useMutation(REGISTER);

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (e: any) => {
    e.preventDefault();
    const { data } = await register({ variables: form });
    localStorage.setItem("token", data.register.token);
    window.location.href = "/";
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <h2>Crear cuenta</h2>
      <input className={styles.input} placeholder="Nombre" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input className={styles.input} placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className={styles.input} placeholder="Contraseña" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className={styles.btn}>Registrarse</button>
    </form>
  );
}
