mergeInto(LibraryManager.library, {
  jsConsoleLogChar: function(messagePtr) {
    console.log(Module.cwrap('getCharPtrValue', 'string', ['number'])(messagePtr));
  },
  jsConsoleLogInt: function(messagePtr) {
    console.log(messagePtr);
  },
  jsConsoleLogFloat: function(messagePtr) {
    console.log(messagePtr);
  },
  jsConsoleLogDouble: function(messagePtr) {
    console.log(messagePtr);
  },
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
