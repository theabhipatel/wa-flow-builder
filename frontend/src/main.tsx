import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactFlowProvider } from "reactflow";
import BotListPage from "./pages/BotListPage";
import FlowListPage from "./pages/FlowListPage";
import EditorPage from "./pages/EditorPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ReactFlowProvider>
        <Routes>
          <Route path="/" element={<BotListPage />} />
          <Route path="/bot/:botId/flows" element={<FlowListPage />} />
          <Route path="/bot/:botId/editor/:flowId" element={<EditorPage />} />
        </Routes>
      </ReactFlowProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
