import React from 'react';
import './Navbar.css';

function Navbar() {
  return (
    <header className="navbar">
      <span className="navbar__brand">ContentFlow</span>
      <div className="navbar__profile" aria-label="User profile">
        <span className="navbar__avatar" aria-hidden="true">
          CF
        </span>
        <span>Demo User</span>
      </div>
    </header>
  );
}

export default Navbar;
