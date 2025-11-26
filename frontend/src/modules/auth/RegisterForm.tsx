import React, { useState } from "react";
import { gqlRequest } from "../../core/graphqlClient";
import { useAuth, User } from "./AuthContext";

interface RegisterFormProps {
  onRegistered: () => void;
  goLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegistered,
  goLogin,
}) => {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await gqlRequest<{
        register: { token: string; user: User };
      }>(
        `
        mutation Register($name: String!, $email: String!, $password: String!) {
          register(name: $name, email: $email, password: $password) {
            token
            user { id name email role }
          }
        }
      `,
        { name, email, password }
      );

      login(data.register.token, data.register.user);
      onRegistered();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Registro</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Nombre
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

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
          {loading ? "Creando..." : "Crear cuenta"}
        </button>
      </form>

      <p>
        ¿Ya tienes cuenta?{" "}
        <button type="button" className="link-btn" onClick={goLogin}>
          Inicia sesión
        </button>
      </p>
    </div>
  );
};
