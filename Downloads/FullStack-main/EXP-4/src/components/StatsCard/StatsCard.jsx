import React from 'react';
import './StatsCard.css';

/**
 * StatsCard is a pure presentational component: given the same props it
 * always renders the same output. That makes it a good candidate for
 * React.memo — when the Dashboard re-renders for an unrelated reason
 * (e.g. a toast appearing), these cards skip re-rendering unless their
 * own value/label/color actually changed.
 */
function StatsCard({ label, value, color = '#2563eb', icon }) {
  return (
    <div className="stats-card" style={{ borderTopColor: color }}>
      {icon && <span className="stats-card__icon" aria-hidden="true">{icon}</span>}
      <p className="stats-card__value">{value}</p>
      <p className="stats-card__label">{label}</p>
    </div>
  );
}

export default React.memo(StatsCard);
