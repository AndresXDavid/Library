import React, { useEffect, useState } from "react";
import { gqlRequest } from "../../core/graphqlClient";

interface User {
     id: string;
     name: string;
     email: string;
     role: string;
     document?: string;
     phone?: string;
     maxLoans: number;
     active: boolean;
     registrationDate?: string;
}

export const UserManagement: React.FC = () => {
     const [users, setUsers] = useState<User[]>([]);
     const [loading, setLoading] = useState(true);
     const [showModal, setShowModal] = useState(false);
     const [editingUser, setEditingUser] = useState<User | null>(null);
     const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

     const [formData, setFormData] = useState({
     name: "",
     email: "",
     role: "user",
     document: "",
     phone: "",
     maxLoans: "3",
     active: true
     });

     const loadUsers = async () => {
     setLoading(true);
     try {
          const data = await gqlRequest<{ users: User[] }>(`
          query Users {
               users {
               id
               name
               email
               role
               document
               phone
               maxLoans
               active
               registrationDate
               }
          }
          `);
          setUsers(data.users);
     } catch (err: any) {
          setMessage({ type: "error", text: err.message });
     } finally {
          setLoading(false);
     }
     };

     useEffect(() => {
     loadUsers();
     }, []);

     const handleOpenModal = (user: User) => {
     setEditingUser(user);
     setFormData({
          name: user.name,
          email: user.email,
          role: user.role,
          document: user.document || "",
          phone: user.phone || "",
          maxLoans: user.maxLoans.toString(),
          active: user.active
     });
     setShowModal(true);
     };

     const handleCloseModal = () => {
     setShowModal(false);
     setEditingUser(null);
     };

     const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!editingUser) return;

     setMessage(null);
     try {
          await gqlRequest(
          `mutation UpdateUser(
               $id: ID!
               $name: String
               $email: String
               $role: String
               $document: String
               $phone: String
               $maxLoans: Int
               $active: Boolean
          ) {
               updateUser(
               id: $id
               name: $name
               email: $email
               role: $role
               document: $document
               phone: $phone
               maxLoans: $maxLoans
               active: $active
               ) { id }
          }`,
          {
               id: editingUser.id,
               ...formData,
               maxLoans: parseInt(formData.maxLoans)
          }
          );

          setMessage({ type: "success", text: "Usuario actualizado exitosamente" });
          handleCloseModal();
          loadUsers();
     } catch (err: any) {
          setMessage({ type: "error", text: err.message });
     }
     };

     const handleDelete = async (id: string) => {
     if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

     try {
          await gqlRequest(`mutation DeleteUser($id: ID!) { deleteUser(id: $id) }`, { id });
          setMessage({ type: "success", text: "Usuario eliminado exitosamente" });
          loadUsers();
     } catch (err: any) {
          setMessage({ type: "error", text: err.message });
     }
     };

     if (loading) return <div className="loading">Cargando usuarios...</div>;

     return (
     <div>
          <div style={{ marginBottom: "2rem" }}>
          <h2>Gestión de Usuarios</h2>
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
               <th>Nombre</th>
               <th>Correo</th>
               <th>Rol</th>
               <th>Documento</th>
               <th>Teléfono</th>
               <th>Max. Préstamos</th>
               <th>Estado</th>
               <th>Acciones</th>
               </tr>
               </thead>
               <tbody>
               {users.map((user) => (
               <tr key={user.id}>
                    <td><strong>{user.name}</strong></td>
                    <td>{user.email}</td>
                    <td>
                    <span className={`badge badge-${user.role}`}>
                         {user.role === "admin" && "Administrador"}
                         {user.role === "staff" && "Bibliotecario"}
                         {user.role === "user" && "Miembro"}
                    </span>
                    </td>
                    <td>{user.document || "N/A"}</td>
                    <td>{user.phone || "N/A"}</td>
                    <td>{user.maxLoans}</td>
                    <td>
                    <span className={`badge ${user.active ? "badge-user" : "badge-staff"}`}>
                         {user.active ? "Activo" : "Inactivo"}
                    </span>
                    </td>
                    <td>
                    <button onClick={() => handleOpenModal(user)} className="btn btn-sm btn-outline">
                         Editar
                    </button>
                    {" "}
                    <button onClick={() => handleDelete(user.id)} className="btn btn-sm btn-danger">
                         Eliminar
                    </button>
                    </td>
               </tr>
               ))}
               </tbody>
          </table>
          </div>

          {users.length === 0 && <div className="empty-state"><p>No hay usuarios registrados</p></div>}

          {/* Modal */}
          {showModal && editingUser && (
          <div className="modal-overlay" onClick={handleCloseModal}>
               <div className="modal" onClick={(e) => e.stopPropagation()}>
               <div className="modal-header">
               <h3>Editar Usuario</h3>
               <button onClick={handleCloseModal} className="modal-close">×</button>
               </div>

               <form onSubmit={handleSubmit} className="form">
               <label>
                    Nombre
                    <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
               </label>

               <label>
                    Correo
                    <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
               </label>

               <label>
                    Rol
                    <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                    <option value="user">Miembro</option>
                    <option value="staff">Bibliotecario</option>
                    <option value="admin">Administrador</option>
                    </select>
               </label>

               <label>
                    Documento
                    <input
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    />
               </label>

               <label>
                    Teléfono
                    <input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
               </label>

               <label>
                    Máximo de Préstamos
                    <input
                    type="number"
                    min="1"
                    value={formData.maxLoans}
                    onChange={(e) => setFormData({ ...formData, maxLoans: e.target.value })}
                    />
               </label>

               <label style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                    <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    style={{ width: "auto" }}
                    />
                    Usuario Activo
               </label>

               <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <button type="button" onClick={handleCloseModal} className="btn btn-outline">
                    Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                    Actualizar
                    </button>
               </div>
               </form>
               </div>
          </div>
          )}
     </div>
     );
};