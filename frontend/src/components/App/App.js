import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import Table from "../Table/Table";
import Contact from "../Contact/Contact";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Table />
            </>
          }
        />
        <Route
          path="/contact/:id"
          element={
            <>
              <Contact />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
