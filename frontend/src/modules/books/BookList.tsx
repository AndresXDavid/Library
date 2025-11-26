import React, { useEffect, useState } from "react";
import { gqlRequest } from "../../core/graphqlClient";
import { useAuth } from "../auth/AuthContext";

export interface Book {
  id: string;
  title: string;
  author: string;
  available: boolean;
}

export const BookList: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // para crear libro (solo admin)
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadBooks = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await gqlRequest<{ books: Book[] }>(`
        query Books {
          books {
            id
            title
            author
            available
          }
        }
      `);
      setBooks(data.books);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleLoan = async (bookId: string) => {
    setActionMessage(null);
    try {
      await gqlRequest<{ loanBook: { id: string } }>(
        `
        mutation LoanBook($bookId: ID!) {
          loanBook(bookId: $bookId) {
            id
          }
        }
      `,
        { bookId }
      );
      setActionMessage("Préstamo registrado correctamente.");
      await loadBooks();
    } catch (err: any) {
      setActionMessage("Error: " + err.message);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      await gqlRequest<{ addBook: Book }>(
        `
        mutation AddBook($title: String!, $author: String!) {
          addBook(title: $title, author: $author) {
            id
          }
        }
      `,
        { title: newTitle, author: newAuthor }
      );
      setNewTitle("");
      setNewAuthor("");
      setActionMessage("Libro creado.");
      await loadBooks();
    } catch (err: any) {
      setActionMessage("Error: " + err.message);
    }
  };

  if (loading) return <p>Cargando libros...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="books-layout">
      <div className="card">
        <h2>Listado de libros</h2>
        <ul className="book-list">
          {books.map((b) => (
            <li key={b.id} className="book-item">
              <div>
                <strong>{b.title}</strong> <br />
                <span>{b.author}</span> <br />
                <span>
                  Estado:{" "}
                  {b.available ? "✅ Disponible" : "❌ No disponible"}
                </span>
              </div>
              <div>
                {b.available && user && (
                  <button onClick={() => handleLoan(b.id)}>Pedir préstamo</button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {books.length === 0 && <p>No hay libros registrados.</p>}
      </div>

      {user?.role === "admin" && (
        <div className="card">
          <h2>Agregar libro (admin)</h2>
          <form onSubmit={handleAddBook} className="form">
            <label>
              Título
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </label>
            <label>
              Autor
              <input
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                required
              />
            </label>
            <button type="submit">Guardar</button>
          </form>
        </div>
      )}

      {actionMessage && <p className="info">{actionMessage}</p>}
    </div>
  );
};
