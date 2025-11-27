import React, { useEffect, useState } from "react";
import { gqlRequest } from "../../core/graphqlClient";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  editorial?: string;
  year?: number;
  category?: string;
  availableCopies: number;
  totalCopies: number;
  imageUrl?: string;
  description?: string;
}

// Modal para solicitar préstamo
interface LoanModalProps {
  book: Book;
  onClose: () => void;
  onSuccess: () => void;
}

const LoanModal: React.FC<LoanModalProps> = ({ book, onClose, onSuccess }) => {
  const [days, setDays] = useState("14");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Obtener el ID del usuario actual (necesitas implementar esto según tu auth)
      const userData = await gqlRequest<{ me: { id: string } }>(`query { me { id } }`);
      
      if (!userData.me) {
        throw new Error("Debes iniciar sesión para solicitar un préstamo");
      }

      await gqlRequest(
        `mutation CreateLoan($userId: ID!, $bookId: ID!, $days: Int) {
          createLoan(userId: $userId, bookId: $bookId, days: $days) { id }
        }`,
        {
          userId: userData.me.id,
          bookId: book.id,
          days: parseInt(days)
        }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Solicitar Préstamo</h3>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ marginBottom: "0.5rem" }}>{book.title}</h4>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>por {book.author}</p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Días de préstamo *
            <input
              type="number"
              min="1"
              max="30"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
              disabled={loading}
            />
            <small style={{ color: "#666", fontSize: "0.85rem" }}>
              Máximo 30 días
            </small>
          </label>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-outline"
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Procesando..." : "Solicitar Préstamo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const BookCatalog: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await gqlRequest<{ books: Book[] }>(
        `query Books($search: String, $category: String) {
          books(search: $search, category: $category) {
            id title author isbn editorial year category
            availableCopies totalCopies imageUrl description
          }
        }`,
        { search: search || undefined, category: category || undefined }
      );
      setBooks(data.books);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBooks();
  };

  const handleRequestLoan = (book: Book) => {
    setSelectedBook(book);
    setShowLoanModal(true);
  };

  const handleReserve = async (bookId: string) => {
    try {
      await gqlRequest(
        `mutation CreateReservation($bookId: ID!) {
          createReservation(bookId: $bookId) { id }
        }`,
        { bookId }
      );
      setMessage({ type: "success", text: "Reserva creada exitosamente. Te notificaremos cuando el libro esté disponible." });
      loadBooks();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleLoanSuccess = () => {
    setMessage({ 
      type: "success", 
      text: "Préstamo solicitado exitosamente. Un miembro del personal procesará tu solicitud." 
    });
    loadBooks();
  };

  if (loading) return <div className="loading">Cargando catálogo...</div>;

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h2>📚 Catálogo de Libros</h2>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-search"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="select-category"
          >
            <option value="">Todas las categorías</option>
            <option value="Ficción">Ficción</option>
            <option value="No Ficción">No Ficción</option>
            <option value="Ciencia">Ciencia</option>
            <option value="Historia">Historia</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Arte">Arte</option>
          </select>
          <button type="submit" className="btn btn-primary">Buscar</button>
        </form>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="alert-close">×</button>
        </div>
      )}

      <div className="books-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <div className="book-image">
              {book.imageUrl ? (
                <img src={book.imageUrl} alt={book.title} />
              ) : (
                <div className="book-placeholder">📖</div>
              )}
            </div>
            
            <div className="book-info">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">por {book.author}</p>
              
              {book.isbn && <p className="book-detail">ISBN: {book.isbn}</p>}
              {book.editorial && <p className="book-detail">{book.editorial}, {book.year}</p>}
              {book.category && <span className="badge">{book.category}</span>}
              
              {book.description && (
                <p className="book-description">{book.description}</p>
              )}
              
              <div className="book-availability">
                <span className={`status ${book.availableCopies > 0 ? "available" : "unavailable"}`}>
                  {book.availableCopies > 0 ? "✓ Disponible" : "✗ No disponible"}
                </span>
                <span className="copies">
                  {book.availableCopies} de {book.totalCopies} copias
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                {book.availableCopies > 0 ? (
                  <button
                    onClick={() => handleRequestLoan(book)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    📚 Solicitar Préstamo
                  </button>
                ) : (
                  <button
                    onClick={() => handleReserve(book.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    🔖 Reservar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="empty-state">
          <p>No se encontraron libros</p>
        </div>
      )}

      {/* Modal de Préstamo */}
      {showLoanModal && selectedBook && (
        <LoanModal
          book={selectedBook}
          onClose={() => {
            setShowLoanModal(false);
            setSelectedBook(null);
          }}
          onSuccess={handleLoanSuccess}
        />
      )}
    </div>
  );
};