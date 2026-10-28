// Explicit mode/session boundary. The simulation is still shared during this migration,
// but ownership and lifecycle are no longer inferred from an ad-hoc window global.
(function attachGameModeRuntime(root) {
    'use strict';
    let activeMode = 'endless';
    let storySession = { active: false, completed: false };

    const runtime = {
        get activeMode() { return activeMode; },
        get storySession() { return storySession; },
        isStoryActive() {
            return activeMode === 'story' && storySession?.active === true;
        },
        enterStory(session) {
            if (!session || session.active !== true) {
                throw new TypeError('A live Story session is required.');
            }
            if (activeMode === 'story' && storySession?.active) {
                throw new Error('A Story session is already active.');
            }
            storySession = session;
            activeMode = 'story';
            return storySession;
        },
        leaveStory(completed = false) {
            const previous = storySession;
            activeMode = 'endless';
            storySession = { active: false, completed: completed === true };
            return previous;
        }
    };
    Object.freeze(runtime);
    root.GameModeRuntime = runtime;
})(typeof window !== 'undefined' ? window : globalThis);
