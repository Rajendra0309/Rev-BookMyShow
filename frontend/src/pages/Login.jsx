import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, socialLogin, saveToken, getToken } from '../services/authService';
import { auth, googleProvider, microsoftProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState('');

    useEffect(() => {
        if (getToken()) {
            navigate('/movies');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await login(form);
            saveToken(data.token, data.user);
            navigate('/movies');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider, providerName) => {
        try {
            setError('');
            setSocialLoading(providerName);
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            const { data } = await socialLogin(idToken);
            saveToken(data.token, data.user);
            navigate('/movies');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.msg || err.message || 'Social login failed');
        } finally {
            setSocialLoading('');
        }
    };

    return (
        <div className='auth-shell'>
            <div className='card auth-card'>
                <h4 className='auth-title'>Welcome Back</h4>
                {error && <div className='alert alert-danger py-2'>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input className="form-control mb-2" placeholder='Email' type="email"
                        disabled={loading || socialLoading !== ''}
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    <input className='form-control mb-2' placeholder='Password' type='password'
                        disabled={loading || socialLoading !== ''}
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <button className='btn btn-danger w-100 mt-1' type='submit' disabled={loading || socialLoading !== ''}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Logging in...
                            </>
                        ) : 'Login'}
                    </button>
                </form>

                <div className='text-center my-3 text-muted'>
                    <small>─ OR ─</small>
                </div>

                <button 
                    disabled={loading || socialLoading !== ''}
                    onClick={() => handleSocialLogin(googleProvider, 'google')} 
                    className='btn btn-outline-dark w-100 mb-2 d-flex align-items-center justify-content-center' 
                    type='button'
                >
                    {socialLoading === 'google' ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Logging in with Google...
                        </>
                    ) : (
                        <>
                            <svg className="me-2" width="18" height="18" viewBox="0 0 18 18">
                                <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.8 2.7v2.24h2.91c1.7-1.57 2.69-3.88 2.69-6.57z"/>
                                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.24c-.8.54-1.84.87-3.05.87-2.35 0-4.33-1.59-5.04-3.73H.96v2.3C2.44 15.98 5.48 18 9 18z"/>
                                <path fill="#FBBC05" d="M3.96 10.72A5.4 5.4 0 0 1 3.6 9c0-.6.1-1.18.28-1.72v-2.3H.96A8.98 8.98 0 0 0 0 9c0 1.63.44 3.16 1.2 4.48l2.76-2.32z"/>
                                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.96 11.42 0 9 0 5.48 0 2.44 2.02.96 5.02l3 .76c.71-2.14 2.69-3.73 5.04-3.73z"/>
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>

                <button 
                    disabled={loading || socialLoading !== ''}
                    onClick={() => handleSocialLogin(microsoftProvider, 'microsoft')} 
                    className='btn btn-outline-dark w-100 mb-2 d-flex align-items-center justify-content-center' 
                    type='button'
                >
                    {socialLoading === 'microsoft' ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Logging in with Microsoft...
                        </>
                    ) : (
                        <>
                            <svg className="me-2" width="16" height="16" viewBox="0 0 23 23">
                                <path fill="#F25022" d="M0 0h11v11H0z"/>
                                <path fill="#7FBA00" d="M12 0h11v11H12z"/>
                                <path fill="#00A4EF" d="M0 12h11v11H0z"/>
                                <path fill="#FFB900" d="M12 12h11v11H12z"/>
                            </svg>
                            Continue with Microsoft
                        </>
                    )}
                </button>

                <p className='text-center mt-3 mb-0 text-muted'>
                    New user? <Link to="/register">Register here</Link>
                    {' | '}<Link to="/forgot-password">Forgot Password?</Link>
                </p>
            </div>
        </div>
    );
}