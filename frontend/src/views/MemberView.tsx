import React, { useEffect, useState } from "react";
import { BookCatalog } from "../modules/books/BookCatalog";
import { gqlRequest } from "../core/graphqlClient";

interface User {
  id: string;
  name: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  imageUrl?: string;
}

interface Loan {
  id: string;
  book: Book;
  loanDate: string;
  returnDeadline: string;
  status: string;
  fine: number;
}

interface Reservation {
  id: string;
  book: Book;
  reservationDate: string;
  status: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  availableSpots: number;
  maxCapacity: number;
  participants: User[];
}

type Tab = "catalog" | "loans" | "reservations" | "events";

export const MemberView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("catalog");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const data = await gqlRequest<{ myLoans: Loan[] }>(
        `query MyLoans {
          myLoans {
            id
            book { id title author imageUrl }
            loanDate
            returnDeadline
            status
            fine
          }
        }`
      );
      setLoans(data.myLoans);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await gqlRequest<{ myReservations: Reservation[] }>(
        `query MyReservations {
          myReservations {
            id
            book { id title author imageUrl }
            reservationDate
            status
          }
        }`
      );
      setReservations(data.myReservations);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await gqlRequest<{ events: Event[] }>(
        `query Events {
          events {
            id
            title
            description
            date
            location
            availableSpots
            maxCapacity
            participants { id name }
          }
        }`
      );
      setEvents(data.events);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "loans") loadLoans();
    if (activeTab === "reservations") loadReservations();
    if (activeTab === "events") loadEvents();
  }, [activeTab]);

  const handleCancelReservation = async (id: string) => {
    try {
      await gqlRequest(
        `mutation CancelReservation($id: ID!) {
          cancelReservation(id: $id)
        }`,
        { id }
      );
      setMessage({ type: "success", text: "Reserva cancelada exitosamente" });
      loadReservations();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    try {
      await gqlRequest(
        `mutation RegisterForEvent($eventId: ID!) {
          registerForEvent(eventId: $eventId) { id }
        }`,
        { eventId }
      );
      setMessage({ type: "success", text: "Inscripción exitosa al evento" });
      loadEvents();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="view-container">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "catalog" ? "active" : ""}`}
          onClick={() => setActiveTab("catalog")}
        >
          📚 Catálogo
        </button>
        <button
          className={`tab ${activeTab === "loans" ? "active" : ""}`}
          onClick={() => setActiveTab("loans")}
        >
          📖 Mis Préstamos
        </button>
        <button
          className={`tab ${activeTab === "reservations" ? "active" : ""}`}
          onClick={() => setActiveTab("reservations")}
        >
          🔖 Mis Reservas
        </button>
        <button
          className={`tab ${activeTab === "events" ? "active" : ""}`}
          onClick={() => setActiveTab("events")}
        >
          🎉 Eventos
        </button>
      </div>

      <div className="tab-content">
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="alert-close">×</button>
          </div>
        )}

        {activeTab === "catalog" && <BookCatalog />}

        {activeTab === "loans" && (
          <div>
            <h2 style={{ marginBottom: "2rem" }}>📖 Mis Préstamos</h2>
            {loading ? (
              <div className="loading">Cargando préstamos...</div>
            ) : (
              <>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Libro</th>
                        <th>Fecha Préstamo</th>
                        <th>Fecha Límite</th>
                        <th>Estado</th>
                        <th>Multa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loans.map((loan) => (
                        <tr key={loan.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                              {loan.book.imageUrl ? (
                                <img 
                                  src={loan.book.imageUrl} 
                                  alt={loan.book.title}
                                  style={{ width: "50px", height: "70px", objectFit: "cover", borderRadius: "4px" }}
                                />
                              ) : (
                                <div style={{ width: "50px", height: "70px", background: "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>📖</div>
                              )}
                              <div>
                                <strong>{loan.book.title}</strong>
                                <br />
                                <small>{loan.book.author}</small>
                              </div>
                            </div>
                          </td>
                          <td>{new Date(loan.loanDate).toLocaleDateString()}</td>
                          <td>{new Date(loan.returnDeadline).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge badge-${loan.status === "active" ? "user" : loan.status === "returned" ? "admin" : "staff"}`}>
                              {loan.status === "active" ? "Activo" : loan.status === "returned" ? "Devuelto" : "Vencido"}
                            </span>
                          </td>
                          <td>${loan.fine.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {loans.length === 0 && (
                  <div className="empty-state">
                    <p>No tienes préstamos activos</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "reservations" && (
          <div>
            <h2 style={{ marginBottom: "2rem" }}>🔖 Mis Reservas</h2>
            {loading ? (
              <div className="loading">Cargando reservas...</div>
            ) : (
              <>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Libro</th>
                        <th>Fecha Reserva</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map((reservation) => (
                        <tr key={reservation.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                              {reservation.book.imageUrl ? (
                                <img 
                                  src={reservation.book.imageUrl} 
                                  alt={reservation.book.title}
                                  style={{ width: "50px", height: "70px", objectFit: "cover", borderRadius: "4px" }}
                                />
                              ) : (
                                <div style={{ width: "50px", height: "70px", background: "var(--gray-200)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px" }}>📖</div>
                              )}
                              <div>
                                <strong>{reservation.book.title}</strong>
                                <br />
                                <small>{reservation.book.author}</small>
                              </div>
                            </div>
                          </td>
                          <td>{new Date(reservation.reservationDate).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge badge-${reservation.status === "pending" ? "user" : reservation.status === "notified" ? "admin" : "staff"}`}>
                              {reservation.status === "pending" ? "Pendiente" : reservation.status === "notified" ? "Notificado" : "Cancelada"}
                            </span>
                          </td>
                          <td>
                            {reservation.status === "pending" && (
                              <button 
                                onClick={() => handleCancelReservation(reservation.id)} 
                                className="btn btn-sm btn-danger"
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {reservations.length === 0 && (
                  <div className="empty-state">
                    <p>No tienes reservas activas</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div>
            <h2 style={{ marginBottom: "2rem" }}>🎉 Eventos Disponibles</h2>
            {loading ? (
              <div className="loading">Cargando eventos...</div>
            ) : (
              <>
                <div className="books-grid">
                  {events.map((event) => {
                    const isPastEvent = new Date(event.date) < new Date();
                    const isFull = event.availableSpots === 0;
                    
                    return (
                      <div key={event.id} className="book-card">
                        <div className="book-info">
                          <h3 className="book-title">{event.title}</h3>
                          {event.description && (
                            <p className="book-description">{event.description}</p>
                          )}
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
                            <p className="book-detail">
                              📅 {new Date(event.date).toLocaleDateString()} - {new Date(event.date).toLocaleTimeString()}
                            </p>
                            {event.location && (
                              <p className="book-detail">📍 {event.location}</p>
                            )}
                            <p className="book-detail">
                              👥 {event.participants.length} / {event.maxCapacity} inscritos
                            </p>
                            <p className="book-detail">
                              ✅ {event.availableSpots} cupos disponibles
                            </p>
                          </div>
                          
                          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--gray-200)" }}>
                            {isPastEvent ? (
                              <span className="badge badge-staff">Evento Finalizado</span>
                            ) : isFull ? (
                              <span className="badge badge-staff">Sin Cupos</span>
                            ) : (
                              <button
                                onClick={() => handleRegisterEvent(event.id)}
                                className="btn btn-primary btn-sm"
                                style={{ width: "100%" }}
                              >
                                Inscribirse
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {events.length === 0 && (
                  <div className="empty-state">
                    <p>No hay eventos disponibles actualmente</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};