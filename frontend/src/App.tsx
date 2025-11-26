import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ApolloConfig from "./apollo/ApolloConfig";
import Navbar from "./components/Navbar";
import Books from "./pages/Books";
import Authors from "./pages/Authors";

export default function App() {
  return (
    <ApolloConfig>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/books" element={<Books />} />
          <Route path="/authors" element={<Authors />} />
        </Routes>
      </BrowserRouter>
    </ApolloConfig>
  );
}
