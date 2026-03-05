import { useNavigate, Link } from 'react-router-dom';
import { getUser, logout } from '../services/authService';

export default function Navbar() {
    const navigate = useNavigate();
    const user = getUser();
    const isAdmin = user?.role === 'Admin';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className='navbar navbar-dark px-4' style={{ background: '#141414' }}>
            <Link className='navbar-brand fw-bold text-danger' to="/movies">RevBookMyShow</Link>
            <div className='d-flex align-items-center gap-3'>
                {user ? (
                    <>
                        {/* Common links */}
                        <Link className='text-white text-decoration-none' to="/movies">Movies</Link>

                        {/* Admin-only links */}
                        {isAdmin && (
                            <Link className='text-white text-decoration-none' to="/admin/show/create">
                                Admin Panel
                            </Link>
                        )}
                        {isAdmin && (
                            <Link className='text-white text-decoration-none' to="/reports">
                                Reports
                            </Link>
                        )}

                        {/* Customer-only links */}
                        {!isAdmin && (
                            <Link className='text-white text-decoration-none' to="/theatres">Theatres</Link>
                        )}
                        {!isAdmin && (
                            <Link className='text-white text-decoration-none' to="/bookings">My Bookings</Link>
                        )}
                        {!isAdmin && (
                            <Link className='text-white text-decoration-none' to="/reports">
                                🔔 Notifications
                            </Link>
                        )}

                        <span className='text-secondary small'>Hi, {user.name} ({user.role})</span>
                        <button className='btn btn-sm btn-danger' onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link className='text-white text-decoration-none' to="/login">Login</Link>
                        <Link className='btn btn-sm btn-danger' to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    )
}