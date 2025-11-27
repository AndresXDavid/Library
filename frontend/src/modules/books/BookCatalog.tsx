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

     export const BookCatalog: React.FC = () => {
     const [books, setBooks] = useState<Book[]>([]);
     const [loading, setLoading] = useState(true);
     const [search, setSearch] = useState("");
     const [category, setCategory] = useState("");
     const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

     const handleReserve = async (bookId: string) => {
     try {
          await gqlRequest(
          `mutation CreateReservation($bookId: ID!) {
               createReservation(bookId: $bookId) { id }
          }`,
          { bookId }
          );
          setMessage({ type: "success", text: "Reserva creada exitosamente" });
          loadBooks();
     } catch (err: any) {
          setMessage({ type: "error", text: err.message });
     }
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

               {book.availableCopies === 0 && (
                    <button
                    onClick={() => handleReserve(book.id)}
                    className="btn btn-secondary btn-sm"
                    >
                    Reservar
                    </button>
               )}
               </div>
               </div>
          ))}
          </div>

          {books.length === 0 && (
          <div className="empty-state">
               <p>No se encontraron libros</p>
          </div>
          )}
     </div>
     );
};