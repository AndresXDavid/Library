import React, { useState } from "react";
import { useAuth } from "./modules/auth/AuthContext";
import { LoginForm } from "./modules/auth/LoginForm";
import { RegisterForm } from "./modules/auth/RegisterForm";
import { BookList } from "./modules/books/BookList";

type View = "login" | "register" | "books";

const App: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [view, setView] = useState<View>("login");

  // si ya hay usuario, siempre forzamos vista de libros
  const currentView: View = user ? "books" : view;

  if (loading) {
    return <div className="app"><p>Cargando sesión...</p></div>;
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>Biblioteca GraphQL</h1>
        <div>
          {user ? (
            <>
              <span>
                Hola, <strong>{user.name}</strong> ({user.role})
              </span>
              <button onClick={logout} className="ml">
                Cerrar sesión
              </button>
            </>
          ) : (
            <span>No autenticado</span>
          )}
        </div>
      </header>

      <main>
        {currentView === "login" && (
          <LoginForm
            onLoggedIn={() => setView("books")}
            goRegister={() => setView("register")}
          />
        )}

        {currentView === "register" && (
          <RegisterForm
            onRegistered={() => setView("books")}
            goLogin={() => setView("login")}
          />
        )}

        {currentView === "books" && <BookList />}
      </main>
    </div>
  );
};

export default App;
