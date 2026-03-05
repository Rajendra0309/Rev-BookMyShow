import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getShows } from "../services/bookingService";
import { getSeatsByScreen } from '../services/theatreService';
import { checkSeatAvailability, createBooking } from '../services/bookingService';
import { getToken, getUser } from '../services/authService';

export default function SeatSelection() {
  const [searchParams] = useSearchParams();
  const movieId = searchParams.get('movieId');
  const navigate = useNavigate();

  // Step 1 — Shows for the movie
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [showsLoading, setShowsLoading] = useState(true);

  // Step 2 — Seats
  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatsLoading, setSeatsLoading] = useState(false);

  // Booking
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const token = getToken();
  const user = getUser();

  // ─── Load shows ───────────────────────────────────────────────
  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    setShowsLoading(true);
    try {
      const res = await getShows();
      const allShows = res.data || res || [];
      // Filter by movieId if provided, show only Active shows
      const filtered = allShows.filter(s =>
        s.status === 'Active' &&
        (!movieId || s.movieId?._id === movieId || s.movieId === movieId)
      );
      setShows(filtered);
    } catch {
      setError('Failed to load shows.');
    } finally {
      setShowsLoading(false);
    }
  };

  // ─── Select a show → load its seats ──────────────────────────
  const handleSelectShow = async (show) => {
    setSelectedShow(show);
    setSelectedSeats([]);
    setSeatsLoading(true);
    setError('');
    try {
      const screenId = show.screenId?._id || show.screenId;
      const showId = show._id;

      const [seatsRes, availRes] = await Promise.all([
        getSeatsByScreen(screenId),
        checkSeatAvailability(showId)
      ]);

      setSeats(seatsRes.data.data || seatsRes.data || []);
      setBookedSeats(availRes.data.bookedSeats || []);
    } catch {
      setError('Failed to load seat information.');
    } finally {
      setSeatsLoading(false);
    }
  };

  // ─── Toggle seat selection ─────────────────────────────────────
  const toggleSeat = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return; // already booked
    setSelectedSeats(prev =>
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  // ─── Confirm booking ──────────────────────────────────────────
  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }
    if (!token) { navigate('/login'); return; }

    setBooking(true);
    setError('');
    try {
      const res = await createBooking({
        showId: selectedShow._id,
        seats: selectedSeats
      });
      setSuccess({
        seats: selectedSeats,
        total: res.data.booking?.totalAmount || selectedSeats.length * selectedShow.ticketPrice
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  // ─── Seat colour helper ───────────────────────────────────────
  const getSeatClass = (seat) => {
    if (bookedSeats.includes(seat.seatNumber)) return 'btn-danger disabled';
    if (selectedSeats.includes(seat.seatNumber)) return 'btn-primary';
    if (seat.seatType === 'VIP') return 'btn-warning text-dark';
    if (seat.seatType === 'Premium') return 'btn-info text-dark';
    return 'btn-outline-success';
  };

  // ─── Price calculation ────────────────────────────────────────
  const calcTotal = () => {
    if (!selectedShow) return 0;
    return selectedSeats.length * selectedShow.ticketPrice;
  };

  // ─── SUCCESS screen ───────────────────────────────────────────
  if (success) {
    return (
      <div className="container mt-5 text-center">
        <div className="card p-5 shadow mx-auto" style={{ maxWidth: 480 }}>
          <h2 className="text-success">🎉 Booking Confirmed!</h2>
          <p className="mt-3">Seats: <strong>{success.seats.join(', ')}</strong></p>
          <p>Total Paid: <strong className="text-success">₹{success.total}</strong></p>
          <div className="d-flex gap-2 justify-content-center mt-4">
            <button className="btn btn-danger" onClick={() => navigate('/bookings')}>
              View My Bookings
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/movies')}>
              Back to Movies
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>🎟️ Book Tickets</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ── STEP 1: Choose Show ── */}
      {!selectedShow && (
        <>
          <h5 className="mt-4 mb-3">Step 1 — Select a Show</h5>
          {showsLoading ? (
            <p>Loading shows...</p>
          ) : shows.length === 0 ? (
            <div className="alert alert-warning">
              No active shows available{movieId ? ' for this movie' : ''}.
            </div>
          ) : (
            <div className="row">
              {shows.map(show => (
                <div className="col-md-4 mb-3" key={show._id}>
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h6>{show.movieId?.title || 'Movie'}</h6>
                      <p className="mb-1 text-muted">
                        📅 {new Date(show.showDate).toLocaleDateString('en-IN')}
                      </p>
                      <p className="mb-1 text-muted">🕐 {show.showTime}</p>
                      <p className="mb-1 text-muted">
                        🏟️ {show.screenId?.screenName || 'Screen'}
                      </p>
                      <p className="mb-0 fw-bold text-success">
                        ₹{show.ticketPrice} / seat
                      </p>
                    </div>
                    <div className="card-footer">
                      <button
                        className="btn btn-danger w-100 btn-sm"
                        onClick={() => handleSelectShow(show)}>
                        Select This Show
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── STEP 2: Choose Seats ── */}
      {selectedShow && (
        <>
          <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
            <div>
              <h5 className="mb-0">Step 2 — Select Seats</h5>
              <small className="text-muted">
                {selectedShow.movieId?.title} | {new Date(selectedShow.showDate).toLocaleDateString('en-IN')} {selectedShow.showTime} | ₹{selectedShow.ticketPrice}/seat
              </small>
            </div>
            <button className="btn btn-outline-secondary btn-sm"
              onClick={() => { setSelectedShow(null); setSelectedSeats([]); setError(''); }}>
              ← Change Show
            </button>
          </div>

          {/* Legend */}
          <div className="d-flex gap-3 mb-3 flex-wrap">
            <span><span className="badge bg-outline-success border border-success text-success">■</span> Available</span>
            <span><span className="badge bg-primary">■</span> Selected</span>
            <span><span className="badge bg-danger">■</span> Booked</span>
            <span><span className="badge bg-warning text-dark">■</span> VIP</span>
            <span><span className="badge bg-info text-dark">■</span> Premium</span>
          </div>

          {seatsLoading ? (
            <p>Loading seats...</p>
          ) : seats.length === 0 ? (
            <div className="alert alert-warning">
              No seats configured for this screen yet. Contact admin.
            </div>
          ) : (
            <>
              {/* SCREEN label */}
              <div className="text-center mb-4">
                <div className="border border-secondary rounded py-2 px-4 d-inline-block text-muted small">
                  🎬 SCREEN
                </div>
              </div>

              {/* Seat Grid */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                {seats.map(seat => (
                  <button
                    key={seat._id}
                    className={`btn btn-sm ${getSeatClass(seat)}`}
                    style={{ width: 60, fontSize: '0.75rem' }}
                    disabled={bookedSeats.includes(seat.seatNumber)}
                    onClick={() => toggleSeat(seat.seatNumber)}>
                    {seat.seatNumber}
                  </button>
                ))}
              </div>

              {/* Summary & Confirm */}
              {selectedSeats.length > 0 && (
                <div className="card p-3 mb-4 shadow-sm" style={{ maxWidth: 400 }}>
                  <h6>Booking Summary</h6>
                  <p className="mb-1">
                    Seats: <strong>{selectedSeats.join(', ')}</strong>
                  </p>
                  <p className="mb-3">
                    Total: <strong className="text-success">₹{calcTotal()}</strong>
                    <small className="text-muted ms-2">
                      ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} × ₹{selectedShow.ticketPrice})
                    </small>
                  </p>
                  <button
                    className="btn btn-danger"
                    disabled={booking}
                    onClick={handleConfirmBooking}>
                    {booking ? 'Booking...' : '✅ Confirm Booking'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}