import React, { useState } from "react";
import { useAuth } from "./modules/auth/AuthContext";
import { LoginForm } from "./modules/auth/LoginForm";
import { RegisterForm } from "./modules/auth/RegisterForm";

// Importar vistas por rol
import { MemberView } from "./views/MemberView";
import { StaffView } from "./views/StaffView";
import { AdminView } from "./views/AdminView";

import "./styles/global.css";

type View = "login" | "register";

const App: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState<View>("login");

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Cargando sesión...</p>
      </div>
    );
  }

  // Si hay usuario, mostrar vista según su rol
  if (user) {
    return (
      <div className="app">
        <header className="navbar">
          <div className="navbar-brand">
            <span className="logo">📚</span>
            <h1>Biblioteca Comunitaria</h1>
          </div>
          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role badge badge-{user.role}">
                {user.role === "admin" && "Administrador"}
                {user.role === "staff" && "Bibliotecario"}
                {user.role === "user" && "Miembro"}
              </span>
            </div>
            <button onClick={logout} className="btn btn-outline">
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="main-content">
          {user.role === "admin" && <AdminView />}
          {user.role === "staff" && <StaffView />}
          {user.role === "user" && <MemberView />}
        </main>
      </div>
    );
  }

  // Si no hay usuario, mostrar login/register
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <span className="logo-large">📚</span>
          <h1>Biblioteca Comunitaria</h1>
          <p>Sistema de gestión bibliotecaria</p>
        </div>

        {view === "login" && (
          <LoginForm
            onLoggedIn={() => {}}
            goRegister={() => setView("register")}
          />
        )}

        {view === "register" && (
          <RegisterForm
            onRegistered={() => {}}
            goLogin={() => setView("login")}
          />
        )}
      </div>
    </div>
  );
};

export default App;