import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Table from "../Table/Table";
import Contact from "../Contact/Contact";

function App() {
  return (
    <Routes>
      {/* Главная страница с таблицей */}
      <Route path="/" element={<Table />} />

      {/* Страница контакта пациента */}
      <Route path="/contact/:id" element={<Contact />} />
    </Routes>
  );
}

export default App;
