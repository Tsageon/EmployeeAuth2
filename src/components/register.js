import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import Swal from 'sweetalert2';
import './register.css'


const Register = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error] = useState('');
 
  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('https://auhtemployeebackend.onrender.com/api/SignUp', {
        email,
        firstName,
        lastName,
        password,
      });
  
      console.log(response.data);
  
      Swal.fire({
        icon: 'success',
        title: 'User Created Successfully',
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
        title: 'Registration Failed',
        text: error.response ? error.response.data.message : 'Something went wrong, please try again.',
        footer: 'Please try again later.',
      });
    }
  };
  
  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form className='space' onSubmit={handleRegister}>
        <i><b>Create An Account Here</b></i><br/>
        <input
          className='form'
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          className='form'
          type="text"
          placeholder='Last Name'
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          className='form'
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className='form'
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className='btn2' type="submit">Register</button>
      </form>
      {error && <div className="error-message">{error}</div>}
      <div className="link-container">
        <p>Already registered? <i><b><Link to="/">Login</Link></b></i></p>
      </div>
    </div>
  );
};

export default Register;