/* eslint-disable */
// noinspection ES6ModulesDependencies,JSUnresolvedFunction,JSUnresolvedVariable,JSUnusedGlobalSymbols
mergeInto(LibraryManager.library, {
  jsChromeTabsDiscard: function (tabId, isForce) {
    // if (typeof tabs === 'number') {
    //   var ptr = tabs;
    //   tabs = [];
    //   var index = size;
    //   while (index--) {
    //     tabs.push(Module.HEAPU32[ptr/HEAPU32.BYTES_PER_ELEMENT + index])
    //   }
    // }
    Module.jsChromeTabsDiscard(tabId, isForce);
  },
  jsClearInterval: function () {
    Module.jsClearInterval();
  },
  jsConsoleLog: function (number) {
    console.log(number);
  },
  jsExpiredTabsWatcher: function () {
    Module.jsExpiredTabsWatcher();
  },
});
