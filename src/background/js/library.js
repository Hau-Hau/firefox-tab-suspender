mergeInto(LibraryManager.library, {
  jsExpiredTabsWatcher: function() {
    if (Module['internalInterval'] !== undefined && Module['internalInterval'] !== null) {
      return;
    }
    Module['internalInterval'] = setInterval(function() {
      Module.cwrap('discardTabs', null, [])();
    }, 2000);
  },
  jsClearInterval: function() {
    clearInterval(Module['internalInterval']);
    Module['internalInterval'] = undefined;
  },
  jsChromeTabsDiscard: function(tabId) {
    chrome.tabs.discard(tabId);
  }
});
