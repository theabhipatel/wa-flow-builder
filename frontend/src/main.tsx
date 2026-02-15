import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ReactFlowProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor/:flowId" element={<EditorPage />} />
        </Routes>
      </ReactFlowProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
