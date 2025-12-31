// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/members">Members</Link></li>
        <li><Link to="/broadcast">Broadcast</Link></li>
        <li style={{float: 'right'}}><button onClick={onLogout}>Logout</button></li>
      </ul>
    </nav>
  );
}

export default Navbar;
