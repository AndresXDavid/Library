// frontend/src/views/MemberView.tsx
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
  const