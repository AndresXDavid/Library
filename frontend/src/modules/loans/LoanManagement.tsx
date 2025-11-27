import React, { useEffect, useState } from "react";
import { gqlRequest } from "../../core/graphqlClient";

interface User {
     id: string;
     name: string;
     email: string;
}

interface Book {
     id: string;
     title: string;
     author: string;
}

interface Loan {
     id: string;
     user: User;
     book: Book;
     loanDate: string;
     returnDeadline: string;
     actualReturnDate?: string;
     status: string;
     fine: number;
}

export const LoanManagement: React.FC = () => {
     const [loans, setLoans] = useState<Loan[]>([]);
     const [users, setUsers] = useState<User[]>([]);
     const [books, setBooks] = useState<Book[]>([]);
     const [loading, setLoading] = useState(true);
     const [showModal, setShowModal] = useState(false);
     const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

     const [selectedUser, setSelectedUser] = useState("");
     const [selectedBook, setSelectedBook] = useState("");
     const [days, setDays] = useState("14");

     const loadData = async () => {
     setLoading(true);
     try {
          const [loansData, usersData, booksData] = await Promise.all([
          gqlRequest<{ loans: Loan[] }>(`
               query Loans {
               loans {
               id
               user { id name email }
               book { id title author }
               loanDate
               returnDeadline
               actualReturnDate
               status
               fine
               }
               }
          `),
          gqlRequest<{ users: User[] }>(`query { users { id name email } }`),
          gqlRequest<{ books: Book[] }>(`query { books { id title author } }`)
          ]);

          setLoans(loansData.loans);
          setUsers(usersData.users);
          setBooks(booksData.books);
     } catch (err: any) {
          setMessage({ type: "error", text: err.message });
     } finally {
          setLoading(false);
     }
     };

     useEffect(() => {
     loadData();
     }, []);

     const handleCreateLoan = async (e: React.FormEvent) => {
     e.preventDefault();
     setMessage(null);

     try {
          await gqlRequest(
          `mutation CreateLoan($userId: ID!, $bookId: ID!, $days: Int) {
               createLoan(userId: $userId, bookId: $bookId, days: $days) { id }
          }`,
          {
               userId: selectedUser,
               bookId: selectedBook,
               days: parseInt(days)
          }
          );

          setMessage({ type: "success", text: "Préstamo creado exitosamente" });
          setShowModal(false);
          setSelectedUser("");
          setSelectedBook("");
          setDays("14");
          loadData();
     } catch (err: any) {
          setMessage({ type: "error", text: err.message });
     }
     };

     const handleReturn = async (loanId: string) => {
     try {
          await gqlRequest(
          `mutation ReturnBook($loanId: ID!) { returnBook(loanId: $loanId) { id } }`,
          { loanId }
          );
          setMessage({ type: "success", text: "Devolución registrada exitosamente" });
          loadData();
     } catch (err: any) {
          setMessage({ type: "error", text: err.message });
     }
     };

     if (loading) return <div className="loading">Cargando préstamos...</div>;

     return (
     <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2>Gestión de Préstamos</h2>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
               ➕ Registrar Préstamo
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
               <th>Usuario</th>
               <th>Libro</th>
               <th>Fecha Préstamo</th>
               <th>Fecha Límite</th>
               <th>Estado</th>
               <th>Multa</th>
               <th>Acciones</th>
               </tr>
               </thead>
               <tbody>
               {loans.map((loan) => (
               <tr key={loan.id}>
                    <td>{loan.user.name}</td>
                    <td><strong>{loan.book.title}</strong><br/><small>{loan.book.author}</small></td>
                    <td>{new Date(loan.loanDate).toLocaleDateString()}</td>
                    <td>{new Date(loan.returnDeadline).toLocaleDateString()}</td>
                    <td>
                    <span className={`badge badge-${loan.status === "active" ? "user" : loan.status === "returned" ? "admin" : "staff"}`}>
                         {loan.status === "active" ? "Activo" : loan.status === "returned" ? "Devuelto" : "Vencido"}
                    </span>
                    </td>
                    <td>${loan.fine.toLocaleString()}</td>
                    <td>
                    {loan.status === "active" && (
                         <button onClick={() => handleReturn(loan.id)} className="btn btn-sm btn-secondary">
                         Registrar Devolución
                         </button>
                    )}
                    </td>
               </tr>
               ))}
               </tbody>
          </table>
          </div>

          {loans.length === 0 && <div className="empty-state"><p>No hay préstamos registrados</p></div>}

          {/* Modal */}
          {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
               <div className="modal" onClick={(e) => e.stopPropagation()}>
               <div className="modal-header">
               <h3>Registrar Nuevo Préstamo</h3>
               <button onClick={() => setShowModal(false)} className="modal-close">×</button>
               </div>

               <form onSubmit={handleCreateLoan} className="form">
               <label>
                    Usuario *
                    <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} required>
                    <option value="">Seleccionar usuario...</option>
                    {users.map((user) => (
                         <option key={user.id} value={user.id}>
                         {user.name} ({user.email})
                         </option>
                    ))}
                    </select>
               </label>

               <label>
                    Libro *
                    <select value={selectedBook} onChange={(e) => setSelectedBook(e.target.value)} required>
                    <option value="">Seleccionar libro...</option>
                    {books.map((book) => (
                         <option key={book.id} value={book.id}>
                         {book.title} - {book.author}
                         </option>
                    ))}
                    </select>
               </label>

               <label>
                    Días de préstamo *
                    <input
                    type="number"
                    min="1"
                    max="30"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    required
                    />
               </label>

               <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                    Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                    Registrar Préstamo
                    </button>
               </div>
               </form>
               </div>
          </div>
          )}
     </div>
     );
};