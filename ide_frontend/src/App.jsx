import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";

import Home from "./pages/Home";
import Questions from "./pages/Questions";
import IDE from "./pages/IDE";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/ide" element={<IDE />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
