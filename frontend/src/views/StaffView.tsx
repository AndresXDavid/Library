import React, { useState } from "react";
import { BookCatalog } from "../modules/books/BookCatalog";
import { BookManagement } from "../modules/books/BookManagement";
import { LoanManagement } from "../modules/loans/LoanManagement";
import { EventManagement } from "../modules/events/EventManagement";
import { StatsPanel } from "../modules/stats/StatsPanel";

type Tab = "stats" | "catalog" | "books" | "loans" | "events";

export const StaffView: React.FC = () => {
     const [activeTab, setActiveTab] = useState<Tab>("stats");

     return (
     <div className="view-container">
          <div className="tabs">
          <button
               className={`tab ${activeTab === "stats" ? "active" : ""}`}
               onClick={() => setActiveTab("stats")}
          >
               📊 Dashboard
          </button>
          <button
               className={`tab ${activeTab === "catalog" ? "active" : ""}`}
               onClick={() => setActiveTab("catalog")}
          >
               📚 Catálogo
          </button>
          <button
               className={`tab ${activeTab === "books" ? "active" : ""}`}
               onClick={() => setActiveTab("books")}
          >
               ➕ Libros
          </button>
          <button
               className={`tab ${activeTab === "loans" ? "active" : ""}`}
               onClick={() => setActiveTab("loans")}
          >
               📖 Préstamos
          </button>
          <button
               className={`tab ${activeTab === "events" ? "active" : ""}`}
               onClick={() => setActiveTab("events")}
          >
               🎉 Eventos
          </button>
          </div>

          <div className="tab-content">
          {activeTab === "stats" && <StatsPanel />}
          {activeTab === "catalog" && <BookCatalog />}
          {activeTab === "books" && <BookManagement />}
          {activeTab === "loans" && <LoanManagement />}
          {activeTab === "events" && <EventManagement />}
          </div>
     </div>
     );
};