import { useNavigate, Link } from 'react-router-dom';
import { getUser, logout } from '../services/authService';

export default function Navbar() {
    const navigate = useNavigate();
    const user = getUser();

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