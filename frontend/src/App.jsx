import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from './services/authService';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Reports from './pages/Reports';

import TheatreList from './pages/TheatreList';
import SeatSelection from './pages/SeatSelection';


const Protected = ({ children }) =>
  getToken() ? children : <Navigate to='/login' />;

// Temporary placeholder until MovieList module is ready
const MoviePlaceholder = () => (
  <div className="container mt-5 text-center">
    <h3>Login Successful!</h3>
    <p className="text-muted">
      Movie listing page coming soon (Movie Management Module)
    </p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Movie Placeholder */}
        <Route path="/movies" element={<Protected><MoviePlaceholder /></Protected>} />

        {/* ✅ Your Seat Selection Route */}
        <Route path="/booking" element={<Protected><SeatSelection /></Protected>} />

        {/* Reports Module */}
        <Route path="/reports" element={<Protected><Reports /></Protected>} />
        {/* Samarth — Epic 3: Theatre & Screen Management */}
        <Route path="/theatres" element={<Protected><TheatreList /></Protected>} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
