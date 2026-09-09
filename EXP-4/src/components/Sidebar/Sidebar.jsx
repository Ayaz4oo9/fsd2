import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/posts', label: 'Posts' },
  { to: '/posts/create', label: 'Create Post' },
];

function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <ul>
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Sidebar;
