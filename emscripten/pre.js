// LBreakout2 web build: keep ~/.lgames (config, highscores, saved games,
// custom levels) in IndexedDB so it survives page reloads.
var SAVE_DIR = '/home/web_user/.lgames';

Module['preRun'] = Module['preRun'] || [];
Module['preRun'].push(function () {
  FS.mkdirTree(SAVE_DIR);
  FS.mount(IDBFS, {}, SAVE_DIR);
  addRunDependency('lbreakout2-savedata');
  FS.syncfs(true, function (err) {
    if (err) console.warn('Could not load saved data:', err);
    removeRunDependency('lbreakout2-savedata');
  });
});

// Write the in-memory save directory to IndexedDB. Returns a promise that
// resolves when the data is stored. A request made while a sync is running
// schedules one more sync; further requests share that one.
(function () {
  var chain = Promise.resolve(), queued = null;
  function sync() {
    queued = null;
    return new Promise(function (resolve) {
      FS.syncfs(false, function (err) {
        if (err) console.warn('Could not store saved data:', err);
        resolve();
      });
    });
  }
  Module['persistFiles'] = function () {
    if (!queued) queued = chain = chain.then(sync);
    return queued;
  };
})();

// Save config and highscores every few seconds and when the page is
// hidden or closed (an IndexedDB write started while the page unloads
// may not complete, so the periodic save is the reliable one).
(function () {
  function save() {
    if (runtimeInitialized && !runtimeExited && !ABORT && Module['_web_save_state']) {
      try { Module['_web_save_state'](); } catch (e) { console.warn(e); }
    }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') save();
  });
  window.addEventListener('pagehide', save);
  setInterval(save, 5000);
})();
