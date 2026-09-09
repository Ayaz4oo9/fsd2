const listeners = new Set();

let state = {
  mode: 'optimized',

  interaction: 'Ready',

  renderedInstances: [],

  totalRenderCount: 0,

  durationMs: 0,

  lastAction: 'No interaction yet',

  timestamp: Date.now(),
};

let activeSession = null;

let finishTimer = null;


/*
 * Notify every subscriber.
 *
 * IMPORTANT:
 * We pass the CURRENT STATE to the listener.
 *
 * This fixes the problem where CalendarPage was
 * receiving undefined as performanceData.
 */
function notify() {
  listeners.forEach((listener) => {
    listener(state);
  });
}


export const performanceMonitor = {

  /*
   * Subscribe to monitor updates.
   */
  subscribe(listener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },


  /*
   * Get the current performance state.
   */
  getSnapshot() {
    return state;
  },


  /*
   * Change optimization mode.
   */
  setMode(mode) {

    activeSession = null;

    if (finishTimer) {
      clearTimeout(finishTimer);
      finishTimer = null;
    }

    state = {
      ...state,

      mode,

      interaction: 'Ready',

      renderedInstances: [],

      totalRenderCount: 0,

      durationMs: 0,

      lastAction:
        mode === 'optimized'
          ? 'Optimized mode enabled'
          : 'Non-optimized mode enabled',

      timestamp: Date.now(),
    };

    notify();
  },


  /*
   * Start measuring a drag-and-drop interaction.
   *
   * IMPORTANT:
   * We intentionally DO NOT call notify() here.
   *
   * Otherwise the performance monitor UI itself could
   * create a React render and contaminate the measurement.
   */
  beginInteraction(label) {

    if (finishTimer) {
      clearTimeout(finishTimer);
      finishTimer = null;
    }

    activeSession = {

      label,

      /*
       * Set stores DISTINCT component instances.
       */
      instances: new Set(),

      /*
       * Counts every execution of an instrumented
       * component function.
       */
      renderCalls: 0,

      /*
       * High-resolution start time.
       */
      startedAt: performance.now(),
    };

    state = {
      ...state,

      interaction: 'Processing...',

      renderedInstances: [],

      totalRenderCount: 0,

      durationMs: 0,

      lastAction: label,

      timestamp: Date.now(),
    };
  },


  /*
   * Called from Calendar and CalendarEvent during render.
   */
  recordRender(instanceId) {

    /*
     * Ignore renders that happen outside the
     * current drag-and-drop measurement.
     */
    if (!activeSession) {
      return;
    }

    /*
     * Add unique component instance.
     */
    activeSession.instances.add(
      instanceId
    );

    /*
     * Count EVERY render call.
     */
    activeSession.renderCalls += 1;
  },


  /*
   * Finish the current interaction.
   */
  finishInteraction() {

    if (!activeSession) {
      return;
    }

    if (finishTimer) {
      clearTimeout(finishTimer);
    }

    /*
     * Small delay gives React time to complete
     * the resulting render work.
     */
    finishTimer = setTimeout(() => {

      if (!activeSession) {
        return;
      }

      const session =
        activeSession;

      /*
       * Convert Set into an array.
       */
      const renderedInstances =
        Array.from(
          session.instances
        );

      /*
       * Calculate elapsed time.
       */
      const durationMs =
        performance.now() -
        session.startedAt;

      /*
       * IMPORTANT:
       *
       * Close the measurement BEFORE notifying
       * CalendarPage.
       *
       * Therefore the CalendarPage render caused
       * by notify() isn't counted.
       */
      activeSession = null;

      state = {
        ...state,

        interaction: 'Complete',

        renderedInstances,

        totalRenderCount:
          session.renderCalls,

        durationMs:
          Number(
            durationMs.toFixed(2)
          ),

        lastAction:
          session.label,

        timestamp: Date.now(),
      };

      finishTimer = null;

      /*
       * Now update the performance UI.
       */
      notify();

    }, 100);
  },


  /*
   * Reset the monitor.
   */
  reset() {

    activeSession = null;

    if (finishTimer) {
      clearTimeout(finishTimer);
      finishTimer = null;
    }

    state = {
      ...state,

      interaction: 'Ready',

      renderedInstances: [],

      totalRenderCount: 0,

      durationMs: 0,

      lastAction:
        'Measurement reset',

      timestamp: Date.now(),
    };

    notify();
  },
};