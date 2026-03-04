import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken } from '../services/authService';

export default function AdminCreateShow() {
    const [form, setForm] = useState({
        movieId: '',
        screenId: '',
        showDate: '',
        showTime: '',
        ticketPrice: ''
    });
    const [movies, setMovies] = useState([]);
    const [screens, setScreens] = useState([]);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const token = getToken();

    useEffect(() => {
        fetchMovies();
        fetchScreens();
    }, []);

    const fetchMovies = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5000/api/movies',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMovies(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch movies:', err);
        }
    };

    const fetchScreens = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5000/api/screens',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setScreens(response.data || []);
        } catch (err) {
            console.error('Failed to fetch screens:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(
                'http://localhost:5000/api/shows/create',
                {
                    movieId: form.movieId,
                    screenId: form.screenId,
                    showDate: form.showDate,
                    showTime: form.showTime,
                    ticketPrice: form.ticketPrice
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess('Show created successfully!');
            setForm({
                movieId: '',
                screenId: '',
                showDate: '',
                showTime: '',
                ticketPrice: ''
            });

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to create show'
            );
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card p-4 shadow">
                        <h3 className="mb-4 text-center">Create New Show</h3>

                        {success && (
                            <div className="alert alert-success">{success}</div>
                        )}
                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Movie *</label>
                                <select
                                    className="form-control"
                                    name="movieId"
                                    value={form.movieId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Movie</option>
                                    {movies.map((movie) => (
                                        <option
                                            key={movie._id}
                                            value={movie._id}
                                        >
                                            {movie.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Screen *</label>
                                <select
                                    className="form-control"
                                    name="screenId"
                                    value={form.screenId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Screen</option>
                                    {screens.map((screen) => (
                                        <option
                                            key={screen._id}
                                            value={screen._id}
                                        >
                                            {screen.screenName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Show Date *</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="showDate"
                                    value={form.showDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Show Time (HH:MM) *</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    name="showTime"
                                    value={form.showTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Ticket Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="ticketPrice"
                                    value={form.ticketPrice}
                                    onChange={handleChange}
                                    min="0"
                                    step="10"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                            >
                                Create Show
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
