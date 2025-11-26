import { useMutation, gql } from "@apollo/client";
import { useState } from "react";
import styles from "../styles/form.module.css";

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

export default function Login() {
  const [login] = useMutation(LOGIN);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: any) => {
    e.preventDefault();
    const { data } = await login({ variables: { email, password } });
    localStorage.setItem("token", data.login.token);
    window.location.href = "/";
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <h2>Iniciar sesión</h2>
      <input className={styles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className={styles.input} placeholder="Contraseña" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button className={styles.btn}>Entrar</button>
    </form>
  );
}
