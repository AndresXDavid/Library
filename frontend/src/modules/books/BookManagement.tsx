import React, { useEffect, useState } from "react";
import { gqlRequest } from "../../core/graphqlClient";

interface Book {
     id: string;
     isbn?: string;
     title: string;
     author: string;
     editorial?: string;
     year?: number;
     category?: string;
     totalCopies: number;
     availableCopies: number;
     location?: string;
     imageUrl?: string;
     description?: string;
}

export const BookManagement: React.FC = () => {
     const [books, setBooks] = useState<Book[]>([]);
     const [loading, setLoading] = useState(true);
     const [showModal, setShowModal] = useState(false);
     const [editingBook, setEditingBook] = useState<Book | null>(null);
     const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

     // Form state
     const [formData, setFormData] = useState({
     isbn: "",
     title: "",
     author: "",
     editorial: "",
     year: "",
     category: "",
     totalCopies: "1",
     location: "",
     imageUrl: "",
     description: ""
     });

     const loadBooks = async () => {
     setLoading(true);
     try {
          const data = await gqlRequest<{ books: Book[] }>(`
          query Books {
               books {
               id isbn title author editorial year category
               totalCopies availableCopies location imageUrl description
               }
          }
          `);
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

     const resetForm = () => {
     setFormData({
          isbn: "",
          title: "",
          author: "",
          editorial: "",
          year: "",
          category: "",
          totalCopies: "1",
          location: "",
          imageUrl: "",
          description: ""
     });
     setEditingBook(null);
     };

     const handleOpenModal = (book?: Book) => {
     if (book) {
          setEditingBook(book);
          setFormData({
          isbn: book.isbn || "",
          title: book.title,
          author: book.author,
          editorial: book.editorial || "",
          year: book.year?.toString() || "",
          category: book.category || "",
          totalCopies: book.totalCopies.toString(),
          location: book.location || "",
          imageUrl: book.imageUrl || "",
          description: book.description || ""
          });
     } else {
          resetForm();
     }
     setShowModal(true);
     };

     const handleCloseModal = () => {
     setShowModal(false);
     resetForm();
     };

     const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setMessage(null);

     try {
          if (editingBook) {
          // Update
          await gqlRequest(
               `mutation UpdateBook(
               $id: ID!
               $isbn: String
               $title: String
               $author: String
               $editorial: String
               $year: Int
               $category: String
               $totalCopies: Int
               $location: String
               $imageUrl: String
               $description: String
               ) {
               updateBook(
               id: $id
               isbn: $isbn
               title: $title
               author: $author
               editorial: $editorial
               year: $year
               category: $category
               totalCopies: $totalCopies
               location: $location
               imageUrl: $imageUrl
               description: $description
               ) { id }
               }`,
               {
               id: editingBook.id,
               ...formData,
               year: formData.year ? parseInt(formData.year) : null,
               totalCopies: parseInt(formData.totalCopies)
               }
          );
          setMessage({ type: "success", text: "Libro actualizado exitosamente" });
          } else {
          // Create
          await gqlRequest(
               `mutation CreateBook(
               $isbn: String
               $title: String!
               $author: String!
               $editorial: String
               $year: Int
               $category: String
               $totalCopies: Int
               $location: String
               $imageUrl: String
               $description: String
               ) {
               createBook(
               isbn: $isbn
               title: $title
               author: $author
               editorial: $editorial
               year: $year
               category: $category
               totalCopies: $totalCopies
               location: $location
               imageUrl: $imageUrl
               description: $description
               ) { id }
               }`,
               {
               ...formData,
               year: formData.year ? parseInt(formData.year) : null,
               totalCopies: parseInt(formData.totalCopies)
               }
          );
          setMessage({ type: "success", text: "Libro creado exitosamente" });
          }
          
          handleCloseModal();
          loadBooks();
     } catch (err: any) {
          setMessage({ type: "error", text: err.message });
     }
     };

     const handleDelete = async (id: string) => {
     if (!confirm("¿Estás seguro de eliminar este libro?")) return;

     try {
          await gqlRequest(`mutation DeleteBook($id: ID!) { deleteBook(id: $id) }`, { id });
          setMessage({ type: "success", text: "Libro eliminado exitosamente" });
          loadBooks();
     } catch (err: any) {
          setMessage({ type: "error", text: err.message });
     }
     };

     if (loading) return <div className="loading">Cargando libros...</div>;

     return (
     <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2>Gestión de Libros</h2>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
               ➕ Agregar Libro
          </button>
          </div>

          {message && (
          <div className={`alert alert-${message.type}`}>
               {message.text}
               <button onClick={() => setMessage(null)} className="alert-close">×</button>
          </div>
          )}

          <div className="table-container">
          <table>
               <thead>
               <tr>
               <th>Título</th>
               <th>Autor</th>
               <th>ISBN</th>
               <th>Categoría</th>
               <th>Copias</th>
               <th>Disponibles</th>
               <th>Acciones</th>
               </tr>
               </thead>
               <tbody>
               {books.map((book) => (
               <tr key={book.id}>
                    <td><strong>{book.title}</strong></td>
                    <td>{book.author}</td>
                    <td>{book.isbn || "N/A"}</td>
                    <td>{book.category || "N/A"}</td>
                    <td>{book.totalCopies}</td>
                    <td>{book.availableCopies}</td>
                    <td>
                    <button onClick={() => handleOpenModal(book)} className="btn btn-sm btn-outline">
                         Editar
                    </button>
                    {" "}
                    <button onClick={() => handleDelete(book.id)} className="btn btn-sm btn-danger">
                         Eliminar
                    </button>
                    </td>
               </tr>
               ))}
               </tbody>
          </table>
          </div>

          {books.length === 0 && <div className="empty-state"><p>No hay libros registrados</p></div>}

          {/* Modal */}
          {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
               <div className="modal" onClick={(e) => e.stopPropagation()}>
               <div className="modal-header">
               <h3>{editingBook ? "Editar Libro" : "Agregar Libro"}</h3>
               <button onClick={handleCloseModal} className="modal-close">×</button>
               </div>

               <form onSubmit={handleSubmit} className="form">
               <label>
                    Título *
                    <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    />
               </label>

               <label>
                    Autor *
                    <input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    required
                    />
               </label>

               <label>
                    ISBN
                    <input
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    />
               </label>

               <label>
                    Editorial
                    <input
                    value={formData.editorial}
                    onChange={(e) => setFormData({ ...formData, editorial: e.target.value })}
                    />
               </label>

               <label>
                    Año
                    <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
               </label>

               <label>
                    Categoría
                    <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                    <option value="">Seleccionar...</option>
                    <option value="Ficción">Ficción</option>
                    <option value="No Ficción">No Ficción</option>
                    <option value="Ciencia">Ciencia</option>
                    <option value="Historia">Historia</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Arte">Arte</option>
                    </select>
               </label>

               <label>
                    Total de Copias *
                    <input
                    type="number"
                    min="1"
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                    required
                    />
               </label>

               <label>
                    Ubicación
                    <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej: Estante A, Piso 2"
                    />
               </label>

               <label>
                    URL de Imagen
                    <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    />
               </label>

               <label>
                    Descripción
                    <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    />
               </label>

               <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <button type="button" onClick={handleCloseModal} className="btn btn-outline">
                    Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                    {editingBook ? "Actualizar" : "Crear"}
                    </button>
               </div>
               </form>
               </div>
          </div>
          )}
     </div>
     );
};