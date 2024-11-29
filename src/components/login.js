import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom';
import './login.css'

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate()
 
  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://auhtemployeebackend.onrender.com/api/Login', {
        email,
        password,
      });
  
      console.log(response.data);
  
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'You are now being redirected to the homepage.',
        showConfirmButton: false,
        timer: 2000, 
      }).then(() => {
        window.location.href = '/home';
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response ? error.response.data.message : 'Something went wrong, please try again.',
        footer: 'Please check your email and password and try again.',
      });
    }
  };
  
  const forgot = () => {
    Swal.fire({
      title: 'Forgot Password?',
      text: 'Redirecting to the Forgot Password page.',
      icon: 'info',
      showConfirmButton: false,
      timer: 1500, 
    }).then(() => {
      navigate('/forgot-password');
    });
  };
  
  
  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form className="space" onSubmit={handleLogin}>
        <p>Welcome to The EmployeeApp</p>
        <input
          className="form"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br/>
        <input
          className="form"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className='forgot-password' onClick={forgot}>
            <Link><i><b>ForgotPassword</b></i></Link>
        </div>
        <button className="btn2" type="submit">
          Login
        </button>
      </form>
      <div className="link-container">
        <p>Don't have an account? <i><b><Link to="/register">Register</Link></b></i></p>
      </div>
    </div>
  );
};

export default Login;