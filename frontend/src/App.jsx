import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SeatSelection from "./pages/SeatSelection";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SeatSelection />} />
      </Routes>
    </Router>
  );
}

export default App;