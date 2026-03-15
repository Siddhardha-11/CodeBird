import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Questions from "./pages/Questions";
import IDE from "./pages/IDE";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/ide" element={<IDE />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;