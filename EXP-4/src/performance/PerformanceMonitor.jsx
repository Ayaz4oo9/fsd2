import React from 'react';
import { usePerformance } from './PerformanceContext';
import './PerformanceMonitor.css';

function PerformanceMonitor() {
  const {
    optimized,
    setMode,
    interaction,
    processing,
    totalRenderCount,
    renderedInstances,
    lastAction,
  } = usePerformance();

  return (
    <div className="performance-monitor">

      <div className="performance-monitor__header">
        <div>
          <div className="performance-monitor__title">
            Render Monitor
          </div>

          <div className="performance-monitor__subtitle">
            React performance comparison
          </div>
        </div>

        <div
          className={`performance-monitor__status ${
            optimized
              ? 'performance-monitor__status--optimized'
              : 'performance-monitor__status--normal'
          }`}
        >
          {optimized ? 'Optimized' : 'Non-optimized'}
        </div>
      </div>

      {/* TOGGLE */}

      <div className="performance-monitor__toggle">

        <button
          type="button"
          className={
            optimized ? 'active' : ''
          }
          onClick={() =>
            setMode('optimized')
          }
        >
          ⚡ Optimized
        </button>

        <button
          type="button"
          className={
            !optimized ? 'active' : ''
          }
          onClick={() =>
            setMode('non-optimized')
          }
        >
          ◌ Non-optimized
        </button>

      </div>

      {/* STATS */}

      <div className="performance-monitor__stats">

        <div className="performance-monitor__stat">
          <span>Last interaction</span>
          <strong>
            {processing}
          </strong>
        </div>

        <div className="performance-monitor__stat">
          <span>Render calls</span>
          <strong>
            {totalRenderCount}
          </strong>
        </div>

      </div>

      {/* LAST ACTION */}

      <div className="performance-monitor__action">
        <span>Last action</span>
        <strong>
          {lastAction}
        </strong>
      </div>

      {/* COMPONENTS */}

      <div className="performance-monitor__section">

        <div className="performance-monitor__section-title">
          Components rendered
        </div>

        {renderedInstances.length === 0 ? (
          <div className="performance-monitor__empty">
            Drag a calendar post to see
            render activity.
          </div>
        ) : (
          <div className="performance-monitor__components">

            {renderedInstances.map(
              (instance) => (
                <div
                  className="performance-monitor__component"
                  key={instance}
                >
                  <span className="performance-monitor__component-dot" />

                  <span>
                    {instance}
                  </span>
                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* EXPLANATION */}

      <div className="performance-monitor__info">

        <strong>
          Why does this matter?
        </strong>

        <p>
          In optimized mode,
          React.memo prevents unchanged
          calendar events from rendering
          again.
        </p>

        <div className="performance-monitor__tech">

          <span>React.memo</span>
          <span>useCallback</span>
          <span>useMemo</span>

        </div>

      </div>

    </div>
  );
}

export default PerformanceMonitor;