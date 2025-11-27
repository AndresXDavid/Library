import React, { useEffect, useState } from "react";
import { gqlRequest } from "../../core/graphqlClient";

interface Stats {
     totalBooks: number;
     totalUsers: number;
     activeLoans: number;
     overdueLoans: number;
     totalEvents: number;
}

export const StatsPanel: React.FC = () => {
     const [stats, setStats] = useState<Stats | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     const loadStats = async () => {
     setLoading(true);
     setError(null);
     try {
          const data = await gqlRequest<{ stats: Stats }>(`
          query Stats {
               stats {
               totalBooks
               totalUsers
               activeLoans
               overdueLoans
               totalEvents
               }
          }
          `);
          setStats(data.stats);
     } catch (err: any) {
          setError(err.message);
     } finally {
          setLoading(false);
     }
     };

     useEffect(() => {
     loadStats();
     }, []);

     if (loading) return <div className="loading">Cargando estadísticas...</div>;
     if (error) return <div className="alert alert-error">{error}</div>;
     if (!stats) return null;

     return (
     <div>
          <h2 style={{ marginBottom: "2rem" }}>📊 Dashboard - Estadísticas Generales</h2>

          <div className="stats-grid">
          <div className="stat-card">
               <div className="stat-label">📚 Total de Libros</div>
               <div className="stat-value">{stats.totalBooks}</div>
          </div>

          <div className="stat-card">
               <div className="stat-label">👥 Total de Usuarios</div>
               <div className="stat-value">{stats.totalUsers}</div>
          </div>

          <div className="stat-card">
               <div className="stat-label">📖 Préstamos Activos</div>
               <div className="stat-value" style={{ color: "var(--secondary)" }}>
               {stats.activeLoans}
               </div>
          </div>

          <div className="stat-card">
               <div className="stat-label">⚠️ Préstamos Vencidos</div>
               <div className="stat-value" style={{ color: "var(--danger)" }}>
               {stats.overdueLoans}
               </div>
          </div>

          <div className="stat-card">
               <div className="stat-label">🎉 Eventos Registrados</div>
               <div className="stat-value">{stats.totalEvents}</div>
          </div>
          </div>

          <div style={{ marginTop: "3rem" }}>
          <div className="card">
               <h3>📈 Resumen de Actividad</h3>
               <div style={{ marginTop: "1rem" }}>
               <p>
               <strong>Estado de la biblioteca:</strong>{" "}
               {stats.overdueLoans > 0
                    ? `⚠️ Hay ${stats.overdueLoans} préstamos vencidos que requieren atención`
                    : "✅ Todos los préstamos están al día"}
               </p>
               <p>
               <strong>Tasa de préstamos activos:</strong>{" "}
               {stats.totalBooks > 0
                    ? `${Math.round((stats.activeLoans / stats.totalBooks) * 100)}% de la colección está en préstamo`
                    : "0%"}
               </p>
               <p>
               <strong>Actividad de eventos:</strong>{" "}
               {stats.totalEvents > 0
                    ? `${stats.totalEvents} eventos programados`
                    : "Sin eventos programados actualmente"}
               </p>
               </div>
          </div>
          </div>
     </div>
     );
};