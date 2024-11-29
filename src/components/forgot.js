import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './forgot.css'

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const Submit = async () => {
        try {
            setLoading(true);
            const response = await axios.post('https://auhtemployeebackend.onrender.com/api/resetPassword', {
                email: email,
            });

            setLoading(false);
            setMessage(response.data.message);
            console.log(response.data.message);

            Swal.fire({
                icon: 'success',
                title: 'Email Sent',
                text: 'A password reset email has been sent to your email address.',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            setLoading(false);
            setMessage(error.message);

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response
                    ? error.response.data.message
                    : 'Something went wrong, please try again.',
                footer: 'If the issue persists, contact support.',
            });
        }
    };


    return (
        <div className="forgot-password-container">
            <h2>Forgot Password</h2>
            <form onSubmit={Submit}>
                <div>
                    <input
                        type="email"
                        className='form'
                        value={email}
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading} className="btn">
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ForgotPassword;
