import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMovies } from "../services/movieService";
import { getShows } from "../services/showService";
import { checkSeatAvailability } from "../services/bookingService";

function MovieList() {

  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [selectedShows, setSelectedShows] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
    fetchShows();
  }, []);

  // ───── Fetch Movies ─────
  const fetchMovies = async () => {
    try {
      const data = await getMovies();
      setMovies(data.data || []);
    } catch (err) {
      console.error("Error fetching movies:", err);
    }
  };

  // ───── Fetch Shows + Seat Availability ─────
  const fetchShows = async () => {

    try {

      const res = await getShows();
      const allShows = res.data || res || [];

      const showsWithSeats = await Promise.all(

        allShows.map(async (show) => {

          try {

            const availRes = await checkSeatAvailability(show._id);
            const bookedSeats = availRes.data.bookedSeats || [];

            const totalSeats = show.screenId?.totalSeats || 0;
            const availableSeats = totalSeats - bookedSeats.length;

            return {
              ...show,
              totalSeats,
              availableSeats
            };

          } catch {

            return {
              ...show,
              totalSeats: show.screenId?.totalSeats || 0,
              availableSeats: 0
            };

          }

        })
      );

      setShows(showsWithSeats);

    } catch (err) {
      console.error("Error fetching shows:", err);
    }
  };

  // ───── Get shows for movie ─────
  const getMovieShows = (movieId) => {

    return shows.filter(
      (show) =>
        show.movieId?._id === movieId &&
        show.status === "Active"
    );

  };

  // ───── Open modal ─────
  const openShows = (movie) => {

    const movieShows = getMovieShows(movie._id);

    setSelectedShows(movieShows);
    setSelectedMovie(movie);

  };

  const getPriceLabel = (p) => {
    if (!p) return '';
    if (typeof p === 'number') return `₹${p}`;
    const vals = [p.Regular, p.Premium, p.VIP].filter(v => v > 0);
    if (!vals.length) return '';
    const min = Math.min(...vals), max = Math.max(...vals);
    return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
  };

  // ───── Close modal ─────
  const closeModal = () => {

    setSelectedMovie(null);
    setSelectedShows([]);

  };

  return (

    <div className="container mt-5">

      <h2 className="mb-4">Movies</h2>

      <div className="row">

        {movies.map((movie) => {

          const movieShows = getMovieShows(movie._id);

          return (

            <div key={movie._id} className="col-md-4 mb-4">

              <div className="card p-3 shadow-sm h-100">

                <h5>{movie.title}</h5>

                <p>
                  <strong>Language:</strong> {movie.language}
                </p>

                <p>
                  <strong>Rating:</strong> {movie.rating}
                </p>

                {/* View Details */}

                <button
                  className="btn btn-primary mb-2"
                  onClick={() => navigate(`/movies/${movie._id}`)}
                >
                  View Details
                </button>

                {/* Shows Button */}

                {movieShows.length > 0 ? (

                  <button
                    className="btn btn-success"
                    onClick={() => openShows(movie)}
                  >
                    {movieShows.length} Shows Available
                  </button>

                ) : (

                  <p className="text-danger fw-bold">
                    No Shows Available
                  </p>

                )}

              </div>

            </div>

          );

        })}

      </div>

      {/* SHOW LIST MODAL */}

      {selectedMovie && (

        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >

          <div className="modal-dialog modal-lg">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title">
                  Shows for {selectedMovie.title}
                </h5>

                <button
                  className="btn-close"
                  onClick={closeModal}
                ></button>

              </div>

              <div className="modal-body">

                {selectedShows.length === 0 ? (

                  <p className="text-danger">
                    No shows available
                  </p>

                ) : (

                  <table className="table table-bordered">

                    <thead>

                      <tr>
                        <th>Theatre</th>
                        <th>Location</th>
                        <th>Screen</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Price</th>
                        <th>Seats</th>
                        <th>Action</th>
                      </tr>

                    </thead>

                    <tbody>

                      {selectedShows.map((show) => (

                        <tr key={show._id}>

                          <td>
                            {show.screenId?.theatreId?.name}
                          </td>

                          <td>
                            {show.screenId?.theatreId?.city}
                          </td>

                          <td>
                            {show.screenId?.screenName}
                          </td>

                          <td>
                            {new Date(show.showDate)
                              .toLocaleDateString("en-GB")}
                          </td>

                          <td>
                            {show.showTime}
                          </td>

                          <td>
                            {getPriceLabel(show.ticketPrice)}
                          </td>

                          <td>
                            {show.availableSeats} / {show.totalSeats}
                          </td>

                          <td>

                            <button
                              className="btn btn-primary btn-sm"
                              disabled={show.availableSeats === 0}
                              onClick={() =>
                                navigate(`/booking?showId=${show._id}`)
                              }
                            >
                              {show.availableSeats === 0
                                ? "Sold Out"
                                : "Book"}
                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                )}

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default MovieList;