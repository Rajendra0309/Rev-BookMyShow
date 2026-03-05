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

  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatsLoading, setSeatsLoading] = useState(false);

  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const token = getToken();
  const user = getUser();

  // ─── Load shows ───────────────────────────────────────────────
  useEffect(() => {
    fetchShows();
  }, []);

  // ───────── Fetch Shows ─────────
  const fetchShows = async () => {

    setShowsLoading(true);

    try {

      const res = await getShows();
      const allShows = res.data || res || [];

      let filtered = allShows.filter(s => s.status === "Active");

      if (showId) {
        filtered = filtered.filter(s => s._id === showId);
      }

      if (movieId) {
        filtered = filtered.filter(
          s => s.movieId?._id === movieId || s.movieId === movieId
        );
      }

      setShows(filtered);

      if (showId && filtered.length === 1) {
        handleSelectShow(filtered[0]);
      }

    } catch {

      setError("Failed to load shows.");

    } finally {

      setShowsLoading(false);

    }
  };

  // ───────── Select Show ─────────
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

      setError("Failed to load seats.");

    } finally {

      setSeatsLoading(false);

    }
  };

  // ───────── Seat Click ─────────
  const toggleSeat = (seatNumber) => {

    if (bookedSeats.includes(seatNumber)) return;

    setSelectedSeats(prev =>
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  // ───────── Confirm Booking ─────────
  const handleConfirmBooking = async () => {

    if (selectedSeats.length === 0) {
      setError("Please select seats.");
      return;
    }

    if (!token) {
      navigate("/login");
      return;
    }

    setBooking(true);

    try {

      const res = await createBooking({
        showId: selectedShow._id,
        seats: selectedSeats
      });

      setSuccess({
        seats: selectedSeats,
        total: selectedSeats.length * selectedShow.ticketPrice
      });

    } catch (err) {

      setError(err.response?.data?.message || "Booking failed.");

    } finally {

      setBooking(false);

    }
  };

  // ───────── Seat Style ─────────
  const getSeatClass = (seat) => {

    if (bookedSeats.includes(seat.seatNumber))
      return "btn-danger disabled";

    if (selectedSeats.includes(seat.seatNumber))
      return "btn-primary";

    if (seat.seatType === "VIP")
      return "btn-warning text-dark";

    if (seat.seatType === "Premium")
      return "btn-info text-dark";

    return "btn-outline-success";
  };

  const calcTotal = () => {
    if (!selectedShow) return 0;
    return selectedSeats.length * selectedShow.ticketPrice;
  };

  // ───────── SUCCESS SCREEN ─────────
  if (success) {

    return (
      <div className="container mt-5 text-center">

        <div className="card p-5 shadow mx-auto" style={{ maxWidth: 450 }}>

          <h3 className="text-success">Booking Confirmed</h3>

          <p className="mt-3">
            Seats: <strong>{success.seats.join(", ")}</strong>
          </p>

          <p>
            Total Paid: <strong>₹{success.total}</strong>
          </p>

          <button
            className="btn btn-danger mt-3"
            onClick={() => navigate("/movies")}
          >
            Back to Movies
          </button>

        </div>

      </div>
    );
  }

  return (

    <div className="container mt-5">

      <h2>Book Tickets</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* SHOW LIST */}

      {!selectedShow && (

        <>
          <h5 className="mt-4">Select Show</h5>

          {showsLoading ? (

            <p>Loading shows...</p>

          ) : shows.length === 0 ? (

            <div className="alert alert-warning">
              No shows available.
            </div>

          ) : (

            <div className="row">

              {shows.map(show => (

                <div className="col-md-4 mb-3" key={show._id}>

                  <div className="card shadow-sm">

                    <div className="card-body">

                      <h6>{show.movieId?.title}</h6>

                      <p className="mb-1">
                        📅 {new Date(show.showDate).toLocaleDateString("en-GB")}
                      </p>

                      <p className="mb-1">
                        🕐 {show.showTime}
                      </p>

                      <p className="mb-1">
                        🎬 {show.screenId?.screenName}
                      </p>

                      <p className="fw-bold text-success">
                        ₹{show.ticketPrice} / seat
                      </p>

                    </div>

                    <div className="card-footer">

                      <button
                        className="btn btn-danger w-100 btn-sm"
                        onClick={() => handleSelectShow(show)}
                      >
                        Select Show
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </>
      )}

      {/* SEAT SELECTION */}

      {selectedShow && (

        <>

          <div className="mt-4 mb-3">

            <h5>
              {selectedShow.movieId?.title}
            </h5>

            <small className="text-muted">

              {selectedShow.screenId?.theatreId?.name}

              {" | "}

              {new Date(selectedShow.showDate).toLocaleDateString("en-GB")}

              {" "}

              {selectedShow.showTime}

              {" | ₹"}

              {selectedShow.ticketPrice}/seat

            </small>

          </div>

          {seatsLoading ? (

            <p>Loading seats...</p>

          ) : (

            <>

              <div className="text-center mb-3">

                <div className="border py-2 px-4 d-inline-block">
                  SCREEN
                </div>

              </div>

              <div className="d-flex flex-wrap gap-2 mb-4">

                {seats.map(seat => (

                  <button
                    key={seat._id}
                    className={`btn btn-sm ${getSeatClass(seat)}`}
                    style={{ width: 60 }}
                    disabled={bookedSeats.includes(seat.seatNumber)}
                    onClick={() => toggleSeat(seat.seatNumber)}
                  >
                    {seat.seatNumber}
                  </button>

                ))}

              </div>

              {selectedSeats.length > 0 && (

                <div className="card p-3" style={{ maxWidth: 400 }}>

                  <p>
                    Seats: <strong>{selectedSeats.join(", ")}</strong>
                  </p>

                  <p>
                    Total: <strong>₹{calcTotal()}</strong>
                  </p>

                  <button
                    className="btn btn-danger"
                    disabled={booking}
                    onClick={handleConfirmBooking}
                  >
                    {booking ? "Booking..." : "Confirm Booking"}
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