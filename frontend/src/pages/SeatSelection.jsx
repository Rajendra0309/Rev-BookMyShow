import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getShows } from '../services/bookingService';
import { getSeatsByScreen } from '../services/theatreService';
import { checkSeatAvailability, createBooking } from '../services/bookingService';
import { getToken, getUser } from '../services/authService';

export default function SeatSelection() {
  const [searchParams] = useSearchParams();
  const showId = searchParams.get('showId');
  const movieId = searchParams.get('movieId');
  const navigate = useNavigate();

  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [showsLoading, setShowsLoading] = useState(true);

  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatsLoading, setSeatsLoading] = useState(false);

  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const token = getToken();
  const user = getUser();

  useEffect(() => { fetchShows(); }, []);

  const fetchShows = async () => {
    setShowsLoading(true);
    try {
      const res = await getShows();
      const allShows = res.data || res || [];
      let filtered = allShows.filter(s => s.status === 'Active');
      if (showId) filtered = filtered.filter(s => s._id === showId);
      if (movieId) filtered = filtered.filter(s => s.movieId?._id === movieId || s.movieId === movieId);
      setShows(filtered);
      if (showId && filtered.length === 1) handleSelectShow(filtered[0]);
    } catch {
      setError('Failed to load shows.');
    } finally {
      setShowsLoading(false);
    }
  };

  const handleSelectShow = async (show) => {
    setSelectedShow(show);
    setSelectedSeats([]);
    setSeatsLoading(true);
    try {
      const screenId = show.screenId?._id || show.screenId;
      const [seatsRes, availRes] = await Promise.all([
        getSeatsByScreen(screenId),
        checkSeatAvailability(show._id)
      ]);
      setSeats(seatsRes.data.data || seatsRes.data || []);
      setBookedSeats(availRes.data.bookedSeats || []);
    } catch {
      setError('Failed to load seats.');
    } finally {
      setSeatsLoading(false);
    }
  };

  const toggleSeat = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return;
    setSelectedSeats(prev =>
      prev.includes(seatNumber) ? prev.filter(s => s !== seatNumber) : [...prev, seatNumber]
    );
  };

  const getSeatPrice = (seat) => {
    const prices = selectedShow?.ticketPrice;
    if (!prices) return 0;
    return prices[seat?.seatType] ?? prices.Regular ?? 0;
  };

  const calcTotal = () => {
    return selectedSeats.reduce((total, seatNum) => {
      const seat = seats.find(s => s.seatNumber === seatNum);
      return total + getSeatPrice(seat);
    }, 0);
  };

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) { setError('Please select at least one seat.'); return; }
    if (!token) { navigate('/login'); return; }
    setBooking(true);
    setError('');
    try {
      await createBooking({ showId: selectedShow._id, seats: selectedSeats });
      setSuccess({ seats: selectedSeats, total: calcTotal() });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBooking(false);
    }
  };

  const getSeatStyle = (seat) => {
    if (bookedSeats.includes(seat.seatNumber)) return { bg: '#e74c3c', color: '#fff', cursor: 'not-allowed' };
    if (selectedSeats.includes(seat.seatNumber)) return { bg: '#2980b9', color: '#fff', cursor: 'pointer' };
    if (seat.seatType === 'VIP') return { bg: '#f39c12', color: '#fff', cursor: 'pointer' };
    if (seat.seatType === 'Premium') return { bg: '#8e44ad', color: '#fff', cursor: 'pointer' };
    return { bg: '#ecf0f1', color: '#333', cursor: 'pointer' };
  };

  const groupSeatsByRow = () => {
    const rows = {};
    seats.forEach(seat => {
      const row = seat.seatNumber?.charAt(0) || 'X';
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });
    return rows;
  };

  const priceLabel = () => {
    const p = selectedShow?.ticketPrice;
    if (!p) return '';
    const vals = [p.Regular, p.Premium, p.VIP].filter(v => v > 0);
    if (!vals.length) return '';
    const min = Math.min(...vals), max = Math.max(...vals);
    return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
  };

  if (success) {
    return (
      <div className="container mt-5 text-center" style={{ maxWidth: 500, margin: '80px auto' }}>
        <div className="card shadow p-5">
          <div style={{ fontSize: 64 }}>🎉</div>
          <h3 className="text-success mt-3">Booking Confirmed!</h3>
          <hr />
          <p><strong>Movie:</strong> {selectedShow?.movieId?.title}</p>
          <p><strong>Theatre:</strong> {selectedShow?.screenId?.theatreId?.name}</p>
          <p><strong>Date:</strong> {new Date(selectedShow?.showDate).toLocaleDateString('en-GB')} &nbsp; <strong>Time:</strong> {selectedShow?.showTime}</p>
          <p><strong>Seats:</strong> {success.seats.join(', ')}</p>
          <p className="fs-5"><strong>Total Paid:</strong> <span className="text-success">₹{success.total}</span></p>
          <div className="d-flex gap-2 justify-content-center mt-3">
            <button className="btn btn-outline-secondary" onClick={() => navigate('/bookings')}>My Bookings</button>
            <button className="btn btn-danger" onClick={() => navigate('/movies')}>Back to Movies</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🎬 Book Tickets</h2>

      {error && <div className="alert alert-danger alert-dismissible">
        {error}<button className="btn-close" onClick={() => setError('')}></button>
      </div>}

      {/* SHOW LIST */}
      {!selectedShow && (
        <>
          <h5 className="text-muted mb-3">Select a Show</h5>
          {showsLoading ? <p>Loading shows...</p> : shows.length === 0 ? (
            <div className="alert alert-warning">No shows available.</div>
          ) : (
            <div className="row">
              {shows.map(show => {
                const p = show.ticketPrice;
                const vals = p ? [p.Regular, p.Premium, p.VIP].filter(v => v > 0) : [];
                const priceStr = vals.length ? (Math.min(...vals) === Math.max(...vals) ? `₹${Math.min(...vals)}` : `₹${Math.min(...vals)}–₹${Math.max(...vals)}`) : '';
                return (
                  <div className="col-md-4 mb-3" key={show._id}>
                    <div className="card h-100 shadow-sm">
                      <div className="card-body">
                        <h6>{show.movieId?.title}</h6>
                        <p className="mb-1 small">🏛 {show.screenId?.theatreId?.name} — {show.screenId?.theatreId?.city}</p>
                        <p className="mb-1 small">🎬 {show.screenId?.screenName}</p>
                        <p className="mb-1 small">📅 {new Date(show.showDate).toLocaleDateString('en-GB')} &nbsp; 🕐 {show.showTime}</p>
                        <p className="fw-bold text-success mb-0">{priceStr} / seat</p>
                      </div>
                      <div className="card-footer">
                        <button className="btn btn-danger w-100 btn-sm" onClick={() => handleSelectShow(show)}>Select Show</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* SEAT SELECTION */}
      {selectedShow && (
        <div className="row g-4">
          <div className="col-lg-8">

            {/* Show Details */}
            <div className="card mb-4 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div>
                    <h4 className="mb-1">{selectedShow.movieId?.title}</h4>
                    <p className="text-muted mb-1">🏛 <strong>{selectedShow.screenId?.theatreId?.name}</strong> — {selectedShow.screenId?.theatreId?.city}</p>
                    <p className="text-muted mb-1">🎬 Screen: {selectedShow.screenId?.screenName} &nbsp;|&nbsp; 📍 {selectedShow.screenId?.theatreId?.location}</p>
                    <p className="text-muted mb-0">📅 {new Date(selectedShow.showDate).toLocaleDateString('en-GB')} &nbsp;|&nbsp; 🕐 {selectedShow.showTime}</p>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-success fs-6">{priceLabel()}</span>
                    <br />
                    <button className="btn btn-link btn-sm text-muted mt-1 p-0" onClick={() => { setSelectedShow(null); setSelectedSeats([]); }}>← Change Show</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Screen Label */}
            <div className="text-center mb-4">
              <div style={{ background: '#bdc3c7', borderRadius: 6, padding: '6px 60px', display: 'inline-block', fontSize: 13, letterSpacing: 4, color: '#555' }}>▲ SCREEN</div>
            </div>

            {/* Seat Map */}
            {seatsLoading ? <p className="text-center">Loading seats...</p> : seats.length === 0 ? (
              <div className="alert alert-warning">No seats configured for this screen.</div>
            ) : (
              <>
                {Object.entries(groupSeatsByRow()).map(([row, rowSeats]) => (
                  <div key={row} className="d-flex align-items-center justify-content-center mb-2">
                    <span style={{ width: 24, fontWeight: 700, color: '#888', fontSize: 13, flexShrink: 0 }}>{row}</span>
                    <div className="d-flex gap-1 flex-wrap justify-content-center">
                      {rowSeats.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber)).map(seat => {
                        const style = getSeatStyle(seat);
                        const price = getSeatPrice(seat);
                        return (
                          <button
                            key={seat._id}
                            title={`${seat.seatNumber} — ${seat.seatType} — ₹${price}`}
                            disabled={bookedSeats.includes(seat.seatNumber)}
                            onClick={() => toggleSeat(seat.seatNumber)}
                            style={{ width: 46, height: 34, background: style.bg, color: style.color, border: 'none', borderRadius: 5, fontSize: 10, fontWeight: 600, cursor: style.cursor }}
                          >
                            {seat.seatNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Legend with prices */}
                <div className="d-flex gap-3 flex-wrap mt-4 align-items-center">
                  {[
                    { bg: '#ecf0f1', color: '#333', type: 'Regular' },
                    { bg: '#8e44ad', color: '#fff', type: 'Premium' },
                    { bg: '#f39c12', color: '#fff', type: 'VIP' },
                    { bg: '#2980b9', color: '#fff', type: 'Selected' },
                    { bg: '#e74c3c', color: '#fff', type: 'Booked' },
                  ].map(item => {
                    const price = selectedShow.ticketPrice?.[item.type];
                    return (
                      <div key={item.type} className="d-flex align-items-center gap-1">
                        <div style={{ width: 22, height: 14, background: item.bg, borderRadius: 3, border: '1px solid #ccc' }}></div>
                        <small>{item.type}{price ? ` ₹${price}` : ''}</small>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="col-lg-4">
            <div className="card shadow-sm sticky-top" style={{ top: 80 }}>
              <div className="card-header bg-dark text-white"><strong>Booking Summary</strong></div>
              <div className="card-body">
                <p className="mb-2"><strong>Movie:</strong><br />{selectedShow.movieId?.title}</p>
                <p className="mb-2"><strong>Theatre:</strong><br />{selectedShow.screenId?.theatreId?.name}</p>
                <p className="mb-2"><strong>Screen:</strong> {selectedShow.screenId?.screenName}</p>
                <p className="mb-2"><strong>Date:</strong> {new Date(selectedShow.showDate).toLocaleDateString('en-GB')}</p>
                <p className="mb-3"><strong>Time:</strong> {selectedShow.showTime}</p>
                <hr />
                <p className="mb-1"><strong>Selected Seats:</strong><br />
                  {selectedSeats.length === 0
                    ? <span className="text-muted">None</span>
                    : selectedSeats.map(seatNum => {
                      const seat = seats.find(s => s.seatNumber === seatNum);
                      return (
                        <span key={seatNum} className="badge bg-primary me-1 mb-1">{seatNum} ₹{getSeatPrice(seat)}</span>
                      );
                    })
                  }
                </p>
                <hr />
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <strong className="fs-5">Total</strong>
                  <strong className="fs-5 text-success">₹{calcTotal()}</strong>
                </div>
                <button className="btn btn-danger w-100" disabled={selectedSeats.length === 0 || booking} onClick={handleConfirmBooking}>
                  {booking ? 'Processing...' : selectedSeats.length === 0 ? 'Select Seats' : `Confirm Booking (${selectedSeats.length})`}
                </button>
                {user && <p className="text-muted small mt-2 text-center">Booking as: {user.name}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}