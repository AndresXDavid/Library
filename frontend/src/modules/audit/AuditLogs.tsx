import React, { useEffect, useState } from "react";
import { gqlRequest } from "../../core/graphqlClient";

interface User {
     id: string;
     name: string;
     email: string;
}

interface AuditLog {
     id: string;
     user?: User;
     action: string;
     description: string;
     timestamp: string;
}

export const AuditLogs: React.FC = () => {
     const [logs, setLogs] = useState<AuditLog[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [limit, setLimit] = useState(50);

     const loadLogs = async () => {
     setLoading(true);
     setError(null);
     try {
          const data = await gqlRequest<{ auditLogs: AuditLog[] }>(
          `query AuditLogs($limit: Int) {
               auditLogs(limit: $limit) {
               id
               user { id name email }
               action
               description
               timestamp
               }
          }`,
          { limit }
          );
          setLogs(data.auditLogs);
     } catch (err: any) {
          setError(err.message);
     } finally {
          setLoading(false);
     }
     };

     useEffect(() => {
     loadLogs();
     }, [limit]);

     if (loading) return <div className="loading">Cargando logs de auditoría...</div>;

     return (
     <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2>Logs de Auditoría</h2>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
               <label style={{ flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
               Mostrar:
               <select
               value={limit}
               onChange={(e) => setLimit(parseInt(e.target.value))}
               style={{ width: "auto" }}
               >
               <option value="25">25 registros</option>
               <option value="50">50 registros</option>
               <option value="100">100 registros</option>
               <option value="200">200 registros</option>
               </select>
               </label>
          </div>
          </div>

          {error && (
          <div className="alert alert-error">
               {error}
          </div>
          )}

          <div className="table-container">
          <table>
               <thead>
               <tr>
               <th>Fecha y Hora</th>
               <th>Usuario</th>
               <th>Acción</th>
               <th>Descripción</th>
               </tr>
               </thead>
               <tbody>
               {logs.map((log) => (
               <tr key={log.id}>
                    <td>
                    {new Date(log.timestamp).toLocaleDateString()}{" "}
                    {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                    {log.user ? (
                         <>
                         <strong>{log.user.name}</strong>
                         <br />
                         <small>{log.user.email}</small>
                         </>
                    ) : (
                         "Sistema"
                    )}
                    </td>
                    <td>
                    <span className="badge badge-user">{log.action}</span>
                    </td>
                    <td>{log.description}</td>
               </tr>
               ))}
               </tbody>
          </table>
          </div>

          {logs.length === 0 && (
          <div className="empty-state">
               <p>No hay logs de auditoría registrados</p>
          </div>
          )}
     </div>
     );
};