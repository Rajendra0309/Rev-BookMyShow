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
        <nav className='navbar rbms-nav px-4'>
            <Link className='navbar-brand' to="/movies">
                RevBook<span className='rbms-brand-dot'>MyShow</span>
            </Link>
            <div className='d-flex align-items-center gap-3'>
                {user ? (
                    <>
                        <Link className='rbms-nav-link' to="/movies">Movies</Link>

                        {isAdmin && (
                            <Link className='rbms-nav-link' to="/admin/show/create">
                                Admin Panel
                            </Link>
                        )}
                        {isAdmin && (
                            <Link className='rbms-nav-link' to="/reports">
                                Reports
                            </Link>
                        )}

                        {!isAdmin && (
                            <Link className='rbms-nav-link' to="/theatres">Theatres</Link>
                        )}
                        {!isAdmin && (
                            <Link className='rbms-nav-link' to="/bookings">My Bookings</Link>
                        )}
                        {!isAdmin && (
                            <Link className='rbms-nav-link' to="/reports">
                                Notifications
                            </Link>
                        )}

                        <span className='rbms-user-pill'>Hi, {user.name} ({user.role})</span>
                        <button className='btn btn-sm btn-danger' onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link className='rbms-nav-link' to="/login">Login</Link>
                        <Link className='btn btn-sm btn-danger' to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    )
}