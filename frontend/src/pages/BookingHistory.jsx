import { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../services/authService';

export default function BookingHistory() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = getToken();
    const user = getUser();

    useEffect(() => {
        fetchBookingHistory();
    }, []);

    const fetchBookingHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:5000/api/bookings/user/${user?.id || 'null'}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBookings(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await axios.put(
                `http://localhost:5000/api/bookings/cancel/${bookingId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Booking cancelled successfully');
            fetchBookingHistory();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel booking');
        }
    };

    if (loading)
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Booking History</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            {bookings.length === 0 ? (
                <div className="alert alert-info">No bookings found</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead className="table-dark">
                            <tr>
                                <th>Movie</th>
                                <th>Show Date & Time</th>
                                <th>Seats</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking._id}>
                                    <td>
                                        {booking.showId?.movieId?.title || 'N/A'}
                                    </td>
                                    <td>
                                        {booking.showId ? (
                                            <>
                                                {new Date(
                                                    booking.showId.showDate
                                                ).toLocaleDateString()}{' '}
                                                {booking.showId.showTime}
                                            </>
                                        ) : (
                                            'N/A'
                                        )}
                                    </td>
                                    <td>{booking.seats?.join(', ') || 'N/A'}</td>
                                    <td>₹{booking.totalAmount}</td>
                                    <td>
                                        <span
                                            className={`badge ${
                                                booking.status === 'Confirmed'
                                                    ? 'bg-success'
                                                    : 'bg-danger'
                                            }`}
                                        >
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td>
                                        {booking.status === 'Confirmed' && (
                                            <button
                                                className="btn btn-sm btn-warning"
                                                onClick={() =>
                                                    handleCancelBooking(
                                                        booking._id
                                                    )
                                                }
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
