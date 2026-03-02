import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from './services/authService';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Reports from './pages/Reports';

const Protected = ({ children }) =>
  getToken() ? children : <Navigate to='/login' />;

// Temporary placeholder until Madhusudan adds MovieList
const MoviePlaceholder = () => (
  <div className="container mt-5 text-center">
    <h3>Login Successful!</h3>
    <p className="text-muted">Movie listing page coming soon (Madhusudan's module)</p>
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

        {/* Temporary placeholder — replace with MovieList after Madhusudan's PR */}
        <Route path="/movies" element={<Protected><MoviePlaceholder /></Protected>} />

        {/* Teammates add their routes below */}
        {/* <Route path="/movies"  element={<Protected><MovieList /></Protected>} /> */}
        {/* <Route path="/booking" element={<Protected><SeatSelection /></Protected>} /> */}
        {/* Spoorthy — Epic 5: Reports & Notifications */}
        <Route path="/reports" element={<Protected><Reports /></Protected>} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App