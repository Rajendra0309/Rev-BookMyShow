import { useEffect, useState } from "react";
import axios from "axios";
import { getToken, getUser } from "../services/authService";

function SeatSelection() {
  const [showId, setShowId] = useState("");
  const [screenId, setScreenId] = useState("");
  const [seats, setSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = getToken();
  const user = getUser();

  useEffect(() => {
    if (showId) {
      fetchBookedSeats();
    }
  }, [showId]);

  useEffect(() => {
    if (screenId) {
      fetchSeats();
    }
  }, [screenId]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/theatres/screens/${screenId}/seats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSeats(response.data || []);
    } catch (err) {
      console.error("Failed to fetch seats:", err);
      setError("Failed to load seats");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedSeats = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/bookings/availability/${showId}`
      );
      setBookedSeats(response.data.bookedSeats || []);
    } catch (err) {
      console.error("Failed to fetch booked seats:", err);
    }
  };

  const handleSeatClick = (seatNumber) => {
    if (bookedSeats.includes(seatNumber)) return;

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const handleConfirmBooking = async () => {
    if (!showId) {
      setError("Please select a show");
      return;
    }

    if (selectedSeats.length === 0) {
      setError("Please select at least one seat");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/bookings/create",
        {
          userId: user?.id,
          showId,
          seats: selectedSeats
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Booking confirmed successfully!");
      setSelectedSeats([]);
      fetchBookedSeats();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Seat Selection & Booking</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Show ID *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Show ID"
              value={showId}
              onChange={(e) => setShowId(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label">Screen ID *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Screen ID"
              value={screenId}
              onChange={(e) => setScreenId(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h5>Legend:</h5>
            <div className="d-flex gap-3">
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: "#6c757d", color: "white" }}
                  disabled
                >
                  Available
                </button>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: "#28a745", color: "white" }}
                  disabled
                >
                  Selected
                </button>
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm"
                  style={{ backgroundColor: "#dc3545", color: "white" }}
                  disabled
                >
                  Booked
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4 p-3 border rounded">
            <h5>Select Seats:</h5>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {seats.length > 0 ? (
                seats.map((seat) => (
                  <button
                    key={seat._id || seat.seatNumber}
                    onClick={() => handleSeatClick(seat.seatNumber)}
                    disabled={bookedSeats.includes(seat.seatNumber)}
                    className="btn btn-sm"
                    style={{
                      backgroundColor: bookedSeats.includes(seat.seatNumber)
                        ? "#dc3545"
                        : selectedSeats.includes(seat.seatNumber)
                        ? "#28a745"
                        : "#6c757d",
                      color: "white",
                      cursor: bookedSeats.includes(seat.seatNumber)
                        ? "not-allowed"
                        : "pointer"
                    }}
                  >
                    {seat.seatNumber}
                  </button>
                ))
              ) : (
                <p className="text-muted">
                  Select a Screen ID to see available seats
                </p>
              )}
            </div>
          </div>

          <div className="mb-4 p-3 bg-light rounded">
            <h5>
              Selected Seats: <strong>{selectedSeats.join(", ") || "None"}</strong>
            </h5>
          </div>

          <button
            onClick={handleConfirmBooking}
            disabled={selectedSeats.length === 0 || loading}
            className="btn btn-primary btn-lg w-100"
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        </>
      )}
    </div>
  );
}

export default SeatSelection;