import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:5000/api/auth';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // step 1: enter email, step 2: answer Q + new password
    const [email, setEmail] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    // Step 1 — fetch security question by email
    const handleFetchQuestion = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await axios.get(`${API}/security-question?email=${email}`);
            setQuestion(data.securityQuestion || 'No question set for this account');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.msg || 'Email not found');
        }
    };

    // Step 2 — reset password using answer
    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await axios.post(`${API}/forgot-password`, { email, securityAnswer: answer, newPassword });
            setMsg(data.msg);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.msg || 'Reset failed');
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center vh-100 bg-light'>
            <div className='card p-4 shadow' style={{ width: '400px' }}>
                <h4 className='mb-3 text-center'>Forgot Password</h4>

                {/* Step 1 — Enter Email */}
                {step === 1 && (
                    <form onSubmit={handleFetchQuestion}>
                        {error && <div className='alert alert-danger py-2'>{error}</div>}
                        <input className='form-control mb-3' placeholder='Enter your email' type='email'
                            value={email} onChange={e => setEmail(e.target.value)} required />
                        <button className='btn btn-danger w-100' type='submit'>Get Security Question</button>
                    </form>
                )}

                {/* Step 2 — Answer + New Password */}
                {step === 2 && (
                    <form onSubmit={handleReset}>
                        {error && <div className='alert alert-danger py-2'>{error}</div>}
                        <div className='alert alert-secondary py-2 mb-3'>
                            <small><strong>Q:</strong> {question}</small>
                        </div>
                        <input className='form-control mb-2' placeholder='Your answer'
                            value={answer} onChange={e => setAnswer(e.target.value)} required />
                        <input className='form-control mb-3' placeholder='New password' type='password'
                            value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        <button className='btn btn-danger w-100' type='submit'>Reset Password</button>
                    </form>
                )}

                {/* Step 3 — Success */}
                {step === 3 && (
                    <div className='text-center'>
                        <div className='alert alert-success'>{msg}</div>
                        <Link to='/login' className='btn btn-outline-danger w-100'>Back to Login</Link>
                    </div>
                )}

                {step !== 3 && (
                    <p className='text-center mt-3 mb-0'>
                        <Link to='/login'>Back to Login</Link>
                    </p>
                )}
            </div>
        </div>
    );
}