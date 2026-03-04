import { useEffect, useState } from "react";
import axios from "axios";

function SeatSelection() {
  const [showId, setShowId] = useState("");
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    if (showId) {
      axios
        .get(`http://localhost:5000/api/bookings/availability/${showId}`)
        .then((res) => {
          setBookedSeats(res.data.bookedSeats);
        })
        .catch((err) => console.log(err));
    }
  }, [showId]);

  const handleSeatClick = (seat) => {
    if (bookedSeats.includes(seat)) return;

    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  return (
    <div>
      <h2>Seat Selection</h2>

      <input
        type="text"
        placeholder="Enter Show ID"
        value={showId}
        onChange={(e) => setShowId(e.target.value)}
      />

      <div style={{ marginTop: "20px" }}>
        {["A1", "A2", "A3", "A4"].map((seat) => (
          <button
            key={seat}
            onClick={() => handleSeatClick(seat)}
            disabled={bookedSeats.includes(seat)}
            style={{
              margin: "5px",
              backgroundColor: bookedSeats.includes(seat)
                ? "red"
                : selectedSeats.includes(seat)
                ? "green"
                : "gray",
              color: "white",
            }}
          >
            {seat}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SeatSelection;