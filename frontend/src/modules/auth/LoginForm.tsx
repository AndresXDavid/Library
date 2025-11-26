import React, { useState } from "react";
import { gqlRequest } from "../../core/graphqlClient";
import { useAuth } from "./AuthContext";
import type { User } from "./AuthContext";

interface LoginFormProps {
  onLoggedIn: () => void;
  goRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoggedIn,
  goRegister,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await gqlRequest<{ login: { token: string; user: User } }>(
        `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            token
            user { id name email role }
          }
        }
      `,
        { email, password }
      );
      login(data.login.token, data.login.user);
      onLoggedIn();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Correo
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p>
        ¿No tienes cuenta?{" "}
        <button type="button" className="link-btn" onClick={goRegister}>
          Registrarse
        </button>
      </p>
    </div>
  );
};
