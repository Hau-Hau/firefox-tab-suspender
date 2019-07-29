mergeInto(LibraryManager.library, {
  jsConsoleLog: function(num) {
    Module['jsConsoleLog'](num);
  },
  jsExpiredTabsWatcher: function() {
    Module['jsExpiredTabsWatcher']();
  },
  jsClearInterval: function() {
    Module['jsClearInterval']();
  },
  jsChromeTabsDiscard: function(tabId) {
    Module['jsChromeTabsDiscard'](tabId);
  },
});
