import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMovieById } from '../services/movieService';

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovie();
  }, []);

  const fetchMovie = async () => {
    try {
      const data = await getMovieById(id);
      setMovie(data.data);
    } catch (error) {
      console.error('Error fetching movie:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (!movie) return <div className="container mt-5">Movie not found.</div>;

  return (
    <div className="container mt-5">
      <h2>{movie.title}</h2>

      <p><strong>Language:</strong> {movie.language}</p>
      <p><strong>Genre:</strong> {movie.genre.join(', ')}</p>
      <p><strong>Duration:</strong> {movie.duration} minutes</p>
      <p><strong>Rating:</strong> {movie.rating}</p>

      <hr />

      <h5>Description</h5>
      <p>{movie.description}</p>
    </div>
  );
}

export default MovieDetails;