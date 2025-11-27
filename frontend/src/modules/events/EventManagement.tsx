import React, { useEffect, useState } from "react";
import { gqlRequest } from "../../core/graphqlClient";

interface User {
     id: string;
     name: string;
}

interface Event {
     id: string;
     title: string;
     description?: string;
     date: string;
     maxCapacity: number;
     availableSpots: number;
     location?: string;
     participants: User[];
     createdBy?: User;
}

export const EventManagement: React.FC = () => {
     const [events, setEvents] = useState<Event[]>([]);
     const [loading, setLoading] = useState(true);
     const [showModal, setShowModal] = useState(false);
     const [editingEvent, setEditingEvent] = useState<Event | null>(null);
     const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

     const [formData, setFormData] = useState({
     title: "",
     description: "",
     date: "",
     maxCapacity: "20",
     location: ""
     });

     const loadEvents = async () => {
     setLoading(true);
     try {
          const data = await gqlRequest<{ events: Event[] }>(`
          query Events {
               events {
               id
               title
               description
               date
               maxCapacity
               availableSpots
               location
               participants { id name }
               createdBy { id name }
               }
          }
          `);
          setEvents(data.events);
     } catch (err: any) {
          setMessage({ type: "error", text: err.message });
     } finally {
          setLoading(false);
     }
     };

     useEffect(() => {
     loadEvents();
     }, []);

     const resetForm = () => {
     setFormData({
          title: "",
          description: "",
          date: "",
          maxCapacity: "20",
          location: ""
     });
     setEditingEvent(null);
     };

     const handleOpenModal = (event?: Event) => {
     if (event) {
          setEditingEvent(event);
          setFormData({
          title: event.title,
          description: event.description || "",
          date: event.date.split("T")[0],
          maxCapacity: event.maxCapacity.toString(),
          location: event.location || ""
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
          if (editingEvent) {
          await gqlRequest(
               `mutation UpdateEvent(
               $id: ID!
               $title: String
               $description: String
               $date: String
               $maxCapacity: Int
               $location: String
               ) {
               updateEvent(
               id: $id
               title: $title
               description: $description
               date: $date
               maxCapacity: $maxCapacity
               location: $location
               ) { id }
               }`,
               {
               id: editingEvent.id,
               ...formData,
               maxCapacity: parseInt(formData.maxCapacity)
               }
          );
          setMessage({ type: "success", text: "Evento actualizado exitosamente" });
          } else {
          await gqlRequest(
               `mutation CreateEvent(
               $title: String!
               $description: String
               $date: String!
               $maxCapacity: Int!
               $location: String
               ) {
               createEvent(
               title: $title
               description: $description
               date: $date
               maxCapacity: $maxCapacity
               location: $location
               ) { id }
               }`,
               {
               ...formData,
               maxCapacity: parseInt(formData.maxCapacity)
               }
          );
          setMessage({ type: "success", text: "Evento creado exitosamente" });
          }

          handleCloseModal();
          loadEvents();
     } catch (err: any) {
          setMessage({ type: "error", text: err.message });
     }
     };

     const handleDelete = async (id: string) => {
     if (!confirm("¿Estás seguro de eliminar este evento?")) return;

     try {
          await gqlRequest(`mutation DeleteEvent($id: ID!) { deleteEvent(id: $id) }`, { id });
          setMessage({ type: "success", text: "Evento eliminado exitosamente" });
          loadEvents();
     } catch (err: any) {
          setMessage({ type: "error", text: err.message });
     }
     };

     if (loading) return <div className="loading">Cargando eventos...</div>;

     return (
     <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2>Gestión de Eventos</h2>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
               ➕ Crear Evento
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
               <th>Evento</th>
               <th>Fecha</th>
               <th>Ubicación</th>
               <th>Capacidad</th>
               <th>Inscritos</th>
               <th>Creado por</th>
               <th>Acciones</th>
               </tr>
               </thead>
               <tbody>
               {events.map((event) => (
               <tr key={event.id}>
                    <td>
                    <strong>{event.title}</strong>
                    {event.description && <><br /><small>{event.description}</small></>}
                    </td>
                    <td>{new Date(event.date).toLocaleDateString()}</td>
                    <td>{event.location || "N/A"}</td>
                    <td>{event.maxCapacity}</td>
                    <td>
                    {event.participants.length} / {event.maxCapacity}
                    <br />
                    <small>{event.availableSpots} disponibles</small>
                    </td>
                    <td>{event.createdBy?.name || "N/A"}</td>
                    <td>
                    <button onClick={() => handleOpenModal(event)} className="btn btn-sm btn-outline">
                         Editar
                    </button>
                    {" "}
                    <button onClick={() => handleDelete(event.id)} className="btn btn-sm btn-danger">
                         Eliminar
                    </button>
                    </td>
               </tr>
               ))}
               </tbody>
          </table>
          </div>

          {events.length === 0 && <div className="empty-state"><p>No hay eventos registrados</p></div>}

          {/* Modal */}
          {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
               <div className="modal" onClick={(e) => e.stopPropagation()}>
               <div className="modal-header">
               <h3>{editingEvent ? "Editar Evento" : "Crear Evento"}</h3>
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
                    Descripción
                    <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    />
               </label>

               <label>
                    Fecha *
                    <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    />
               </label>

               <label>
                    Capacidad Máxima *
                    <input
                    type="number"
                    min="1"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                    required
                    />
               </label>

               <label>
                    Ubicación
                    <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej: Sala Principal, Auditorio"
                    />
               </label>

               <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                    <button type="button" onClick={handleCloseModal} className="btn btn-outline">
                    Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                    {editingEvent ? "Actualizar" : "Crear"}
                    </button>
               </div>
               </form>
               </div>
          </div>
          )}
     </div>
     );
};