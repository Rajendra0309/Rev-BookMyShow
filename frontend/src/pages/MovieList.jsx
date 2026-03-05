import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMovies, getShowsByMovie } from '../services/movieService';
import { getToken } from '../services/authService';

function MovieList() {
  const [movies, setMovies] = useState([]);
  const [showAvailability, setShowAvailability] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = getToken();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const data = await getMovies();
      const moviesList = data.data || [];
      setMovies(moviesList);

      // Check show availability for each movie
      checkShows(moviesList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkShows = async (moviesList) => {
    let availability = {};

    for (let movie of moviesList) {
      try {
        const shows = await getShowsByMovie(movie._id);
        availability[movie._id] = shows?.filter(s => s.status === 'Active').length > 0;
      } catch {
        availability[movie._id] = false;
      }
    }

    setShowAvailability(availability);
  };

  const handleBookNow = (movieId) => {
    if (!token) {
      navigate('/login');
      return;
    }

    navigate(`/booking?movieId=${movieId}`);
  };

  if (loading) return <div className="container mt-5">Loading movies...</div>;

  return (
    <div className="container mt-5">
      <h2>Movies</h2>

      {movies.length === 0 ? (
        <p>No movies available.</p>
      ) : (
        <div className="row">
          {movies.map((movie) => {
            const hasShows = showAvailability[movie._id];

            return (
              <div className="col-md-4 mb-4" key={movie._id}>
                <div className="card p-3 shadow-sm">
                  <h5>{movie.title}</h5>
                  <p><strong>Language:</strong> {movie.language}</p>
                  <p><strong>Genre:</strong> {movie.genre.join(', ')}</p>
                  <p><strong>Rating:</strong> {movie.rating}</p>

                  <div className="d-flex justify-content-between mt-3">
                    <Link
                      to={`/movies/${movie._id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      View Details
                    </Link>

                    {!token ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/login')}
                      >
                        Login to Book
                      </button>
                    ) : (
                      <button
                        className="btn btn-success btn-sm"
                        disabled={!hasShows}
                        onClick={() => handleBookNow(movie._id)}
                      >
                        {hasShows ? 'Book Now' : 'No Shows Available'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MovieList;