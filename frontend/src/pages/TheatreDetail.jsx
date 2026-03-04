import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    getTheatreById,
    getScreensByTheatre,
    addScreenToTheatre,
    deleteScreen,
    getSeatsByScreen
} from '../services/theatreService';
import { getUser } from '../services/authService';

export default function TheatreDetail() {
    const { id } = useParams();
    const [theatre, setTheatre] = useState(null);
    const [screens, setScreens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showScreenForm, setShowScreenForm] = useState(false);
    const [screenForm, setScreenForm] = useState({ screenName: '', totalSeats: '' });
    const [expandedScreen, setExpandedScreen] = useState(null);
    const [seatsByScreen, setSeatsByScreen] = useState({});

    const user = getUser();
    const isAdmin = user?.role === 'Admin';

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

    const handleAddScreen = async (e) => {
        e.preventDefault();
        try {
            await addScreenToTheatre(id, {
                screenName: screenForm.screenName,
                totalSeats: Number(screenForm.totalSeats)
            });
            setScreenForm({ screenName: '', totalSeats: '' });
            setShowScreenForm(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add screen.');
        }
    };

    const handleDeleteScreen = async (screenId) => {
        if (!window.confirm('Delete this screen and all its seats?')) return;
        try {
            await deleteScreen(screenId);
            fetchData();
        } catch {
            setError('Failed to delete screen.');
        }
    };

    const toggleSeats = async (screenId) => {
        if (expandedScreen === screenId) {
            setExpandedScreen(null);
            return;
        }
        setExpandedScreen(screenId);
        if (!seatsByScreen[screenId]) {
            try {
                const res = await getSeatsByScreen(screenId);
                setSeatsByScreen(prev => ({
                    ...prev,
                    [screenId]: res.data.data || res.data || []
                }));
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

            {/* Theatre Header */}
            <div className="mb-4">
                <h2>🏟️ {theatre.name}</h2>
                <p className="text-muted">📍 {theatre.city} {theatre.location ? `— ${theatre.location}` : ''}</p>
            </div>

            {/* Screens Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Screens ({screens.length})</h4>
                {isAdmin && (
                    <button className="btn btn-danger btn-sm" onClick={() => setShowScreenForm(!showScreenForm)}>
                        {showScreenForm ? 'Cancel' : '+ Add Screen'}
                    </button>
                )}
            </div>

            {/* Add Screen Form */}
            {isAdmin && showScreenForm && (
                <form onSubmit={handleAddScreen} className="card p-3 mb-4 shadow-sm">
                    <h6>Add New Screen</h6>
                    <input className="form-control mb-2" placeholder="Screen Name (e.g. Screen 1)" required
                        value={screenForm.screenName}
                        onChange={(e) => setScreenForm({ ...screenForm, screenName: e.target.value })} />
                    <input type="number" className="form-control mb-2" placeholder="Total Seats (e.g. 100)" required
                        value={screenForm.totalSeats}
                        onChange={(e) => setScreenForm({ ...screenForm, totalSeats: e.target.value })} />
                    <button className="btn btn-success btn-sm" type="submit">Add Screen</button>
                </form>
            )}

            {/* Screens List */}
            {screens.length === 0 ? (
                <p className="text-muted">No screens added yet.</p>
            ) : (
                screens.map((screen) => (
                    <div className="card mb-3 shadow-sm" key={screen._id}>
                        <div className="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-0">{screen.screenName}</h6>
                                <small className="text-muted">Total Seats: {screen.totalSeats}</small>
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => toggleSeats(screen._id)}>
                                    {expandedScreen === screen._id ? 'Hide Seats' : 'View Seats'}
                                </button>
                                {isAdmin && (
                                    <button className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDeleteScreen(screen._id)}>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Seats View */}
                        {expandedScreen === screen._id && (
                            <div className="card-footer">
                                {(seatsByScreen[screen._id] || []).length === 0 ? (
                                    <p className="text-muted mb-0 small">No seats configured for this screen.</p>
                                ) : (
                                    <div className="d-flex flex-wrap gap-2">
                                        {(seatsByScreen[screen._id] || []).map((seat) => (
                                            <span key={seat._id}
                                                className={`badge ${seat.seatType === 'VIP' ? 'bg-warning text-dark' :
                                                    seat.seatType === 'Premium' ? 'bg-info text-dark' : 'bg-secondary'}`}>
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
