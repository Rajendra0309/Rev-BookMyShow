import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from './services/authService';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Reports from './pages/Reports';
import SeatSelection from './pages/SeatSelection';
<<<<<<< HEAD
import BookingHistory from './pages/BookingHistory';
import AdminCreateShow from './pages/AdminCreateShow';
=======
import MovieList from './pages/MovieList';
import MovieDetails from './pages/MovieDetails';
import AdminCreateShow from './pages/AdminCreateShow';
// import BookingHistory from './pages/BookingHistory'; // ← uncomment when Samrudhi completes it
// import AdminCreateShow from './pages/AdminCreateShow'; // ← uncomment when Samrudhi completes it
>>>>>>> 2c786817f667e05858eac78b664c450b8e39526d

const Protected = ({ children }) =>
  getToken() ? children : <Navigate to='/login' />;

// Placeholder: replace with real component when teammate completes it
const ComingSoon = ({ name }) => (
  <div className="container mt-5 text-center">
    <h4>{name} — Coming Soon</h4>
    <p className="text-muted">This module is under development.</p>
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
        {/* <Route path="/movies" element={<Protected><ComingSoon name="Movie Module" /></Protected>} /> */}
        {/* Movie Module */}
        <Route
          path="/movies"
          element={
            <Protected>
              <MovieList />
            </Protected>
          }
        />

        <Route
          path="/movies/:id"
          element={
            <Protected>
              <MovieDetails />
            </Protected>
          }
        />

        <Route
          path="/admin/show/create"
          element={
            <Protected>
              <AdminCreateShow />
            </Protected>
          }
        />

        {/* Booking Routes */}
        <Route path="/booking" element={<Protected><SeatSelection /></Protected>} />
        <Route path="/bookings" element={<Protected><BookingHistory /></Protected>} />

        {/* Admin Routes */}
        <Route path="/admin/show/create" element={<Protected><AdminCreateShow /></Protected>} />

        {/* Reports Module */}
        <Route path="/reports" element={<Protected><Reports /></Protected>} />

        {/* Booking History — uncomment import above when Samrudhi completes BookingHistory.jsx */}
        <Route path="/bookings" element={<Protected><ComingSoon name="Booking History" /></Protected>} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;