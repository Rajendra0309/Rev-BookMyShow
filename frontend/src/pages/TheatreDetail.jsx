import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTheatreById, getScreensByTheatre, getSeatsByScreen } from '../services/theatreService';

export default function TheatreDetail() {
    const { id } = useParams();
    const [theatre, setTheatre] = useState(null);
    const [screens, setScreens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedScreen, setExpandedScreen] = useState(null);
    const [seatsByScreen, setSeatsByScreen] = useState({});

    useEffect(() => { fetchData(); }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [theatreRes, screensRes] = await Promise.all([
                getTheatreById(id),
                getScreensByTheatre(id)
            ]);
            setTheatre(theatreRes.data.data || theatreRes.data);
            setScreens(screensRes.data.data || screensRes.data || []);
        } catch {
            setError('Failed to load theatre details.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSeats = async (screenId) => {
        if (expandedScreen === screenId) { setExpandedScreen(null); return; }
        setExpandedScreen(screenId);
        if (!seatsByScreen[screenId]) {
            try {
                const res = await getSeatsByScreen(screenId);
                setSeatsByScreen(prev => ({ ...prev, [screenId]: res.data.data || res.data || [] }));
            } catch {
                setSeatsByScreen(prev => ({ ...prev, [screenId]: [] }));
            }
        }
    };

    if (loading) return <div className="container mt-5">Loading...</div>;
    if (!theatre) return <div className="container mt-5 text-danger">Theatre not found.</div>;

    return (
        <div className="container mt-5">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-4">
                <h2>🏟️ {theatre.name}</h2>
                <p className="text-muted">📍 {theatre.city}{theatre.location ? ` — ${theatre.location}` : ''}</p>
            </div>

            <h4>Screens ({screens.length})</h4>

            {screens.length === 0 ? (
                <p className="text-muted">No screens available.</p>
            ) : (
                screens.map((screen) => (
                    <div className="card mb-3 shadow-sm" key={screen._id}>
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-0">{screen.screenName}</h6>
                                <small className="text-muted">Total Seats: {screen.totalSeats}</small>
                            </div>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => toggleSeats(screen._id)}>
                                {expandedScreen === screen._id ? 'Hide Seats' : 'View Seats'}
                            </button>
                        </div>

                        {expandedScreen === screen._id && (
                            <div className="card-footer">
                                {(seatsByScreen[screen._id] || []).length === 0 ? (
                                    <p className="text-muted mb-0 small">No seats configured for this screen.</p>
                                ) : (
                                    <div className="d-flex flex-wrap gap-2">
                                        {(seatsByScreen[screen._id] || []).map((seat) => (
                                            <span key={seat._id}
                                                className={`badge ${seat.seatType === 'VIP' ? 'bg-warning text-dark' :
                                                        seat.seatType === 'Premium' ? 'bg-info text-dark' : 'bg-secondary'
                                                    }`}>
                                                {seat.seatNumber} ({seat.seatType})
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
