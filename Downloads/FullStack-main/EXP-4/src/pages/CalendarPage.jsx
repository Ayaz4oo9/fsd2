import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  useDispatch,
  useSelector,
} from 'react-redux';

import Calendar from '../components/Calendar/Calendar';

import {
  movePost,
} from '../features/posts/postSlice';

import {
  showToast,
} from '../features/ui/uiSlice';

import {
  performanceMonitor,
} from '../performance/performanceMonitor';

import './CalendarPage.css';


function CalendarPage() {

  const dispatch = useDispatch();


  /*
   * Get posts from Redux.
   */
  const posts = useSelector(
    (state) =>
      state.posts?.posts || []
  );


  /*
   * TRUE  = React.memo enabled
   * FALSE = React.memo disabled
   */
  const [
    optimized,
    setOptimized,
  ] = useState(true);


  /*
   * Get initial monitor state.
   *
   * This is guaranteed to be an object.
   */
  const [
    performanceData,
    setPerformanceData,
  ] = useState(
    () =>
      performanceMonitor.getSnapshot()
  );


  /*
   * Subscribe to performance monitor.
   */
  useEffect(() => {

    const unsubscribe =
      performanceMonitor.subscribe(
        (snapshot) => {

          /*
           * Safety check.
           *
           * Even if something unexpected happens,
           * never put undefined into performanceData.
           */
          if (snapshot) {
            setPerformanceData(
              snapshot
            );
          }

        }
      );

    return unsubscribe;

  }, []);


  /*
   * Update monitor mode whenever the toggle changes.
   */
  useEffect(() => {

    performanceMonitor.setMode(
      optimized
        ? 'optimized'
        : 'non-optimized'
    );

  }, [optimized]);


  /*
   * Handle clicking a calendar event.
   */
  const handleEventClick =
    useCallback(
      (postId) => {

        window.location.href =
          `/posts/${postId}/edit`;

      },
      []
    );


  /*
   * Handle clicking a calendar date.
   */
  const handleDateClick =
    useCallback(
      (date) => {

        const dateString =
          date.toISOString();

        window.location.href =
          `/posts/create?date=${encodeURIComponent(
            dateString
          )}`;

      },
      []
    );


  /*
   * ==========================================
   * DRAG & DROP
   * ==========================================
   */
  const handleEventDrop =
    useCallback(
      (postId, newDate) => {

        /*
         * Find selected post.
         */
        const post =
          posts.find(
            (item) =>
              String(item.id) ===
              String(postId)
          );


        if (!post) {
          return;
        }


        /*
         * Original scheduled date/time.
         */
        const originalDate =
          new Date(
            post.scheduledAt
          );


        /*
         * New target date.
         */
        const targetDate =
          new Date(newDate);


        /*
         * Preserve original time.
         */
        targetDate.setHours(
          originalDate.getHours()
        );

        targetDate.setMinutes(
          originalDate.getMinutes()
        );

        targetDate.setSeconds(
          originalDate.getSeconds()
        );

        targetDate.setMilliseconds(
          originalDate.getMilliseconds()
        );


        /*
         * Convert to ISO.
         */
        const newScheduledAt =
          targetDate.toISOString();


        /*
         * ======================================
         * START PERFORMANCE MEASUREMENT
         * ======================================
         *
         * This happens BEFORE Redux update.
         */
        performanceMonitor.beginInteraction(
          `Drag & drop: ${post.title}`
        );


        /*
         * ======================================
         * UPDATE REDUX
         * ======================================
         */
        dispatch(
          movePost({
            id: postId,
            newScheduledAt,
          })
        );


        /*
         * Show success message.
         */
        dispatch(
          showToast({
            message:
              `"${post.title}" moved successfully`,
            type: 'success',
          })
        );


        /*
         * ======================================
         * WAIT FOR REACT
         * ======================================
         *
         * Wait two animation frames before
         * finishing the measurement.
         */
        requestAnimationFrame(() => {

          requestAnimationFrame(() => {

            performanceMonitor
              .finishInteraction();

          });

        });

      },
      [
        dispatch,
        posts,
      ]
    );


  /*
   * Toggle optimized/non-optimized mode.
   */
  const handleOptimizationToggle =
    useCallback(() => {

      setOptimized(
        (current) => !current
      );

    }, []);


  /*
   * Safety fallback.
   *
   * This prevents the page from crashing if
   * performanceData is ever unavailable.
   */
  const safePerformanceData =
    performanceData || {
      mode: optimized
        ? 'optimized'
        : 'non-optimized',

      interaction: 'Ready',

      renderedInstances: [],

      totalRenderCount: 0,

      durationMs: 0,

      lastAction:
        'No interaction yet',

      timestamp: Date.now(),
    };


  return (

    <div className="calendar-page">


      {/* ====================================
          PAGE HEADER
      ==================================== */}

      <div className="calendar-page__header">

        <div>

          <h1>
            Content Calendar
          </h1>

          <p>
            Drag posts between dates and compare
            React rendering performance.
          </p>

        </div>


        {/* ==================================
            PERFORMANCE TOGGLE
        ================================== */}

        <div className="calendar-page__controls">

          <span className="calendar-page__control-label">
            Performance Mode
          </span>


          <button
            type="button"
            className={
              `calendar-page__toggle ${
                optimized
                  ? 'calendar-page__toggle--active'
                  : ''
              }`
            }
            onClick={
              handleOptimizationToggle
            }
            aria-pressed={
              optimized
            }
          >

            <span className="calendar-page__toggle-track">

              <span className="calendar-page__toggle-thumb" />

            </span>


            <span>
              {
                optimized
                  ? 'Optimized'
                  : 'Non-optimized'
              }
            </span>

          </button>

        </div>

      </div>


      {/* ====================================
          PERFORMANCE PANEL
      ==================================== */}

      <div className="calendar-page__performance-panel">


        <div className="calendar-page__performance-header">

          <div>

            <span className="calendar-page__eyebrow">
              LIVE PERFORMANCE MONITOR
            </span>

            <h2>
              Drag & Drop Rendering
            </h2>

          </div>


          <span
            className={
              `calendar-page__status ${
                safePerformanceData
                  .interaction ===
                'Processing...'
                  ? 'calendar-page__status--processing'
                  : 'calendar-page__status--ready'
              }`
            }
          >

            {
              safePerformanceData
                .interaction
            }

          </span>

        </div>


        {/* ====================================
            METRICS
        ==================================== */}

        <div className="calendar-page__metrics">


          {/* ==================================
              DISTINCT COMPONENTS
          ================================== */}

          <div className="calendar-page__metric">

            <span className="calendar-page__metric-label">
              Components
            </span>


            <strong className="calendar-page__metric-value">

              {
                safePerformanceData
                  .renderedInstances
                  .length
              }

            </strong>


            <small>
              unique instances rendered
            </small>

          </div>


          {/* ==================================
              RENDER CALLS
          ================================== */}

          <div className="calendar-page__metric">

            <span className="calendar-page__metric-label">
              Render Calls
            </span>


            <strong className="calendar-page__metric-value">

              {
                safePerformanceData
                  .totalRenderCount
              }

            </strong>


            <small>
              total component executions
            </small>

          </div>


          {/* ==================================
              PROCESSING TIME
          ================================== */}

          <div className="calendar-page__metric">

            <span className="calendar-page__metric-label">
              Processing
            </span>


            <strong className="calendar-page__metric-value">

              {
                safePerformanceData
                  .durationMs
              }

              <small className="calendar-page__metric-unit">
                ms
              </small>

            </strong>


            <small>
              measured interaction window
            </small>

          </div>


        </div>


        {/* ====================================
            LAST ACTION
        ==================================== */}

        <div className="calendar-page__last-action">

          <span>
            Last interaction
          </span>


          <strong>

            {
              safePerformanceData
                .lastAction
            }

          </strong>

        </div>


        {/* ====================================
            RENDERED COMPONENTS
        ==================================== */}

        {
          safePerformanceData
            .renderedInstances
            .length > 0 && (

            <details className="calendar-page__details">

              <summary>
                View rendered component instances
              </summary>


              <div className="calendar-page__render-list">

                {
                  safePerformanceData
                    .renderedInstances
                    .map(
                      (instance) => (

                        <span
                          key={instance}
                        >
                          {instance}
                        </span>

                      )
                    )
                }

              </div>

            </details>

          )
        }

      </div>


      {/* ====================================
          CALENDAR
      ==================================== */}

      <div className="calendar-page__calendar">

        <Calendar
          posts={posts}
          onEventClick={
            handleEventClick
          }
          onDateClick={
            handleDateClick
          }
          onEventDrop={
            handleEventDrop
          }
          optimized={
            optimized
          }
        />

      </div>


    </div>

  );
}


export default CalendarPage;